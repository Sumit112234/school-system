"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTeacherStudents } from "@/hooks/use-teacher-data";
import { Search, Users, Mail, Eye, Loader2, AlertCircle } from "lucide-react";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your students...</p>
      </div>
    </div>
  );
}

export default function TeacherStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const { students, classes, loading, error, refetch } = useTeacherStudents();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading students: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const studentsList = students?.data || [];
  const classList = classes?.data || [];

  const filteredStudents = studentsList.filter((student) => {
    const matchesSearch =
      student.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.includes(searchQuery);
    const matchesClass = selectedClass === "all" || student.classId === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Students</h1>
        <p className="text-muted-foreground">View and manage your students</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or roll number..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2 border rounded-md bg-card"
        >
          <option value="all">All Classes</option>
          {mockClasses.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-student/10">
                <Users className="h-6 w-6 text-student" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredStudents.length}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(filteredStudents.reduce((sum, s) => sum + s.attendance, 0) / filteredStudents.length)}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teacher/10">
                <Users className="h-6 w-6 text-teacher" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(filteredStudents.reduce((sum, s) => sum + s.grade, 0) / filteredStudents.length)}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Grade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>{filteredStudents.length} students found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-student text-student-foreground">
                      {student.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Roll: {student.rollNumber} | {student.className}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center hidden md:block">
                    <p className="font-medium text-foreground">{student.attendance}%</p>
                    <p className="text-xs text-muted-foreground">Attendance</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="font-medium text-foreground">{student.grade}%</p>
                    <p className="text-xs text-muted-foreground">Grade</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
