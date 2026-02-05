import mongoose from "mongoose";


const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },
    section: {
      type: String,
      default: null,
    },
    rollNumber: {
      type: String,
      default: null,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    parentName: {
      type: String,
      default: null,
    },
    parentPhone: {
      type: String,
      default: null,
    },
    parentEmail: {
      type: String,
      default: null,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", null],
      default: null,
    },
    emergencyContact: {
      type: String,
      default: null,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full student data with user info
// StudentSchema.virtual("fullData").get(function () {
//   return {
//     ...this.toObject(),
//     user: this.user,
//   };
// });

// Index for faster queries
StudentSchema.index({ class: 1, section: 1 });
// StudentSchema.index({ studentId: 1 });

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
