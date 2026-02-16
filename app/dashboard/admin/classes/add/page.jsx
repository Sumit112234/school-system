"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useAdminUsers } from "@/hooks/use-admin-data";


// ─── API helpers ─────────────────────────────────────────────────────────────


async function createClass(body) {
    const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data?.message || `Failed to create class (${res.status})`);
    }
    return data;
}

async function fetchTeachers() {
    console.log("Fetching teachers for class creation form...");
    const { stats, loading, error, refetch } = await useAdminUsers();
    console.log(stats, loading, error);
// const datam = await useAdminUsers();
// console.log("Fetched users for teacher selection:", datam);
  const res = await fetch("/api/teachers?limit=200");
  if (!res.ok) return [];
  const data = await res.json();
  // Handle both { data: { data: [] } } and { data: [] }
  return data?.data?.data ?? data?.data ?? [];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTIONS = ["A", "B", "C", "D", "E", "F"];
const CURRENT_YEAR = new Date().getFullYear();
const ACADEMIC_YEARS = Array.from({ length: 5 }, (_, i) => {
  const y = CURRENT_YEAR - 1 + i;
  return `${y}-${y + 1}`;
});

const INITIAL_FORM = {
  name: "",
  section: "",
  academicYear: ACADEMIC_YEARS[1], // current year
  classTeacher: "",
  room: "",
  capacity: 40,
  description: "",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AddClassPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTeachers()
      .then(setTeachers)
      .catch(() => setTeachers([]))
      .finally(() => setLoadingTeachers(false));
  }, []);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit() {
    // Basic client-side validation
    if (!form.name.trim()) return setError("Class name is required.");
    if (!form.section) return setError("Section is required.");
    if (!form.academicYear) return setError("Academic year is required.");
    if (form.capacity < 1) return setError("Capacity must be at least 1.");

    setSubmitting(true);
    setError(null);

    try {
      await createClass({
        name: form.name.trim(),
        section: form.section,
        academicYear: form.academicYear,
        classTeacher: form.classTeacher || undefined,
        room: form.room.trim() || undefined,
        capacity: Number(form.capacity),
        description: form.description.trim() || undefined,
      });

      setSuccess(true);
      // Redirect after a short delay so the user sees the success state
      setTimeout(() => router.push("/dashboard/admin/classes"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/classes">
          <Button variant="outline" size="icon" className="bg-transparent">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Class</h1>
          <p className="text-muted-foreground">Create a new class for the school</p>
        </div>
      </div>

      {/* ── Form Card ── */}
      <Card>
        <CardHeader>
          <CardTitle>Class Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Name + Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Class Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Grade 10, Class VI"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={submitting || success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">
                Section <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.section}
                onValueChange={(v) => handleChange("section", v)}
                disabled={submitting || success}
              >
                <SelectTrigger id="section">
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

          {/* Academic Year */}
          <div className="space-y-2">
            <Label htmlFor="academicYear">
              Academic Year <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.academicYear}
              onValueChange={(v) => handleChange("academicYear", v)}
              disabled={submitting || success}
            >
              <SelectTrigger id="academicYear">
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Teacher */}
          <div className="space-y-2">
            <Label htmlFor="classTeacher">Class Teacher</Label>
            {loadingTeachers ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground h-10 border rounded-md px-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading teachers…
              </div>
            ) : (
              <Select
                value={form.classTeacher}
                onValueChange={(v) => handleChange("classTeacher", v)}
                disabled={submitting || success}
              >
                <SelectTrigger id="classTeacher">
                  <SelectValue placeholder="Select class teacher (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">None</SelectItem>
                  {teachers.map((t) => {
                    const name = t.user?.name ?? t.employeeId ?? t._id;
                    return (
                      <SelectItem key={t._id} value={t._id}>
                        {name}
                        {t.employeeId && t.user?.name ? ` (${t.employeeId})` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Room + Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                placeholder="e.g. 101, Lab-2"
                value={form.room}
                onChange={(e) => handleChange("room", e.target.value)}
                disabled={submitting || success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={200}
                placeholder="40"
                value={form.capacity}
                onChange={(e) => handleChange("capacity", e.target.value)}
                disabled={submitting || success}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional notes about this class…"
              rows={3}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              disabled={submitting || success}
            />
          </div>

          {/* Error / Success banners */}
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-md bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Class created successfully! Redirecting…
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link href="/dashboard/admin/classes" className="flex-1">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                disabled={submitting || success}
              >
                Cancel
              </Button>
            </Link>
            <Button
              className="flex-1 gap-2 bg-admin hover:bg-admin/90"
              onClick={handleSubmit}
              disabled={submitting || success}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {submitting ? "Creating…" : "Create Class"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}