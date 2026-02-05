import mongoose from "mongoose";

const GradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
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
    academicYear: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      enum: ["first", "second", "third", "final"],
      required: true,
    },
    examType: {
      type: String,
      enum: ["midterm", "final", "quiz", "assignment", "practical", "project"],
      required: true,
    },
    marksObtained: {
      type: Number,
      required: [true, "Marks obtained is required"],
    },
    totalMarks: {
      type: Number,
      required: [true, "Total marks is required"],
    },
    percentage: {
      type: Number,
    },
    grade: {
      type: String,
    },
    remarks: {
      type: String,
      default: null,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate percentage and grade before saving
GradeSchema.pre("save", function (next) {
  this.percentage = (this.marksObtained / this.totalMarks) * 100;
  
  // Assign grade based on percentage
  if (this.percentage >= 90) this.grade = "A+";
  else if (this.percentage >= 80) this.grade = "A";
  else if (this.percentage >= 70) this.grade = "B+";
  else if (this.percentage >= 60) this.grade = "B";
  else if (this.percentage >= 50) this.grade = "C+";
  else if (this.percentage >= 40) this.grade = "C";
  else if (this.percentage >= 35) this.grade = "D";
  else this.grade = "F";
  
  next();
});

// Compound index
GradeSchema.index({ student: 1, subject: 1, term: 1, examType: 1 });
GradeSchema.index({ class: 1, academicYear: 1 });

export default mongoose.models.Grade || mongoose.model("Grade", GradeSchema);
