import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["document", "video", "link", "image", "presentation", "other"],
      default: "document",
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    file: {
      name: String,
      url: String,
      publicId: String,
      size: Number,
      format: String,
    },
    externalLink: {
      type: String,
      default: null,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index
MaterialSchema.index({ class: 1, subject: 1 });
MaterialSchema.index({ teacher: 1 });
MaterialSchema.index({ tags: 1 });

export default mongoose.models.Material || mongoose.model("Material", MaterialSchema);
