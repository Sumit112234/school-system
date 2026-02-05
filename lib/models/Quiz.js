import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["multiple-choice", "true-false", "short-answer"],
    default: "multiple-choice",
  },
  options: [String],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  points: {
    type: Number,
    default: 1,
  },
  explanation: {
    type: String,
    default: null,
  },
});

const AttemptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  answers: [
    {
      questionIndex: Number,
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      pointsEarned: Number,
    },
  ],
  score: {
    type: Number,
    required: true,
  },
  totalPoints: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  timeTaken: {
    type: Number,
    default: 0,
  },
});

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: null,
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
    questions: [QuestionSchema],
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: 1,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    passingScore: {
      type: Number,
      default: 50,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    attempts: [AttemptSchema],
    maxAttempts: {
      type: Number,
      default: 1,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    showResults: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate total points before saving
QuizSchema.pre("save", function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  }
  next();
});

// Index
QuizSchema.index({ class: 1, subject: 1 });
QuizSchema.index({ teacher: 1 });
QuizSchema.index({ status: 1, startDate: 1, endDate: 1 });

export default mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
