"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStudentGrades } from "@/hooks/use-student-data";
import { BarChart3, TrendingUp, Award, BookOpen, Loader2, AlertCircle } from "lucide-react";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your grades...</p>
      </div>
    </div>
  );
}

export default function StudentGrades() {
  const { grades, loading, error, refetch } = useStudentGrades();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading grades: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const gradesList = grades?.data || [];
  
  // Calculate overall average
  const totalMarks = gradesList.reduce((sum, g) => sum + (g.marks || 0), 0);
  const totalMaxMarks = gradesList.reduce((sum, g) => sum + (g.maxMarks || 0), 0);
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : 0;

  // Grade by subject
  const gradesBySubject = (grades?.subjects || []).map((subject) => {
    const subjectGrades = gradesList.filter((g) => g.subjectId === subject._id);
    const subjectTotal = subjectGrades.reduce((sum, g) => sum + (g.marks || 0), 0);
    const subjectMaxTotal = subjectGrades.reduce((sum, g) => sum + (g.maxMarks || 0), 0);
    const percentage = subjectMaxTotal > 0 ? Math.round((subjectTotal / subjectMaxTotal) * 100) : 0;
    return {
      ...subject,
      grades: subjectGrades,
      totalMarks: subjectTotal,
      maxMarks: subjectMaxTotal,
      percentage,
    };
  });

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 75) return "text-student";
    if (percentage >= 60) return "text-warning";
    return "text-destructive";
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    return "F";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Grades & Performance</h1>
        <p className="text-muted-foreground">Track your academic progress</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-student/10">
                <BarChart3 className="h-6 w-6 text-student" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{overallPercentage}%</p>
                <p className="text-sm text-muted-foreground">Overall Average</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Award className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{getGradeLetter(overallPercentage)}</p>
                <p className="text-sm text-muted-foreground">Grade</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">+5%</p>
                <p className="text-sm text-muted-foreground">vs Last Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{mockGrades.length}</p>
                <p className="text-sm text-muted-foreground">Graded Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades by Subject */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Subject</CardTitle>
          <CardDescription>Your grades across all subjects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {gradesBySubject.map((subject) => (
              <div key={subject.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-student/10">
                      <BookOpen className="h-4 w-4 text-student" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {subject.totalMarks}/{subject.maxMarks} marks
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${getGradeColor(subject.percentage)}`}>
                      {subject.percentage}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Grade: {getGradeLetter(subject.percentage)}
                    </p>
                  </div>
                </div>
                <Progress value={subject.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Grades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Grades</CardTitle>
          <CardDescription>Your latest graded assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockGrades.map((grade) => {
              const assignment = mockAssignments.find((a) => a.id === grade.assignmentId);
              const subject = mockSubjects.find((s) => s.id === grade.subjectId);
              const percentage = Math.round((grade.marks / grade.maxMarks) * 100);

              return (
                <div key={grade.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      percentage >= 75 ? "bg-success/10" : percentage >= 50 ? "bg-warning/10" : "bg-destructive/10"
                    }`}>
                      <span className={`text-sm font-bold ${getGradeColor(percentage)}`}>
                        {getGradeLetter(percentage)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{assignment?.title || "Assignment"}</p>
                      <p className="text-sm text-muted-foreground">{subject?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getGradeColor(percentage)}`}>
                      {grade.marks}/{grade.maxMarks}
                    </p>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
