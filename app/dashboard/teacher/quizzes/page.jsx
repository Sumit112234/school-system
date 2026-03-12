// [
//   {
//     "question": "What is the synonym of 'happy'?",
//     "type": "multiple-choice",
//     "options": [
//       "Sad",
//       "Joyful",
//       "Angry",
//       "Tired"
//     ],
//     "correctAnswer": 1,
//     "points": 1,
//     "explanation": "Joyful means feeling, expressing, or causing great pleasure and happiness, which is a synonym for happy."
//   },
//   {
//     "question": "Which of the following is a proper noun?",
//     "type": "multiple-choice",
//     "options": [
//       "city",
//       "book",
//       "London",
//       "dog"
//     ],
//     "correctAnswer": 2,
//     "points": 2,
//     "explanation": "London is a proper noun because it is the specific name of a place and should be capitalized."
//   },
//   {
//     "question": "A verb is an action word.",
//     "type": "true-false",
//     "correctAnswer": true,
//     "points": 1,
//     "explanation": "True. Verbs are words that describe actions, occurrences, or states of being (run, jump, is, are)."
//   },
//   {
//     "question": "What is the past tense of 'go'?",
//     "type": "short-answer",
//     "correctAnswer": "went",
//     "points": 2,
//     "explanation": "The past tense of 'go' is 'went'. Example: Yesterday I went to the park."
//   },
//   {
//     "question": "Which word is an adjective in the sentence: 'The beautiful flowers bloom in spring.'?",
//     "type": "multiple-choice",
//     "options": [
//       "flowers",
//       "beautiful",
//       "bloom",
//       "spring"
//     ],
//     "correctAnswer": 1,
//     "points": 2,
//     "explanation": "Beautiful is an adjective because it describes the noun 'flowers'."
//   },
//   {
//     "question": "An adverb modifies a verb, adjective, or another adverb.",
//     "type": "true-false",
//     "correctAnswer": true,
//     "points": 1,
//     "explanation": "True. Adverbs modify verbs (ran quickly), adjectives (very tall), or other adverbs (too slowly)."
//   },
//   {
//     "question": "What is the plural form of 'child'?",
//     "type": "short-answer",
//     "correctAnswer": "children",
//     "points": 2,
//     "explanation": "Child is an irregular noun that becomes 'children' in its plural form."
//   },
//   {
//     "question": "Which sentence uses the correct punctuation?",
//     "type": "multiple-choice",
//     "options": [
//       "Where are you going",
//       "Where are you going.",
//       "Where are you going?",
//       "where are you going?"
//     ],
//     "correctAnswer": 2,
//     "points": 2,
//     "explanation": "A question sentence should end with a question mark (?) and begin with a capital letter."
//   },
//   {
//     "question": "Identify the pronoun in this sentence: 'She went to the market.'",
//     "type": "multiple-choice",
//     "options": [
//       "went",
//       "market",
//       "She",
//       "the"
//     ],
//     "correctAnswer": 2,
//     "points": 1,
//     "explanation": "She is a pronoun because it replaces the name of a person (e.g., instead of saying 'Mary went', we say 'She went')."
//   },
//   {
//     "question": "What is the opposite (antonym) of 'difficult'?",
//     "type": "short-answer",
//     "correctAnswer": "easy",
//     "points": 2,
//     "explanation": "Easy is the antonym of difficult. Other possible answers could include 'simple'."
//   }
// ]

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Edit, Trash2, Eye, Users, Clock, Calendar, CheckCircle2, 
  XCircle, Loader2, AlertCircle, FileText, Trophy, Timer, X,
  Upload, Download, FileJson
} from "lucide-react";

const QUESTION_TYPES = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "true-false", label: "True/False" },
  { value: "short-answer", label: "Short Answer" },
];

