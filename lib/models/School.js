import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "School name is required"],
      trim: true,
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      uppercase: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
    subjects: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
        },
        teacher: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
        },
      },
    ],
    room: {
      type: String,
      default: null,
    },
    capacity: {
      type: Number,
      default: 40,
    },
    description: {
      type: String,
      default: null,
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

// // Virtual for student count
// ClassSchema.virtual("studentCount", {
//   ref: "Student",
//   localField: "_id",
//   foreignField: "class",
//   count: true,
// });

// // Compound unique index
// ClassSchema.index({ name: 1, section: 1, academicYear: 1 }, { unique: true });

export default mongoose.models.School || mongoose.model("School", SchoolSchema);
