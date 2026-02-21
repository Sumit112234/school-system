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




"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  BookOpen,
  BarChart,
} from "lucide-react";

export default function TeacherQuizzesPage() {
  const [isCreating, setIsCreating] = useState(false);

  const quizzes = [
    {
      id: 1,
      title: "Quadratic Equations Test",
      subject: "Mathematics",
      class: "Class 10A",
      questions: 10,
      duration: 15,
      status: "active",
      submissions: 28,
      avgScore: 78,
    },
    {
      id: 2,
      title: "Trigonometry Basics",
      subject: "Mathematics",
      class: "Class 10B",
      questions: 15,
      duration: 20,
      status: "draft",
      submissions: 0,
      avgScore: 0,
    },
    {
      id: 3,
      title: "Algebra Mid-Term",
      subject: "Mathematics",
      class: "Class 9A",
      questions: 20,
      duration: 30,
      status: "completed",
      submissions: 32,
      avgScore: 72,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quiz Management</h1>
          <p className="text-muted-foreground">Create and manage quizzes for your students</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-teacher hover:bg-teacher/90">
              <Plus className="h-4 w-4" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Quiz Title</Label>
                  <Input placeholder="Enter quiz title" />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9a">Class 9A</SelectItem>
                      <SelectItem value="9b">Class 9B</SelectItem>
                      <SelectItem value="10a">Class 10A</SelectItem>
                      <SelectItem value="10b">Class 10B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input type="number" placeholder="15" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Instructions</Label>
                <Textarea placeholder="Enter quiz instructions for students" rows={3} />
              </div>

              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Questions</h3>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <Plus className="h-3 w-3" />
                    Add Question
                  </Button>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No questions added yet</p>
                  <p className="text-sm">Click Add Question to start building your quiz</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Save as Draft
                </Button>
                <Button onClick={() => setIsCreating(false)}>
                  Publish Quiz
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Quizzes</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <BookOpen className="h-8 w-8 text-teacher" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-success">5</p>
              </div>
              <Badge className="bg-success">Live</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Submissions</p>
                <p className="text-2xl font-bold text-student">156</p>
              </div>
              <Users className="h-8 w-8 text-student" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-2xl font-bold">74%</p>
              </div>
              <BarChart className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{quiz.title}</h3>
                    <Badge
                      className={
                        quiz.status === "active"
                          ? "bg-success"
                          : quiz.status === "draft"
                          ? "bg-warning"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {quiz.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline">{quiz.subject}</Badge>
                    <span>{quiz.class}</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {quiz.questions} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {quiz.duration} min
                    </span>
                  </div>
                  {quiz.status !== "draft" && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-student" />
                        {quiz.submissions} submissions
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart className="h-3 w-3 text-teacher" />
                        {quiz.avgScore}% avg score
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