function QuizDialog({ quiz, open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({
    title: "", description: "", classId: "", subjectId: "", duration: "30",
    passingScore: "50", startDate: "", endDate: "", maxAttempts: "1",
    shuffleQuestions: false, showResults: true, status: "draft",
  });
  const [questions, setQuestions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkError, setBulkError] = useState(null);

  useEffect(() => {

    console.log('inside useEffect, open:', open, 'quiz:', quiz  )
    if (open) {
      fetchData();
      if (quiz) {
        setForm({
          title: quiz.title, description: quiz.description || "",
          classId: quiz.class._id, subjectId: quiz.subject._id,
          duration: String(quiz.duration), passingScore: String(quiz.passingScore),
          startDate: new Date(quiz.startDate).toISOString().slice(0, 16),
          endDate: new Date(quiz.endDate).toISOString().slice(0, 16),
          maxAttempts: String(quiz.maxAttempts),
          shuffleQuestions: quiz.shuffleQuestions, showResults: quiz.showResults,
          status: quiz.status,
        });

        console.log("Setting questions from quiz:", quiz);
        setQuestions(quiz.questions || []);
      } else {
        resetForm();
      }
    }
  }, [open, quiz]);

  const resetForm = () => {
    setForm({
      title: "", description: "", classId: "", subjectId: "", duration: "30",
      passingScore: "50", startDate: "", endDate: "", maxAttempts: "1",
      shuffleQuestions: false, showResults: true, status: "draft",
    });
    setQuestions([]);
    setBulkJson("");
    setBulkError(null);
    setStep(1);
  };

  const fetchData = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        fetch("/api/teacher/classes")
        
      ]);
      const [classesData] = await Promise.all([classesRes.json()]);

      console.log('classes->', classesData)
      setClasses(classesData.data?.classes || []);

      let sub = classesData.data?.classes.map((c)=>{ return c.allSubjects}).flat();

      console.log(sub)
      setSubjects(sub || []);

      // console.log(classesData.data?.classes.find(c => c._id === '6991d3c18c3c6762a2dd7d96')?.allSubjects) ;

      console.log("Fetched data:", classesData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question: "", type: "multiple-choice", options: ["", "", "", ""],
      correctAnswer: 0, points: 1, explanation: ""
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleBulkUpload = () => {
    setBulkError(null);
    
    if (!bulkJson.trim()) {
      setBulkError("Please enter JSON data");
      return;
    }

    try {
      const parsedQuestions = JSON.parse(bulkJson);
      
      // Validate that it's an array
      if (!Array.isArray(parsedQuestions)) {
        setBulkError("JSON must be an array of questions");
        return;
      }

      // Validate each question has required fields
      const validatedQuestions = parsedQuestions.map((q, index) => {
        const question = {
          question: q.question || "",
          type: q.type || "multiple-choice",
          points: q.points || 1,
          explanation: q.explanation || "",
          correctAnswer : q.correctAnswer
        };

        // Validate based on question type
        if (question.type === "multiple-choice") {
          if (!Array.isArray(q.options) || q.options.length < 2) {
            throw new Error(`Question ${index + 1}: Multiple choice questions must have at least 2 options`);
          }
          question.options = q.options;
          question.correctAnswer = q.correctAnswer !== undefined ? q.correctAnswer : 0;
        } else if (question.type === "true-false") {
          question.options = ["True", "False"];
          question.correctAnswer = q.correctAnswer === true || q.correctAnswer === "true";
        } else if (question.type === "short-answer") {
          question.correctAnswer = q.correctAnswer || "";
        } else {
          throw new Error(`Question ${index + 1}: Invalid question type "${q.type}"`);
        }

        return question;
      });

      setQuestions([...questions, ...validatedQuestions]);
      setBulkJson("");
      setStep(2); // Switch to questions tab to show the uploaded questions
    } catch (err) {
      setBulkError(err.message);
    }
  };

  const handleDownloadSample = () => {
    const sampleQuestions = [
      {
        question: "What is the capital of France?",
        type: "multiple-choice",
        options: ["London", "Paris", "Berlin", "Madrid"],
        correctAnswer: 1,
        points: 2,
        explanation: "Paris is the capital of France"
      },
      {
        question: "The Earth is flat.",
        type: "true-false",
        correctAnswer: false,
        points: 1,
        explanation: "The Earth is actually spherical"
      },
      {
        question: "What is the chemical symbol for water?",
        type: "short-answer",
        correctAnswer: "H2O",
        points: 2,
        explanation: "H2O represents two hydrogen atoms and one oxygen atom"
      }
    ];

    const blob = new Blob([JSON.stringify(sampleQuestions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-questions.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {

    console.log("Submitting quiz with data:", { ...form, questions });
    setError(null);
    if (!form.title || !form.classId || !form.subjectId || !form.endDate) {
      setError("Title, class, subject, and end date are required");
      return;
    }
    console.log(questions)
    if (questions.length === 0) {
      setError("At least one question is required");
      return;
    }

    console.log("Submitting quiz with data:", { ...form, questions });
    // return ;
    setSaving(true);


    try {
      const url = quiz ? `/api/teacher/quizzes/${quiz._id}` : "/api/teacher/quizzes";
      const method = quiz ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, questions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save quiz");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quiz ? "Edit Quiz" : "Create New Quiz"}</DialogTitle>
        </DialogHeader>

        <Tabs value={String(step)} onValueChange={(v) => setStep(Number(v))}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1">Basic Info</TabsTrigger>
            <TabsTrigger value="2">Questions ({questions.length})</TabsTrigger>
            <TabsTrigger value="3">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="1" className="space-y-4 pt-4">
            {error && <div className="text-destructive text-sm">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
              <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
              
              <div><Label>Class</Label><Select value={form.classId} onValueChange={v => {
                setSubjects(classes.find(c => c._id === v)?.allSubjects || []);
                setForm({...form, classId: v})
                }}>
                <SelectTrigger><SelectValue  placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name} - {c.section}</SelectItem>)}</SelectContent>
              </Select></div>
              
              <div><Label>Subject</Label><Select value={form.subjectId} onValueChange={v => setForm({...form, subjectId: v})}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
              </Select></div>
              
              <div><Label>Duration (minutes)</Label><Input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} /></div>
              <div><Label>Passing Score (%)</Label><Input type="number" value={form.passingScore} onChange={e => setForm({...form, passingScore: e.target.value})} /></div>
              
              <div><Label>Start Date</Label><Input type="datetime-local" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
              <div><Label>End Date</Label><Input type="datetime-local" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
              
              <div><Label>Max Attempts</Label><Input type="number" value={form.maxAttempts} onChange={e => setForm({...form, maxAttempts: e.target.value})} /></div>
              <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select></div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.shuffleQuestions} onCheckedChange={v => setForm({...form, shuffleQuestions: v})} />
                <Label>Shuffle Questions</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.showResults} onCheckedChange={v => setForm({...form, showResults: v})} />
                <Label>Show Results</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="2" className="space-y-3 pt-4 max-h-[500px] overflow-y-auto">
            {questions.map((q, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between">
                  <Label>Question {i + 1}</Label>
                  <Button variant="ghost" size="sm" onClick={() => removeQuestion(i)}><X className="h-4 w-4" /></Button>
                </div>
                
                <Input placeholder="Question text" value={q.question} onChange={e => updateQuestion(i, "question", e.target.value)} />
                
                <div className="grid grid-cols-3 gap-2">
                  <Select value={q.type} onValueChange={v => updateQuestion(i, "type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{QUESTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="Points" value={q.points} onChange={e => updateQuestion(i, "points", Number(e.target.value))} />
                </div>

                {q.type === "multiple-choice" && (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex gap-2">
                        <Input placeholder={`Option ${oi + 1}`} value={opt} onChange={e => {
                          const newOpts = [...q.options];
                          newOpts[oi] = e.target.value;
                          updateQuestion(i, "options", newOpts);
                        }} />
                        <Switch checked={q.correctAnswer === oi} onCheckedChange={() => updateQuestion(i, "correctAnswer", oi)} />
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "true-false" && (
                  <Select value={String(q.correctAnswer)} onValueChange={v => updateQuestion(i, "correctAnswer", v === "true")}>
                    <SelectTrigger><SelectValue placeholder="Correct answer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {q.type === "short-answer" && (
                  <Input placeholder="Correct answer" value={q.correctAnswer} onChange={e => updateQuestion(i, "correctAnswer", e.target.value)} />
                )}

                <Input placeholder="Explanation (optional)" value={q.explanation} onChange={e => updateQuestion(i, "explanation", e.target.value)} />
              </div>
            ))}
            <Button onClick={addQuestion} className="w-full" variant="outline"><Plus className="h-4 w-4 mr-2" />Add Question</Button>
          </TabsContent>

          <TabsContent value="3" className="space-y-4 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Bulk Upload Questions</h3>
              <Button variant="outline" size="sm" onClick={handleDownloadSample}>
                <Download className="h-4 w-4 mr-2" />
                Sample JSON
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>JSON Data</Label>
              <Textarea
                placeholder='Paste your JSON array of questions here. Example: [{"question": "...", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "points": 1}]'
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            {bulkError && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                {bulkError}
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">JSON Format Guide:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <strong>Multiple Choice:</strong> {"{"} "question": "...", "type": "multiple-choice", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "points": 1, "explanation": "..." {"}"}</li>
                <li>• <strong>True/False:</strong> {"{"} "question": "...", "type": "true-false", "correctAnswer": true, "points": 1, "explanation": "..." {"}"}</li>
                <li>• <strong>Short Answer:</strong> {"{"} "question": "...", "type": "short-answer", "correctAnswer": "answer", "points": 1, "explanation": "..." {"}"}</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleBulkUpload} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Upload Questions
              </Button>
              <Button variant="outline" onClick={() => setBulkJson("")}>
                Clear
              </Button>
            </div>

            {questions.length > 0 && (
              <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-3 rounded-md text-sm">
                <CheckCircle2 className="h-4 w-4 inline mr-2" />
                Successfully added {questions.length} question{questions.length !== 1 ? 's' : ''}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Quiz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuizResultsDialog({ quiz, open, onOpenChange }) {
  if (!quiz) return null;

  const attempts = quiz.attempts || [];
  const avgScore = attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Quiz Results - {quiz.title}</DialogTitle></DialogHeader>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card><CardContent className="pt-6 text-center"><Users className="h-6 w-6 mx-auto mb-2" /><p className="text-2xl font-bold">{attempts.length}</p><p className="text-xs text-muted-foreground">Attempts</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><Trophy className="h-6 w-6 mx-auto mb-2" /><p className="text-2xl font-bold">{avgScore.toFixed(1)}%</p><p className="text-xs text-muted-foreground">Avg Score</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" /><p className="text-2xl font-bold">{attempts.filter(a => a.percentage >= quiz.passingScore).length}</p><p className="text-xs text-muted-foreground">Passed</p></CardContent></Card>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {attempts.map((attempt, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{attempt.student.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(attempt.completedAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${attempt.percentage >= quiz.passingScore ? 'text-green-600' : 'text-red-600'}`}>{attempt.percentage.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">{attempt.score}/{attempt.totalPoints} pts</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizDialog, setQuizDialog] = useState({ open: false, quiz: null });
  const [resultsDialog, setResultsDialog] = useState({ open: false, quiz: null });

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/quizzes");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to fetch quizzes");
      setQuizzes(data.data?.data || []);
      console.log("Fetched quizzes inside fetchQuizzes:", data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this quiz?")) return;
    try {
      const res = await fetch(`/api/teacher/quizzes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchQuizzes();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="text-center py-12"><AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" /><p className="text-destructive">{error}</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Quizzes</h1><p className="text-muted-foreground">Create and manage quizzes</p></div>
        <Button onClick={() => setQuizDialog({ open: true, quiz: null })}><Plus className="h-4 w-4 mr-2" />Create Quiz</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map(quiz => (
          <Card key={quiz._id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg">{quiz.title}</CardTitle>
                <Badge variant={quiz.status === "published" ? "default" : "secondary"}>{quiz.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{quiz.class?.name} • {quiz.subject?.name}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-muted-foreground">Questions</p><p className="font-medium">{quiz.questions?.length || 0}</p></div>
                <div><p className="text-muted-foreground">Duration</p><p className="font-medium">{quiz.duration} min</p></div>
                <div><p className="text-muted-foreground">Attempts</p><p className="font-medium">{quiz.attempts?.length || 0}</p></div>
                <div><p className="text-muted-foreground">Points</p><p className="font-medium">{quiz.totalPoints}</p></div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setQuizDialog({ open: true, quiz })}><Edit className="h-3 w-3" /></Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setResultsDialog({ open: true, quiz })}><Eye className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(quiz._id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <QuizDialog {...quizDialog} onOpenChange={(open) => setQuizDialog({ ...quizDialog, open })} onSaved={fetchQuizzes} />
      <QuizResultsDialog {...resultsDialog} onOpenChange={(open) => setResultsDialog({ ...resultsDialog, open })} />
    </div>
  );
}





// ------------------------------------------------------------------------------
// This file is currently not in use. The teacher quizzes management page is implemented in the admin panel for now. 
// We can move it back here and add teacher-specific features later if needed.
// ------------------------------------------------------------------------------



// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Plus, Edit, Trash2, Eye, Users, Clock, Calendar, CheckCircle2, 
//   XCircle, Loader2, AlertCircle, FileText, Trophy, Timer, X
// } from "lucide-react";

// const QUESTION_TYPES = [
//   { value: "multiple-choice", label: "Multiple Choice" },
//   { value: "true-false", label: "True/False" },
//   { value: "short-answer", label: "Short Answer" },
// ];

// function QuizDialog({ quiz, open, onOpenChange, onSaved }) {
//   const [form, setForm] = useState({
//     title: "", description: "", classId: "", subjectId: "", duration: "30",
//     passingScore: "50", startDate: "", endDate: "", maxAttempts: "1",
//     shuffleQuestions: false, showResults: true, status: "draft",
//   });
//   const [questions, setQuestions] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [step, setStep] = useState(1);

//   useEffect(() => {
//     if (open) {
//       fetchData();
//       if (quiz) {
//         setForm({
//           title: quiz.title, description: quiz.description || "",
//           classId: quiz.class._id, subjectId: quiz.subject._id,
//           duration: String(quiz.duration), passingScore: String(quiz.passingScore),
//           startDate: new Date(quiz.startDate).toISOString().slice(0, 16),
//           endDate: new Date(quiz.endDate).toISOString().slice(0, 16),
//           maxAttempts: String(quiz.maxAttempts),
//           shuffleQuestions: quiz.shuffleQuestions, showResults: quiz.showResults,
//           status: quiz.status,
//         });
//         setQuestions(quiz.questions || []);
//       } else {
//         resetForm();
//       }
//     }
//   }, [open, quiz]);

//   const resetForm = () => {
//     setForm({
//       title: "", description: "", classId: "", subjectId: "", duration: "30",
//       passingScore: "50", startDate: "", endDate: "", maxAttempts: "1",
//       shuffleQuestions: false, showResults: true, status: "draft",
//     });
//     setQuestions([]);
//     setStep(1);
//   };

//   const fetchData = async () => {
//     try {
//       const [classesRes, subjectsRes] = await Promise.all([
//         fetch("/api/teacher/classes"),
//         fetch("/api/admin/subjects?limit=1000"),
//       ]);
//       const [classesData, subjectsData] = await Promise.all([classesRes.json(), subjectsRes.json()]);
//       setClasses(classesData.data?.classes || []);
//       setSubjects(subjectsData.data?.data || []);

//       console.log("Fetched data:", classesData, subjectsData);
//     } catch (err) {
//       console.error("Failed to fetch data:", err);
//     }
//   };

//   const addQuestion = () => {
//     setQuestions([...questions, {
//       question: "", type: "multiple-choice", options: ["", "", "", ""],
//       correctAnswer: 0, points: 1, explanation: ""
//     }]);
//   };

//   const updateQuestion = (index, field, value) => {
//     const updated = [...questions];
//     updated[index] = { ...updated[index], [field]: value };
//     setQuestions(updated);
//   };

//   const removeQuestion = (index) => {
//     setQuestions(questions.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async () => {
//     setError(null);
//     if (!form.title || !form.classId || !form.subjectId || !form.endDate) {
//       setError("Title, class, subject, and end date are required");
//       return;
//     }
//     if (questions.length === 0) {
//       setError("At least one question is required");
//       return;
//     }

//     setSaving(true);
//     try {
//       const url = quiz ? `/api/teacher/quizzes/${quiz._id}` : "/api/teacher/quizzes";
//       const method = quiz ? "PUT" : "POST";
//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...form, questions }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Failed to save quiz");
//       onSaved();
//       onOpenChange(false);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>{quiz ? "Edit Quiz" : "Create New Quiz"}</DialogTitle>
//         </DialogHeader>

//         <Tabs value={String(step)} onValueChange={(v) => setStep(Number(v))}>
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="1">Basic Info</TabsTrigger>
//             <TabsTrigger value="2">Questions ({questions.length})</TabsTrigger>
//           </TabsList>

//           <TabsContent value="1" className="space-y-4 pt-4">
//             {error && <div className="text-destructive text-sm">{error}</div>}
            
//             <div className="grid grid-cols-2 gap-4">
//               <div className="col-span-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
//               <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
              
//               <div><Label>Class</Label><Select value={form.classId} onValueChange={v => setForm({...form, classId: v})}>
//                 <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
//                 <SelectContent>{classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name} - {c.section}</SelectItem>)}</SelectContent>
//               </Select></div>
              
//               <div><Label>Subject</Label><Select value={form.subjectId} onValueChange={v => setForm({...form, subjectId: v})}>
//                 <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
//                 <SelectContent>{subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
//               </Select></div>
              
//               <div><Label>Duration (minutes)</Label><Input type="number" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} /></div>
//               <div><Label>Passing Score (%)</Label><Input type="number" value={form.passingScore} onChange={e => setForm({...form, passingScore: e.target.value})} /></div>
              
//               <div><Label>Start Date</Label><Input type="datetime-local" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
//               <div><Label>End Date</Label><Input type="datetime-local" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
              
//               <div><Label>Max Attempts</Label><Input type="number" value={form.maxAttempts} onChange={e => setForm({...form, maxAttempts: e.target.value})} /></div>
//               <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
//                 <SelectTrigger><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="draft">Draft</SelectItem>
//                   <SelectItem value="published">Published</SelectItem>
//                   <SelectItem value="closed">Closed</SelectItem>
//                 </SelectContent>
//               </Select></div>
//             </div>

//             <div className="flex gap-4">
//               <div className="flex items-center gap-2">
//                 <Switch checked={form.shuffleQuestions} onCheckedChange={v => setForm({...form, shuffleQuestions: v})} />
//                 <Label>Shuffle Questions</Label>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Switch checked={form.showResults} onCheckedChange={v => setForm({...form, showResults: v})} />
//                 <Label>Show Results</Label>
//               </div>
//             </div>
//           </TabsContent>

//           <TabsContent value="2" className="space-y-3 pt-4 max-h-[500px] overflow-y-auto">
//             {questions.map((q, i) => (
//               <div key={i} className="p-4 border rounded-lg space-y-3">
//                 <div className="flex justify-between">
//                   <Label>Question {i + 1}</Label>
//                   <Button variant="ghost" size="sm" onClick={() => removeQuestion(i)}><X className="h-4 w-4" /></Button>
//                 </div>
                
//                 <Input placeholder="Question text" value={q.question} onChange={e => updateQuestion(i, "question", e.target.value)} />
                
//                 <div className="grid grid-cols-3 gap-2">
//                   <Select value={q.type} onValueChange={v => updateQuestion(i, "type", v)}>
//                     <SelectTrigger><SelectValue /></SelectTrigger>
//                     <SelectContent>{QUESTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
//                   </Select>
//                   <Input type="number" placeholder="Points" value={q.points} onChange={e => updateQuestion(i, "points", Number(e.target.value))} />
//                 </div>

//                 {q.type === "multiple-choice" && (
//                   <div className="space-y-2">
//                     {q.options.map((opt, oi) => (
//                       <div key={oi} className="flex gap-2">
//                         <Input placeholder={`Option ${oi + 1}`} value={opt} onChange={e => {
//                           const newOpts = [...q.options];
//                           newOpts[oi] = e.target.value;
//                           updateQuestion(i, "options", newOpts);
//                         }} />
//                         <Switch checked={q.correctAnswer === oi} onCheckedChange={() => updateQuestion(i, "correctAnswer", oi)} />
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {q.type === "true-false" && (
//                   <Select value={String(q.correctAnswer)} onValueChange={v => updateQuestion(i, "correctAnswer", v === "true")}>
//                     <SelectTrigger><SelectValue placeholder="Correct answer" /></SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="true">True</SelectItem>
//                       <SelectItem value="false">False</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 )}

//                 {q.type === "short-answer" && (
//                   <Input placeholder="Correct answer" value={q.correctAnswer} onChange={e => updateQuestion(i, "correctAnswer", e.target.value)} />
//                 )}

//                 <Input placeholder="Explanation (optional)" value={q.explanation} onChange={e => updateQuestion(i, "explanation", e.target.value)} />
//               </div>
//             ))}
//             <Button onClick={addQuestion} className="w-full" variant="outline"><Plus className="h-4 w-4 mr-2" />Add Question</Button>
//           </TabsContent>
//         </Tabs>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
//           <Button onClick={handleSubmit} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Quiz</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// function QuizResultsDialog({ quiz, open, onOpenChange }) {
//   if (!quiz) return null;

//   const attempts = quiz.attempts || [];
//   const avgScore = attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length : 0;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader><DialogTitle>Quiz Results - {quiz.title}</DialogTitle></DialogHeader>
        
//         <div className="grid grid-cols-3 gap-3 mb-4">
//           <Card><CardContent className="pt-6 text-center"><Users className="h-6 w-6 mx-auto mb-2" /><p className="text-2xl font-bold">{attempts.length}</p><p className="text-xs text-muted-foreground">Attempts</p></CardContent></Card>
//           <Card><CardContent className="pt-6 text-center"><Trophy className="h-6 w-6 mx-auto mb-2" /><p className="text-2xl font-bold">{avgScore.toFixed(1)}%</p><p className="text-xs text-muted-foreground">Avg Score</p></CardContent></Card>
//           <Card><CardContent className="pt-6 text-center"><CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" /><p className="text-2xl font-bold">{attempts.filter(a => a.percentage >= quiz.passingScore).length}</p><p className="text-xs text-muted-foreground">Passed</p></CardContent></Card>
//         </div>

//         <div className="space-y-2 max-h-96 overflow-y-auto">
//           {attempts.map((attempt, i) => (
//             <div key={i} className="p-3 border rounded-lg">
//               <div className="flex justify-between items-start">
//                 <div>
//                   <p className="font-medium">{attempt.student.user?.name}</p>
//                   <p className="text-xs text-muted-foreground">{new Date(attempt.completedAt).toLocaleString()}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className={`text-xl font-bold ${attempt.percentage >= quiz.passingScore ? 'text-green-600' : 'text-red-600'}`}>{attempt.percentage.toFixed(1)}%</p>
//                   <p className="text-xs text-muted-foreground">{attempt.score}/{attempt.totalPoints} pts</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default function TeacherQuizzesPage() {
//   const [quizzes, setQuizzes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [quizDialog, setQuizDialog] = useState({ open: false, quiz: null });
//   const [resultsDialog, setResultsDialog] = useState({ open: false, quiz: null });

//   useEffect(() => { fetchQuizzes(); }, []);

//   const fetchQuizzes = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/teacher/quizzes");
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message || "Failed to fetch quizzes");
//       setQuizzes(data.data?.data || []);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this quiz?")) return;
//     try {
//       const res = await fetch(`/api/teacher/quizzes/${id}`, { method: "DELETE" });
//       if (!res.ok) throw new Error("Failed to delete");
//       fetchQuizzes();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
//   if (error) return <div className="text-center py-12"><AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" /><p className="text-destructive">{error}</p></div>;

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div><h1 className="text-3xl font-bold">Quizzes</h1><p className="text-muted-foreground">Create and manage quizzes</p></div>
//         <Button onClick={() => setQuizDialog({ open: true, quiz: null })}><Plus className="h-4 w-4 mr-2" />Create Quiz</Button>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {quizzes.map(quiz => (
//           <Card key={quiz._id}>
//             <CardHeader className="pb-3">
//               <div className="flex justify-between items-start gap-2">
//                 <CardTitle className="text-lg">{quiz.title}</CardTitle>
//                 <Badge variant={quiz.status === "published" ? "default" : "secondary"}>{quiz.status}</Badge>
//               </div>
//               <p className="text-sm text-muted-foreground">{quiz.class?.name} • {quiz.subject?.name}</p>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <div className="grid grid-cols-2 gap-2 text-sm">
//                 <div><p className="text-muted-foreground">Questions</p><p className="font-medium">{quiz.questions?.length || 0}</p></div>
//                 <div><p className="text-muted-foreground">Duration</p><p className="font-medium">{quiz.duration} min</p></div>
//                 <div><p className="text-muted-foreground">Attempts</p><p className="font-medium">{quiz.attempts?.length || 0}</p></div>
//                 <div><p className="text-muted-foreground">Points</p><p className="font-medium">{quiz.totalPoints}</p></div>
//               </div>
//               <div className="flex gap-2 pt-2 border-t">
//                 <Button variant="outline" size="sm" className="flex-1" onClick={() => setQuizDialog({ open: true, quiz })}><Edit className="h-3 w-3" /></Button>
//                 <Button variant="outline" size="sm" className="flex-1" onClick={() => setResultsDialog({ open: true, quiz })}><Eye className="h-3 w-3" /></Button>
//                 <Button variant="ghost" size="sm" onClick={() => handleDelete(quiz._id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <QuizDialog {...quizDialog} onOpenChange={(open) => setQuizDialog({ ...quizDialog, open })} onSaved={fetchQuizzes} />
//       <QuizResultsDialog {...resultsDialog} onOpenChange={(open) => setResultsDialog({ ...resultsDialog, open })} />
//     </div>
//   );
// }











// ------------------------------------------------------------------------------
// This file is currently not in use. The teacher quizzes management page is implemented in the admin panel for now. 
// We can move it back here and add teacher-specific features later if needed.
// ------------------------------------------------------------------------------
// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import { useTeacherQuizzes } from "@/hooks/use-teacher-data";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import {
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   Users,
//   Clock,
//   BookOpen,
//   BarChart,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";
// import { toast } from "sonner";

// function LoadingState() {
//   return (
//     <div className="flex items-center justify-center min-h-96">
//       <div className="text-center">
//         <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
//         <p className="text-muted-foreground">Loading your quizzes...</p>
//       </div>
//     </div>
//   );
// }

// export default function TeacherQuizzesPage() {
//   const [isCreating, setIsCreating] = useState(false);
//   const { quizzes, loading, error, refetch, createQuiz } = useTeacherQuizzes();

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

//   const quizzesList = quizzes?.data || [];
//     {
//       id: 2,
//       title: "Trigonometry Basics",
//       subject: "Mathematics",
//       class: "Class 10B",
//       questions: 15,
//       duration: 20,
//       status: "draft",
//       submissions: 0,
//       avgScore: 0,
//     },
//     {
//       id: 3,
//       title: "Algebra Mid-Term",
//       subject: "Mathematics",
//       class: "Class 9A",
//       questions: 20,
//       duration: 30,
//       status: "completed",
//       submissions: 32,
//       avgScore: 72,
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Quiz Management</h1>
//           <p className="text-muted-foreground">Create and manage quizzes for your students</p>
//         </div>
//         <Dialog open={isCreating} onOpenChange={setIsCreating}>
//           <DialogTrigger asChild>
//             <Button className="gap-2 bg-teacher hover:bg-teacher/90">
//               <Plus className="h-4 w-4" />
//               Create Quiz
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle>Create New Quiz</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4 pt-4">
//               <div className="grid gap-4 md:grid-cols-2">
//                 <div className="space-y-2">
//                   <Label>Quiz Title</Label>
//                   <Input placeholder="Enter quiz title" />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Subject</Label>
//                   <Select>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select subject" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="math">Mathematics</SelectItem>
//                       <SelectItem value="physics">Physics</SelectItem>
//                       <SelectItem value="chemistry">Chemistry</SelectItem>
//                       <SelectItem value="english">English</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Class</Label>
//                   <Select>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select class" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="9a">Class 9A</SelectItem>
//                       <SelectItem value="9b">Class 9B</SelectItem>
//                       <SelectItem value="10a">Class 10A</SelectItem>
//                       <SelectItem value="10b">Class 10B</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Duration (minutes)</Label>
//                   <Input type="number" placeholder="15" />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label>Instructions</Label>
//                 <Textarea placeholder="Enter quiz instructions for students" rows={3} />
//               </div>

//               <div className="border rounded-lg p-4 space-y-4">
//                 <div className="flex items-center justify-between">
//                   <h3 className="font-medium">Questions</h3>
//                   <Button variant="outline" size="sm" className="gap-1 bg-transparent">
//                     <Plus className="h-3 w-3" />
//                     Add Question
//                   </Button>
//                 </div>
//                 <div className="text-center py-8 text-muted-foreground">
//                   <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
//                   <p>No questions added yet</p>
//                   <p className="text-sm">Click Add Question to start building your quiz</p>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button variant="outline" onClick={() => setIsCreating(false)}>
//                   Save as Draft
//                 </Button>
//                 <Button onClick={() => setIsCreating(false)}>
//                   Publish Quiz
//                 </Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Stats */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Quizzes</p>
//                 <p className="text-2xl font-bold">12</p>
//               </div>
//               <BookOpen className="h-8 w-8 text-teacher" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Active</p>
//                 <p className="text-2xl font-bold text-success">5</p>
//               </div>
//               <Badge className="bg-success">Live</Badge>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Submissions</p>
//                 <p className="text-2xl font-bold text-student">156</p>
//               </div>
//               <Users className="h-8 w-8 text-student" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Avg. Score</p>
//                 <p className="text-2xl font-bold">74%</p>
//               </div>
//               <BarChart className="h-8 w-8 text-warning" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Quizzes List */}
//       <div className="space-y-4">
//         {quizzes.map((quiz) => (
//           <Card key={quiz.id}>
//             <CardContent className="pt-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <h3 className="font-semibold text-lg">{quiz.title}</h3>
//                     <Badge
//                       className={
//                         quiz.status === "active"
//                           ? "bg-success"
//                           : quiz.status === "draft"
//                           ? "bg-warning"
//                           : "bg-muted text-muted-foreground"
//                       }
//                     >
//                       {quiz.status}
//                     </Badge>
//                   </div>
//                   <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                     <Badge variant="outline">{quiz.subject}</Badge>
//                     <span>{quiz.class}</span>
//                     <span className="flex items-center gap-1">
//                       <BookOpen className="h-3 w-3" />
//                       {quiz.questions} questions
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <Clock className="h-3 w-3" />
//                       {quiz.duration} min
//                     </span>
//                   </div>
//                   {quiz.status !== "draft" && (
//                     <div className="flex items-center gap-4 text-sm">
//                       <span className="flex items-center gap-1">
//                         <Users className="h-3 w-3 text-student" />
//                         {quiz.submissions} submissions
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <BarChart className="h-3 w-3 text-teacher" />
//                         {quiz.avgScore}% avg score
//                       </span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex gap-2">
//                   <Button variant="outline" size="sm" className="gap-1 bg-transparent">
//                     <Eye className="h-3 w-3" />
//                     View
//                   </Button>
//                   <Button variant="outline" size="sm" className="gap-1 bg-transparent">
//                     <Edit className="h-3 w-3" />
//                     Edit
//                   </Button>
//                   <Button variant="ghost" size="sm" className="text-destructive">
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }




// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import {
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   Users,
//   Clock,
//   BookOpen,
//   BarChart,
// } from "lucide-react";

// export default function TeacherQuizzesPage() {
//   const [isCreating, setIsCreating] = useState(false);

//   const quizzes = [
//     {
//       id: 1,
//       title: "Quadratic Equations Test",
//       subject: "Mathematics",
//       class: "Class 10A",
//       questions: 10,
//       duration: 15,
//       status: "active",
//       submissions: 28,
//       avgScore: 78,
//     },
//     {
//       id: 2,
//       title: "Trigonometry Basics",
//       subject: "Mathematics",
//       class: "Class 10B",
//       questions: 15,
//       duration: 20,
//       status: "draft",
//       submissions: 0,
//       avgScore: 0,
//     },
//     {
//       id: 3,
//       title: "Algebra Mid-Term",
//       subject: "Mathematics",
//       class: "Class 9A",
//       questions: 20,
//       duration: 30,
//       status: "completed",
//       submissions: 32,
//       avgScore: 72,
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Quiz Management</h1>
//           <p className="text-muted-foreground">Create and manage quizzes for your students</p>
//         </div>
//         <Dialog open={isCreating} onOpenChange={setIsCreating}>
//           <DialogTrigger asChild>
//             <Button className="gap-2 bg-teacher hover:bg-teacher/90">
//               <Plus className="h-4 w-4" />
//               Create Quiz
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle>Create New Quiz</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4 pt-4">
//               <div className="grid gap-4 md:grid-cols-2">
//                 <div className="space-y-2">
//                   <Label>Quiz Title</Label>
//                   <Input placeholder="Enter quiz title" />
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Subject</Label>
//                   <Select>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select subject" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="math">Mathematics</SelectItem>
//                       <SelectItem value="physics">Physics</SelectItem>
//                       <SelectItem value="chemistry">Chemistry</SelectItem>
//                       <SelectItem value="english">English</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Class</Label>
//                   <Select>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select class" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="9a">Class 9A</SelectItem>
//                       <SelectItem value="9b">Class 9B</SelectItem>
//                       <SelectItem value="10a">Class 10A</SelectItem>
//                       <SelectItem value="10b">Class 10B</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label>Duration (minutes)</Label>
//                   <Input type="number" placeholder="15" />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label>Instructions</Label>
//                 <Textarea placeholder="Enter quiz instructions for students" rows={3} />
//               </div>

//               <div className="border rounded-lg p-4 space-y-4">
//                 <div className="flex items-center justify-between">
//                   <h3 className="font-medium">Questions</h3>
//                   <Button variant="outline" size="sm" className="gap-1 bg-transparent">
//                     <Plus className="h-3 w-3" />
//                     Add Question
//                   </Button>
//                 </div>
//                 <div className="text-center py-8 text-muted-foreground">
//                   <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
//                   <p>No questions added yet</p>
//                   <p className="text-sm">Click Add Question to start building your quiz</p>
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button variant="outline" onClick={() => setIsCreating(false)}>
//                   Save as Draft
//                 </Button>
//                 <Button onClick={() => setIsCreating(false)}>
//                   Publish Quiz
//                 </Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Stats */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Quizzes</p>
//                 <p className="text-2xl font-bold">12</p>
//               </div>
//               <BookOpen className="h-8 w-8 text-teacher" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Active</p>
//                 <p className="text-2xl font-bold text-success">5</p>
//               </div>
//               <Badge className="bg-success">Live</Badge>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Submissions</p>
//                 <p className="text-2xl font-bold text-student">156</p>
//               </div>
//               <Users className="h-8 w-8 text-student" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Avg. Score</p>
//                 <p className="text-2xl font-bold">74%</p>
//               </div>
//               <BarChart className="h-8 w-8 text-warning" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Quizzes List */}
//       <div className="space-y-4">
//         {quizzes.map((quiz) => (
//           <Card key={quiz.id}>
//             <CardContent className="pt-6">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <h3 className="font-semibold text-lg">{quiz.title}</h3>
//                     <Badge
//                       className={
//                         quiz.status === "active"
//                           ? "bg-success"
//                           : quiz.status === "draft"
//                           ? "bg-warning"
//                           : "bg-muted text-muted-foreground"
//                       }
//                     >
//                       {quiz.status}
//                     </Badge>
//                   </div>
//                   <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                     <Badge variant="outline">{quiz.subject}</Badge>
//                     <span>{quiz.class}</span>
//                     <span className="flex items-center gap-1">
//                       <BookOpen className="h-3 w-3" />
//                       {quiz.questions} questions
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <Clock className="h-3 w-3" />
//                       {quiz.duration} min
//                     </span>
//                   </div>
//                   {quiz.status !== "draft" && (
//                     <div className="flex items-center gap-4 text-sm">
//                       <span className="flex items-center gap-1">
//                         <Users className="h-3 w-3 text-student" />
//                         {quiz.submissions} submissions
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <BarChart className="h-3 w-3 text-teacher" />
//                         {quiz.avgScore}% avg score
//                       </span>
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex gap-2">
//                   <Button variant="outline" size="sm" className="gap-1 bg-transparent">
//                     <Eye className="h-3 w-3" />
//                     View
//                   </Button>
//                   <Button variant="outline" size="sm" className="gap-1 bg-transparent">
//                     <Edit className="h-3 w-3" />
//                     Edit
//                   </Button>
//                   <Button variant="ghost" size="sm" className="text-destructive">
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }
