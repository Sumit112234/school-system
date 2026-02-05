"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockClasses } from "@/lib/mock-data";
import { CheckCircle2, XCircle, Clock, Users, Save } from "lucide-react";
import { toast } from "sonner";

// Generate mock students for attendance
const generateStudents = (count) => {
  const names = [
    "Alex Johnson", "Emily Davis", "Michael Brown", "Sarah Wilson", "David Lee",
    "Jessica Taylor", "Chris Martin", "Amanda White", "Ryan Clark", "Nicole Lewis",
    "Jason Harris", "Michelle Young", "Kevin Hall", "Laura Allen", "Brandon King",
    "Ashley Wright", "Tyler Scott", "Samantha Hill", "Justin Green", "Rachel Adams",
    "Daniel Baker", "Stephanie Nelson", "Andrew Carter", "Megan Mitchell", "Joshua Perez",
    "Lauren Roberts", "Nathan Turner", "Kayla Phillips", "Jacob Campbell", "Olivia Parker",
    "Ethan Evans", "Emma Edwards"
  ];
  return names.slice(0, count).map((name, index) => ({
    id: String(index + 1),
    name,
    rollNumber: `2024${String(index + 1).padStart(3, "0")}`,
    status: "present",
  }));
};

export default function TeacherAttendance() {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState(() => 
    generateStudents(mockClasses[0].studentCount)
  );

  const currentClass = mockClasses.find((c) => c.id === selectedClass);

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    const cls = mockClasses.find((c) => c.id === classId);
    setStudents(generateStudents(cls?.studentCount || 30));
  };

  const updateStatus = (studentId, status) => {
    setStudents(students.map((s) => 
      s.id === studentId ? { ...s, status } : s
    ));
  };

  const markAllPresent = () => {
    setStudents(students.map((s) => ({ ...s, status: "present" })));
  };

  const saveAttendance = () => {
    toast.success("Attendance saved successfully!", {
      description: `Attendance for ${currentClass?.name} on ${selectedDate} has been recorded.`,
    });
  };

  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.filter((s) => s.status === "absent").length;
  const lateCount = students.filter((s) => s.status === "late").length;

  const getStatusStyle = (status) => {
    switch (status) {
      case "present":
        return "bg-success text-success-foreground";
      case "absent":
        return "bg-destructive text-destructive-foreground";
      case "late":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Take Attendance</h1>
          <p className="text-muted-foreground">Mark attendance for your classes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllPresent}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark All Present
          </Button>
          <Button onClick={saveAttendance}>
            <Save className="mr-2 h-4 w-4" />
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-card"
              >
                {mockClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.studentCount} students)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-card"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{presentCount}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{absentCount}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lateCount}</p>
                <p className="text-sm text-muted-foreground">Late</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Students - {currentClass?.name}</CardTitle>
          <CardDescription>Click on status buttons to change attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {students.map((student, index) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-8">{index + 1}.</span>
                  <div>
                    <p className="font-medium text-foreground">{student.name}</p>
                    <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={student.status === "present" ? "default" : "outline"}
                    className={student.status === "present" ? "bg-success hover:bg-success/90" : ""}
                    onClick={() => updateStatus(student.id, "present")}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={student.status === "late" ? "default" : "outline"}
                    className={student.status === "late" ? "bg-warning hover:bg-warning/90" : ""}
                    onClick={() => updateStatus(student.id, "late")}
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={student.status === "absent" ? "default" : "outline"}
                    className={student.status === "absent" ? "bg-destructive hover:bg-destructive/90" : ""}
                    onClick={() => updateStatus(student.id, "absent")}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
