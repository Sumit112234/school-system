import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String,
    default: null,
  },
  attachments: [
    {
      name: String,
      url: String,
      type: String,
      size: Number,
    },
  ],
  grade: {
    type: Number,
    default: null,
  },
  feedback: {
    type: String,
    default: null,
  },
  gradedAt: {
    type: Date,
    default: null,
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    default: null,
  },
  status: {
    type: String,
    enum: ["submitted", "graded", "returned", "resubmit"],
    default: "submitted",
  },
});

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    instructions: {
      type: String,
      default: null,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    submissions: [SubmissionSchema],
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
    },
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    lateSubmissionPenalty: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for submission count
AssignmentSchema.virtual("submissionCount").get(function () {
  return this.submissions ? this.submissions.length : 0;
});

// Index
AssignmentSchema.index({ class: 1, subject: 1 });
AssignmentSchema.index({ teacher: 1 });
AssignmentSchema.index({ dueDate: 1 });

export default mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);
