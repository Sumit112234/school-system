import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: String,
      enum: ["technical", "account", "academic", "general", "complaint", "suggestion"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    replies: [ReplySchema],
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate ticket number before saving
TicketSchema.pre("save", async function (next) {
  if (!this.ticketNumber) {
    const count = await mongoose.models.Ticket.countDocuments();
    this.ticketNumber = `TKT-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// Index
TicketSchema.index({ ticketNumber: 1 });
TicketSchema.index({ createdBy: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });
TicketSchema.index({ status: 1, priority: 1 });

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
