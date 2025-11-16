import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { Event } from "./event.model";

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking schema definition
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true, // Index for faster queries
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string): boolean {
          // Email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Pre-save hook: Verify that the referenced event exists
bookingSchema.pre("save", async function (next) {
  try {
    // Check if eventId has been modified or is new
    if (this.isModified("eventId") || this.isNew) {
      const event = await Event.findById(this.eventId);
      if (!event) {
        const error = new Error(
          `Event with ID ${this.eventId} does not exist`
        ) as Error & { statusCode?: number };
        error.statusCode = 404;
        return next(error);
      }
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Create index on eventId for faster queries (explicit index in addition to field-level index)
bookingSchema.index({ eventId: 1 });

// Create and export the Booking model
export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

