"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  UserCheck,
  AlertCircle,
  Loader2,
  X,
  IdCard,
  Heart,
  UserCircle,
  Building,
  ChevronLeft,
  ChevronRight,
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

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Loading State ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    </div>
  );
}

// ─── Student Details Dialog ────────────────────────────────────────────────────

function StudentDetailsDialog({ studentId, open, onOpenChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && studentId) {
      fetchStudentDetails();
    }
  }, [open, studentId]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/teacher/students/${studentId}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message ?? "Failed to fetch student details");
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const student = data?.student;
  const classInfo = data?.class;
  const parentInfo = data?.parentInfo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Student Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive">{error}</p>
          </div>
        ) : student ? (
          <div className="space-y-6">
            {/* Student Profile */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={student.user?.avatar} />
                <AvatarFallback className="text-lg">
                  {getInitials(student.user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-2xl font-bold">{student.user?.name}</h3>
                <p className="text-muted-foreground">{student.user?.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{student.studentId}</Badge>
                  {student.user?.isActive ? (
                    <Badge className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Personal Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{student.user?.gender || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium">{student.user?.age ? `${student.user.age} years` : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{formatDateShort(student.user?.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{student.bloodGroup || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{student.user?.address || "—"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Academic Information */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Academic Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Class</p>
                  <p className="font-medium">
                    {classInfo?.name} - Section {classInfo?.section}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Roll Number</p>
                  <p className="font-medium">{student.rollNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Academic Year</p>
                  <p className="font-medium">{classInfo?.academicYear}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Admission Date</p>
                  <p className="font-medium">{formatDateShort(student.admissionDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Class Teacher</p>
                  <p className="font-medium">{classInfo?.classTeacher?.name || "Not Assigned"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Room</p>
                  <p className="font-medium">{classInfo?.room || "—"}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Subjects */}
            {student.subjects && student.subjects.length > 0 && (
              <>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Enrolled Subjects ({student.subjects.length})
                  </h4>
                  <div className="grid gap-2">
                    {student.subjects.map((subject) => {
                      const classSubject = classInfo?.subjects?.find(
                        (cs) => cs.subject._id === subject._id
                      );
                      return (
                        <div
                          key={subject._id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{subject.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {subject.code} • {subject.type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {classSubject?.teacher?.name || "No Teacher"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {subject.credits} {subject.credits === 1 ? "Credit" : "Credits"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Contact Information */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Information
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{student.user?.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{student.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Emergency Contact</p>
                    <p className="font-medium">{student.emergencyContact || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Parent Information */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Parent / Guardian Information
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{parentInfo?.parentName || "—"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{parentInfo?.parentPhone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{parentInfo?.parentEmail || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// ─── Student Card ──────────────────────────────────────────────────────────────

function StudentCard({ student, onClick }) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all"
      onClick={() => onClick(student._id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={student.user?.avatar} />
            <AvatarFallback>{getInitials(student.user?.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight truncate">
              {student.user?.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground truncate">{student.user?.email}</p>
            <div className="flex gap-1 mt-1.5">
              <Badge variant="outline" className="text-xs">
                {student.studentId}
              </Badge>
              {student.rollNumber && (
                <Badge variant="secondary" className="text-xs">
                  Roll {student.rollNumber}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Building className="h-3 w-3" />
            <span className="text-xs">Class</span>
          </div>
          <p className="font-medium">
            {student.class?.name} - Section {student.class?.section}
          </p>
        </div>

        {student.subjects && student.subjects.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">Subjects</p>
            <div className="flex flex-wrap gap-1">
              {student.subjects.slice(0, 3).map((subject) => (
                <Badge key={subject._id} variant="outline" className="text-xs">
                  {subject.code}
                </Badge>
              ))}
              {student.subjects.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{student.subjects.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const LIMIT = 12;

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
        ...(searchQuery && { search: searchQuery }),
        ...(classFilter !== "all" && { classId: classFilter }),
      });

      const res = await fetch(`/api/teacher/students?${params}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message ?? "Failed to fetch students");

      const data = result.data;
      setStudents(data.data || []);
      setTotalStudents(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / LIMIT));
      setTeacherClasses(data.teacherClasses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchQuery, classFilter]);

  useEffect(() => {
    fetchStudents();
  }, [page, searchQuery, classFilter]);

  const handleStudentClick = (studentId) => {
    setSelectedStudentId(studentId);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Students</h1>
        <p className="text-muted-foreground">View and manage students in your classes</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My Classes</p>
                <p className="text-2xl font-bold text-purple-600">{teacherClasses.length}</p>
              </div>
              <Building className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Currently Viewing</p>
                <p className="text-2xl font-bold text-green-600">{students.length}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students by name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {teacherClasses.map((cls) => (
                  <SelectItem key={cls._id} value={cls._id}>
                    {cls.name} - Section {cls.section} ({cls.academicYear})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">Error loading students: {error}</p>
          <Button onClick={fetchStudents}>Try Again</Button>
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || classFilter !== "all"
                  ? "No students found matching your filters"
                  : "No students assigned to your classes yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <StudentCard
                key={student._id}
                student={student}
                onClick={handleStudentClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, totalStudents)} of{" "}
                {totalStudents} students
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Student Details Dialog */}
      <StudentDetailsDialog
        studentId={selectedStudentId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}