"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Users,
  UserPlus,
  UserMinus,
  Loader2,
  AlertCircle,
  Search,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

// ─── Loading State ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading class students...</p>
      </div>
    </div>
  );
}

// ─── Add Students Dialog ───────────────────────────────────────────────────────

function AddStudentsDialog({ classData, availableStudents, open, onOpenChange, onAdded }) {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [assignSubjects, setAssignSubjects] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      setSelectedStudents([]);
      setAssignSubjects(true);
      setSearchQuery("");
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    const filtered = filteredStudents.map((s) => s._id);
    setSelectedStudents(filtered);
  };

  const handleDeselectAll = () => {
    setSelectedStudents([]);
  };

  const handleSubmit = async () => {
    setError(null);
    if (selectedStudents.length === 0) {
      setError("Please select at least one student");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch(`/api/admin/classes/${classData._id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selectedStudents,
          assignSubjects,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to add students");
      onAdded(data);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const filteredStudents = availableStudents.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.user?.name?.toLowerCase().includes(query) ||
      s.user?.email?.toLowerCase().includes(query) ||
      s.studentId?.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Students to Class</DialogTitle>
          <DialogDescription>
            Add students to{" "}
            <span className="font-semibold text-foreground">
              {classData?.name} - Section {classData?.section}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Auto-assign subjects toggle */}
          {classData?.subjects?.length > 0 && (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
              <Checkbox
                id="assign-subjects"
                checked={assignSubjects}
                onCheckedChange={setAssignSubjects}
              />
              <div className="flex-1">
                <Label htmlFor="assign-subjects" className="cursor-pointer font-medium">
                  Auto-assign class subjects ({classData.subjects.length})
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically assign all class subjects to selected students
                </p>
              </div>
            </div>
          )}

          {/* Selection controls */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedStudents.length} of {filteredStudents.length} selected
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredStudents.length === 0}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={selectedStudents.length === 0}
              >
                Deselect All
              </Button>
            </div>
          </div>

          {/* Student list */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {searchQuery ? "No students found" : "No unassigned students available"}
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2 rounded-lg border p-3">
              {filteredStudents.map((student) => {
                const isSelected = selectedStudents.includes(student._id);
                return (
                  <div
                    key={student._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? "bg-primary/10 border-primary" : "hover:bg-accent"
                    }`}
                    onClick={() => handleToggleStudent(student._id)}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => handleToggleStudent(student._id)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{student.user?.email}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {student.studentId}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={adding}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={adding || selectedStudents.length === 0} className="gap-2">
            {adding && <Loader2 className="h-4 w-4 animate-spin" />}
            Add {selectedStudents.length} Student{selectedStudents.length !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Remove Students Dialog ────────────────────────────────────────────────────

function RemoveStudentsDialog({ classData, selectedStudents, studentsList, open, onOpenChange, onRemoved }) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  const selectedStudentDetails = studentsList.filter((s) => selectedStudents.includes(s._id));

  const handleRemove = async () => {
    setError(null);
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/classes/${classData._id}/students`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentIds: selectedStudents }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to remove students");
      onRemoved(data);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Remove Students from Class</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {selectedStudents.length} student
            {selectedStudents.length !== 1 ? "s" : ""} from this class?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg border p-3">
            {selectedStudentDetails.map((student) => (
              <div key={student._id} className="flex items-center justify-between p-2 rounded bg-muted">
                <div>
                  <p className="font-medium text-sm">{student.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{student.studentId}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            Their class assignment and subjects will be removed. This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={removing}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemove} disabled={removing} className="gap-2">
            {removing && <Loader2 className="h-4 w-4 animate-spin" />}
            Remove Students
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ClassStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/classes/${classId}/students`);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message ?? "Failed to fetch data");
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classId]);

  const handleAdded = () => {
    setSelectedStudents([]);
    fetchData();
  };

  const handleRemoved = () => {
    setSelectedStudents([]);
    fetchData();
  };

  const handleToggleStudent = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudents(filteredStudents.map((s) => s._id));
  };

  const handleDeselectAll = () => {
    setSelectedStudents([]);
  };

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading class: {error}</p>
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    );
  }

  const classData = data.class;
  const studentsInClass = data.studentsInClass || [];
  const availableStudents = data.availableStudents || [];
  const classSubjects = data.classSubjects || [];

  const filteredStudents = studentsInClass.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.user?.name?.toLowerCase().includes(query) ||
      s.user?.email?.toLowerCase().includes(query) ||
      s.studentId?.toLowerCase().includes(query) ||
      s.rollNumber?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {classData.name} - Section {classData.section}
          </h1>
          <p className="text-muted-foreground">Academic Year: {classData.academicYear}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">{studentsInClass.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="text-2xl font-bold">{classData.capacity}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subjects</p>
                <p className="text-2xl font-bold">{classSubjects.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-orange-600">{availableStudents.length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Subjects Info */}
      {classSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Class Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {classSubjects.map((subject) => (
                <Badge key={subject._id} variant="secondary">
                  {subject.name} ({subject.code})
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These subjects will be auto-assigned to students added to this class
            </p>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students in class..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              {selectedStudents.length > 0 && (
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => setRemoveDialogOpen(true)}
                >
                  <UserMinus className="h-4 w-4" />
                  Remove ({selectedStudents.length})
                </Button>
              )}
              <Button className="gap-2 bg-admin hover:bg-admin/90" onClick={() => setAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Add Students
              </Button>
            </div>
          </div>

          {studentsInClass.length > 0 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedStudents.length} of {filteredStudents.length} selected
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedStudents.length === 0}
                >
                  Deselect All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No students found matching your search"
                  : "No students assigned to this class yet"}
              </p>
              {!searchQuery && (
                <Button className="mt-4 gap-2" onClick={() => setAddDialogOpen(true)}>
                  <UserPlus className="h-4 w-4" />
                  Add Students
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => {
            const isSelected = selectedStudents.includes(student._id);
            const isActive = student.user?.isActive;

            return (
              <Card
                key={student._id}
                className={`cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-primary" : ""
                } ${!isActive ? "opacity-60" : ""}`}
                onClick={() => handleToggleStudent(student._id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Checkbox checked={isSelected} onClick={(e) => e.stopPropagation()} />
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base leading-tight truncate">
                          {student.user?.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground truncate">{student.user?.email}</p>
                      </div>
                    </div>
                    {!isActive && (
                      <Badge variant="outline" className="shrink-0 text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Student ID</p>
                      <p className="font-medium">{student.studentId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Roll Number</p>
                      <p className="font-medium">{student.rollNumber || "—"}</p>
                    </div>
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
          })}
        </div>
      )}

      {/* Add Students Dialog */}
      {addDialogOpen && (
        <AddStudentsDialog
          classData={classData}
          availableStudents={availableStudents}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onAdded={handleAdded}
        />
      )}

      {/* Remove Students Dialog */}
      {removeDialogOpen && (
        <RemoveStudentsDialog
          classData={classData}
          selectedStudents={selectedStudents}
          studentsList={studentsInClass}
          open={removeDialogOpen}
          onOpenChange={setRemoveDialogOpen}
          onRemoved={handleRemoved}
        />
      )}
    </div>
  );
}