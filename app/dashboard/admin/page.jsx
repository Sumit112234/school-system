"use client";

import { useAdminStats } from "@/hooks/use-admin-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  Bell,
  Building,
  DollarSign,
  UserCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { stats: dashboardStats, loading, error } = useAdminStats();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading dashboard: {error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Students",
      value: dashboardStats?.totalStudents || "0",
      change: dashboardStats?.studentChange || "+0%",
      icon: GraduationCap,
      color: "bg-student",
    },
    {
      title: "Total Teachers",
      value: dashboardStats?.totalTeachers || "0",
      change: dashboardStats?.teacherChange || "+0%",
      icon: Users,
      color: "bg-teacher",
    },
    {
      title: "Total Classes",
      value: dashboardStats?.totalClasses || "0",
      change: dashboardStats?.classChange || "+0%",
      icon: Building,
      color: "bg-admin",
    },
    {
      title: "Active Subjects",
      value: dashboardStats?.totalSubjects || "0",
      change: dashboardStats?.subjectChange || "+0%",
      icon: BookOpen,
      color: "bg-helper",
    },
  ];

  const recentActivities = dashboardStats?.recentActivities || [];
  const pendingApprovals = dashboardStats?.pendingApprovals || [];

  const quickActions = [
    { label: "Add Student", href: "/dashboard/admin/students/add", icon: GraduationCap },
    { label: "Add Teacher", href: "/dashboard/admin/teachers/add", icon: Users },
    { label: "Create Class", href: "/dashboard/admin/classes/add", icon: Building },
    { label: "Send Notice", href: "/dashboard/admin/notices/new", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here is the school overview.</p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingApprovals.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {item.urgent && (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  <span className="font-medium">{item.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {item.count}
                  </span>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      activity.type === "enrollment"
                        ? "bg-student"
                        : activity.type === "payment"
                        ? "bg-success"
                        : activity.type === "leave"
                        ? "bg-warning"
                        : activity.type === "staff"
                        ? "bg-teacher"
                        : "bg-admin"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Attendance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 rounded-lg bg-success/10">
              <div className="text-3xl font-bold text-success">92%</div>
              <div className="text-sm text-muted-foreground">Student Attendance</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-teacher/10">
              <div className="text-3xl font-bold text-teacher">98%</div>
              <div className="text-sm text-muted-foreground">Teacher Attendance</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10">
              <div className="text-3xl font-bold text-warning">45</div>
              <div className="text-sm text-muted-foreground">On Leave Today</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <div className="text-3xl font-bold text-destructive">12</div>
              <div className="text-sm text-muted-foreground">Absent Without Notice</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
