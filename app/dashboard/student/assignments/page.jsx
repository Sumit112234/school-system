"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useStudentAssignments } from "@/hooks/use-student-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Calendar, Upload, Search, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your assignments...</p>
      </div>
    </div>
  );
}

export default function StudentAssignments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const { assignments, loading, error, refetch } = useStudentAssignments();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading assignments: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const assignmentsList = assignments?.data || [];
  const filteredAssignments = assignmentsList.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.className?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingAssignments = filteredAssignments.filter((a) => a.status === "active");
  const completedAssignments = filteredAssignments.filter((a) => a.status === "completed");

  const handleSubmit = () => {
    toast.success("Assignment submitted successfully!");
    setSelectedAssignment(null);
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const AssignmentCard = ({ assignment, showSubmit = true }) => {
    const daysRemaining = getDaysRemaining(assignment.dueDate);
    const isOverdue = daysRemaining < 0;
    const isUrgent = daysRemaining <= 2 && daysRemaining >= 0;

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-student/10">
                <FileText className="h-5 w-5 text-student" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{assignment.title}</h3>
                <p className="text-sm text-muted-foreground">{assignment.subjectName}</p>
              </div>
            </div>
            <Badge
              variant={isOverdue ? "destructive" : isUrgent ? "warning" : "secondary"}
              className={isUrgent && !isOverdue ? "bg-warning text-warning-foreground" : ""}
            >
              {isOverdue
                ? "Overdue"
                : daysRemaining === 0
                ? "Due Today"
                : `${daysRemaining} days left`}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Max: {assignment.maxMarks} marks
            </span>
          </div>

          {showSubmit && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" onClick={() => setSelectedAssignment(assignment)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Assignment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Assignment</DialogTitle>
                  <DialogDescription>
                    Upload your completed assignment for {assignment.title}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop your file here, or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      Browse Files
                    </Button>
                  </div>
                  <Button className="w-full" onClick={handleSubmit}>
                    Submit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {!showSubmit && (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Submitted</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground">View and submit your assignments</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-student/10">
                <FileText className="h-6 w-6 text-student" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockAssignments.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedAssignments.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {pendingAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} showSubmit />
            ))}
            {pendingAssignments.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                No pending assignments found.
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {completedAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} showSubmit={false} />
            ))}
            {completedAssignments.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                No completed assignments found.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
