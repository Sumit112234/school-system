"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Clock, Calendar, FileText, Play, CheckCircle2, XCircle, 
  Trophy, Timer, Loader2, AlertCircle
} from "lucide-react";

function QuizTakingDialog({ quizId, open, onOpenChange, onCompleted }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime] = useState(new Date());
  
  // Anti-cheating states
  const [cheatingWarnings, setCheatingWarnings] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [fullscreenEnabled, setFullscreenEnabled] = useState(false);
  
  // Refs
  const quizContainerRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  // Request fullscreen when quiz starts
  useEffect(() => {
    if (open && quiz && !loading) {
      enableFullscreen();
    }
  }, [open, quiz, loading]);

  // Anti-cheating detection
  useEffect(() => {
    if (!open || !quiz || loading) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && fullscreenEnabled) {
        // User exited fullscreen - treat as cheating
        handleCheatingAttempt("You exited fullscreen mode");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && fullscreenEnabled) {
        // User switched tabs/windows
        handleCheatingAttempt("You switched to another tab or application");
      }
    };

    const handleKeyDown = (e) => {
      // Detect console opening attempts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
      if (fullscreenEnabled) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'U')) {
          e.preventDefault();
          handleCheatingAttempt("Developer tools access attempted");
        }
        
        // Prevent copy/paste
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a')) {
          e.preventDefault();
          handleCheatingAttempt("Copy/paste attempted");
        }
      }
    };

    const handleContextMenu = (e) => {
      if (fullscreenEnabled) {
        e.preventDefault(); // Prevent right-click
      }
    };

    const handleResize = () => {
      if (fullscreenEnabled) {
        // Check if window size changed significantly (potential dev tools opening)
        const widthDiff = Math.abs(window.innerWidth - window.screen.width);
        const heightDiff = Math.abs(window.innerHeight - window.screen.height);
        
        if (widthDiff > 100 || heightDiff > 100) {
          handleCheatingAttempt("Window resize detected");
        }
      }
    };

    // Add event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('resize', handleResize);

    return () => {
      // Clean up event listeners
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
      
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      
      // Exit fullscreen when component unmounts
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log("Error exiting fullscreen:", err));
      }
    };
  }, [open, quiz, loading, fullscreenEnabled]);

  const enableFullscreen = async () => {
    try {
      const elem = quizContainerRef.current;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
        setFullscreenEnabled(true);
      }
    } catch (err) {
      console.log("Fullscreen request failed:", err);
      handleCheatingAttempt("Failed to enable fullscreen mode");
    }
  };

  const handleCheatingAttempt = async (reason) => {
    if (!fullscreenEnabled || submitting) return;

    // Clear any existing warning timeout
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    const newWarningCount = cheatingWarnings + 1;
    setCheatingWarnings(newWarningCount);

    console.log(`Cheating attempt detected: ${reason}. Warning count: ${newWarningCount}` );

    if (newWarningCount >= 2) {
      // Second cheating attempt - submit quiz immediately
      setWarningMessage("Cheating detected! Quiz is being submitted automatically.");
      setShowWarning(true);
      
      // Small delay to show warning before submitting
      setTimeout(() => {
        setShowWarning(false);
        handleAutoSubmit();
      }, 2000);
    } else {
      // First cheating attempt - show warning
      setWarningMessage(`⚠️ FINAL WARNING: ${reason}. This is your only warning. Next violation will automatically submit your quiz.`);
      setShowWarning(true);
      
      // Auto-hide warning after 3 seconds
      warningTimeoutRef.current = setTimeout(() => {
        setShowWarning(false);
      }, 3000);
    }
  };

  const handleAutoSubmit = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const answersArray = quiz.questions.map((q, i) => ({
        questionIndex: q.index,
        answer: answers[i] ?? null,
      }));

      const res = await fetch(`/api/student/quizzes/${quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersArray,
          startedAt: startTime.toISOString(),
          completedAt: new Date().toISOString(),
          autoSubmitted: true,
          reason: "Cheating detected"
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to submit");
      
      // Exit fullscreen before closing
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      
      onCompleted(data.data);
      onOpenChange(false);
    } catch (err) {
      alert(err.message);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (open && quizId) {
      fetchQuiz();
    }
  }, [open, quizId]);

  useEffect(() => {
    if (!quiz || timeLeft <= 0) return;
    
    if (timeLeft === 0) {
      // Time's up - auto submit
      handleAutoSubmit();
      return;
    }
    
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [quiz, timeLeft]);

  const fetchQuiz = async () => {
    setLoading(true);
    setCheatingWarnings(0);
    setFullscreenEnabled(false);
    setShowWarning(false);
    
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load quiz");
      setQuiz(data.data.quiz);
      setTimeLeft(data.data.quiz.duration * 60);
      setAnswers({});
    } catch (err) {
      alert(err.message);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Submit quiz? You cannot change answers after submission.")) return;
    
    setSubmitting(true);
    try {
      const answersArray = quiz.questions.map((q, i) => ({
        questionIndex: q.index,
        answer: answers[i] ?? null,
      }));

      const res = await fetch(`/api/student/quizzes/${quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersArray,
          startedAt: startTime.toISOString(),
          completedAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to submit");
      
      // Exit fullscreen before closing
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      
      onCompleted(data.data);
      onOpenChange(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div></DialogContent>
    </Dialog>
  );

  if (!quiz) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && fullscreenEnabled && !submitting) {
        // Prevent closing dialog while quiz is active
        return;
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0">
        <div 
          ref={quizContainerRef}
          className="relative bg-background"
          style={{ minHeight: '80vh' }}
        >
          {/* Warning Banner */}
          {showWarning && (
            <div className="absolute top-0 left-0 right-0 z-50 animate-in slide-in-from-top">
              <div className="bg-destructive/10 border-destructive border-2 rounded-lg m-4 p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-destructive animate-pulse" />
                  <p className="text-destructive font-semibold">{warningMessage}</p>
                </div>
              </div>
            </div>
          )}

          <DialogHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 border-b p-6">
            <DialogTitle>{quiz.title}</DialogTitle>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                <span className={timeLeft < 60 ? 'text-destructive font-bold' : ''}>
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </span>
              <span>{answeredCount}/{quiz.questions.length} answered</span>
              <Badge variant="outline" className="ml-auto">
                {fullscreenEnabled ? '🔒 Secure Mode' : '⚠️ Fullscreen Required'}
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {!fullscreenEnabled && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  <p className="text-yellow-700">
                    Please enable fullscreen mode to start the quiz. The quiz will be submitted automatically if you exit fullscreen.
                  </p>
                </div>
                <Button onClick={enableFullscreen} className="mt-2">
                  Enable Fullscreen
                </Button>
              </div>
            )}

            {quiz.questions.map((q, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between">
                  <Label className="text-base font-semibold">Question {i + 1}</Label>
                  <Badge variant="outline">{q.points} pt{q.points !== 1 ? 's' : ''}</Badge>
                </div>
                <p className="text-sm">{q.question}</p>

                {q.type === "multiple-choice" && (
                  <RadioGroup 
                    value={String(answers[i] ?? "")} 
                    onValueChange={v => setAnswers({...answers, [i]: Number(v)})}
                    className="space-y-2"
                  >
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center space-x-2">
                        <RadioGroupItem value={String(oi)} id={`q${i}-${oi}`} />
                        <Label htmlFor={`q${i}-${oi}`} className="cursor-pointer">{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {q.type === "true-false" && (
                  <RadioGroup 
                    value={String(answers[i] ?? "")} 
                    onValueChange={v => setAnswers({...answers, [i]: v === "true"})}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id={`q${i}-true`} />
                      <Label htmlFor={`q${i}-true`} className="cursor-pointer">True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id={`q${i}-false`} />
                      <Label htmlFor={`q${i}-false`} className="cursor-pointer">False</Label>
                    </div>
                  </RadioGroup>
                )}

                {q.type === "short-answer" && (
                  <Input 
                    placeholder="Your answer" 
                    value={answers[i] || ""} 
                    onChange={e => setAnswers({...answers, [i]: e.target.value})}
                    disabled={!fullscreenEnabled}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 border-t p-6">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  if (confirm("Are you sure you want to cancel? Your progress will be lost.")) {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    }
                    onOpenChange(false);
                  }
                }} 
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || !fullscreenEnabled} 
                className="flex-1"
              >
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Quiz
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ResultDialog({ result, open, onOpenChange }) {
  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Quiz Result</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="text-center py-6">
            <Trophy className={`h-16 w-16 mx-auto mb-4 ${result.passed ? 'text-green-600' : 'text-orange-600'}`} />
            <p className="text-4xl font-bold mb-2">{result.percentage}%</p>
            <p className="text-muted-foreground">{result.score} / {result.totalPoints} points</p>
            <Badge variant={result.passed ? "default" : "secondary"} className="mt-3">
              {result.passed ? "Passed" : "Not Passed"}
            </Badge>
            {result.autoSubmitted && (
              <p className="text-destructive text-sm mt-2">
                ⚠️ Quiz was auto-submitted due to cheating detection
              </p>
            )}
          </div>
          {result.answers && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {result.answers.map((ans, i) => (
                <div key={i} className={`p-3 rounded-lg border ${ans.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {ans.isCorrect ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                    <span className="text-sm font-medium">Question {i + 1}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{ans.pointsEarned} pts</span>
                  </div>
                  {!ans.isCorrect && <p className="text-xs text-muted-foreground">Correct: {ans.correctAnswer}</p>}
                  {ans.explanation && <p className="text-xs text-muted-foreground mt-1">{ans.explanation}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [takingDialog, setTakingDialog] = useState({ open: false, quizId: null });
  const [resultDialog, setResultDialog] = useState({ open: false, result: null });

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/quizzes");
      const data = await res.json();

      console.log("Fetched quizzes:", data);
      if (!res.ok) throw new Error(data?.message || "Failed to fetch quizzes");
      setQuizzes(data.data?.quizzes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleted = (result) => {
    setResultDialog({ open: true, result });
    fetchQuizzes();
  };
  

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const availableQuizzes = quizzes.filter(q => q.canAttempt);
  const completedQuizzes = quizzes.filter(q => !q.canAttempt && !q.isExpired);
  const expiredQuizzes = quizzes.filter(q => q.isExpired);

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Quizzes</h1><p className="text-muted-foreground">View and take quizzes</p></div>

      {availableQuizzes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Available Quizzes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableQuizzes.map(quiz => (
              <Card key={quiz._id} className="border-primary/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{quiz.subject?.name}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-muted-foreground">Questions</p><p className="font-medium">{quiz.questionCount}</p></div>
                    <div><p className="text-muted-foreground">Duration</p><p className="font-medium">{quiz.duration} min</p></div>
                    <div><p className="text-muted-foreground">Points</p><p className="font-medium">{quiz.totalPoints}</p></div>
                    <div><p className="text-muted-foreground">Attempts</p><p className="font-medium">{quiz.attemptsTaken}/{quiz.maxAttempts}</p></div>
                  </div>
                  <Button className="w-full gap-2" onClick={() => setTakingDialog({ open: true, quizId: quiz._id })}>
                    <Play className="h-4 w-4" />Start Quiz
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedQuizzes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Completed</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedQuizzes.map(quiz => (
              <Card key={quiz._id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{quiz.subject?.name}</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-3xl font-bold text-green-600">{quiz.bestScore}%</p>
                    <p className="text-sm text-muted-foreground">Best Score</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <QuizTakingDialog {...takingDialog} onOpenChange={open => setTakingDialog({...takingDialog, open})} onCompleted={handleCompleted} />
      <ResultDialog {...resultDialog} onOpenChange={open => setResultDialog({...resultDialog, open})} />
    </div>
  );
}


// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { useStudentQuizzes } from "@/hooks/use-student-data";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import {
//   Play,
//   Clock,
//   CheckCircle,
//   Trophy,
//   BookOpen,
//   Timer,
//   ArrowRight,
//   ArrowLeft,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";
// import { toast } from "sonner";

// function LoadingState() {
//   return (
//     <div className="flex items-center justify-center min-h-96">
//       <div className="text-center">
//         <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
//         <p className="text-muted-foreground">Loading quizzes...</p>
//       </div>
//     </div>
//   );
// }

// export default function StudentQuizzesPage() {
//   const [selectedQuiz, setSelectedQuiz] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [showResults, setShowResults] = useState(false);
//   const { quizzes, loading, error, refetch, submitQuiz } = useStudentQuizzes();

//   if (loading) {
//     return <LoadingState />;
//   }

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
//         <p className="text-destructive mb-4">Error loading quizzes: {error}</p>
//         <Button onClick={refetch}>Try Again</Button>
//       </div>
//     );
//   }

//   const availableQuizzes = quizzes?.data || [];
//       difficulty: "Hard",
//       attempts: 1,
//       bestScore: 70,
//     },
//     {
//       id: 3,
//       title: "English: Grammar Basics",
//       subject: "English",
//       questions: 20,
//       duration: 25,
//       difficulty: "Easy",
//       attempts: 0,
//       bestScore: null,
//     },
//     {
//       id: 4,
//       title: "Chemistry: Periodic Table",
//       subject: "Chemistry",
//       questions: 12,
//       duration: 18,
//       difficulty: "Medium",
//       attempts: 3,
//       bestScore: 92,
//     },
//   ];

//   const sampleQuestions = [
//     {
//       id: 1,
//       question: "What is the standard form of a quadratic equation?",
//       options: ["ax + b = 0", "ax² + bx + c = 0", "ax³ + bx² + cx + d = 0", "a/x + b = 0"],
//       correct: 1,
//     },
//     {
//       id: 2,
//       question: "The discriminant of a quadratic equation is given by:",
//       options: ["b² - 4ac", "b² + 4ac", "4ac - b²", "2ac - b"],
//       correct: 0,
//     },
//     {
//       id: 3,
//       question: "If the discriminant is positive, the equation has:",
//       options: ["No real roots", "One real root", "Two distinct real roots", "Complex roots only"],
//       correct: 2,
//     },
//     {
//       id: 4,
//       question: "The sum of roots of ax² + bx + c = 0 is:",
//       options: ["-b/a", "b/a", "c/a", "-c/a"],
//       correct: 0,
//     },
//     {
//       id: 5,
//       question: "The product of roots of ax² + bx + c = 0 is:",
//       options: ["-b/a", "b/a", "c/a", "-c/a"],
//       correct: 2,
//     },
//   ];

//   const startQuiz = (quiz) => {
//     setSelectedQuiz(quiz);
//     setIsPlaying(true);
//     setCurrentQuestion(0);
//     setAnswers({});
//     setShowResults(false);
//   };

//   const handleAnswer = (questionId, answerIndex) => {
//     setAnswers({ ...answers, [questionId]: answerIndex });
//   };

//   const nextQuestion = () => {
//     if (currentQuestion < sampleQuestions.length - 1) {
//       setCurrentQuestion(currentQuestion + 1);
//     }
//   };

//   const prevQuestion = () => {
//     if (currentQuestion > 0) {
//       setCurrentQuestion(currentQuestion - 1);
//     }
//   };

//   const submitQuiz = () => {
//     setShowResults(true);
//   };

//   const calculateScore = () => {
//     let correct = 0;
//     sampleQuestions.forEach((q) => {
//       if (answers[q.id] === q.correct) correct++;
//     });
//     return Math.round((correct / sampleQuestions.length) * 100);
//   };

//   const getDifficultyColor = (difficulty) => {
//     switch (difficulty) {
//       case "Easy":
//         return "bg-success";
//       case "Medium":
//         return "bg-warning";
//       case "Hard":
//         return "bg-destructive";
//       default:
//         return "bg-muted";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-foreground">Quizzes</h1>
//         <p className="text-muted-foreground">Test your knowledge with interactive quizzes</p>
//       </div>

//       {/* Stats */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Available</p>
//                 <p className="text-2xl font-bold">12</p>
//               </div>
//               <BookOpen className="h-8 w-8 text-student" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Completed</p>
//                 <p className="text-2xl font-bold text-success">8</p>
//               </div>
//               <CheckCircle className="h-8 w-8 text-success" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Avg. Score</p>
//                 <p className="text-2xl font-bold">82%</p>
//               </div>
//               <Trophy className="h-8 w-8 text-warning" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Time Spent</p>
//                 <p className="text-2xl font-bold">4.5h</p>
//               </div>
//               <Timer className="h-8 w-8 text-admin" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Available Quizzes */}
//       <div className="grid gap-4 md:grid-cols-2">
//         {availableQuizzes.map((quiz) => (
//           <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="flex items-start justify-between">
//                 <div>
//                   <Badge variant="outline" className="mb-2">{quiz.subject}</Badge>
//                   <CardTitle className="text-lg">{quiz.title}</CardTitle>
//                 </div>
//                 <Badge className={getDifficultyColor(quiz.difficulty)}>
//                   {quiz.difficulty}
//                 </Badge>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center gap-6 text-sm text-muted-foreground">
//                 <span className="flex items-center gap-1">
//                   <BookOpen className="h-4 w-4" />
//                   {quiz.questions} Questions
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <Clock className="h-4 w-4" />
//                   {quiz.duration} min
//                 </span>
//               </div>
//               {quiz.bestScore !== null && (
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span>Best Score</span>
//                     <span className="font-medium">{quiz.bestScore}%</span>
//                   </div>
//                   <Progress value={quiz.bestScore} className="h-2" />
//                 </div>
//               )}
//               <div className="flex items-center justify-between pt-2">
//                 <span className="text-sm text-muted-foreground">
//                   {quiz.attempts} attempt(s)
//                 </span>
//                 <Button className="gap-2" onClick={() => startQuiz(quiz)}>
//                   <Play className="h-4 w-4" />
//                   {quiz.attempts > 0 ? "Retake" : "Start Quiz"}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Quiz Dialog */}
//       <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
//         <DialogContent className="max-w-2xl">
//           {selectedQuiz && !showResults && (
//             <>
//               <DialogHeader>
//                 <div className="flex items-center justify-between">
//                   <DialogTitle>{selectedQuiz.title}</DialogTitle>
//                   <Badge variant="outline" className="gap-1">
//                     <Clock className="h-3 w-3" />
//                     {selectedQuiz.duration}:00
//                   </Badge>
//                 </div>
//               </DialogHeader>

//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-muted-foreground">
//                     Question {currentQuestion + 1} of {sampleQuestions.length}
//                   </span>
//                   <Progress
//                     value={((currentQuestion + 1) / sampleQuestions.length) * 100}
//                     className="w-32 h-2"
//                   />
//                 </div>

//                 <div className="p-6 bg-muted/50 rounded-lg">
//                   <h3 className="text-lg font-medium mb-4">
//                     {sampleQuestions[currentQuestion].question}
//                   </h3>
//                   <RadioGroup
//                     value={answers[sampleQuestions[currentQuestion].id]?.toString()}
//                     onValueChange={(value) =>
//                       handleAnswer(sampleQuestions[currentQuestion].id, parseInt(value))
//                     }
//                   >
//                     {sampleQuestions[currentQuestion].options.map((option, i) => (
//                       <div
//                         key={i}
//                         className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background transition-colors"
//                       >
//                         <RadioGroupItem value={i.toString()} id={`option-${i}`} />
//                         <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
//                           {option}
//                         </Label>
//                       </div>
//                     ))}
//                   </RadioGroup>
//                 </div>

//                 <div className="flex justify-between">
//                   <Button
//                     variant="outline"
//                     onClick={prevQuestion}
//                     disabled={currentQuestion === 0}
//                     className="gap-2 bg-transparent"
//                   >
//                     <ArrowLeft className="h-4 w-4" />
//                     Previous
//                   </Button>
//                   {currentQuestion === sampleQuestions.length - 1 ? (
//                     <Button onClick={submitQuiz} className="gap-2">
//                       Submit Quiz
//                       <CheckCircle className="h-4 w-4" />
//                     </Button>
//                   ) : (
//                     <Button onClick={nextQuestion} className="gap-2">
//                       Next
//                       <ArrowRight className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}

//           {showResults && (
//             <div className="text-center space-y-6 py-6">
//               <Trophy className="h-16 w-16 mx-auto text-warning" />
//               <div>
//                 <h2 className="text-2xl font-bold">Quiz Completed!</h2>
//                 <p className="text-muted-foreground">Here are your results</p>
//               </div>
//               <div className="text-5xl font-bold text-student">{calculateScore()}%</div>
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div className="p-4 bg-success/10 rounded-lg">
//                   <p className="text-success font-medium">Correct</p>
//                   <p className="text-2xl font-bold">
//                     {sampleQuestions.filter((q) => answers[q.id] === q.correct).length}
//                   </p>
//                 </div>
//                 <div className="p-4 bg-destructive/10 rounded-lg">
//                   <p className="text-destructive font-medium">Incorrect</p>
//                   <p className="text-2xl font-bold">
//                     {sampleQuestions.filter((q) => answers[q.id] !== q.correct).length}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex gap-4 justify-center">
//                 <Button variant="outline" onClick={() => setIsPlaying(false)}>
//                   Close
//                 </Button>
//                 <Button onClick={() => startQuiz(selectedQuiz)}>
//                   Try Again
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import {
//   Play,
//   Clock,
//   CheckCircle,
//   Trophy,
//   BookOpen,
//   Timer,
//   ArrowRight,
//   ArrowLeft,
// } from "lucide-react";

// export default function StudentQuizzesPage() {
//   const [selectedQuiz, setSelectedQuiz] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [showResults, setShowResults] = useState(false);

//   const availableQuizzes = [
//     {
//       id: 1,
//       title: "Mathematics: Quadratic Equations",
//       subject: "Mathematics",
//       questions: 10,
//       duration: 15,
//       difficulty: "Medium",
//       attempts: 2,
//       bestScore: 85,
//     },
//     {
//       id: 2,
//       title: "Physics: Laws of Motion",
//       subject: "Physics",
//       questions: 15,
//       duration: 20,
//       difficulty: "Hard",
//       attempts: 1,
//       bestScore: 70,
//     },
//     {
//       id: 3,
//       title: "English: Grammar Basics",
//       subject: "English",
//       questions: 20,
//       duration: 25,
//       difficulty: "Easy",
//       attempts: 0,
//       bestScore: null,
//     },
//     {
//       id: 4,
//       title: "Chemistry: Periodic Table",
//       subject: "Chemistry",
//       questions: 12,
//       duration: 18,
//       difficulty: "Medium",
//       attempts: 3,
//       bestScore: 92,
//     },
//   ];

//   const sampleQuestions = [
//     {
//       id: 1,
//       question: "What is the standard form of a quadratic equation?",
//       options: ["ax + b = 0", "ax² + bx + c = 0", "ax³ + bx² + cx + d = 0", "a/x + b = 0"],
//       correct: 1,
//     },
//     {
//       id: 2,
//       question: "The discriminant of a quadratic equation is given by:",
//       options: ["b² - 4ac", "b² + 4ac", "4ac - b²", "2ac - b"],
//       correct: 0,
//     },
//     {
//       id: 3,
//       question: "If the discriminant is positive, the equation has:",
//       options: ["No real roots", "One real root", "Two distinct real roots", "Complex roots only"],
//       correct: 2,
//     },
//     {
//       id: 4,
//       question: "The sum of roots of ax² + bx + c = 0 is:",
//       options: ["-b/a", "b/a", "c/a", "-c/a"],
//       correct: 0,
//     },
//     {
//       id: 5,
//       question: "The product of roots of ax² + bx + c = 0 is:",
//       options: ["-b/a", "b/a", "c/a", "-c/a"],
//       correct: 2,
//     },
//   ];

//   const startQuiz = (quiz) => {
//     setSelectedQuiz(quiz);
//     setIsPlaying(true);
//     setCurrentQuestion(0);
//     setAnswers({});
//     setShowResults(false);
//   };

//   const handleAnswer = (questionId, answerIndex) => {
//     setAnswers({ ...answers, [questionId]: answerIndex });
//   };

//   const nextQuestion = () => {
//     if (currentQuestion < sampleQuestions.length - 1) {
//       setCurrentQuestion(currentQuestion + 1);
//     }
//   };

//   const prevQuestion = () => {
//     if (currentQuestion > 0) {
//       setCurrentQuestion(currentQuestion - 1);
//     }
//   };

//   const submitQuiz = () => {
//     setShowResults(true);
//   };

//   const calculateScore = () => {
//     let correct = 0;
//     sampleQuestions.forEach((q) => {
//       if (answers[q.id] === q.correct) correct++;
//     });
//     return Math.round((correct / sampleQuestions.length) * 100);
//   };

//   const getDifficultyColor = (difficulty) => {
//     switch (difficulty) {
//       case "Easy":
//         return "bg-success";
//       case "Medium":
//         return "bg-warning";
//       case "Hard":
//         return "bg-destructive";
//       default:
//         return "bg-muted";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-foreground">Quizzes</h1>
//         <p className="text-muted-foreground">Test your knowledge with interactive quizzes</p>
//       </div>

//       {/* Stats */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Available</p>
//                 <p className="text-2xl font-bold">12</p>
//               </div>
//               <BookOpen className="h-8 w-8 text-student" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Completed</p>
//                 <p className="text-2xl font-bold text-success">8</p>
//               </div>
//               <CheckCircle className="h-8 w-8 text-success" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Avg. Score</p>
//                 <p className="text-2xl font-bold">82%</p>
//               </div>
//               <Trophy className="h-8 w-8 text-warning" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Time Spent</p>
//                 <p className="text-2xl font-bold">4.5h</p>
//               </div>
//               <Timer className="h-8 w-8 text-admin" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Available Quizzes */}
//       <div className="grid gap-4 md:grid-cols-2">
//         {availableQuizzes.map((quiz) => (
//           <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
//             <CardHeader>
//               <div className="flex items-start justify-between">
//                 <div>
//                   <Badge variant="outline" className="mb-2">{quiz.subject}</Badge>
//                   <CardTitle className="text-lg">{quiz.title}</CardTitle>
//                 </div>
//                 <Badge className={getDifficultyColor(quiz.difficulty)}>
//                   {quiz.difficulty}
//                 </Badge>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center gap-6 text-sm text-muted-foreground">
//                 <span className="flex items-center gap-1">
//                   <BookOpen className="h-4 w-4" />
//                   {quiz.questions} Questions
//                 </span>
//                 <span className="flex items-center gap-1">
//                   <Clock className="h-4 w-4" />
//                   {quiz.duration} min
//                 </span>
//               </div>
//               {quiz.bestScore !== null && (
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span>Best Score</span>
//                     <span className="font-medium">{quiz.bestScore}%</span>
//                   </div>
//                   <Progress value={quiz.bestScore} className="h-2" />
//                 </div>
//               )}
//               <div className="flex items-center justify-between pt-2">
//                 <span className="text-sm text-muted-foreground">
//                   {quiz.attempts} attempt(s)
//                 </span>
//                 <Button className="gap-2" onClick={() => startQuiz(quiz)}>
//                   <Play className="h-4 w-4" />
//                   {quiz.attempts > 0 ? "Retake" : "Start Quiz"}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Quiz Dialog */}
//       <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
//         <DialogContent className="max-w-2xl">
//           {selectedQuiz && !showResults && (
//             <>
//               <DialogHeader>
//                 <div className="flex items-center justify-between">
//                   <DialogTitle>{selectedQuiz.title}</DialogTitle>
//                   <Badge variant="outline" className="gap-1">
//                     <Clock className="h-3 w-3" />
//                     {selectedQuiz.duration}:00
//                   </Badge>
//                 </div>
//               </DialogHeader>

//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-muted-foreground">
//                     Question {currentQuestion + 1} of {sampleQuestions.length}
//                   </span>
//                   <Progress
//                     value={((currentQuestion + 1) / sampleQuestions.length) * 100}
//                     className="w-32 h-2"
//                   />
//                 </div>

//                 <div className="p-6 bg-muted/50 rounded-lg">
//                   <h3 className="text-lg font-medium mb-4">
//                     {sampleQuestions[currentQuestion].question}
//                   </h3>
//                   <RadioGroup
//                     value={answers[sampleQuestions[currentQuestion].id]?.toString()}
//                     onValueChange={(value) =>
//                       handleAnswer(sampleQuestions[currentQuestion].id, parseInt(value))
//                     }
//                   >
//                     {sampleQuestions[currentQuestion].options.map((option, i) => (
//                       <div
//                         key={i}
//                         className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background transition-colors"
//                       >
//                         <RadioGroupItem value={i.toString()} id={`option-${i}`} />
//                         <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
//                           {option}
//                         </Label>
//                       </div>
//                     ))}
//                   </RadioGroup>
//                 </div>

//                 <div className="flex justify-between">
//                   <Button
//                     variant="outline"
//                     onClick={prevQuestion}
//                     disabled={currentQuestion === 0}
//                     className="gap-2 bg-transparent"
//                   >
//                     <ArrowLeft className="h-4 w-4" />
//                     Previous
//                   </Button>
//                   {currentQuestion === sampleQuestions.length - 1 ? (
//                     <Button onClick={submitQuiz} className="gap-2">
//                       Submit Quiz
//                       <CheckCircle className="h-4 w-4" />
//                     </Button>
//                   ) : (
//                     <Button onClick={nextQuestion} className="gap-2">
//                       Next
//                       <ArrowRight className="h-4 w-4" />
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}

//           {showResults && (
//             <div className="text-center space-y-6 py-6">
//               <Trophy className="h-16 w-16 mx-auto text-warning" />
//               <div>
//                 <h2 className="text-2xl font-bold">Quiz Completed!</h2>
//                 <p className="text-muted-foreground">Here are your results</p>
//               </div>
//               <div className="text-5xl font-bold text-student">{calculateScore()}%</div>
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div className="p-4 bg-success/10 rounded-lg">
//                   <p className="text-success font-medium">Correct</p>
//                   <p className="text-2xl font-bold">
//                     {sampleQuestions.filter((q) => answers[q.id] === q.correct).length}
//                   </p>
//                 </div>
//                 <div className="p-4 bg-destructive/10 rounded-lg">
//                   <p className="text-destructive font-medium">Incorrect</p>
//                   <p className="text-2xl font-bold">
//                     {sampleQuestions.filter((q) => answers[q.id] !== q.correct).length}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex gap-4 justify-center">
//                 <Button variant="outline" onClick={() => setIsPlaying(false)}>
//                   Close
//                 </Button>
//                 <Button onClick={() => startQuiz(selectedQuiz)}>
//                   Try Again
//                 </Button>
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }



