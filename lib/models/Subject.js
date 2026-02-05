import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Subject code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    credits: {
      type: Number,
      default: 1,
    },
    type: {
      type: String,
      enum: ["core", "elective", "lab", "practical"],
      default: "core",
    },
    passingMarks: {
      type: Number,
      default: 35,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
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

// Index
SubjectSchema.index({ code: 1 });
SubjectSchema.index({ department: 1 });

export default mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);
