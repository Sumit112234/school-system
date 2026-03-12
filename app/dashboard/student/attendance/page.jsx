"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2, XCircle, Clock, AlertCircle, Calendar, TrendingUp,
  Loader2, BookOpen, BarChart3
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_CONFIG = {
  present: { label: "Present", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  absent: { label: "Absent", icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  late: { label: "Late", icon: Clock, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  excused: { label: "Excused", icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
};

function AttendanceStatCard({ label, value, icon: Icon, color, subtext }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
          </div>
          <Icon className={`h-10 w-10 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function AttendanceRecord({ record }) {
  const config = STATUS_CONFIG[record.status];
  const Icon = config.icon;

  return (
    <div className={`p-3 rounded-lg border ${config.border} ${config.bg}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          <div>
            <p className="font-medium text-sm">
              {new Date(record.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            {record.subject && (
              <p className="text-xs text-muted-foreground">
                {record.subject.name} ({record.subject.code})
              </p>
            )}
          </div>
        </div>
        <Badge className={`${config.color} bg-white`}>{config.label}</Badge>
      </div>
      {record.remarks && (
        <p className="text-xs text-muted-foreground mt-2 pl-7">{record.remarks}</p>
      )}
    </div>
  );
}

function SubjectAttendance({ subjectData }) {
  const getColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{subjectData.subject?.name || "General"}</CardTitle>
            {subjectData.subject?.code && (
              <p className="text-xs text-muted-foreground">{subjectData.subject.code}</p>
            )}
          </div>
          <p className={`text-2xl font-bold ${getColor(subjectData.percentage)}`}>
            {subjectData.percentage.toFixed(1)}%
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={subjectData.percentage} className="h-2" />
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <p className="font-bold text-green-600">{subjectData.present}</p>
            <p className="text-muted-foreground">Present</p>
          </div>
          <div>
            <p className="font-bold text-red-600">{subjectData.absent}</p>
            <p className="text-muted-foreground">Absent</p>
          </div>
          <div>
            <p className="font-bold text-orange-600">{subjectData.late}</p>
            <p className="text-muted-foreground">Late</p>
          </div>
          <div>
            <p className="font-bold text-blue-600">{subjectData.excused}</p>
            <p className="text-muted-foreground">Excused</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          {subjectData.total} total day{subjectData.total !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  );
}

function MonthlyTrend({ monthlyData }) {
  return (
    <div className="space-y-2">
      {monthlyData.map((month, i) => {
        const [year, monthNum] = month.month.split("-");
        const monthName = new Date(year, parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        const getColor = (percentage) => {
          if (percentage >= 90) return "bg-green-500";
          if (percentage >= 75) return "bg-blue-500";
          if (percentage >= 60) return "bg-orange-500";
          return "bg-red-500";
        };

        return (
          <div key={i} className="p-3 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">{monthName}</p>
              <Badge variant="outline">{month.percentage.toFixed(1)}%</Badge>
            </div>
            <Progress value={month.percentage} className={`h-2 ${getColor(month.percentage)}`} />
            <p className="text-xs text-muted-foreground mt-1">
              {month.present}/{month.total} days
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function StudentAttendancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    subjectId: ""
  });

  useEffect(() => { fetchAttendance(); }, [filters]);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/student/attendance?${params}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to fetch attendance");
      setData(result.data);
      console.log("Fetched attendance data:", result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <p className="text-destructive">{error}</p>
    </div>
  );

  const stats = data?.statistics || {};
  const bySubject = data?.bySubject || [];
  const records = data?.records || [];
  const byMonth = data?.byMonth || [];

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground">Track your attendance records and statistics</p>
      </div>

      {/* Overall Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <AttendanceStatCard
          label="Total Days"
          value={stats.totalDays || 0}
          icon={Calendar}
          color="text-primary"
        />
        <AttendanceStatCard
          label="Present"
          value={stats.presentDays || 0}
          icon={CheckCircle2}
          color="text-green-600"
          subtext={`${stats.attendancePercentage || 0}%`}
        />
        <AttendanceStatCard
          label="Absent"
          value={stats.absentDays || 0}
          icon={XCircle}
          color="text-red-600"
        />
        <AttendanceStatCard
          label="Late"
          value={stats.lateDays || 0}
          icon={Clock}
          color="text-orange-600"
        />
      </div>

      {/* Overall Percentage */}
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Overall Attendance</p>
              <p className={`text-4xl font-bold ${getPercentageColor(stats.attendancePercentage)}`}>
                {stats.attendancePercentage || 0}%
              </p>
            </div>
            <BarChart3 className={`h-12 w-12 ${getPercentageColor(stats.attendancePercentage)}`} />
          </div>
          <Progress value={stats.attendancePercentage} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.attendancePercentage >= 75 
              ? "Good attendance! Keep it up!" 
              : stats.attendancePercentage >= 60
              ? "Your attendance needs improvement"
              : "Warning: Low attendance rate"}
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs mb-2 block">Month</Label>
              <Input
                type="month"
                value={filters.month}
                onChange={e => setFilters({...filters, month: e.target.value})}
              />
            </div>
            <div>
              <Label className="text-xs mb-2 block">Subject</Label>
              <Select value={filters.subjectId } onValueChange={v => setFilters({...filters, subjectId: v})}>
                <SelectTrigger><SelectValue placeholder="All Subjects" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Subjects">All Subjects</SelectItem>
                  {bySubject.map(s => s.subject && (
                    <SelectItem key={s.subject._id} value={s.subject._id}>{s.subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="subjects">By Subject</TabsTrigger>
          <TabsTrigger value="trend">Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-3">
          {records.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No attendance records found</p>
              </CardContent>
            </Card>
          ) : (
            records.map(record => (
              <AttendanceRecord key={record._id} record={record} />
            ))
          )}
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          {bySubject.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No subject data available</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {bySubject.map((subj, i) => (
                <SubjectAttendance key={i} subjectData={subj} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {byMonth.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No trend data available</p>
              ) : (
                <MonthlyTrend monthlyData={byMonth} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}