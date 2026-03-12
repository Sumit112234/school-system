"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Building,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  DoorOpen,
  Loader2,
  AlertCircle,
  Award,
  UserCheck,
  Mail,
  Phone,
  ChevronRight,
  Shield,
  Target,
} from "lucide-react";
import Link from "next/link";

// ─── Helper Functions ──────────────────────────────────────────────────────────

function getInitials(name) {
  return name
    ?.split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";
}

// ─── Loading State ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading classes...</p>
      </div>
    </div>
  );
}

// ─── Class Details Dialog ──────────────────────────────────────────────────────

function ClassDetailsDialog({ classId, open, onOpenChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && classId) {
      fetchClassDetails();
    }
  }, [open, classId]);

  const fetchClassDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/teacher/classes/${classId}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message ?? "Failed to fetch class details");
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const classInfo = data?.class;
  const isClassTeacher = data?.isClassTeacher;
  const classTeacher = data?.classTeacher;
  const mySubjects = data?.mySubjects || [];
  const allSubjects = data?.allSubjects || [];
  const students = data?.students || [];
  const stats = data?.stats;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Class Details</DialogTitle>
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
        ) : classInfo ? (
          <div className="space-y-6">
            {/* Class Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">
                  {classInfo.name} - Section {classInfo.section}
                </h3>
                <p className="text-muted-foreground">Academic Year: {classInfo.academicYear}</p>
                <div className="flex gap-2 mt-2">
                  {isClassTeacher && (
                    <Badge className="bg-purple-500">
                      <Shield className="h-3 w-3 mr-1" />
                      Class Teacher
                    </Badge>
                  )}
                  {classInfo.isActive ? (
                    <Badge className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DoorOpen className="h-4 w-4" />
                  <span>Room {classInfo.room || "—"}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg border bg-card">
                <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-card">
                <UserCheck className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <p className="text-2xl font-bold">{stats?.activeStudents || 0}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-card">
                <BookOpen className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <p className="text-2xl font-bold">{stats?.totalSubjects || 0}</p>
                <p className="text-xs text-muted-foreground">Subjects</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-card">
                <Award className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                <p className="text-2xl font-bold">{stats?.mySubjectsCount || 0}</p>
                <p className="text-xs text-muted-foreground">I Teach</p>
              </div>
            </div>

            <Separator />

            {/* Class Teacher Info */}
            {classTeacher && (
              <>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Class Teacher
                  </h4>
                  <div className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(classTeacher.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{classTeacher.name}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {classTeacher.email}
                          </span>
                          {classTeacher.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {classTeacher.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* My Subjects */}
            {mySubjects.length > 0 && (
              <>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Subjects I Teach ({mySubjects.length})
                  </h4>
                  <div className="grid gap-2">
                    {mySubjects.map((subject) => (
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
                        <div className="text-right text-sm">
                          <p className="font-medium">{subject.credits} Credits</p>
                          <p className="text-xs text-muted-foreground">
                            Pass: {subject.passingMarks}/{subject.totalMarks}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* All Subjects */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                All Class Subjects ({allSubjects.length})
              </h4>
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {allSubjects.map((subject) => (
                  <div
                    key={subject._id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      subject.isMine ? "bg-primary/5 border-primary/50" : "bg-card"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {subject.name} ({subject.code})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {subject.type} • {subject.credits} credits
                      </p>
                    </div>
                    <div className="text-right">
                      {subject.isMine ? (
                        <Badge variant="default" className="text-xs">You</Badge>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {subject.teacher?.name || "No Teacher"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Link href={`/dashboard/teacher/students?classId=${classInfo._id}`} className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Users className="h-4 w-4" />
                  View All Students
                </Button>
              </Link>
              {classInfo.description && (
                <Button variant="outline" className="flex-1" disabled>
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Assignments
                </Button>
              )}
            </div>

            {/* Description */}
            {classInfo.description && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{classInfo.description}</p>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// ─── Class Card ────────────────────────────────────────────────────────────────

function ClassCard({ classData, onClick }) {
  const isClassTeacher = classData.isClassTeacher;

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all"
      onClick={() => onClick(classData._id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="text-lg leading-tight">
                {classData.name} - Section {classData.section}
              </CardTitle>
              {isClassTeacher && (
                <Badge className="bg-purple-500 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Class Teacher
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{classData.academicYear}</p>
          </div>
          <Badge variant="outline" className="shrink-0">
            <DoorOpen className="h-3 w-3 mr-1" />
            {classData.room || "—"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Students</p>
            <p className="font-bold text-lg">{classData.studentCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Capacity</p>
            <p className="font-bold text-lg">{classData.capacity}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">My Subjects</p>
            <p className="font-bold text-lg text-primary">{classData.mySubjects.length}</p>
          </div>
        </div>

        {/* My Subjects */}
        {classData.mySubjects.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Subjects I Teach</p>
            <div className="flex flex-wrap gap-1">
              {classData.mySubjects.slice(0, 3).map((subject) => (
                <Badge key={subject._id} variant="secondary" className="text-xs">
                  {subject.code}
                </Badge>
              ))}
              {classData.mySubjects.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{classData.mySubjects.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Class Teacher Info */}
        {!isClassTeacher && classData.classTeacher && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Class Teacher</p>
            <p className="text-sm font-medium truncate">{classData.classTeacher.name}</p>
          </div>
        )}

        {/* View Details Link */}
        <div className="pt-2 border-t">
          <Button variant="ghost" size="sm" className="w-full gap-2 justify-between">
            <span>View Details</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [yearFilter, setYearFilter] = useState("all");
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        ...(yearFilter !== "all" && { academicYear: yearFilter }),
      });

      const res = await fetch(`/api/teacher/classes?${params}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message ?? "Failed to fetch classes");

      const data = result.data;
      setClasses(data.classes || []);
      setAcademicYears(data.academicYears || []);
      setSummary(data.summary || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [yearFilter]);

  const handleClassClick = (classId) => {
    setSelectedClassId(classId);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
        <p className="text-muted-foreground">View and manage your assigned classes</p>
      </div>

      {/* Stats */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                  <p className="text-2xl font-bold">{summary.totalClasses}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Class Teacher</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.classTeacherOf}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Subject Teacher</p>
                  <p className="text-2xl font-bold text-green-600">{summary.subjectTeacherOf}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-orange-600">{summary.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      {academicYears.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="All Academic Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Academic Years</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Classes Grid */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">Error loading classes: {error}</p>
          <Button onClick={fetchClasses}>Try Again</Button>
        </div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {yearFilter !== "all"
                  ? "No classes found for this academic year"
                  : "No classes assigned to you yet"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((classData) => (
            <ClassCard key={classData._id} classData={classData} onClick={handleClassClick} />
          ))}
        </div>
      )}

      {/* Class Details Dialog */}
      <ClassDetailsDialog
        classId={selectedClassId}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}