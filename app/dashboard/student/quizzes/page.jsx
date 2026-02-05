"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Play,
  Clock,
  CheckCircle,
  Trophy,
  BookOpen,
  Timer,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function StudentQuizzesPage() {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const availableQuizzes = [
    {
      id: 1,
      title: "Mathematics: Quadratic Equations",
      subject: "Mathematics",
      questions: 10,
      duration: 15,
      difficulty: "Medium",
      attempts: 2,
      bestScore: 85,
    },
    {
      id: 2,
      title: "Physics: Laws of Motion",
      subject: "Physics",
      questions: 15,
      duration: 20,
      difficulty: "Hard",
      attempts: 1,
      bestScore: 70,
    },
    {
      id: 3,
      title: "English: Grammar Basics",
      subject: "English",
      questions: 20,
      duration: 25,
      difficulty: "Easy",
      attempts: 0,
      bestScore: null,
    },
    {
      id: 4,
      title: "Chemistry: Periodic Table",
      subject: "Chemistry",
      questions: 12,
      duration: 18,
      difficulty: "Medium",
      attempts: 3,
      bestScore: 92,
    },
  ];

  const sampleQuestions = [
    {
      id: 1,
      question: "What is the standard form of a quadratic equation?",
      options: ["ax + b = 0", "ax² + bx + c = 0", "ax³ + bx² + cx + d = 0", "a/x + b = 0"],
      correct: 1,
    },
    {
      id: 2,
      question: "The discriminant of a quadratic equation is given by:",
      options: ["b² - 4ac", "b² + 4ac", "4ac - b²", "2ac - b"],
      correct: 0,
    },
    {
      id: 3,
      question: "If the discriminant is positive, the equation has:",
      options: ["No real roots", "One real root", "Two distinct real roots", "Complex roots only"],
      correct: 2,
    },
    {
      id: 4,
      question: "The sum of roots of ax² + bx + c = 0 is:",
      options: ["-b/a", "b/a", "c/a", "-c/a"],
      correct: 0,
    },
    {
      id: 5,
      question: "The product of roots of ax² + bx + c = 0 is:",
      options: ["-b/a", "b/a", "c/a", "-c/a"],
      correct: 2,
    },
  ];

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setIsPlaying(true);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const nextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    sampleQuestions.forEach((q) => {
      if (answers[q.id] === q.correct) correct++;
    });
    return Math.round((correct / sampleQuestions.length) * 100);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-success";
      case "Medium":
        return "bg-warning";
      case "Hard":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quizzes</h1>
        <p className="text-muted-foreground">Test your knowledge with interactive quizzes</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <BookOpen className="h-8 w-8 text-student" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">8</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-2xl font-bold">82%</p>
              </div>
              <Trophy className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold">4.5h</p>
              </div>
              <Timer className="h-8 w-8 text-admin" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Quizzes */}
      <div className="grid gap-4 md:grid-cols-2">
        {availableQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">{quiz.subject}</Badge>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                </div>
                <Badge className={getDifficultyColor(quiz.difficulty)}>
                  {quiz.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {quiz.questions} Questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {quiz.duration} min
                </span>
              </div>
              {quiz.bestScore !== null && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Best Score</span>
                    <span className="font-medium">{quiz.bestScore}%</span>
                  </div>
                  <Progress value={quiz.bestScore} className="h-2" />
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">
                  {quiz.attempts} attempt(s)
                </span>
                <Button className="gap-2" onClick={() => startQuiz(quiz)}>
                  <Play className="h-4 w-4" />
                  {quiz.attempts > 0 ? "Retake" : "Start Quiz"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quiz Dialog */}
      <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
        <DialogContent className="max-w-2xl">
          {selectedQuiz && !showResults && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{selectedQuiz.title}</DialogTitle>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {selectedQuiz.duration}:00
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {sampleQuestions.length}
                  </span>
                  <Progress
                    value={((currentQuestion + 1) / sampleQuestions.length) * 100}
                    className="w-32 h-2"
                  />
                </div>

                <div className="p-6 bg-muted/50 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">
                    {sampleQuestions[currentQuestion].question}
                  </h3>
                  <RadioGroup
                    value={answers[sampleQuestions[currentQuestion].id]?.toString()}
                    onValueChange={(value) =>
                      handleAnswer(sampleQuestions[currentQuestion].id, parseInt(value))
                    }
                  >
                    {sampleQuestions[currentQuestion].options.map((option, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background transition-colors"
                      >
                        <RadioGroupItem value={i.toString()} id={`option-${i}`} />
                        <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                    className="gap-2 bg-transparent"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  {currentQuestion === sampleQuestions.length - 1 ? (
                    <Button onClick={submitQuiz} className="gap-2">
                      Submit Quiz
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion} className="gap-2">
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {showResults && (
            <div className="text-center space-y-6 py-6">
              <Trophy className="h-16 w-16 mx-auto text-warning" />
              <div>
                <h2 className="text-2xl font-bold">Quiz Completed!</h2>
                <p className="text-muted-foreground">Here are your results</p>
              </div>
              <div className="text-5xl font-bold text-student">{calculateScore()}%</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-success/10 rounded-lg">
                  <p className="text-success font-medium">Correct</p>
                  <p className="text-2xl font-bold">
                    {sampleQuestions.filter((q) => answers[q.id] === q.correct).length}
                  </p>
                </div>
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-destructive font-medium">Incorrect</p>
                  <p className="text-2xl font-bold">
                    {sampleQuestions.filter((q) => answers[q.id] !== q.correct).length}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setIsPlaying(false)}>
                  Close
                </Button>
                <Button onClick={() => startQuiz(selectedQuiz)}>
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
