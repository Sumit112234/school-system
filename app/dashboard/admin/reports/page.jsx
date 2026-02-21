"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  GraduationCap,
  BookOpen,
  Building,
  Activity,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertCircle,
  Loader2,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  UserCheck,
  ClipboardList,
  Bell,
  TicketIcon,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function roleBadgeVariant(role) {
  switch (role) {
    case "super-admin": return "destructive";
    case "admin":       return "default";
    case "teacher":     return "secondary";
    case "student":     return "outline";
    default:            return "outline";
  }
}

function roleLabel(role) {
  return role
    ? role.charAt(0).toUpperCase() + role.slice(1).replace("-", " ")
    : "—";
}

// ─── Loading State ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    </div>
  );
}

// ─── Stat Card Component ───────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, trend, trendValue, description, color = "text-primary" }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{value}</p>
              {trend && (
                <span className={`flex items-center text-sm font-medium ${
                  trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {trendValue}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`rounded-full p-3 ${color.replace("text-", "bg-")}/10`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Role Distribution Chart ───────────────────────────────────────────────────

function RoleDistributionCard({ usersByRole }) {
  const roles = [
    { key: "student", label: "Students", color: "bg-blue-500" },
    { key: "teacher", label: "Teachers", color: "bg-green-500" },
    { key: "admin", label: "Admins", color: "bg-purple-500" },
    { key: "helper", label: "Helpers", color: "bg-orange-500" },
    { key: "super-admin", label: "Super Admins", color: "bg-red-500" },
    { key: "temporary", label: "Temporary", color: "bg-gray-500" },
  ];

  const total = Object.values(usersByRole).reduce((sum, count) => sum + count, 0);

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          User Distribution by Role
        </CardTitle>
        <CardDescription>Breakdown of users across different roles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {roles.map((role) => {
          const count = usersByRole[role.key] || 0;
          const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
          
          return (
            <div key={role.key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{role.label}</span>
                <span className="text-muted-foreground">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${role.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ─── Recent Users Card ─────────────────────────────────────────────────────────

function RecentUsersCard({ users }) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recently Joined Users
        </CardTitle>
        <CardDescription>Latest 5 users added to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users && users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id || user._id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {user.name
                      ?.split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={roleBadgeVariant(user.role)} className="text-xs">
                    {roleLabel(user.role)}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No recent users found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Activity Summary Card ─────────────────────────────────────────────────────

function ActivitySummaryCard({ activity }) {
  const items = [
    {
      label: "Pending Assignments",
      value: activity?.pendingAssignments ?? 0,
      icon: ClipboardList,
      color: "text-blue-600",
    },
    {
      label: "Open Tickets",
      value: activity?.openTickets ?? 0,
      icon: TicketIcon,
      color: "text-orange-600",
    },
    {
      label: "Active Notices",
      value: activity?.recentNotices ?? 0,
      icon: Bell,
      color: "text-purple-600",
    },
  ];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Activity Summary
        </CardTitle>
        <CardDescription>Current system activity and pending items</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
              >
                <div className={`rounded-full p-3 ${item.color.replace("text-", "bg-")}/10`}>
                  <Icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Reports Page ─────────────────────────────────────────────────────────

export default function AdminReportsPage() {
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [timeRange, setTimeRange] = useState("all"); // for future filtering

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/admin/stats");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to fetch statistics");
      setStats(data?.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExport = () => {
    // Placeholder for CSV/PDF export functionality
    alert("Export functionality coming soon!");
  };

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading reports: {error}</p>
        <Button onClick={fetchStats}>Try Again</Button>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const activity = stats?.activity || {};
  const usersByRole = stats?.usersByRole || {};
  const recentUsers = stats?.recentUsers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of system statistics and activity
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats - Primary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={overview.totalStudents?.toLocaleString() ?? 0}
          icon={GraduationCap}
          description={`${overview.activeStudents ?? 0} active`}
          color="text-blue-600"
        />
        <StatCard
          title="Total Teachers"
          value={overview.totalTeachers?.toLocaleString() ?? 0}
          icon={Users}
          description={`${overview.activeTeachers ?? 0} active`}
          color="text-green-600"
        />
        <StatCard
          title="Total Classes"
          value={overview.totalClasses?.toLocaleString() ?? 0}
          icon={Building}
          color="text-purple-600"
        />
        <StatCard
          title="Total Subjects"
          value={overview.totalSubjects?.toLocaleString() ?? 0}
          icon={BookOpen}
          color="text-orange-600"
        />
      </div>

      {/* Activity Summary */}
      <ActivitySummaryCard activity={activity} />

      {/* Secondary Row: Charts & Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-4">
        <RoleDistributionCard usersByRole={usersByRole} />
        <RecentUsersCard users={recentUsers} />
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
              Student Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Students</span>
              <span className="text-lg font-bold">{overview.activeStudents ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Inactive Students</span>
              <span className="text-lg font-bold">
                {(overview.totalStudents ?? 0) - (overview.activeStudents ?? 0)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Enrollment Rate</span>
                <span className="text-sm font-bold text-green-600">
                  {overview.totalStudents
                    ? ((overview.activeStudents / overview.totalStudents) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-blue-600" />
              Teacher Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Teachers</span>
              <span className="text-lg font-bold">{overview.activeTeachers ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Inactive Teachers</span>
              <span className="text-lg font-bold">
                {(overview.totalTeachers ?? 0) - (overview.activeTeachers ?? 0)}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Activity Rate</span>
                <span className="text-sm font-bold text-blue-600">
                  {overview.totalTeachers
                    ? ((overview.activeTeachers / overview.totalTeachers) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5 text-purple-600" />
              Class Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Classes</span>
              <span className="text-lg font-bold">{overview.totalClasses ?? 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg. Class Size</span>
              <span className="text-lg font-bold">
                {overview.totalClasses && overview.totalStudents
                  ? Math.round(overview.totalStudents / overview.totalClasses)
                  : 0}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Student-Teacher Ratio</span>
                <span className="text-sm font-bold text-purple-600">
                  {overview.totalTeachers
                    ? Math.round(overview.totalStudents / overview.totalTeachers)
                    : 0}:1
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Generate detailed reports and exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start gap-2">
              <Users className="h-4 w-4" />
              User Report
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <GraduationCap className="h-4 w-4" />
              Student Report
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Building className="h-4 w-4" />
              Class Report
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Activity className="h-4 w-4" />
              Activity Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
        <Calendar className="h-3 w-3" />
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}