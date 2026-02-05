"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockAssignments, mockClasses, mockSubjects } from "@/lib/mock-data";
import { FileText, Plus, Calendar, Users, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function TeacherAssignments() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subjectId: "",
    classId: "",
    dueDate: "",
    maxMarks: 100,
  });

  const activeAssignments = mockAssignments.filter((a) => a.status === "active");
  const completedAssignments = mockAssignments.filter((a) => a.status === "completed");

  const handleCreate = () => {
    if (!newAssignment.title || !newAssignment.subjectId || !newAssignment.classId || !newAssignment.dueDate) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success("Assignment created successfully!");
    setShowCreateDialog(false);
    setNewAssignment({
      title: "",
      description: "",
      subjectId: "",
      classId: "",
      dueDate: "",
      maxMarks: 100,
    });
  };

  const handleDelete = (id) => {
    toast.success("Assignment deleted successfully!");
  };

  const AssignmentCard = ({ assignment }) => {
    const submissionRate = (assignment.submissions / assignment.totalStudents) * 100;

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teacher/10">
                <FileText className="h-5 w-5 text-teacher" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                <p className="text-sm text-muted-foreground">{assignment.subjectName}</p>
              </div>
            </div>
            <Badge variant={assignment.status === "active" ? "default" : "secondary"}>
              {assignment.status === "active" ? "Active" : "Completed"}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Submissions</span>
              <span className="font-medium">{assignment.submissions}/{assignment.totalStudents}</span>
            </div>
            <Progress value={submissionRate} className="h-2" />
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {assignment.totalStudents} students
            </span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Eye className="mr-1 h-3 w-3" />
              View
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Edit className="mr-1 h-3 w-3" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:text-destructive bg-transparent"
              onClick={() => handleDelete(assignment.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground">Create and manage assignments</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>Fill in the details to create a new assignment</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  placeholder="Assignment title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Assignment description"
                  rows={3}
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject *</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-card"
                    value={newAssignment.subjectId}
                    onChange={(e) => setNewAssignment({ ...newAssignment, subjectId: e.target.value })}
                  >
                    <option value="">Select subject</option>
                    {mockSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class *</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-card"
                    value={newAssignment.classId}
                    onChange={(e) => setNewAssignment({ ...newAssignment, classId: e.target.value })}
                  >
                    <option value="">Select class</option>
                    {mockClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date *</label>
                  <Input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Marks</label>
                  <Input
                    type="number"
                    value={newAssignment.maxMarks}
                    onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: Number(e.target.value) })}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleCreate}>
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teacher/10">
                <FileText className="h-6 w-6 text-teacher" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <FileText className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({activeAssignments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedAssignments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {activeAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
            {activeAssignments.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                No active assignments.
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {completedAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
            {completedAssignments.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                No completed assignments.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
