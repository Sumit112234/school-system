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
import {
  Plus, Edit, Trash2, Eye, Users, Clock, Calendar, CheckCircle2, 
  Loader2, AlertCircle, FileText, Award
} from "lucide-react";

function AssignmentDialog({ assignment, open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({
    title: "", description: "", instructions: "", classId: "", subjectId: "",
    dueDate: "", totalMarks: "100", status: "published", allowLateSubmission: false, lateSubmissionPenalty: "0"
  });
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchData();
      if (assignment) {
        setForm({
          title: assignment.title, description: assignment.description || "", instructions: assignment.instructions || "",
          classId: assignment.class._id, subjectId: assignment.subject._id,
          dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
          totalMarks: String(assignment.totalMarks), status: assignment.status,
          allowLateSubmission: assignment.allowLateSubmission, lateSubmissionPenalty: String(assignment.lateSubmissionPenalty || 0)
        });
      } else {
        setForm({ title: "", description: "", instructions: "", classId: "", subjectId: "", dueDate: "", totalMarks: "100", status: "published", allowLateSubmission: false, lateSubmissionPenalty: "0" });
      }
    }
  }, [open, assignment]);

  const fetchData = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([fetch("/api/teacher/classes"), fetch("/api/admin/subjects?limit=1000")]);
      const [classesData, subjectsData] = await Promise.all([classesRes.json(), subjectsRes.json()]);
      setClasses(classesData.data?.classes || []);
      setSubjects(subjectsData.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.title || !form.classId || !form.subjectId || !form.dueDate) {
      setError("Title, class, subject, and due date are required");
      return;
    }

    setSaving(true);
    try {
      const url = assignment ? `/api/teacher/assignments/${assignment._id}` : "/api/teacher/assignments";
      const res = await fetch(url, {
        method: assignment ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save");
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{assignment ? "Edit Assignment" : "Create Assignment"}</DialogTitle></DialogHeader>
        
        <div className="space-y-4">
          {error && <div className="text-destructive text-sm">{error}</div>}
          <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>
          <div><Label>Instructions</Label><Textarea value={form.instructions} onChange={e => setForm({...form, instructions: e.target.value})} rows={3} /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Class</Label><Select value={form.classId} onValueChange={v => {
                setSubjects(classes.find(c => c._id === v)?.allSubjects || []);
                setForm({...form, classId: v})
                }}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>{classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name} - {c.section}</SelectItem>)}</SelectContent>
            </Select></div>
            
            <div><Label>Subject</Label><Select value={form.subjectId} onValueChange={v => setForm({...form, subjectId: v})}>
              <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>{subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
            </Select></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label>Due Date</Label><Input type="datetime-local" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
            <div><Label>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: e.target.value})} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select></div>
            <div><Label>Late Penalty (%)</Label><Input type="number" value={form.lateSubmissionPenalty} onChange={e => setForm({...form, lateSubmissionPenalty: e.target.value})} disabled={!form.allowLateSubmission} /></div>
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={form.allowLateSubmission} onCheckedChange={v => setForm({...form, allowLateSubmission: v})} />
            <Label>Allow Late Submission</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubmissionsDialog({ assignment, open, onOpenChange }) {
  const [grading, setGrading] = useState({ submissionId: null, grade: "", feedback: "" });
  const [saving, setSaving] = useState(false);

  const handleGrade = async (submission) => {
    if (!grading.grade) return alert("Please enter a grade");
    
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/assignments/${assignment._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission._id, grade: Number(grading.grade), feedback: grading.feedback }),
      });
      if (!res.ok) throw new Error("Failed to grade");
      setGrading({ submissionId: null, grade: "", feedback: "" });
      // Refresh parent
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Submissions - {assignment.title}</DialogTitle></DialogHeader>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card><CardContent className="pt-6 text-center"><Users className="h-6 w-6 mx-auto mb-2" /><p className="text-2xl font-bold">{assignment.submissions?.length || 0}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" /><p className="text-2xl font-bold">{assignment.pendingCount || 0}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" /><p className="text-2xl font-bold">{assignment.gradedCount || 0}</p><p className="text-xs text-muted-foreground">Graded</p></CardContent></Card>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {assignment.submissions?.map(sub => (
            <div key={sub._id} className="p-4 border rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{sub.student?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(sub.submittedAt).toLocaleString()}</p>
                </div>
                <Badge variant={sub.status === "graded" ? "default" : "secondary"}>{sub.status}</Badge>
              </div>
              
              {sub.content && <p className="text-sm">{sub.content}</p>}
              
              {grading.submissionId === sub._id ? (
                <div className="space-y-2">
                  <Input type="number" placeholder="Grade" value={grading.grade} onChange={e => setGrading({...grading, grade: e.target.value})} />
                  <Textarea placeholder="Feedback" value={grading.feedback} onChange={e => setGrading({...grading, feedback: e.target.value})} rows={2} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleGrade(sub)} disabled={saving}>Submit Grade</Button>
                    <Button size="sm" variant="outline" onClick={() => setGrading({ submissionId: null, grade: "", feedback: "" })}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  {sub.grade !== null && sub.grade !== undefined ? (
                    <div><span className="font-bold text-lg">{sub.grade}/{assignment.totalMarks}</span><p className="text-xs text-muted-foreground">{sub.feedback}</p></div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setGrading({ submissionId: sub._id, grade: "", feedback: "" })}>Grade</Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentDialog, setAssignmentDialog] = useState({ open: false, assignment: null });
  const [submissionsDialog, setSubmissionsDialog] = useState({ open: false, assignment: null });

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/assignments");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      setAssignments(data.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      const res = await fetch(`/api/teacher/assignments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchAssignments();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Assignments</h1><p className="text-muted-foreground">Create and manage assignments</p></div>
        <Button onClick={() => setAssignmentDialog({ open: true, assignment: null })}><Plus className="h-4 w-4 mr-2" />Create Assignment</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map(a => (
          <Card key={a._id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg">{a.title}</CardTitle>
                <Badge variant={a.status === "published" ? "default" : "secondary"}>{a.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{a.class?.name} • {a.subject?.name}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-muted-foreground">Due Date</p><p className="font-medium">{new Date(a.dueDate).toLocaleDateString()}</p></div>
                <div><p className="text-muted-foreground">Marks</p><p className="font-medium">{a.totalMarks}</p></div>
                <div><p className="text-muted-foreground">Submitted</p><p className="font-medium">{a.submittedCount || 0}</p></div>
                <div><p className="text-muted-foreground">Graded</p><p className="font-medium">{a.gradedCount || 0}</p></div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setAssignmentDialog({ open: true, assignment: a })}><Edit className="h-3 w-3" /></Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setSubmissionsDialog({ open: true, assignment: a })}><Eye className="h-3 w-3" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(a._id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AssignmentDialog {...assignmentDialog} onOpenChange={open => setAssignmentDialog({...assignmentDialog, open})} onSaved={fetchAssignments} />
      <SubmissionsDialog {...submissionsDialog} onOpenChange={open => setSubmissionsDialog({...submissionsDialog, open})} />
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Progress } from "@/components/ui/progress";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useTeacherAssignments } from "@/hooks/use-teacher-data";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { FileText, Plus, Calendar, Users, Eye, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
// import { toast } from "sonner";

// function LoadingState() {
//   return (
//     <div className="flex items-center justify-center min-h-96">
//       <div className="text-center">
//         <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
//         <p className="text-muted-foreground">Loading assignments...</p>
//       </div>
//     </div>
//   );
// }

// export default function TeacherAssignments() {
//   const [showCreateDialog, setShowCreateDialog] = useState(false);
//   const [newAssignment, setNewAssignment] = useState({
//     title: "",
//     description: "",
//     subjectId: "",
//     classId: "",
//     dueDate: "",
//     maxMarks: 100,
//   });
//   const { assignments, loading, error, refetch, createAssignment } = useTeacherAssignments();

//   if (loading) {
//     return <LoadingState />;
//   }

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
//         <p className="text-destructive mb-4">Error loading assignments: {error}</p>
//         <Button onClick={refetch}>Try Again</Button>
//       </div>
//     );
//   }

//   const assignmentsList = assignments?.data || [];
//   const activeAssignments = assignmentsList.filter((a) => a.status === "active");
//   const completedAssignments = assignmentsList.filter((a) => a.status === "completed");

//   const handleCreate = () => {
//     if (!newAssignment.title || !newAssignment.subjectId || !newAssignment.classId || !newAssignment.dueDate) {
//       toast.error("Please fill all required fields");
//       return;
//     }
//     toast.success("Assignment created successfully!");
//     setShowCreateDialog(false);
//     setNewAssignment({
//       title: "",
//       description: "",
//       subjectId: "",
//       classId: "",
//       dueDate: "",
//       maxMarks: 100,
//     });
//   };

//   const handleDelete = (id) => {
//     toast.success("Assignment deleted successfully!");
//   };

//   const AssignmentCard = ({ assignment }) => {
//     const submissionRate = (assignment.submissions / assignment.totalStudents) * 100;

//     return (
//       <Card>
//         <CardContent className="p-6">
//           <div className="flex items-start justify-between mb-4">
//             <div className="flex items-start gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teacher/10">
//                 <FileText className="h-5 w-5 text-teacher" />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-foreground">{assignment.title}</h3>
//                 <p className="text-sm text-muted-foreground">{assignment.subjectName}</p>
//               </div>
//             </div>
//             <Badge variant={assignment.status === "active" ? "default" : "secondary"}>
//               {assignment.status === "active" ? "Active" : "Completed"}
//             </Badge>
//           </div>

//           <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>

//           <div className="space-y-3 mb-4">
//             <div className="flex items-center justify-between text-sm">
//               <span className="text-muted-foreground">Submissions</span>
//               <span className="font-medium">{assignment.submissions}/{assignment.totalStudents}</span>
//             </div>
//             <Progress value={submissionRate} className="h-2" />
//           </div>

//           <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
//             <span className="flex items-center gap-1">
//               <Calendar className="h-4 w-4" />
//               Due: {new Date(assignment.dueDate).toLocaleDateString()}
//             </span>
//             <span className="flex items-center gap-1">
//               <Users className="h-4 w-4" />
//               {assignment.totalStudents} students
//             </span>
//           </div>

//           <div className="flex gap-2">
//             <Button variant="outline" size="sm" className="flex-1 bg-transparent">
//               <Eye className="mr-1 h-3 w-3" />
//               View
//             </Button>
//             <Button variant="outline" size="sm" className="flex-1 bg-transparent">
//               <Edit className="mr-1 h-3 w-3" />
//               Edit
//             </Button>
//             <Button 
//               variant="outline" 
//               size="sm" 
//               className="text-destructive hover:text-destructive bg-transparent"
//               onClick={() => handleDelete(assignment.id)}
//             >
//               <Trash2 className="h-3 w-3" />
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
//           <p className="text-muted-foreground">Create and manage assignments</p>
//         </div>
//         <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Create Assignment
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-lg">
//             <DialogHeader>
//               <DialogTitle>Create New Assignment</DialogTitle>
//               <DialogDescription>Fill in the details to create a new assignment</DialogDescription>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Title *</label>
//                 <Input
//                   placeholder="Assignment title"
//                   value={newAssignment.title}
//                   onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label className="text-sm font-medium">Description</label>
//                 <Textarea
//                   placeholder="Assignment description"
//                   rows={3}
//                   value={newAssignment.description}
//                   onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Subject *</label>
//                   <select
//                     className="w-full px-3 py-2 border rounded-md bg-card"
//                     value={newAssignment.subjectId}
//                     onChange={(e) => setNewAssignment({ ...newAssignment, subjectId: e.target.value })}
//                   >
//                     <option value="">Select subject</option>
//                     {mockSubjects.map((subject) => (
//                       <option key={subject.id} value={subject.id}>
//                         {subject.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Class *</label>
//                   <select
//                     className="w-full px-3 py-2 border rounded-md bg-card"
//                     value={newAssignment.classId}
//                     onChange={(e) => setNewAssignment({ ...newAssignment, classId: e.target.value })}
//                   >
//                     <option value="">Select class</option>
//                     {mockClasses.map((cls) => (
//                       <option key={cls.id} value={cls.id}>
//                         {cls.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Due Date *</label>
//                   <Input
//                     type="date"
//                     value={newAssignment.dueDate}
//                     onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Max Marks</label>
//                   <Input
//                     type="number"
//                     value={newAssignment.maxMarks}
//                     onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: Number(e.target.value) })}
//                   />
//                 </div>
//               </div>
//               <Button className="w-full" onClick={handleCreate}>
//                 Create Assignment
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Stats */}
//       <div className="grid gap-4 md:grid-cols-3">
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-4">
//               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teacher/10">
//                 <FileText className="h-6 w-6 text-teacher" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{mockAssignments.length}</p>
//                 <p className="text-sm text-muted-foreground">Total Assignments</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-4">
//               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
//                 <FileText className="h-6 w-6 text-warning" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{activeAssignments.length}</p>
//                 <p className="text-sm text-muted-foreground">Active</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-4">
//               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
//                 <FileText className="h-6 w-6 text-success" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{completedAssignments.length}</p>
//                 <p className="text-sm text-muted-foreground">Completed</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Assignments Tabs */}
//       <Tabs defaultValue="active">
//         <TabsList>
//           <TabsTrigger value="active">Active ({activeAssignments.length})</TabsTrigger>
//           <TabsTrigger value="completed">Completed ({completedAssignments.length})</TabsTrigger>
//         </TabsList>
//         <TabsContent value="active" className="mt-4">
//           <div className="grid gap-4 md:grid-cols-2">
//             {activeAssignments.map((assignment) => (
//               <AssignmentCard key={assignment.id} assignment={assignment} />
//             ))}
//             {activeAssignments.length === 0 && (
//               <div className="col-span-2 text-center py-12 text-muted-foreground">
//                 No active assignments.
//               </div>
//             )}
//           </div>
//         </TabsContent>
//         <TabsContent value="completed" className="mt-4">
//           <div className="grid gap-4 md:grid-cols-2">
//             {completedAssignments.map((assignment) => (
//               <AssignmentCard key={assignment.id} assignment={assignment} />
//             ))}
//             {completedAssignments.length === 0 && (
//               <div className="col-span-2 text-center py-12 text-muted-foreground">
//                 No completed assignments.
//               </div>
//             )}
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
