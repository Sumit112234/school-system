"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockSubjects, mockClasses, mockGrades } from "@/lib/mock-data";
import { BookOpen, User, Clock, Award } from "lucide-react";

export default function StudentClasses() {
  const myClass = mockClasses[0]; // Assuming student is in class 10-A

  const getSubjectProgress = (subjectId) => {
    const subjectGrades = mockGrades.filter((g) => g.subjectId === subjectId);
    if (subjectGrades.length === 0) return 0;
    const total = subjectGrades.reduce((sum, g) => sum + g.marks, 0);
    const max = subjectGrades.reduce((sum, g) => sum + g.maxMarks, 0);
    return max > 0 ? Math.round((total / max) * 100) : 0;
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-success";
    if (progress >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <p className="text-muted-foreground">View your enrolled classes and subjects</p>
      </div>

      {/* Class Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-student" />
            Class Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Class</p>
              <p className="text-2xl font-bold text-foreground">{myClass.name}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Grade</p>
              <p className="text-2xl font-bold text-foreground">{myClass.grade}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold text-foreground">{myClass.studentCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">My Subjects</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockSubjects.map((subject) => {
            const progress = getSubjectProgress(subject.id);
            return (
              <Card key={subject.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-student/10">
                      <BookOpen className="h-6 w-6 text-student" />
                    </div>
                    <Badge variant="outline">{subject.code}</Badge>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-1">{subject.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {subject.credits} Credits
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Dr. Sarah Smith
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      4 hrs/week
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-student" />
            Performance Summary
          </CardTitle>
          <CardDescription>Your overall academic performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSubjects.map((subject) => {
              const progress = getSubjectProgress(subject.id);
              return (
                <div key={subject.id} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-foreground truncate">
                    {subject.name}
                  </div>
                  <div className="flex-1">
                    <Progress value={progress} className={`h-3 ${getProgressColor(progress)}`} />
                  </div>
                  <div className="w-12 text-right text-sm font-medium">
                    {progress}%
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
