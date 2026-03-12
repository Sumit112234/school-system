"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  BookOpen,
  Loader2,
  Save,
  BarChart3,
  Search,
  CheckCheck,
} from "lucide-react";

// ─── Helper Functions ──────────────────────────────────────────────────────────

function getInitials(name) {
  return name
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

// ─── Loading State ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// ─── Status Button Component ───────────────────────────────────────────────────

function StatusButton({ status, active, onClick, icon: Icon, label, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
        active
          ? `${color} border-current shadow-md`
          : "bg-background border-border hover:border-muted-foreground"
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? "text-white" : "text-muted-foreground"}`} />
      <span className={`font-medium ${active ? "text-white" : "text-muted-foreground"}`}>
        {label}
      </span>
    </button>
  );
}

// ─── Student Attendance Row ────────────────────────────────────────────────────

function StudentAttendanceRow({ student, attendance, onStatusChange, onRemarksChange }) {
  const [showRemarks, setShowRemarks] = useState(false);

  const statuses = [
    { value: "present", icon: CheckCircle2, label: "Present", color: "bg-green-500" },
    { value: "absent", icon: XCircle, label: "Absent", color: "bg-red-500" },
    { value: "late", icon: Clock, label: "Late", color: "bg-orange-500" },
    { value: "excused", icon: AlertCircle, label: "Excused", color: "bg-blue-500" },
  ];

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center gap-4 mb-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={student.user?.avatar} />
          <AvatarFallback>{getInitials(student.user?.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{student.user?.name}</p>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span>Roll: {student.rollNumber || "—"}</span>
            <span>•</span>
            <span>{student.studentId}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-2">
        {statuses.map((s) => (
          <StatusButton
            key={s.value}
            status={s.value}
            active={attendance.status === s.value}
            onClick={() => onStatusChange(student._id, s.value)}
            icon={s.icon}
            label={s.label}
            color={s.color}
          />
        ))}
      </div>

      {(attendance.status === "absent" || attendance.status === "late" || showRemarks) && (
        <div className="mt-2">
          <Textarea
            placeholder="Add remarks (optional)..."
            value={attendance.remarks || ""}
            onChange={(e) => onRemarksChange(student._id, e.target.value)}
            className="text-sm min-h-[60px]"
          />
        </div>
      )}

      {!showRemarks && attendance.status !== "absent" && attendance.status !== "late" && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowRemarks(true)}
          className="mt-2 text-xs"
        >
          Add remarks
        </Button>
      )}
    </div>
  );
}

// ─── Attendance Stats Dialog ───────────────────────────────────────────────────

function AttendanceStatsDialog({ classId, open, onOpenChange }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Last 30 days
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(getTodayDate());

  useEffect(() => {
    if (open && classId) {
      fetchStats();
    }
  }, [open, classId, startDate, endDate]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ classId, startDate, endDate });
      const res = await fetch(`/api/teacher/attendance/stats?${params}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message ?? "Failed to fetch stats");
      setStats(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attendance Statistics</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive">{error}</p>
            </div>
          ) : stats ? (
            <>
              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-3xl font-bold">{stats.summary.totalStudents}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Average Attendance</p>
                      <p className="text-3xl font-bold text-green-600">
                        {stats.summary.avgAttendance}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Student Stats */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {stats.stats.map((item) => {
                  const percentage = item.stats.attendancePercentage;
                  const color =
                    percentage >= 90
                      ? "text-green-600"
                      : percentage >= 75
                      ? "text-orange-600"
                      : "text-red-600";

                  return (
                    <div
                      key={item.student._id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={item.student.avatar} />
                          <AvatarFallback>{getInitials(item.student.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{item.student.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Roll: {item.student.rollNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${color}`}>{percentage}%</p>
                        <p className="text-xs text-muted-foreground">
                          {item.stats.present}/{item.stats.totalDays} days
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TeacherAttendancePage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("general");
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [searchQuery, setSearchQuery] = useState("");
  const [attendance, setAttendance] = useState({});
  const [statsOpen, setStatsOpen] = useState(false);

  // Fetch classes
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch students when class changes
  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
      fetchExistingAttendance();
    }
  }, [selectedClass, selectedDate, selectedSubject]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/classes");
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message ?? "Failed to fetch classes");
      setClasses(result.data.classes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/classes/${selectedClass}/students`);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message ?? "Failed to fetch students");
      
      const studentsList = result.data.studentsInClass || [];
      setStudents(studentsList);

      // Initialize attendance with "present" by default
      const initialAttendance = {};
      studentsList.forEach((student) => {
        initialAttendance[student._id] = { status: "present", remarks: "" };
      });
      setAttendance(initialAttendance);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const params = new URLSearchParams({
        classId: selectedClass,
        date: selectedDate,
        subjectId: selectedSubject,
      });
      const res = await fetch(`/api/teacher/attendance?${params}`);
      const result = await res.json();
      
      if (res.ok && result.data.records.length > 0) {
        const existingAttendance = {};
        result.data.records.forEach((record) => {
          existingAttendance[record.student._id] = {
            status: record.status,
            remarks: record.remarks || "",
          };
        });
        setAttendance(existingAttendance);
      }
    } catch (err) {
      console.error("Failed to fetch existing attendance:", err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  const handleMarkAllPresent = () => {
    const updatedAttendance = {};
    students.forEach((student) => {
      updatedAttendance[student._id] = { status: "present", remarks: "" };
    });
    setAttendance(updatedAttendance);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const attendanceRecords = Object.entries(attendance).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        remarks: data.remarks || null,
      }));

      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          subjectId: selectedSubject === "general" ? null : selectedSubject,
          attendanceRecords,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.message ?? "Failed to submit attendance");

      alert("Attendance submitted successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClassData = classes.find((c) => c._id === selectedClass);
  const filteredStudents = students.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.user?.name?.toLowerCase().includes(query) ||
      s.studentId?.toLowerCase().includes(query) ||
      s.rollNumber?.toLowerCase().includes(query)
    );
  });

  // Calculate summary
  const summary = {
    total: filteredStudents.length,
    present: Object.values(attendance).filter((a) => a.status === "present").length,
    absent: Object.values(attendance).filter((a) => a.status === "absent").length,
    late: Object.values(attendance).filter((a) => a.status === "late").length,
    excused: Object.values(attendance).filter((a) => a.status === "excused").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Take Attendance</h1>
        <p className="text-muted-foreground">Mark student attendance quickly and easily</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls._id} value={cls._id}>
                      {cls.name} - Section {cls.section}
                      {cls.isClassTeacher && " (Class Teacher)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClassData && selectedClassData.mySubjects.length > 0 && (
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Attendance</SelectItem>
                    {selectedClassData.mySubjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={getTodayDate()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedClass ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Please select a class to take attendance</p>
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <LoadingState />
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={fetchStudents}>Try Again</Button>
        </div>
      ) : (
        <>
          {/* Summary & Actions */}
          <div className="grid gap-4 md:grid-cols-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{summary.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">{summary.present}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="h-5 w-5 mx-auto mb-1 text-red-600" />
                  <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                  <p className="text-2xl font-bold text-orange-600">{summary.late}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">{summary.excused}</p>
                  <p className="text-xs text-muted-foreground">Excused</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                  <p className="text-2xl font-bold text-primary">
                    {summary.total > 0 ? ((summary.present / summary.total) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleMarkAllPresent} className="gap-2">
              <CheckCheck className="h-4 w-4" />
              Mark All Present
            </Button>
            <Button variant="outline" onClick={() => setStatsOpen(true)} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Submit Attendance
            </Button>
          </div>

          {/* Students List */}
          <div className="grid gap-3">
            {filteredStudents.map((student) => (
              <StudentAttendanceRow
                key={student._id}
                student={student}
                attendance={attendance[student._id] || { status: "present", remarks: "" }}
                onStatusChange={handleStatusChange}
                onRemarksChange={handleRemarksChange}
              />
            ))}
          </div>
        </>
      )}

      {/* Stats Dialog */}
      <AttendanceStatsDialog
        classId={selectedClass}
        open={statsOpen}
        onOpenChange={setStatsOpen}
      />
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useTeacherAttendance } from "@/hooks/use-teacher-data";
// import { CheckCircle2, XCircle, Clock, Users, Save, Loader2, AlertCircle } from "lucide-react";
// import { toast } from "sonner";

// function LoadingState() {
//   return (
//     <div className="flex items-center justify-center min-h-96">
//       <div className="text-center">
//         <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
//         <p className="text-muted-foreground">Loading attendance data...</p>
//       </div>
//     </div>
//   );
// }

// export default function TeacherAttendance() {
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
//   const { classes, attendance, loading, error, refetch, saveAttendance } = useTeacherAttendance();
//   const [students, setStudents] = useState([]);

//   if (loading) {
//     return <LoadingState />;
//   }

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
//         <p className="text-destructive mb-4">Error loading attendance: {error}</p>
//         <Button onClick={refetch}>Try Again</Button>
//       </div>
//     );
//   }

//   const classList = classes?.data || [];
//   const currentClass = classList.find((c) => c._id === selectedClass) || classList[0];
  
//   if (selectedClass === "" && classList.length > 0) {
//     setSelectedClass(classList[0]._id);
//   }

//   const handleClassChange = (classId) => {
//     setSelectedClass(classId);
//     const cls = mockClasses.find((c) => c.id === classId);
//     setStudents(generateStudents(cls?.studentCount || 30));
//   };

//   const updateStatus = (studentId, status) => {
//     setStudents(students.map((s) => 
//       s.id === studentId ? { ...s, status } : s
//     ));
//   };

//   const markAllPresent = () => {
//     setStudents(students.map((s) => ({ ...s, status: "present" })));
//   };

//   const saveAttendance = () => {
//     toast.success("Attendance saved successfully!", {
//       description: `Attendance for ${currentClass?.name} on ${selectedDate} has been recorded.`,
//     });
//   };

//   const presentCount = students.filter((s) => s.status === "present").length;
//   const absentCount = students.filter((s) => s.status === "absent").length;
//   const lateCount = students.filter((s) => s.status === "late").length;

//   const getStatusStyle = (status) => {
//     switch (status) {
//       case "present":
//         return "bg-success text-success-foreground";
//       case "absent":
//         return "bg-destructive text-destructive-foreground";
//       case "late":
//         return "bg-warning text-warning-foreground";
//       default:
//         return "bg-muted";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">Take Attendance</h1>
//           <p className="text-muted-foreground">Mark attendance for your classes</p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={markAllPresent}>
//             <CheckCircle2 className="mr-2 h-4 w-4" />
//             Mark All Present
//           </Button>
//           <Button onClick={saveAttendance}>
//             <Save className="mr-2 h-4 w-4" />
//             Save Attendance
//           </Button>
//         </div>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardContent className="p-4">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1">
//               <label className="text-sm font-medium text-foreground mb-2 block">Select Class</label>
//               <select
//                 value={selectedClass}
//                 onChange={(e) => handleClassChange(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-md bg-card"
//               >
//                 {mockClasses.map((cls) => (
//                   <option key={cls.id} value={cls.id}>
//                     {cls.name} ({cls.studentCount} students)
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex-1">
//               <label className="text-sm font-medium text-foreground mb-2 block">Select Date</label>
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-md bg-card"
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Stats */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-4">
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
//                 <Users className="h-5 w-5 text-muted-foreground" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{students.length}</p>
//                 <p className="text-sm text-muted-foreground">Total</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-4">
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
//                 <CheckCircle2 className="h-5 w-5 text-success" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{presentCount}</p>
//                 <p className="text-sm text-muted-foreground">Present</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-4">
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
//                 <XCircle className="h-5 w-5 text-destructive" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{absentCount}</p>
//                 <p className="text-sm text-muted-foreground">Absent</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-4">
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
//                 <Clock className="h-5 w-5 text-warning" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{lateCount}</p>
//                 <p className="text-sm text-muted-foreground">Late</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Student List */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Students - {currentClass?.name}</CardTitle>
//           <CardDescription>Click on status buttons to change attendance</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-2">
//             {students.map((student, index) => (
//               <div
//                 key={student.id}
//                 className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
//               >
//                 <div className="flex items-center gap-4">
//                   <span className="text-sm text-muted-foreground w-8">{index + 1}.</span>
//                   <div>
//                     <p className="font-medium text-foreground">{student.name}</p>
//                     <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     size="sm"
//                     variant={student.status === "present" ? "default" : "outline"}
//                     className={student.status === "present" ? "bg-success hover:bg-success/90" : ""}
//                     onClick={() => updateStatus(student.id, "present")}
//                   >
//                     <CheckCircle2 className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant={student.status === "late" ? "default" : "outline"}
//                     className={student.status === "late" ? "bg-warning hover:bg-warning/90" : ""}
//                     onClick={() => updateStatus(student.id, "late")}
//                   >
//                     <Clock className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant={student.status === "absent" ? "default" : "outline"}
//                     className={student.status === "absent" ? "bg-destructive hover:bg-destructive/90" : ""}
//                     onClick={() => updateStatus(student.id, "absent")}
//                   >
//                     <XCircle className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { mockClasses } from "@/lib/mock-data";
// import { CheckCircle2, XCircle, Clock, Users, Save } from "lucide-react";
// import { toast } from "sonner";

// // Generate mock students for attendance
// const generateStudents = (count) => {
//   const names = [
//     "Alex Johnson", "Emily Davis", "Michael Brown", "Sarah Wilson", "David Lee",
//     "Jessica Taylor", "Chris Martin", "Amanda White", "Ryan Clark", "Nicole Lewis",
//     "Jason Harris", "Michelle Young", "Kevin Hall", "Laura Allen", "Brandon King",
//     "Ashley Wright", "Tyler Scott", "Samantha Hill", "Justin Green", "Rachel Adams",
//     "Daniel Baker", "Stephanie Nelson", "Andrew Carter", "Megan Mitchell", "Joshua Perez",
//     "Lauren Roberts", "Nathan Turner", "Kayla Phillips", "Jacob Campbell", "Olivia Parker",
//     "Ethan Evans", "Emma Edwards"
//   ];
//   return names.slice(0, count).map((name, index) => ({
//     id: String(index + 1),
//     name,
//     rollNumber: `2024${String(index + 1).padStart(3, "0")}`,
//     status: "present",
//   }));
// };

// export default function TeacherAttendance() {
//   const [selectedClass, setSelectedClass] = useState(mockClasses[0].id);
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
//   const [students, setStudents] = useState(() => 
//     generateStudents(mockClasses[0].studentCount)
//   );

//   const currentClass = mockClasses.find((c) => c.id === selectedClass);

//   const handleClassChange = (classId) => {
//     setSelectedClass(classId);
//     const cls = mockClasses.find((c) => c.id === classId);
//     setStudents(generateStudents(cls?.studentCount || 30));
//   };

//   const updateStatus = (studentId, status) => {
//     setStudents(students.map((s) => 
//       s.id === studentId ? { ...s, status } : s
//     ));
//   };

//   const markAllPresent = () => {
//     setStudents(students.map((s) => ({ ...s, status: "present" })));
//   };

//   const saveAttendance = () => {
//     toast.success("Attendance saved successfully!", {
//       description: `Attendance for ${currentClass?.name} on ${selectedDate} has been recorded.`,
//     });
//   };

//   const presentCount = students.filter((s) => s.status === "present").length;
//   const absentCount = students.filter((s) => s.status === "absent").length;
//   const lateCount = students.filter((s) => s.status === "late").length;

//   const getStatusStyle = (status) => {
//     switch (status) {
//       case "present":
//         return "bg-success text-success-foreground";
//       case "absent":
//         return "bg-destructive text-destructive-foreground";
//       case "late":
//         return "bg-warning text-warning-foreground";
//       default:
//         return "bg-muted";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-foreground">Take Attendance</h1>
//           <p className="text-muted-foreground">Mark attendance for your classes</p>
//         </div>
//         <div className="flex gap-2">
//           <Button variant="outline" onClick={markAllPresent}>
//             <CheckCircle2 className="mr-2 h-4 w-4" />
//             Mark All Present
//           </Button>
//           <Button onClick={saveAttendance}>
//             <Save className="mr-2 h-4 w-4" />
//             Save Attendance
//           </Button>
//         </div>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardContent className="p-4">
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1">
//               <label className="text-sm font-medium text-foreground mb-2 block">Select Class</label>
//               <select
//                 value={selectedClass}
//                 onChange={(e) => handleClassChange(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-md bg-card"
//               >
//                 {mockClasses.map((cls) => (
//                   <option key={cls.id} value={cls.id}>
//                     {cls.name} ({cls.studentCount} students)
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex-1">
//               <label className="text-sm font-medium text-foreground mb-2 block">Select Date</label>
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="w-full px-3 py-2 border rounded-md bg-card"
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Stats */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-4">
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
//                 <Users className="h-5 w-5 text-muted-foreground" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{students.length}</p>
//                 <p className="text-sm text-muted-foreground">Total</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-4">
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
//                 <CheckCircle2 className="h-5 w-5 text-success" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{presentCount}</p>
//                 <p className="text-sm text-muted-foreground">Present</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-4">
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
//                 <XCircle className="h-5 w-5 text-destructive" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{absentCount}</p>
//                 <p className="text-sm text-muted-foreground">Absent</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-4">
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
//                 <Clock className="h-5 w-5 text-warning" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{lateCount}</p>
//                 <p className="text-sm text-muted-foreground">Late</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Student List */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Students - {currentClass?.name}</CardTitle>
//           <CardDescription>Click on status buttons to change attendance</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-2">
//             {students.map((student, index) => (
//               <div
//                 key={student.id}
//                 className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
//               >
//                 <div className="flex items-center gap-4">
//                   <span className="text-sm text-muted-foreground w-8">{index + 1}.</span>
//                   <div>
//                     <p className="font-medium text-foreground">{student.name}</p>
//                     <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     size="sm"
//                     variant={student.status === "present" ? "default" : "outline"}
//                     className={student.status === "present" ? "bg-success hover:bg-success/90" : ""}
//                     onClick={() => updateStatus(student.id, "present")}
//                   >
//                     <CheckCircle2 className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant={student.status === "late" ? "default" : "outline"}
//                     className={student.status === "late" ? "bg-warning hover:bg-warning/90" : ""}
//                     onClick={() => updateStatus(student.id, "late")}
//                   >
//                     <Clock className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant={student.status === "absent" ? "default" : "outline"}
//                     className={student.status === "absent" ? "bg-destructive hover:bg-destructive/90" : ""}
//                     onClick={() => updateStatus(student.id, "absent")}
//                   >
//                     <XCircle className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
