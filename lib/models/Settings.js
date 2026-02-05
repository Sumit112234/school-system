import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    schoolName: {
      type: String,
      default: "School Management System",
    },
    schoolLogo: {
      type: String,
      default: null,
    },
    schoolAddress: {
      type: String,
      default: null,
    },
    schoolPhone: {
      type: String,
      default: null,
    },
    schoolEmail: {
      type: String,
      default: null,
    },
    schoolWebsite: {
      type: String,
      default: null,
    },
    currentAcademicYear: {
      type: String,
      default: "2025-2026",
    },
    currentTerm: {
      type: String,
      enum: ["first", "second", "third"],
      default: "first",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    dateFormat: {
      type: String,
      default: "DD/MM/YYYY",
    },
    currency: {
      type: String,
      default: "USD",
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowStudentRegistration: {
      type: Boolean,
      default: false,
    },
    allowTeacherRegistration: {
      type: Boolean,
      default: false,
    },
    defaultStudentPassword: {
      type: String,
      default: "student123",
    },
    defaultTeacherPassword: {
      type: String,
      default: "teacher123",
    },
    gradingSystem: {
      type: String,
      enum: ["percentage", "gpa", "letter"],
      default: "percentage",
    },
    attendanceRequired: {
      type: Number,
      default: 75,
    },
    workingDays: {
      type: [String],
      default: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },
    schoolTimings: {
      startTime: {
        type: String,
        default: "08:00",
      },
      endTime: {
        type: String,
        default: "15:00",
      },
    },
    periodsPerDay: {
      type: Number,
      default: 8,
    },
    periodDuration: {
      type: Number,
      default: 45,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
