import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: String,
      default: null,
    },
    designation: {
      type: String,
      default: "Teacher",
    },
    qualification: {
      type: String,
      default: null,
    },
    experience: {
      type: Number,
      default: 0,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: null,
      select: false,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    isClassTeacher: {
      type: Boolean,
      default: false,
    },
    classTeacherOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },
    specialization: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
// TeacherSchema.index({ employeeId: 1 });
TeacherSchema.index({ department: 1 });

export default mongoose.models.Teacher || mongoose.model("Teacher", TeacherSchema);
