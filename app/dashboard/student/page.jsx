"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useStudentDashboard, useStudentAssignments } from "@/hooks/use-student-data";
import {
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Clock,
  Bell,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { dashboardData, loading, error } = useStudentDashboard();
  const { assignments, loading: assignmentsLoading } = useStudentAssignments();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading dashboard: {error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const todaySchedule = dashboardData?.todaySchedule || [];
  const pendingAssignments = (assignments?.data || []).filter((a) => a.status === "active").slice(0, 3);
  const recentAnnouncements = dashboardData?.announcements || [];

  const statCards = [
    {
      title: "Attendance Rate",
      value: `${stats.attendanceRate || 0}%`,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Pending Assignments",
      value: stats.pendingAssignments || 0,
      icon: FileText,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Average Grade",
      value: `${stats.averageGrade || 0}%`,
      icon: BarChart3,
      color: "text-student",
      bgColor: "bg-student/10",
    },
    {
      title: "Unread Messages",
      value: stats.unreadMessages || 0,
      icon: Bell,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
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
            Here&apos;s what&apos;s happening with your studies today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/student/timetable">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              View Timetable
            </Button>
          </Link>
          <Link href="/dashboard/student/assignments">
            <Button size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Assignments
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
            <Link href="/dashboard/student/timetable">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-student/10">
                    <Clock className="h-5 w-5 text-student" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{schedule.subjectName}</p>
                    <p className="text-sm text-muted-foreground">{schedule.room}</p>
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

        {/* Pending Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Pending Assignments</CardTitle>
              <CardDescription>Due soon</CardDescription>
            </div>
            <Link href="/dashboard/student/assignments">
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
                      Due {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">65% completed</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Announcements</CardTitle>
              <CardDescription>Latest updates from school</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      announcement.priority === "high" ? "bg-destructive/10" : "bg-student/10"
                    }`}>
                      <Bell className={`h-4 w-4 ${
                        announcement.priority === "high" ? "text-destructive" : "text-student"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{announcement.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
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
              <Link href="/dashboard/student/materials">
                <Button variant="outline" className="w-full h-auto py-4 flex-col bg-transparent">
                  <BookOpen className="h-6 w-6 mb-2" />
                  <span>Study Materials</span>
                </Button>
              </Link>
              <Link href="/dashboard/student/quizzes">
                <Button variant="outline" className="w-full h-auto py-4 flex-col bg-transparent">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Take Quiz</span>
                </Button>
              </Link>
              <Link href="/dashboard/student/grades">
                <Button variant="outline" className="w-full h-auto py-4 flex-col bg-transparent">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span>View Grades</span>
                </Button>
              </Link>
              <Link href="/dashboard/student/ai-chat">
                <Button variant="outline" className="w-full h-auto py-4 flex-col bg-transparent">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>AI Assistant</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
