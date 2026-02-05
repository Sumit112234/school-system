import mongoose from "mongoose";

const PeriodSchema = new mongoose.Schema({
  periodNumber: {
    type: Number,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    default: null,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    default: null,
  },
  room: {
    type: String,
    default: null,
  },
  type: {
    type: String,
    enum: ["class", "break", "lunch", "assembly", "free"],
    default: "class",
  },
});

const TimetableSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    day: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    periods: [PeriodSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index
TimetableSchema.index({ class: 1, day: 1, academicYear: 1 }, { unique: true });

export default mongoose.models.Timetable || mongoose.model("Timetable", TimetableSchema);
