import { Event } from "@/database/event.model";
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Parse request body - support both JSON and form data
    let event;
    const contentType = req.headers.get("content-type") || "";

    try {
      if (contentType.includes("application/json")) {
        // Parse JSON body
        event = await req.json();
      } else if (
        contentType.includes("multipart/form-data") ||
        contentType.includes("application/x-www-form-urlencoded")
      ) {
        // Parse form data
        const formData = await req.formData();
        const formEntries: Record<string, unknown> = {};

        // Convert FormData to plain object, handling arrays
        for (const [key, value] of formData.entries()) {
          // Convert File objects to strings (get their name or empty string)
          const stringValue =
            value instanceof File ? value.name || "" : String(value);

          if (formEntries[key]) {
            // If key already exists, convert to array
            const existing = formEntries[key];
            formEntries[key] = Array.isArray(existing)
              ? [...existing, stringValue]
              : [existing, stringValue];
          } else {
            formEntries[key] = stringValue;
          }
        }

        event = formEntries;

        // Parse agenda and tags from strings to arrays if they're strings
        if (event.agenda && typeof event.agenda === "string") {
          try {
            event.agenda = JSON.parse(event.agenda);
          } catch {
            // If parsing fails, treat as single-item array
            event.agenda = [event.agenda];
          }
        }

        if (event.tags && typeof event.tags === "string") {
          try {
            event.tags = JSON.parse(event.tags);
          } catch {
            // If parsing fails, split by comma or treat as single-item array
            const tagsStr = event.tags as string;
            event.tags = tagsStr.includes(",")
              ? tagsStr.split(",").map((tag: string) => tag.trim())
              : [tagsStr];
          }
        }
      } else {
        // Try JSON as fallback
        event = await req.json();
      }
    } catch {
      return NextResponse.json(
        {
          message: "Invalid request data format",
          status: 400,
        },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "overview",
      "image",
      "venue",
      "location",
      "date",
      "time",
      "mode",
      "audience",
      "agenda",
      "organizer",
      "tags",
    ];

    const missingFields = requiredFields.filter((field) => !event[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          message: "Missing required fields",
          missingFields,
          status: 400,
        },
        { status: 400 }
      );
    }

    // Ensure agenda and tags are arrays
    if (!Array.isArray(event.agenda)) {
      return NextResponse.json(
        {
          message: "Agenda must be an array",
          status: 400,
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(event.tags)) {
      return NextResponse.json(
        {
          message: "Tags must be an array",
          status: 400,
        },
        { status: 400 }
      );
    }

    const createdEvent = await Event.create(event);
    return NextResponse.json(
      {
        message: "Event created successfully",
        event: createdEvent,
        status: 201,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Event creation error:", e);
    return NextResponse.json(
      {
        message: "Event creation failed",
        error: e instanceof Error ? e.message : "Unknown error",
        status: 500,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json({
      message: "Events fetched successfully",
      events,
      status: 200,
    });
  } catch (e) {
    return NextResponse.json({
      message: "Events fetching failed",

      status: 500,
    });
  }
}
