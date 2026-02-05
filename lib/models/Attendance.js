import mongoose from "mongoose";

const AttendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  status: {
    type: String,
    enum: ["present", "absent", "late", "excused"],
    required: true,
  },
  remarks: {
    type: String,
    default: null,
  },
});

const AttendanceSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    period: {
      type: Number,
      default: null,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    records: [AttendanceRecordSchema],
    type: {
      type: String,
      enum: ["daily", "subject"],
      default: "daily",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for present count
AttendanceSchema.virtual("presentCount").get(function () {
  return this.records ? this.records.filter((r) => r.status === "present").length : 0;
});

AttendanceSchema.virtual("absentCount").get(function () {
  return this.records ? this.records.filter((r) => r.status === "absent").length : 0;
});

// Compound index for unique attendance per class per date
AttendanceSchema.index({ class: 1, date: 1, subject: 1, period: 1 });
AttendanceSchema.index({ teacher: 1 });

export default mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
