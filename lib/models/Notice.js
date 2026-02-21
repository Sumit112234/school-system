import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    type: {
      type: String,
      enum: ["general", "academic", "event", "holiday", "emergency", "exam"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    targetAudience: {
      type: [String],
      enum: ["all", "students", "teachers", "admin", "parents","staff" ,"helpers"],
      default: ["all"],
    },

    targetClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    viewCount: {
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

// Index
NoticeSchema.index({ isPublished: 1, startDate: -1 });
NoticeSchema.index({ targetAudience: 1 });
NoticeSchema.index({ type: 1 });

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
