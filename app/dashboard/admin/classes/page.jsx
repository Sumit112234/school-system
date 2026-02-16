"use client";


import { useState, useEffect } from "react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const SECTIONS = ["A", "B", "C", "D", "E", "F"];
const ACADEMIC_YEARS = ["2024-2025", "2025-2026", "2026-2027", "2027-2028"];


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdminClasses } from "@/hooks/use-admin-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Building,
  Loader2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

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

// ─── Edit Dialog ───────────────────────────────────────────────────────────────

export function EditClassDialog({ cls, open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    section: "",
    academicYear: "",
    classTeacher: "",
    room: "",
    capacity: "",
    description: "",
  });

  const [teachers, setTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Fetch teachers whenever dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchTeachers = async () => {
      setTeachersLoading(true);
      try {
        const res = await fetch("/api/admin/teachers");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message ?? "Failed to fetch teachers");
        // Support both { data: { data: [] } } and { data: [] } response shapes
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

  // Sync form when dialog opens or cls changes
  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      setForm({
        name: cls?.name ?? "",
        section: cls?.section ?? "",
        academicYear: cls?.academicYear ?? "2026-2027",
        classTeacher: cls?.classTeacherId ?? cls?.classTeacher ?? "",
        room: cls?.room ?? "",
        capacity: String(cls?.capacity ?? "40"),
        description: cls?.description ?? "",
      });
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelect = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/classes/${cls.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity),
          // send null if "none" was explicitly selected
          classTeacher: form.classTeacher === "none" ? null : form.classTeacher || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to update class");
      onSaved(data);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Class</DialogTitle>
          <DialogDescription>
            Update the details for{" "}
            <span className="font-semibold text-foreground">{cls?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* ── Error Banner ── */}
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ── Row 1: Class Name + Section ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">
                Class Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
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
              <Select
                value={form.section}
                onValueChange={(val) => handleSelect("section", val)}
              >
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

          {/* ── Row 2: Academic Year ── */}
          <div className="space-y-1.5">
            <Label>
              Academic Year <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.academicYear}
              onValueChange={(val) => handleSelect("academicYear", val)}
            >
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

          {/* ── Row 3: Class Teacher ── */}
          <div className="space-y-1.5">
            <Label>Class Teacher</Label>
            <Select
              value={form.classTeacher || "none"}
              onValueChange={(val) => handleSelect("classTeacher", val)}
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
                <SelectItem value="none">
                  Select class teacher (optional)
                </SelectItem>
                {teachers.map((t) => {
                  const id = t._id ?? t.id;
                  // Handle both populated { user: { name } } and flat shapes
                  const name =
                    t.user?.name ?? t.name ?? t.teacherName ?? "Unknown";
                  return (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* ── Row 4: Room + Capacity ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-room">Room</Label>
              <Input
                id="edit-room"
                name="room"
                value={form.room}
                onChange={handleChange}
                placeholder="e.g. 101, Lab-2"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                name="capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={handleChange}
                placeholder="40"
              />
            </div>
          </div>

          {/* ── Row 5: Description ── */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional notes about this class..."
              rows={3}
              className="resize-y"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ──────────────────────────────────────────────────────
function DeleteClassDialog({ cls, open, onOpenChange, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/classes/${cls.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to delete class");
      onDeleted(cls.id);
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
              <DialogDescription className="mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">{cls?.name}</span>? All associated
          data will be permanently removed.
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
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-2"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete Class
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { classes, loading, error, refetch } = useAdminClasses();

  // Dialog state
  const [editTarget, setEditTarget] = useState(null);   // class object being edited
  const [deleteTarget, setDeleteTarget] = useState(null); // class object being deleted

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading classes: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const classList = classes?.data?.data || [];

  const filteredClasses = classList.filter(
    (cls) =>
      cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.teacherName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Called after a successful PUT — update the local list optimistically
  const handleSaved = (updatedData) => {
    refetch(); // re-fetch to get latest from server
  };

  // Called after a successful DELETE — remove from local list
  const handleDeleted = (deletedId) => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Class Management</h1>
          <p className="text-muted-foreground">Manage all classes and sections</p>
        </div>
        <Link href="/dashboard/admin/classes/add">
          <Button className="gap-2 bg-admin hover:bg-admin/90">
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">48</p>
              </div>
              <Building className="h-8 w-8 text-admin" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-student">1,234</p>
              </div>
              <Users className="h-8 w-8 text-student" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Class Size</p>
                <p className="text-2xl font-bold">29</p>
              </div>
              <BookOpen className="h-8 w-8 text-teacher" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by class name or teacher..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((cls) => (
          <Card key={cls.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{cls.name}</CardTitle>
                <Badge variant="outline">Room {cls.room}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Class Teacher</p>
                  <p className="font-medium">{cls.teacher}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Students</p>
                  <p className="font-medium">{cls.students}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Grade</p>
                  <p className="font-medium">{cls.grade}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Subjects</p>
                  <p className="font-medium">{cls.subjects}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {/* ── Edit button ── */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 bg-transparent"
                  onClick={() => setEditTarget(cls)}
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>

                {/* ── View Students button ── */}
                <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
                  <Users className="h-3 w-3" />
                  Students
                </Button>

                {/* ── Delete button ── */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteTarget(cls)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Edit Dialog (rendered once, outside the map) ── */}
      {editTarget && (
        <EditClassDialog
          cls={editTarget}
          open={!!editTarget}
          onOpenChange={(isOpen) => { if (!isOpen) setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* ── Delete Confirm Dialog ── */}
      {deleteTarget && (
        <DeleteClassDialog
          cls={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(isOpen) => { if (!isOpen) setDeleteTarget(null); }}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}