"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  Users,
  BookOpen,
  FileText,
  ClipboardList,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { mockDashboardStats, mockAssignments, mockSchedule, mockClasses } from "@/lib/mock-data";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const stats = mockDashboardStats.teacher;

  const todaySchedule = mockSchedule.filter((s) => s.day === "Monday").slice(0, 4);
  const pendingAssignments = mockAssignments.filter((a) => a.status === "active").slice(0, 3);

  const statCards = [
    {
      title: "My Classes",
      value: stats.totalClasses,
      icon: BookOpen,
      color: "text-teacher",
      bgColor: "bg-teacher/10",
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-student",
      bgColor: "bg-student/10",
    },
    {
      title: "Pending Reviews",
      value: stats.pendingAssignments,
      icon: FileText,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Avg. Attendance",
      value: `${stats.averageAttendance}%`,
      icon: ClipboardList,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Manage your classes and track student progress.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/teacher/attendance">
            <Button variant="outline" size="sm">
              <ClipboardList className="mr-2 h-4 w-4" />
              Take Attendance
            </Button>
          </Link>
          <Link href="/dashboard/teacher/assignments">
            <Button size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </div>
            <Link href="/dashboard/teacher/timetable">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule.map((schedule, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teacher/10">
                    <Clock className="h-5 w-5 text-teacher" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{schedule.subjectName}</p>
                    <p className="text-sm text-muted-foreground">Class 10-A - {schedule.room}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{schedule.time}</p>
                    <p className="text-xs text-muted-foreground">1 hour</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assignments to Review */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Assignments to Review</CardTitle>
              <CardDescription>Submissions pending your review</CardDescription>
            </div>
            <Link href="/dashboard/teacher/assignments">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAssignments.map((assignment) => (
                <div key={assignment.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{assignment.title}</p>
                      <p className="text-sm text-muted-foreground">{assignment.subjectName}</p>
                    </div>
                    <span className="flex items-center text-xs text-warning">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {assignment.submissions}/{assignment.totalStudents} submitted
                    </span>
                  </div>
                  <Progress value={(assignment.submissions / assignment.totalStudents) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Classes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">My Classes</CardTitle>
              <CardDescription>Classes you teach</CardDescription>
            </div>
            <Link href="/dashboard/teacher/classes">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {mockClasses.slice(0, 4).map((cls) => (
                <div key={cls.id} className="p-4 rounded-lg border text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teacher/10 mx-auto mb-2">
                    <BookOpen className="h-5 w-5 text-teacher" />
                  </div>
                  <p className="font-medium text-foreground">{cls.name}</p>
                  <p className="text-xs text-muted-foreground">{cls.studentCount} students</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/teacher/attendance">
                <Button variant="outline" className="w-full h-auto py-4 flex-col bg-transparent">
                  <ClipboardList className="h-6 w-6 mb-2" />
                  <span>Take Attendance</span>
                </Button>
              </Link>
              <Link href="/dashboard/teacher/grades">
                <Button variant="outline" className="w-full h-auto py-4 flex-col bg-transparent">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Grade Work</span>
                </Button>
              </Link>
              <Link href="/dashboard/teacher/materials">
                <Button variant="outline" className="w-full h-auto py-4 flex-col bg-transparent">
                  <BookOpen className="h-6 w-6 mb-2" />
                  <span>Upload Materials</span>
                </Button>
              </Link>
              <Link href="/dashboard/teacher/quizzes">
                <Button variant="outline" className="w-full h-auto py-4 flex-col bg-transparent">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Create Quiz</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
