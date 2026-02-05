import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    body: {
      type: String,
      required: [true, "Message body is required"],
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    parentMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
