"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, FileText, Award, Calendar, TrendingUp, Clock,
  CheckCircle2, XCircle, AlertCircle, Loader2, GraduationCap, Users
} from "lucide-react";
import Link from "next/link";

function StatCard({ title, value, icon: Icon, color, subtext, link }) {
  const content = (
    <Card className={link ? "hover:shadow-lg transition-shadow cursor-pointer" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
          </div>
          <Icon className={`h-10 w-10 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return link ? <Link href={link}>{content}</Link> : content;
}

function QuickStatCard({ label, value, color, total }) {
  return (
    <div className="text-center p-3 rounded-lg border">
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {total && <p className="text-xs text-muted-foreground">of {total}</p>}
      <p className="text-xs font-medium mt-1">{label}</p>
    </div>
  );
}

export default function StudentDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/dashboard");
      const result = await res.json();
      if (res.ok) setData(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  if (!data) return null;

  const { student, statistics, upcomingAssignments, recentGrades } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {student.name}!</h1>
        <p className="text-muted-foreground">
          {student.class?.name} - Section {student.class?.section} • {student.studentId}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Assignments"
          value={statistics.assignments.pending}
          icon={FileText}
          color="text-orange-600"
          subtext={`${statistics.assignments.submitted} completed`}
          link="/dashboard/student/assignments"
        />
        <StatCard
          title="Available Quizzes"
          value={statistics.quizzes.available}
          icon={BookOpen}
          color="text-blue-600"
          subtext={`${statistics.quizzes.completed} completed`}
          link="/dashboard/student/quizzes"
        />
        <StatCard
          title="Attendance"
          value={`${statistics.attendance.percentage}%`}
          icon={CheckCircle2}
          color={statistics.attendance.percentage >= 75 ? "text-green-600" : "text-red-600"}
          subtext={`${statistics.attendance.present}/${statistics.attendance.totalDays} days`}
          link="/dashboard/student/attendance"
        />
        <StatCard
          title="Average Grade"
          value={`${statistics.grades.averagePercentage}%`}
          icon={Award}
          color={statistics.grades.averagePercentage >= 75 ? "text-green-600" : "text-orange-600"}
          subtext={`${statistics.grades.total} evaluations`}
          link="/dashboard/student/grades"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming assignments</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAssignments.map(a => (
                    <Link key={a._id} href="/dashboard/student/assignments">
                      <div className="flex items-start justify-between p-3 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{a.title}</p>
                          <p className="text-xs text-muted-foreground">{a.subject?.name}</p>
                        </div>
                        <div className="text-right ml-3">
                          <Badge variant="outline" className="text-xs">
                            {new Date(a.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{a.totalMarks} marks</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Assignments */}
                <div>
                  <p className="text-sm font-medium mb-2">Assignments</p>
                  <div className="grid grid-cols-3 gap-2">
                    <QuickStatCard label="Pending" value={statistics.assignments.pending} color="#f97316" total={statistics.assignments.total} />
                    <QuickStatCard label="Submitted" value={statistics.assignments.submitted} color="#22c55e" total={statistics.assignments.total} />
                    <QuickStatCard label="Overdue" value={statistics.assignments.overdue} color="#ef4444" total={statistics.assignments.total} />
                  </div>
                </div>

                {/* Quizzes */}
                <div>
                  <p className="text-sm font-medium mb-2">Quizzes</p>
                  <div className="grid grid-cols-3 gap-2">
                    <QuickStatCard label="Available" value={statistics.quizzes.available} color="#3b82f6" total={statistics.quizzes.total} />
                    <QuickStatCard label="Completed" value={statistics.quizzes.completed} color="#22c55e" total={statistics.quizzes.total} />
                    <QuickStatCard label="Expired" value={statistics.quizzes.expired} color="#6b7280" total={statistics.quizzes.total} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentGrades.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No grades yet</p>
              ) : (
                <div className="space-y-3">
                  {recentGrades.map(g => (
                    <div key={g._id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{g.subject?.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{g.examType} • {g.term}</p>
                        </div>
                        <Badge className={
                          g.percentage >= 90 ? "bg-green-500" :
                          g.percentage >= 75 ? "bg-blue-500" :
                          g.percentage >= 60 ? "bg-orange-500" : "bg-red-500"
                        }>
                          {g.grade}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Score</span>
                        <span className="font-bold">{g.marksObtained}/{g.totalMarks}</span>
                      </div>
                      <Progress value={g.percentage} className="h-1.5 mt-2" />
                    </div>
                  ))}
                </div>
              )}
              <Link href="/dashboard/student/grades">
                <Button variant="outline" className="w-full mt-3" size="sm">View All Grades</Button>
              </Link>
            </CardContent>
          </Card>

          {/* My Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                My Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {student.subjects?.map(s => (
                  <div key={s._id} className="flex items-center gap-2 p-2 rounded-lg border">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.code}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/student/class">
                <Button variant="outline" className="w-full mt-3" size="sm">View Class Details</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Study Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Study Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-primary">{statistics.materials}</p>
                <p className="text-sm text-muted-foreground">materials available</p>
              </div>
              <Link href="/dashboard/student/materials">
                <Button className="w-full" size="sm">Browse Materials</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}