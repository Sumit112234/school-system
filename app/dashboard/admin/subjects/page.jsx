"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  Plus,
  BookOpen,
  GraduationCap,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  Award,
  Target,
  TrendingUp,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Mathematics",
  "Science",
  "English",
  "Social Studies",
  "Languages",
  "Arts",
  "Physical Education",
  "Computer Science",
  "Commerce",
];

const SUBJECT_TYPES = ["core", "elective", "optional", "extracurricular"];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function typeBadgeColor(type) {
  switch (type) {
    case "core":             return "bg-blue-500 text-white";
    case "elective":         return "bg-purple-500 text-white";
    case "optional":         return "bg-orange-500 text-white";
    case "extracurricular":  return "bg-green-500 text-white";
    default:                 return "bg-muted text-muted-foreground";
  }
}

function typeLabel(type) {
  return type
    ? type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " ")
    : "Core";
}

// ─── Loading State ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading subjects...</p>
      </div>
    </div>
  );
}

// ─── Add/Edit Subject Dialog ───────────────────────────────────────────────────

function SubjectDialog({ subject, open, onOpenChange, onSaved }) {
  const isEdit = !!subject;
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    department: "",
    credits: "1",
    type: "core",
    passingMarks: "35",
    totalMarks: "100",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      if (isEdit) {
        setForm({
          name:         subject.name         ?? "",
          code:         subject.code         ?? "",
          description:  subject.description  ?? "",
          department:   subject.department   ?? "",
          credits:      String(subject.credits      ?? 1),
          type:         subject.type         ?? "core",
          passingMarks: String(subject.passingMarks ?? 35),
          totalMarks:   String(subject.totalMarks   ?? 100),
        });
      } else {
        setForm({
          name: "", code: "", description: "", department: "",
          credits: "1", type: "core", passingMarks: "35", totalMarks: "100",
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
    if (!form.name || !form.code) {
      setError("Name and code are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name:         form.name,
        code:         form.code.toUpperCase(),
        description:  form.description || null,
        department:   form.department  || null,
        credits:      Number(form.credits)      || 1,
        type:         form.type,
        passingMarks: Number(form.passingMarks) || 35,
        totalMarks:   Number(form.totalMarks)   || 100,
      };

      const url  = isEdit ? `/api/admin/subjects/${subject.id ?? subject._id}` : "/api/admin/subjects";
      const method = isEdit ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? `Failed to ${isEdit ? "update" : "create"} subject`);
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? "Edit Subject" : "Create New Subject"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update the details for "${subject?.name}".`
              : "Fill in the details to add a new subject."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Row 1: Name + Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject-name">
                Subject Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Advanced Mathematics"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject-code">
                Subject Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject-code"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. MATH301"
                className="uppercase"
              />
            </div>
          </div>

          {/* Row 2: Department + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => handleSelect("department", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => handleSelect("type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{typeLabel(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Credits + Passing/Total Marks */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject-credits">Credits</Label>
              <Input
                id="subject-credits"
                name="credits"
                type="number"
                min={1}
                value={form.credits}
                onChange={handleChange}
                placeholder="1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject-passingMarks">Passing Marks</Label>
              <Input
                id="subject-passingMarks"
                name="passingMarks"
                type="number"
                min={0}
                value={form.passingMarks}
                onChange={handleChange}
                placeholder="35"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject-totalMarks">Total Marks</Label>
              <Input
                id="subject-totalMarks"
                name="totalMarks"
                type="number"
                min={0}
                value={form.totalMarks}
                onChange={handleChange}
                placeholder="100"
              />
            </div>
          </div>

          {/* Row 4: Description */}
          <div className="space-y-1.5">
            <Label htmlFor="subject-description">Description</Label>
            <Textarea
              id="subject-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the subject..."
              rows={3}
              className="resize-y"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Subject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteSubjectDialog({ subject, open, onOpenChange, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState(null);

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      const res  = await fetch(`/api/admin/subjects/${subject.id ?? subject._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to delete subject");
      onDeleted(subject.id ?? subject._id);
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
              <DialogTitle>Delete Subject</DialogTitle>
              <DialogDescription className="mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">"{subject?.name}"</span> ({subject?.code})?
          All associated data will be permanently removed.
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
            Delete Subject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Subject Card ──────────────────────────────────────────────────────────────

function SubjectCard({ subject, onEdit, onDelete }) {
  const passingPercentage = subject.totalMarks
    ? ((subject.passingMarks / subject.totalMarks) * 100).toFixed(0)
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <CardTitle className="text-lg leading-tight">{subject.name}</CardTitle>
              <Badge variant="outline" className="text-xs font-mono">
                {subject.code}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={typeBadgeColor(subject.type)}>
                {typeLabel(subject.type)}
              </Badge>
              {subject.department && (
                <span className="text-xs text-muted-foreground">
                  {subject.department}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onEdit(subject)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(subject)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {subject.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {subject.description}
          </p>
        )}

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Credits</p>
              <p className="font-semibold">{subject.credits}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Passing</p>
              <p className="font-semibold">{subject.passingMarks}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-semibold">{subject.totalMarks}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Pass Rate Required</span>
            <span className="font-semibold">{passingPercentage}%</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-green-500 transition-all"
              style={{ width: `${passingPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminSubjectsPage() {
  const [subjects, setSubjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Filters & pagination
  const [searchQuery, setSearchQuery]       = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter]         = useState("all");
  const [page, setPage]                     = useState(1);
  const [totalPages, setTotalPages]         = useState(1);
  const [totalSubjects, setTotalSubjects]   = useState(0);
  const LIMIT = 12;

  // Dialog state
  const [addOpen, setAddOpen]         = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, core: 0, elective: 0, avgCredits: 0 });

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
        ...(searchQuery && { search: searchQuery }),
        ...(departmentFilter !== "all" && { department: departmentFilter }),
        ...(typeFilter !== "all" && { type: typeFilter }),
      });

      const res  = await fetch(`/api/admin/subjects?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to fetch subjects");

      const list  = data?.data?.data ?? data?.data ?? [];
      const total = data?.data?.total ?? list.length;
      setSubjects(list);
      setTotalSubjects(total);
      setTotalPages(Math.ceil(total / LIMIT));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [totalRes, coreRes, electiveRes, allRes] = await Promise.all([
        fetch("/api/admin/subjects?limit=1"),
        fetch("/api/admin/subjects?limit=1&type=core"),
        fetch("/api/admin/subjects?limit=1&type=elective"),
        fetch("/api/admin/subjects?limit=1000"),
      ]);
      const [totalData, coreData, electiveData, allData] = await Promise.all([
        totalRes.json(), coreRes.json(), electiveRes.json(), allRes.json(),
      ]);
      const total    = totalData?.data?.total    ?? 0;
      const core     = coreData?.data?.total     ?? 0;
      const elective = electiveData?.data?.total ?? 0;
      const allSubjects = allData?.data?.data ?? [];
      const avgCredits = allSubjects.length
        ? (allSubjects.reduce((sum, s) => sum + (s.credits || 0), 0) / allSubjects.length).toFixed(1)
        : 0;
      setStats({ total, core, elective, avgCredits });
    } catch {
      // stats are non-critical
    }
  };

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    // Reset to page 1 whenever filters change
    setPage(1);
  }, [searchQuery, departmentFilter, typeFilter]);

  useEffect(() => { fetchSubjects(); }, [page, searchQuery, departmentFilter, typeFilter]);

  const handleCreated = () => {
    fetchSubjects();
    fetchStats();
  };

  const handleSaved = () => {
    fetchSubjects();
  };

  const handleDeleted = () => {
    fetchSubjects();
    fetchStats();
  };

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subject Management</h1>
          <p className="text-muted-foreground">Manage all subjects and course curriculum</p>
        </div>
        <Button
          className="gap-2 bg-admin hover:bg-admin/90"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-admin" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Core Subjects</p>
                <p className="text-2xl font-bold text-blue-600">{stats.core}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Electives</p>
                <p className="text-2xl font-bold text-purple-600">{stats.elective}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Credits</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgCredits}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or code..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Department filter */}
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {SUBJECT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{typeLabel(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">Error loading subjects: {error}</p>
          <Button onClick={fetchSubjects}>Try Again</Button>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No subjects found. Create your first subject!</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id ?? subject._id}
                subject={subject}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, totalSubjects)} of{" "}
                {totalSubjects} subjects
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

      {/* ── Add/Edit Dialog ── */}
      {(addOpen || editTarget) && (
        <SubjectDialog
          subject={editTarget}
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

      {/* ── Delete Dialog ── */}
      {deleteTarget && (
        <DeleteSubjectDialog
          subject={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(isOpen) => { if (!isOpen) setDeleteTarget(null); }}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}