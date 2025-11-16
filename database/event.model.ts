import mongoose, { Schema, Document, Model } from "mongoose";

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Event schema definition
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Title cannot be empty",
      },
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Description cannot be empty",
      },
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Overview cannot be empty",
      },
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Image cannot be empty",
      },
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Venue cannot be empty",
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Location cannot be empty",
      },
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Time cannot be empty",
      },
    },
    mode: {
      type: String,
      required: [true, "Mode is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Mode cannot be empty",
      },
    },
    audience: {
      type: String,
      required: [true, "Audience is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Audience cannot be empty",
      },
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      validate: {
        validator: (value: string) => value.trim().length > 0,
        message: "Organizer cannot be empty",
      },
    },
    tags: {
      type: [String],
      required: [true, "Tags is required"],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Normalize date to ISO format
function normalizeDate(date: string): string {
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date format");
    }
    return parsedDate.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
  } catch {
    // If parsing fails, return the original date string
    return date;
  }
}

// Normalize time to consistent format (HH:MM)
function normalizeTime(time: string): string {
  // Remove extra whitespace and ensure consistent format
  const trimmed = time.trim();
  // If time is already in HH:MM format, return it
  if (/^\d{1,2}:\d{2}(\s*(AM|PM))?$/i.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

// Pre-save hook: Generate slug and normalize date/time
eventSchema.pre("save", function (next) {
  // Only regenerate slug if title has changed
  if (this.isModified("title") || !this.slug) {
    this.slug = generateSlug(this.title);
  }

  // Normalize date to ISO format if it has changed
  if (this.isModified("date")) {
    this.date = normalizeDate(this.date);
  }

  // Normalize time format if it has changed
  if (this.isModified("time")) {
    this.time = normalizeTime(this.time);
  }

  next();
});

// Create unique index on slug for faster lookups
eventSchema.index({ slug: 1 }, { unique: true });

// Create and export the Event model
export const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

