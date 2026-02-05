"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { mockClasses, mockSubjects } from "@/lib/mock-data";
import { BookOpen, Users, Clock, ChevronRight, GraduationCap } from "lucide-react";

export default function TeacherClasses() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <p className="text-muted-foreground">View and manage your classes</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teacher/10">
                <BookOpen className="h-6 w-6 text-teacher" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockClasses.length}</p>
                <p className="text-sm text-muted-foreground">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-student/10">
                <Users className="h-6 w-6 text-student" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockClasses.reduce((sum, c) => sum + c.studentCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <GraduationCap className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockSubjects.length}</p>
                <p className="text-sm text-muted-foreground">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">20</p>
                <p className="text-sm text-muted-foreground">Hours/Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockClasses.map((cls) => (
          <Card key={cls.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teacher/10">
                  <BookOpen className="h-6 w-6 text-teacher" />
                </div>
                <Badge variant="outline">Grade {cls.grade}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold text-foreground mb-1">{cls.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">Section {cls.section}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {cls.studentCount} students
                </span>
              </div>

              <div className="flex gap-2">
                <Link href="/dashboard/teacher/attendance" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Attendance
                  </Button>
                </Link>
                <Link href="/dashboard/teacher/students" className="flex-1">
                  <Button size="sm" className="w-full">
                    View Students
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle>My Subjects</CardTitle>
          <CardDescription>Subjects you teach across all classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockSubjects.map((subject) => (
              <div key={subject.id} className="p-4 rounded-lg border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teacher/10">
                    <BookOpen className="h-5 w-5 text-teacher" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">{subject.code}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{subject.credits} Credits</span>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
