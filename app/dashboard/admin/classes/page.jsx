"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Plus,
  Building,
  Users,
  BookOpen,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  GraduationCap,
  Calendar,
  DoorOpen,
  X,
} from "lucide-react";
import Link from "next/link";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const ACADEMIC_YEARS = ["2023-2024", "2024-2025", "2025-2026", "2026-2027", "2027-2028"];

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

// ─── Subject Assignment Dialog ─────────────────────────────────────────────────

function SubjectAssignmentDialog({ cls, open, onOpenChange, onSaved }) {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [subjectsRes, teachersRes] = await Promise.all([
          fetch("/api/admin/subjects?limit=1000"),
          fetch("/api/admin/teachers?limit=1000"),
        ]);
        

        
        const [subjectsData, teachersData] = await Promise.all([
          subjectsRes.json(),
          teachersRes.json(),
        ]);

        console.log("Fetched subjects data:", teachersData);

        if (!subjectsRes.ok) throw new Error("Failed to fetch subjects");
        if (!teachersRes.ok) throw new Error("Failed to fetch teachers");

        setAllSubjects(subjectsData?.data?.data ?? []);
        setTeachers(teachersData?.data?.data ?? []);

        // Initialize with existing subjects or empty array
        console.log("Class subjects:", cls?.subjects, cls);
        setSubjects(
          cls?.subjects?.map((s) => ({
            subject: s.subject?._id ?? s.subject,
            teacher: s.teacher?._id ?? s.teacher ?? "",
          })) ?? []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, cls]);

  const handleAddSubject = () => {
    setSubjects([...subjects, { subject: "", teacher: "" }]);
  };

  const handleRemoveSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);
  };

  const handleSubmit = async () => {
    setError(null);
    
    // Validate that all subjects have a subject selected
    const hasInvalidSubjects = subjects.some((s) => !s.subject);
    if (hasInvalidSubjects) {
      setError("Please select a subject for all entries");
      return;
    }

    setSaving(true);

    console.log("Submitting subjects:", subjects);
    // return ;
    try {
      const res = await fetch(`/api/admin/classes/${cls.id ?? cls._id}/subjects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjects }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to update subjects");
      onSaved(data);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Assign Subjects</DialogTitle>
          <DialogDescription>
            Assign subjects and teachers for{" "}
            <span className="font-semibold text-foreground">
              {cls?.name} - Section {cls?.section}
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

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {subjects.map((subj, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        {index === 0 && (
                          <Label className="text-xs">
                            Subject <span className="text-destructive">*</span>
                          </Label>
                        )}
                        <Select
                          value={subj.subject}
                          onValueChange={(v) => handleSubjectChange(index, "subject", v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {allSubjects.map((s) => (
                              <SelectItem key={s.id ?? s._id} value={s.id ?? s._id}>
                                {s.name} ({s.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        {index === 0 && <Label className="text-xs">Teacher (Optional)</Label>}
                        <Select
                          value={subj.teacher || "none"}
                          onValueChange={(v) =>
                            handleSubjectChange(index, "teacher", v === "none" ? "" : v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No teacher</SelectItem>
                            {teachers.map((t) => (
                              <SelectItem key={t.id ?? t._id} value={t?.teacherData?._id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive shrink-0 mt-6"
                      onClick={() => handleRemoveSubject(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={handleAddSubject}
              >
                <Plus className="h-4 w-4" />
                Add Subject
              </Button>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || loading} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Subjects
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add/Edit Class Dialog ─────────────────────────────────────────────────────

function ClassDialog({ cls, open, onOpenChange, onSaved }) {
  const isEdit = !!cls;
  const [form, setForm] = useState( !cls ?{
    name: "",
    section: "",
    academicYear: "2026-2027",
    classTeacher: "",
    room: "",
    capacity: "40",
    description: "",
    isActive: true,
  } : 
{
          name: cls.name ?? "",
          section: cls.section ?? "",
          academicYear: cls.academicYear ?? "2026-2027",
          classTeacher: cls.classTeacher ?? "",
          room: cls.room ?? "",
          capacity: String(cls.capacity ?? 40),
          description: cls.description ?? "",
          isActive: cls.isActive ?? true,
        });

  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    const fetchTeachers = async () => {
      setTeachersLoading(true);
      try {
        const res = await fetch("/api/admin/teachers");
        const data = await res.json();
        console.log("Fetched teachers data:", data);
        if (!res.ok) throw new Error(data?.message ?? "Failed to fetch teachers");
        setTeachers(data?.data?.data ?? data?.data ?? []);
      } catch (err) {
        console.error("Failed to load teachers:", err.message);
        setTeachers([]);
      } finally {
        setTeachersLoading(false);
      }
    };
    fetchTeachers();
  }, [open]);

  const handleOpenChange = (isOpen) => {

    console.log("Dialog open state changed:", isOpen);
    if (isOpen) {
      if (isEdit) {
        setForm({
          name: cls.name ?? "",
          section: cls.section ?? "",
          academicYear: cls.academicYear ?? "2026-2027",
          classTeacher: cls.classTeacher?._id ?? cls.classTeacher ?? "",
          room: cls.room ?? "",
          capacity: String(cls.capacity ?? 40),
          description: cls.description ?? "",
          isActive: cls.isActive ?? true,
        });
      } else {
        setForm({
          name: "",
          section: "",
          academicYear: "2026-2027",
          classTeacher: "",
          room: "",
          capacity: "40",
          description: "",
          isActive: true,
        });
      }
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.name || !form.section || !form.academicYear) {
      setError("Name, section, and academic year are required.");
      return;
    }

      console.log("Form data to submit:", form);

      if (form.description === "") form.description = null;
    // return ;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        section: form.section,
        academicYear: form.academicYear,
        classTeacher: !form.classTeacher ? null : form.classTeacher,
        room: form.room || null,
        capacity: Number(form.capacity) || 40,
        description: form.description || null,
        isActive: form.isActive,
      };

      const url = isEdit ? `/api/admin/classes/${cls.id ?? cls._id}` : "/api/admin/classes";
      const method = isEdit ? "PUT" : "POST";

      console.log(payload, method, url);

      // return ;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? `Failed to ${isEdit ? "update" : "create"} class`);
      onSaved(data);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? "Edit Class" : "Create New Class"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update the details for "${cls?.name} - Section ${cls?.section}".`
              : "Fill in the details to add a new class."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="class-name">
                Class Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="class-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Grade 10, Class VI"
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Section <span className="text-destructive">*</span>
              </Label>
              <Select value={form.section} onValueChange={(v) => handleSelect("section", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      Section {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              Academic Year <span className="text-destructive">*</span>
            </Label>
            <Select value={form.academicYear} onValueChange={(v) => handleSelect("academicYear", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map((yr) => (
                  <SelectItem key={yr} value={yr}>
                    {yr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Class Teacher</Label>
            <Select
              value={form.classTeacher || "none"}
              onValueChange={(v) => handleSelect("classTeacher", v)}
              disabled={teachersLoading}
            >
              <SelectTrigger>
                {teachersLoading ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading teachers…
                  </span>
                ) : (
                  <SelectValue placeholder="Select class teacher (optional)" />
                )}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No class teacher</SelectItem>
                {teachers.map((t) => {
                  const id = t?.teacherData?._id ?? t?.teacherData?.id;
                  const name = t.name ?? "Unknown";
                  return (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="class-room">Room Number</Label>
              <Input
                id="class-room"
                name="room"
                value={form.room}
                onChange={handleChange}
                placeholder="e.g. 101, Lab-2"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="class-capacity">Capacity</Label>
              <Input
                id="class-capacity"
                name="capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={handleChange}
                placeholder="40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="class-description">Description</Label>
            <Textarea
              id="class-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional notes about this class..."
              rows={3}
              className="resize-y"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Switch
              id="class-active"
              checked={form.isActive}
              onCheckedChange={(v) => setForm((prev) => ({ ...prev, isActive: v }))}
            />
            <Label htmlFor="class-active" className="cursor-pointer">
              Active Class
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteClassDialog({ cls, open, onOpenChange, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/classes/${cls.id ?? cls._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to delete class");
      onDeleted(cls.id ?? cls._id);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete Class</DialogTitle>
              <DialogDescription className="mt-0.5">This action cannot be undone.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">
            {cls?.name} - Section {cls?.section}
          </span>
          ? All associated data will be permanently removed.
        </p>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2">
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete Class
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Class Card ────────────────────────────────────────────────────────────────

function ClassCard({ cls, onEdit, onDelete, onAssignSubjects }) {

  // console.log('class teacher in classCard ', cls)
  const teacherName = cls.classTeacher?.user?.name ?? "Not Assigned";
  const studentCount = cls.students?.length ?? 0;
  const subjectCount = cls.subjects?.length ?? 0;

  return (
    <Card className={`hover:shadow-lg transition-shadow ${!cls.isActive ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="text-lg leading-tight">
                {cls.name} - Section {cls.section}
              </CardTitle>
              {!cls.isActive && <Badge variant="outline" className="text-xs">Inactive</Badge>}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {cls.academicYear}
            </div>
          </div>
          <Badge variant="outline" className="shrink-0">
            <DoorOpen className="h-3 w-3 mr-1" />
            {cls.room || "—"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Teacher</p>
            <p className="font-medium truncate" title={teacherName}>
              {teacherName}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Students</p>
            <p className="font-medium">{studentCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Subjects</p>
            <p className="font-medium">{subjectCount}</p>
          </div>
        </div>

        {cls.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{cls.description}</p>
        )}

        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1 bg-transparent"
            onClick={() => onEdit(cls)}
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1 bg-transparent"
            onClick={() => onAssignSubjects(cls)}
          >
            <BookOpen className="h-3 w-3" />
            Subjects
          </Button>

          <Link href={`/dashboard/admin/classes/${cls.id ?? cls._id}/students`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1 bg-transparent">
              <Users className="h-3 w-3" />
              Students
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(cls)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(0);
  const LIMIT = 12;

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [subjectTarget, setSubjectTarget] = useState(null);

  const [stats, setStats] = useState({ total: 0, active: 0, students: 0, avgSize: 0 });

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
        ...(academicYearFilter !== "all" && { academicYear: academicYearFilter }),
        ...(statusFilter !== "all" && { isActive: statusFilter }),
      });

      const res = await fetch(`/api/admin/classes?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to fetch classes");

      console.log("Fetched classes data:", data, params);

      const list = data?.data?.data ?? data?.data ?? [];
      const total = data?.data?.total ?? list.length;
      setClasses(list);
      setTotalClasses(total);
      setTotalPages(Math.ceil(total / LIMIT));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [totalRes, activeRes, allRes] = await Promise.all([
        fetch("/api/admin/classes?limit=1"),
        fetch("/api/admin/classes?limit=1&isActive=true"),
        fetch("/api/admin/classes?limit=1000"),
      ]);
      const [totalData, activeData, allData] = await Promise.all([
        totalRes.json(),
        activeRes.json(),
        allRes.json(),
      ]);
      const total = totalData?.data?.total ?? 0;
      const active = activeData?.data?.total ?? 0;
      const allClasses = allData?.data?.data ?? [];
      const totalStudents = allClasses.reduce((sum, c) => sum + (c.students?.length ?? 0), 0);
      const avgSize = allClasses.length ? Math.round(totalStudents / allClasses.length) : 0;
      setStats({ total, active, students: totalStudents, avgSize });
    } catch {
      // stats are non-critical
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, academicYearFilter, statusFilter]);

  useEffect(() => {
    fetchClasses();
  }, [page, academicYearFilter, statusFilter]);

  const handleCreated = () => {
    fetchClasses();
    fetchStats();
  };

  const handleSaved = () => {
    fetchClasses();
  };

  const handleDeleted = () => {
    fetchClasses();
    fetchStats();
  };

  const filteredClasses = searchQuery
    ? classes.filter((cls) => {
        const query = searchQuery.toLowerCase();
        return (
          cls.name?.toLowerCase().includes(query) ||
          cls.section?.toLowerCase().includes(query) ||
          cls.classTeacher?.user?.name?.toLowerCase().includes(query)
        );
      })
    : classes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Class Management</h1>
          <p className="text-muted-foreground">Manage all classes and sections</p>
        </div>
        <Button className="gap-2 bg-admin hover:bg-admin/90" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Class
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building className="h-8 w-8 text-admin" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Classes</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{stats.students}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Class Size</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgSize}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by class name, section, or teacher..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {ACADEMIC_YEARS.map((yr) => (
                  <SelectItem key={yr} value={yr}>
                    {yr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">Error loading classes: {error}</p>
          <Button onClick={fetchClasses}>Try Again</Button>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchQuery ? "No classes found matching your search." : "No classes found. Create your first class!"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {console.log('classes to display ', filteredClasses)}
            {filteredClasses.map((cls) => (
              <ClassCard
                key={cls.id ?? cls._id}
                cls={cls}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
                onAssignSubjects={setSubjectTarget}
              />
            ))}
          </div>

          {totalPages > 1 && !searchQuery && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, totalClasses)} of {totalClasses} classes
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

      {(addOpen || editTarget) && (
        <ClassDialog
          cls={editTarget}
          open={addOpen || !!editTarget}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setAddOpen(false);
              setEditTarget(null);
            }
          }}
          onSaved={editTarget ? handleSaved : handleCreated}
        />
      )}

      {deleteTarget && (
        <DeleteClassDialog
          cls={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(isOpen) => {
            if (!isOpen) setDeleteTarget(null);
          }}
          onDeleted={handleDeleted}
        />
      )}

      {subjectTarget && (
        <SubjectAssignmentDialog
          cls={subjectTarget}
          open={!!subjectTarget}
          onOpenChange={(isOpen) => {
            if (!isOpen) setSubjectTarget(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   Plus,
//   Building,
//   Users,
//   BookOpen,
//   Edit,
//   Trash2,
//   Loader2,
//   AlertCircle,
//   AlertTriangle,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   UserCheck,
//   GraduationCap,
//   Calendar,
//   DoorOpen,
// } from "lucide-react";
// import Link from "next/link";

// // ─── Constants ─────────────────────────────────────────────────────────────────

// const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H"];
// const ACADEMIC_YEARS = ["2023-2024", "2024-2025", "2025-2026", "2026-2027", "2027-2028"];

// // ─── Loading State ─────────────────────────────────────────────────────────────

// function LoadingState() {
//   return (
//     <div className="flex items-center justify-center min-h-96">
//       <div className="text-center">
//         <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
//         <p className="text-muted-foreground">Loading classes...</p>
//       </div>
//     </div>
//   );
// }

// // ─── Add/Edit Class Dialog ─────────────────────────────────────────────────────

// function ClassDialog({ cls, open, onOpenChange, onSaved }) {
//   const isEdit = !!cls;
//   const [form, setForm] = useState({
//     name: "",
//     section: "",
//     academicYear: "2026-2027",
//     classTeacher: "",
//     room: "",
//     capacity: "40",
//     description: "",
//     isActive: true,
//   });
//   const [teachers, setTeachers]       = useState([]);
//   const [teachersLoading, setTeachersLoading] = useState(false);
//   const [saving, setSaving]           = useState(false);
//   const [error, setError]             = useState(null);

//   // Fetch teachers when dialog opens
//   useEffect(() => {
//     if (!open) return;
//     const fetchTeachers = async () => {
//       setTeachersLoading(true);
//       try {
//         const res  = await fetch("/api/admin/users?role=teacher");
//         const data = await res.json();
//         if (!res.ok) throw new Error(data?.message ?? "Failed to fetch teachers");
//         setTeachers(data?.data?.data ?? data?.data ?? []);
//       } catch (err) {
//         console.error("Failed to load teachers:", err.message);
//         setTeachers([]);
//       } finally {
//         setTeachersLoading(false);
//       }
//     };
//     fetchTeachers();
//   }, [open]);

//   const handleOpenChange = (isOpen) => {
//     if (isOpen) {
//       if (isEdit) {
//         setForm({
//           name:         cls.name         ?? "",
//           section:      cls.section      ?? "",
//           academicYear: cls.academicYear ?? "2026-2027",
//           classTeacher: cls.classTeacher?._id ?? cls.classTeacher ?? "",
//           room:         cls.room         ?? "",
//           capacity:     String(cls.capacity ?? 40),
//           description:  cls.description  ?? "",
//           isActive:     cls.isActive     ?? true,
//         });
//       } else {
//         setForm({
//           name: "", section: "", academicYear: "2026-2027",
//           classTeacher: "", room: "", capacity: "40", description: "", isActive: true,
//         });
//       }
//       setError(null);
//     }
//     onOpenChange(isOpen);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSelect = (field, value) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = async () => {
//     setError(null);
//     if (!form.name || !form.section || !form.academicYear) {
//       setError("Name, section, and academic year are required.");
//       return;
//     }
//     setSaving(true);
//     try {
//       const payload = {
//         name:         form.name,
//         section:      form.section,
//         academicYear: form.academicYear,
//         classTeacher: form.classTeacher === "none" || !form.classTeacher ? null : form.classTeacher,
//         room:         form.room || null,
//         capacity:     Number(form.capacity) || 40,
//         description:  form.description || null,
//         isActive:     form.isActive,
//       };

//       const url    = isEdit ? `/api/admin/classes/${cls.id ?? cls._id}` : "/api/admin/classes";
//       const method = isEdit ? "PUT" : "POST";

//       const res  = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message ?? `Failed to ${isEdit ? "update" : "create"} class`);
//       onSaved(data);
//       onOpenChange(false);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleOpenChange}>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-xl">
//             {isEdit ? "Edit Class" : "Create New Class"}
//           </DialogTitle>
//           <DialogDescription>
//             {isEdit
//               ? `Update the details for "${cls?.name} - Section ${cls?.section}".`
//               : "Fill in the details to add a new class."}
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-5 py-2">
//           {error && (
//             <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
//               <AlertCircle className="h-4 w-4 shrink-0" />
//               {error}
//             </div>
//           )}

//           {/* Row 1: Class Name + Section */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <Label htmlFor="class-name">
//                 Class Name <span className="text-destructive">*</span>
//               </Label>
//               <Input
//                 id="class-name"
//                 name="name"
//                 value={form.name}
//                 onChange={handleChange}
//                 placeholder="e.g. Grade 10, Class VI"
//               />
//             </div>
//             <div className="space-y-1.5">
//               <Label>
//                 Section <span className="text-destructive">*</span>
//               </Label>
//               <Select value={form.section} onValueChange={(v) => handleSelect("section", v)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select section" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {SECTIONS.map((s) => (
//                     <SelectItem key={s} value={s}>Section {s}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Row 2: Academic Year */}
//           <div className="space-y-1.5">
//             <Label>
//               Academic Year <span className="text-destructive">*</span>
//             </Label>
//             <Select value={form.academicYear} onValueChange={(v) => handleSelect("academicYear", v)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select academic year" />
//               </SelectTrigger>
//               <SelectContent>
//                 {ACADEMIC_YEARS.map((yr) => (
//                   <SelectItem key={yr} value={yr}>{yr}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Row 3: Class Teacher */}
//           <div className="space-y-1.5">
//             <Label>Class Teacher</Label>
//             <Select
//               value={form.classTeacher || "none"}
//               onValueChange={(v) => handleSelect("classTeacher", v)}
//               disabled={teachersLoading}
//             >
//               <SelectTrigger>
//                 {teachersLoading ? (
//                   <span className="flex items-center gap-2 text-muted-foreground">
//                     <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                     Loading teachers…
//                   </span>
//                 ) : (
//                   <SelectValue placeholder="Select class teacher (optional)" />
//                 )}
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="none">No class teacher</SelectItem>
//                 {teachers.map((t) => {
//                   const id   = t._id ?? t.id;
//                   const name = t.user?.name ?? t.name ?? "Unknown";
//                   return (
//                     <SelectItem key={id} value={id}>{name}</SelectItem>
//                   );
//                 })}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Row 4: Room + Capacity */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <Label htmlFor="class-room">Room Number</Label>
//               <Input
//                 id="class-room"
//                 name="room"
//                 value={form.room}
//                 onChange={handleChange}
//                 placeholder="e.g. 101, Lab-2"
//               />
//             </div>
//             <div className="space-y-1.5">
//               <Label htmlFor="class-capacity">Capacity</Label>
//               <Input
//                 id="class-capacity"
//                 name="capacity"
//                 type="number"
//                 min={1}
//                 value={form.capacity}
//                 onChange={handleChange}
//                 placeholder="40"
//               />
//             </div>
//           </div>

//           {/* Row 5: Description */}
//           <div className="space-y-1.5">
//             <Label htmlFor="class-description">Description</Label>
//             <Textarea
//               id="class-description"
//               name="description"
//               value={form.description}
//               onChange={handleChange}
//               placeholder="Optional notes about this class..."
//               rows={3}
//               className="resize-y"
//             />
//           </div>

//           {/* Row 6: Active Toggle */}
//           <div className="flex items-center gap-3 pt-2">
//             <Switch
//               id="class-active"
//               checked={form.isActive}
//               onCheckedChange={(v) => setForm((prev) => ({ ...prev, isActive: v }))}
//             />
//             <Label htmlFor="class-active" className="cursor-pointer">
//               Active Class
//             </Label>
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit} disabled={saving} className="gap-2">
//             {saving && <Loader2 className="h-4 w-4 animate-spin" />}
//             {isEdit ? "Save Changes" : "Create Class"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// // ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

// function DeleteClassDialog({ cls, open, onOpenChange, onDeleted }) {
//   const [deleting, setDeleting] = useState(false);
//   const [error, setError]       = useState(null);

//   const handleDelete = async () => {
//     setError(null);
//     setDeleting(true);
//     try {
//       const res  = await fetch(`/api/admin/classes/${cls.id ?? cls._id}`, { method: "DELETE" });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message ?? "Failed to delete class");
//       onDeleted(cls.id ?? cls._id);
//       onOpenChange(false);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[420px]">
//         <DialogHeader>
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
//               <AlertTriangle className="h-5 w-5 text-destructive" />
//             </div>
//             <div>
//               <DialogTitle>Delete Class</DialogTitle>
//               <DialogDescription className="mt-0.5">
//                 This action cannot be undone.
//               </DialogDescription>
//             </div>
//           </div>
//         </DialogHeader>

//         <p className="text-sm text-muted-foreground">
//           Are you sure you want to delete{" "}
//           <span className="font-semibold text-foreground">
//             {cls?.name} - Section {cls?.section}
//           </span>? All associated data will be permanently removed.
//         </p>

//         {error && (
//           <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
//             <AlertCircle className="h-4 w-4 shrink-0" />
//             {error}
//           </div>
//         )}

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
//             Cancel
//           </Button>
//           <Button
//             variant="destructive"
//             onClick={handleDelete}
//             disabled={deleting}
//             className="gap-2"
//           >
//             {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
//             Delete Class
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// // ─── Class Card ────────────────────────────────────────────────────────────────

// function ClassCard({ cls, onEdit, onDelete }) {
//   const teacherName = cls.classTeacher?.user?.name ?? "Not Assigned";
//   const studentCount = cls.students?.length ?? 0;
//   const subjectCount = cls.subjects?.length ?? 0;

//   return (
//     <Card className={`hover:shadow-lg transition-shadow ${!cls.isActive ? "opacity-60" : ""}`}>
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between gap-2">
//           <div className="min-w-0 flex-1">
//             <div className="flex items-center gap-2 flex-wrap mb-1">
//               <CardTitle className="text-lg leading-tight">
//                 {cls.name} - Section {cls.section}
//               </CardTitle>
//               {!cls.isActive && (
//                 <Badge variant="outline" className="text-xs">Inactive</Badge>
//               )}
//             </div>
//             <div className="flex items-center gap-2 text-xs text-muted-foreground">
//               <Calendar className="h-3 w-3" />
//               {cls.academicYear}
//             </div>
//           </div>
//           <Badge variant="outline" className="shrink-0">
//             <DoorOpen className="h-3 w-3 mr-1" />
//             {cls.room || "—"}
//           </Badge>
//         </div>
//       </CardHeader>

//       <CardContent className="space-y-4">
//         <div className="grid grid-cols-3 gap-3 text-sm">
//           <div>
//             <p className="text-muted-foreground text-xs">Teacher</p>
//             <p className="font-medium truncate" title={teacherName}>
//               {teacherName}
//             </p>
//           </div>
//           <div>
//             <p className="text-muted-foreground text-xs">Students</p>
//             <p className="font-medium">{studentCount}</p>
//           </div>
//           <div>
//             <p className="text-muted-foreground text-xs">Capacity</p>
//             <p className="font-medium">{cls.capacity || "—"}</p>
//           </div>
//         </div>

//         {cls.description && (
//           <p className="text-xs text-muted-foreground line-clamp-2">
//             {cls.description}
//           </p>
//         )}

//         <div className="flex gap-2 pt-2 border-t">
//           <Button
//             variant="outline"
//             size="sm"
//             className="flex-1 gap-1 bg-transparent"
//             onClick={() => onEdit(cls)}
//           >
//             <Edit className="h-3 w-3" />
//             Edit
//           </Button>

//           <Link href={`/dashboard/admin/classes/${cls.id ?? cls._id}/students`} className="flex-1">
//             <Button variant="outline" size="sm" className="w-full gap-1 bg-transparent">
//               <Users className="h-3 w-3" />
//               Students
//             </Button>
//           </Link>

//           <Button
//             variant="ghost"
//             size="sm"
//             className="text-destructive hover:bg-destructive/10 hover:text-destructive"
//             onClick={() => onDelete(cls)}
//           >
//             <Trash2 className="h-4 w-4" />
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// // ─── Main Page ─────────────────────────────────────────────────────────────────

// export default function AdminClassesPage() {
//   const [classes, setClasses]     = useState([]);
//   const [loading, setLoading]     = useState(true);
//   const [error, setError]         = useState(null);

//   // Filters & pagination
//   const [searchQuery, setSearchQuery]         = useState("");
//   const [academicYearFilter, setAcademicYearFilter] = useState("all");
//   const [statusFilter, setStatusFilter]       = useState("all");
//   const [page, setPage]                       = useState(1);
//   const [totalPages, setTotalPages]           = useState(1);
//   const [totalClasses, setTotalClasses]       = useState(0);
//   const LIMIT = 12;

//   // Dialog state
//   const [addOpen, setAddOpen]         = useState(false);
//   const [editTarget, setEditTarget]   = useState(null);
//   const [deleteTarget, setDeleteTarget] = useState(null);

//   // Stats
//   const [stats, setStats] = useState({ total: 0, active: 0, students: 0, avgSize: 0 });

//   const fetchClasses = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams({
//         page,
//         limit: LIMIT,
//         ...(academicYearFilter !== "all" && { academicYear: academicYearFilter }),
//         ...(statusFilter !== "all" && { isActive: statusFilter }),
//       });

//       const res  = await fetch(`/api/admin/classes?${params}`);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message ?? "Failed to fetch classes");

//       const list  = data?.data?.data ?? data?.data ?? [];
//       const total = data?.data?.total ?? list.length;
//       setClasses(list);
//       setTotalClasses(total);
//       setTotalPages(Math.ceil(total / LIMIT));
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const [totalRes, activeRes, allRes] = await Promise.all([
//         fetch("/api/admin/classes?limit=1"),
//         fetch("/api/admin/classes?limit=1&isActive=true"),
//         fetch("/api/admin/classes?limit=1000"),
//       ]);
//       const [totalData, activeData, allData] = await Promise.all([
//         totalRes.json(), activeRes.json(), allRes.json(),
//       ]);
//       const total  = totalData?.data?.total  ?? 0;
//       const active = activeData?.data?.total ?? 0;
//       const allClasses = allData?.data?.data ?? [];
//       const totalStudents = allClasses.reduce((sum, c) => sum + (c.students?.length ?? 0), 0);
//       const avgSize = allClasses.length ? Math.round(totalStudents / allClasses.length) : 0;
//       setStats({ total, active, students: totalStudents, avgSize });
//     } catch {
//       // stats are non-critical
//     }
//   };

//   useEffect(() => { fetchStats(); }, []);

//   useEffect(() => {
//     // Reset to page 1 whenever filters change
//     setPage(1);
//   }, [searchQuery, academicYearFilter, statusFilter]);

//   useEffect(() => { fetchClasses(); }, [page, academicYearFilter, statusFilter]);

//   const handleCreated = () => {
//     fetchClasses();
//     fetchStats();
//   };

//   const handleSaved = () => {
//     fetchClasses();
//   };

//   const handleDeleted = () => {
//     fetchClasses();
//     fetchStats();
//   };

//   // Client-side search filtering (since API doesn't have search param in the provided code)
//   const filteredClasses = searchQuery
//     ? classes.filter((cls) => {
//         const query = searchQuery.toLowerCase();
//         return (
//           cls.name?.toLowerCase().includes(query) ||
//           cls.section?.toLowerCase().includes(query) ||
//           cls.classTeacher?.user?.name?.toLowerCase().includes(query)
//         );
//       })
//     : classes;

//   // ── Render ──
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Class Management</h1>
//           <p className="text-muted-foreground">Manage all classes and sections</p>
//         </div>
//         <Button
//           className="gap-2 bg-admin hover:bg-admin/90"
//           onClick={() => setAddOpen(true)}
//         >
//           <Plus className="h-4 w-4" />
//           Add Class
//         </Button>
//       </div>

//       {/* Stats */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Classes</p>
//                 <p className="text-2xl font-bold">{stats.total}</p>
//               </div>
//               <Building className="h-8 w-8 text-admin" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Active Classes</p>
//                 <p className="text-2xl font-bold text-green-600">{stats.active}</p>
//               </div>
//               <UserCheck className="h-8 w-8 text-green-600" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Students</p>
//                 <p className="text-2xl font-bold text-blue-600">{stats.students}</p>
//               </div>
//               <GraduationCap className="h-8 w-8 text-blue-600" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Avg. Class Size</p>
//                 <p className="text-2xl font-bold text-purple-600">{stats.avgSize}</p>
//               </div>
//               <Users className="h-8 w-8 text-purple-600" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="flex flex-col sm:flex-row gap-3">
//             {/* Search */}
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//               <Input
//                 placeholder="Search by class name, section, or teacher..."
//                 className="pl-9"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>

//             {/* Academic Year filter */}
//             <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
//               <SelectTrigger className="w-full sm:w-44">
//                 <SelectValue placeholder="All Years" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Years</SelectItem>
//                 {ACADEMIC_YEARS.map((yr) => (
//                   <SelectItem key={yr} value={yr}>{yr}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             {/* Status filter */}
//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger className="w-full sm:w-36">
//                 <SelectValue placeholder="All Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Status</SelectItem>
//                 <SelectItem value="true">Active</SelectItem>
//                 <SelectItem value="false">Inactive</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Classes Grid */}
//       {loading ? (
//         <LoadingState />
//       ) : error ? (
//         <div className="text-center py-12">
//           <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
//           <p className="text-destructive mb-4">Error loading classes: {error}</p>
//           <Button onClick={fetchClasses}>Try Again</Button>
//         </div>
//       ) : filteredClasses.length === 0 ? (
//         <div className="text-center py-12">
//           <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//           <p className="text-muted-foreground">
//             {searchQuery ? "No classes found matching your search." : "No classes found. Create your first class!"}
//           </p>
//         </div>
//       ) : (
//         <>
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {filteredClasses.map((cls) => (
//               <ClassCard
//                 key={cls.id ?? cls._id}
//                 cls={cls}
//                 onEdit={setEditTarget}
//                 onDelete={setDeleteTarget}
//               />
//             ))}
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && !searchQuery && (
//             <div className="flex items-center justify-between pt-2">
//               <p className="text-sm text-muted-foreground">
//                 Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, totalClasses)} of{" "}
//                 {totalClasses} classes
//               </p>
//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </Button>
//                 <span className="text-sm font-medium">
//                   {page} / {totalPages}
//                 </span>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={page === totalPages}
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* ── Add/Edit Dialog ── */}
//       {(addOpen || editTarget) && (
//         <ClassDialog
//           cls={editTarget}
//           open={addOpen || !!editTarget}
//           onOpenChange={(isOpen) => {
//             if (!isOpen) {
//               setAddOpen(false);
//               setEditTarget(null);
//             }
//           }}
//           onSaved={editTarget ? handleSaved : handleCreated}
//         />
//       )}

//       {/* ── Delete Dialog ── */}
//       {deleteTarget && (
//         <DeleteClassDialog
//           cls={deleteTarget}
//           open={!!deleteTarget}
//           onOpenChange={(isOpen) => { if (!isOpen) setDeleteTarget(null); }}
//           onDeleted={handleDeleted}
//         />
//       )}
//     </div>
//   );
// }

// "use client";


// import { useState, useEffect } from "react";

// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";


// const SECTIONS = ["A", "B", "C", "D", "E", "F"];
// const ACADEMIC_YEARS = ["2024-2025", "2025-2026", "2026-2027", "2027-2028"];


// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { useAdminClasses } from "@/hooks/use-admin-data";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from "@/components/ui/dialog";

// import {
//   Search,
//   Plus,
//   Edit,
//   Trash2,
//   Users,
//   BookOpen,
//   Building,
//   Loader2,
//   AlertCircle,
//   AlertTriangle,
// } from "lucide-react";
// import Link from "next/link";

// function LoadingState() {
//   return (
//     <div className="flex items-center justify-center min-h-96">
//       <div className="text-center">
//         <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
//         <p className="text-muted-foreground">Loading classes...</p>
//       </div>
//     </div>
//   );
// }

// // ─── Edit Dialog ───────────────────────────────────────────────────────────────

// export function EditClassDialog({ cls, open, onOpenChange, onSaved }) {
//   const [form, setForm] = useState({
//     name: "",
//     section: "",
//     academicYear: "",
//     classTeacher: "",
//     room: "",
//     capacity: "",
//     description: "",
//   });

//   const [teachers, setTeachers] = useState([]);
//   const [teachersLoading, setTeachersLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);

//   // Fetch teachers whenever dialog opens
//   useEffect(() => {
//     if (!open) return;

//     const fetchTeachers = async () => {
//       setTeachersLoading(true);
//       try {
//         const res = await fetch("/api/admin/teachers");
//         const data = await res.json();
//         if (!res.ok) throw new Error(data?.message ?? "Failed to fetch teachers");
//         // Support both { data: { data: [] } } and { data: [] } response shapes
//         setTeachers(data?.data?.data ?? data?.data ?? []);
//       } catch (err) {
//         console.error("Failed to load teachers:", err.message);
//         setTeachers([]);
//       } finally {
//         setTeachersLoading(false);
//       }
//     };

//     fetchTeachers();
//   }, [open]);

//   // Sync form when dialog opens or cls changes
//   const handleOpenChange = (isOpen) => {
//     if (isOpen) {
//       setForm({
//         name: cls?.name ?? "",
//         section: cls?.section ?? "",
//         academicYear: cls?.academicYear ?? "2026-2027",
//         classTeacher: cls?.classTeacherId ?? cls?.classTeacher ?? "",
//         room: cls?.room ?? "",
//         capacity: String(cls?.capacity ?? "40"),
//         description: cls?.description ?? "",
//       });
//       setError(null);
//     }
//     onOpenChange(isOpen);
//   };

//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSelect = (field, value) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = async () => {
//     setError(null);
//     setSaving(true);
//     try {
//       const res = await fetch(`/api/admin/classes/${cls.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...form,
//           capacity: Number(form.capacity),
//           // send null if "none" was explicitly selected
//           classTeacher: form.classTeacher === "none" ? null : form.classTeacher || null,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message ?? "Failed to update class");
//       onSaved(data);
//       onOpenChange(false);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleOpenChange}>
//       <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-xl">Edit Class</DialogTitle>
//           <DialogDescription>
//             Update the details for{" "}
//             <span className="font-semibold text-foreground">{cls?.name}</span>.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-5 py-2">
//           {/* ── Error Banner ── */}
//           {error && (
//             <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
//               <AlertCircle className="h-4 w-4 shrink-0" />
//               {error}
//             </div>
//           )}

//           {/* ── Row 1: Class Name + Section ── */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <Label htmlFor="edit-name">
//                 Class Name <span className="text-destructive">*</span>
//               </Label>
//               <Input
//                 id="edit-name"
//                 name="name"
//                 value={form.name}
//                 onChange={handleChange}
//                 placeholder="e.g. Grade 10, Class VI"
//               />
//             </div>

//             <div className="space-y-1.5">
//               <Label>
//                 Section <span className="text-destructive">*</span>
//               </Label>
//               <Select
//                 value={form.section}
//                 onValueChange={(val) => handleSelect("section", val)}
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select section" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {SECTIONS.map((s) => (
//                     <SelectItem key={s} value={s}>
//                       Section {s}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* ── Row 2: Academic Year ── */}
//           <div className="space-y-1.5">
//             <Label>
//               Academic Year <span className="text-destructive">*</span>
//             </Label>
//             <Select
//               value={form.academicYear}
//               onValueChange={(val) => handleSelect("academicYear", val)}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select academic year" />
//               </SelectTrigger>
//               <SelectContent>
//                 {ACADEMIC_YEARS.map((yr) => (
//                   <SelectItem key={yr} value={yr}>
//                     {yr}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* ── Row 3: Class Teacher ── */}
//           <div className="space-y-1.5">
//             <Label>Class Teacher</Label>
//             <Select
//               value={form.classTeacher || "none"}
//               onValueChange={(val) => handleSelect("classTeacher", val)}
//               disabled={teachersLoading}
//             >
//               <SelectTrigger>
//                 {teachersLoading ? (
//                   <span className="flex items-center gap-2 text-muted-foreground">
//                     <Loader2 className="h-3.5 w-3.5 animate-spin" />
//                     Loading teachers…
//                   </span>
//                 ) : (
//                   <SelectValue placeholder="Select class teacher (optional)" />
//                 )}
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="none">
//                   Select class teacher (optional)
//                 </SelectItem>
//                 {teachers.map((t) => {
//                   const id = t._id ?? t.id;
//                   // Handle both populated { user: { name } } and flat shapes
//                   const name =
//                     t.user?.name ?? t.name ?? t.teacherName ?? "Unknown";
//                   return (
//                     <SelectItem key={id} value={id}>
//                       {name}
//                     </SelectItem>
//                   );
//                 })}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* ── Row 4: Room + Capacity ── */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-1.5">
//               <Label htmlFor="edit-room">Room</Label>
//               <Input
//                 id="edit-room"
//                 name="room"
//                 value={form.room}
//                 onChange={handleChange}
//                 placeholder="e.g. 101, Lab-2"
//               />
//             </div>

//             <div className="space-y-1.5">
//               <Label htmlFor="edit-capacity">Capacity</Label>
//               <Input
//                 id="edit-capacity"
//                 name="capacity"
//                 type="number"
//                 min={1}
//                 value={form.capacity}
//                 onChange={handleChange}
//                 placeholder="40"
//               />
//             </div>
//           </div>

//           {/* ── Row 5: Description ── */}
//           <div className="space-y-1.5">
//             <Label htmlFor="edit-description">Description</Label>
//             <Textarea
//               id="edit-description"
//               name="description"
//               value={form.description}
//               onChange={handleChange}
//               placeholder="Optional notes about this class..."
//               rows={3}
//               className="resize-y"
//             />
//           </div>
//         </div>

//         <DialogFooter>
//           <Button
//             variant="outline"
//             onClick={() => onOpenChange(false)}
//             disabled={saving}
//           >
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit} disabled={saving} className="gap-2">
//             {saving && <Loader2 className="h-4 w-4 animate-spin" />}
//             Save Changes
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// // ─── Delete Confirm Dialog ──────────────────────────────────────────────────────
// function DeleteClassDialog({ cls, open, onOpenChange, onDeleted }) {
//   const [deleting, setDeleting] = useState(false);
//   const [error, setError] = useState(null);

//   const handleDelete = async () => {
//     setError(null);
//     setDeleting(true);
//     try {
//       const res = await fetch(`/api/admin/classes/${cls.id}`, { method: "DELETE" });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.message ?? "Failed to delete class");
//       onDeleted(cls.id);
//       onOpenChange(false);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[420px]">
//         <DialogHeader>
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
//               <AlertTriangle className="h-5 w-5 text-destructive" />
//             </div>
//             <div>
//               <DialogTitle>Delete Class</DialogTitle>
//               <DialogDescription className="mt-0.5">
//                 This action cannot be undone.
//               </DialogDescription>
//             </div>
//           </div>
//         </DialogHeader>

//         <p className="text-sm text-muted-foreground">
//           Are you sure you want to delete{" "}
//           <span className="font-semibold text-foreground">{cls?.name}</span>? All associated
//           data will be permanently removed.
//         </p>

//         {error && (
//           <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
//             <AlertCircle className="h-4 w-4 shrink-0" />
//             {error}
//           </div>
//         )}

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
//             Cancel
//           </Button>
//           <Button
//             variant="destructive"
//             onClick={handleDelete}
//             disabled={deleting}
//             className="gap-2"
//           >
//             {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
//             Delete Class
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// // ─── Main Page ─────────────────────────────────────────────────────────────────
// export default function AdminClassesPage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const { classes, loading, error, refetch } = useAdminClasses();

//   // Dialog state
//   const [editTarget, setEditTarget] = useState(null);   // class object being edited
//   const [deleteTarget, setDeleteTarget] = useState(null); // class object being deleted

//   if (loading) return <LoadingState />;

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
//         <p className="text-destructive mb-4">Error loading classes: {error}</p>
//         <Button onClick={refetch}>Try Again</Button>
//       </div>
//     );
//   }

//   const classList = classes?.data?.data || [];

//   const filteredClasses = classList.filter(
//     (cls) =>
//       cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       cls.teacherName?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   // Called after a successful PUT — update the local list optimistically
//   const handleSaved = (updatedData) => {
//     refetch(); // re-fetch to get latest from server
//   };

//   // Called after a successful DELETE — remove from local list
//   const handleDeleted = (deletedId) => {
//     refetch();
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Class Management</h1>
//           <p className="text-muted-foreground">Manage all classes and sections</p>
//         </div>
//         <Link href="/dashboard/admin/classes/add">
//           <Button className="gap-2 bg-admin hover:bg-admin/90">
//             <Plus className="h-4 w-4" />
//             Add Class
//           </Button>
//         </Link>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-3">
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Classes</p>
//                 <p className="text-2xl font-bold">48</p>
//               </div>
//               <Building className="h-8 w-8 text-admin" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Students</p>
//                 <p className="text-2xl font-bold text-student">1,234</p>
//               </div>
//               <Users className="h-8 w-8 text-student" />
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="pt-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Avg. Class Size</p>
//                 <p className="text-2xl font-bold">29</p>
//               </div>
//               <BookOpen className="h-8 w-8 text-teacher" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Search */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search by class name or teacher..."
//               className="pl-9"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Classes Grid */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {filteredClasses.map((cls) => (
//           <Card key={cls.id} className="hover:shadow-lg transition-shadow">
//             <CardHeader className="pb-3">
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-lg">{cls.name}</CardTitle>
//                 <Badge variant="outline">Room {cls.room}</Badge>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-muted-foreground">Class Teacher</p>
//                   <p className="font-medium">{cls.teacher}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Students</p>
//                   <p className="font-medium">{cls.students}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Grade</p>
//                   <p className="font-medium">{cls.grade}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Subjects</p>
//                   <p className="font-medium">{cls.subjects}</p>
//                 </div>
//               </div>

//               <div className="flex gap-2 pt-2">
//                 {/* ── Edit button ── */}
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   className="flex-1 gap-1 bg-transparent"
//                   onClick={() => setEditTarget(cls)}
//                 >
//                   <Edit className="h-3 w-3" />
//                   Edit
//                 </Button>

//                 {/* ── View Students button ── */}
//                 <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
//                   <Users className="h-3 w-3" />
//                   Students
//                 </Button>

//                 {/* ── Delete button ── */}
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="text-destructive hover:bg-destructive/10 hover:text-destructive"
//                   onClick={() => setDeleteTarget(cls)}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* ── Edit Dialog (rendered once, outside the map) ── */}
//       {editTarget && (
//         <EditClassDialog
//           cls={editTarget}
//           open={!!editTarget}
//           onOpenChange={(isOpen) => { if (!isOpen) setEditTarget(null); }}
//           onSaved={handleSaved}
//         />
//       )}

//       {/* ── Delete Confirm Dialog ── */}
//       {deleteTarget && (
//         <DeleteClassDialog
//           cls={deleteTarget}
//           open={!!deleteTarget}
//           onOpenChange={(isOpen) => { if (!isOpen) setDeleteTarget(null); }}
//           onDeleted={handleDeleted}
//         />
//       )}
//     </div>
//   );
// }