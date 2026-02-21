"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useStudentAttendance } from "@/hooks/use-student-data";
import { Calendar, CheckCircle2, XCircle, Clock, TrendingUp, Loader2, AlertCircle } from "lucide-react";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading attendance records...</p>
      </div>
    </div>
  );
}

export default function StudentAttendance() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const { attendance, loading, error, refetch } = useStudentAttendance();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading attendance: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const attendanceRecords = attendance?.data || [];
  // Calculate attendance stats
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter((a) => a.status === "present").length;
  const absentDays = attendanceRecords.filter((a) => a.status === "absent").length;
  const lateDays = attendanceRecords.filter((a) => a.status === "late").length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-success text-success-foreground";
      case "absent":
        return "bg-destructive text-destructive-foreground";
      case "late":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <CheckCircle2 className="h-4 w-4" />;
      case "absent":
        return <XCircle className="h-4 w-4" />;
      case "late":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Generate calendar data
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const year = 2024;
  const daysInMonth = getDaysInMonth(year, selectedMonth);
  const firstDay = getFirstDayOfMonth(year, selectedMonth);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground">Track your attendance record</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{attendanceRate}%</p>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{presentDays}</p>
                <p className="text-sm text-muted-foreground">Days Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{absentDays}</p>
                <p className="text-sm text-muted-foreground">Days Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{lateDays}</p>
                <p className="text-sm text-muted-foreground">Days Late</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
          <CardDescription>Your attendance progress this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Attendance Rate</span>
              <span className="font-medium text-foreground">{attendanceRate}%</span>
            </div>
            <Progress value={attendanceRate} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {attendanceRate >= 90 
                ? "Excellent attendance! Keep it up!" 
                : attendanceRate >= 75 
                ? "Good attendance. Try to improve further."
                : "Your attendance needs improvement."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>{monthNames[selectedMonth]} {year}</CardDescription>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(year, selectedMonth, day);
              const attendance = mockAttendance.find(
                (a) => new Date(a.date).toDateString() === date.toDateString()
              );
              
              return (
                <div
                  key={day}
                  className={`p-2 rounded-md text-sm ${
                    attendance
                      ? getStatusColor(attendance.status)
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Your attendance history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAttendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    record.status === "present" ? "bg-success/10" :
                    record.status === "absent" ? "bg-destructive/10" : "bg-warning/10"
                  }`}>
                    {getStatusIcon(record.status)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(record.status)}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-success" />
              <span className="text-sm text-muted-foreground">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-destructive" />
              <span className="text-sm text-muted-foreground">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-warning" />
              <span className="text-sm text-muted-foreground">Late</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
