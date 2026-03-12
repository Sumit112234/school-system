"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Save,
  X,
  BookOpen,
  Coffee,
  Users,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

const PERIOD_TYPES = [
  { value: "class", label: "Class", icon: BookOpen, color: "bg-blue-500" },
  { value: "break", label: "Break", icon: Coffee, color: "bg-orange-500" },
  { value: "lunch", label: "Lunch", icon: Coffee, color: "bg-green-500" },
  { value: "assembly", label: "Assembly", icon: Users, color: "bg-purple-500" },
  { value: "free", label: "Free Period", icon: Clock, color: "bg-gray-500" },
];

// ─── Loading State ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading timetable...</p>
      </div>
    </div>
  );
}

// ─── Edit Timetable Dialog ─────────────────────────────────────────────────────

function EditTimetableDialog({ classId, day, existingTimetable, open, onOpenChange, onSaved }) {
  const [periods, setPeriods] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchData();
      console.log({ existingTimetable });
      if (existingTimetable) {
        setPeriods(existingTimetable.periods || []);
      } else {
        // Default periods
        setPeriods([
          { periodNumber: 1, startTime: "08:00", endTime: "08:45", type: "assembly" },
          { periodNumber: 2, startTime: "08:45", endTime: "09:30", type: "class", subject: "", teacher: "", room: "" },
          { periodNumber: 3, startTime: "09:30", endTime: "10:15", type: "class", subject: "", teacher: "", room: "" },
          { periodNumber: 4, startTime: "10:15", endTime: "10:30", type: "break" },
          { periodNumber: 5, startTime: "10:30", endTime: "11:15", type: "class", subject: "", teacher: "", room: "" },
          { periodNumber: 6, startTime: "11:15", endTime: "12:00", type: "class", subject: "", teacher: "", room: "" },
          { periodNumber: 7, startTime: "12:00", endTime: "12:45", type: "lunch" },
          { periodNumber: 8, startTime: "12:45", endTime: "01:30", type: "class", subject: "", teacher: "", room: "" },
          { periodNumber: 9, startTime: "01:30", endTime: "02:15", type: "class", subject: "", teacher: "", room: "" },
        ]);
      }
    }
  }, [open, existingTimetable]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjectsRes, teachersRes] = await Promise.all([
        fetch("/api/admin/subjects?limit=1000"),
        fetch("/api/admin/teachers"),
      ]);
      const [subjectsData, teachersData] = await Promise.all([
        subjectsRes.json(),
        teachersRes.json(),
      ]);
      setSubjects(subjectsData?.data?.data ?? []);
      setTeachers(teachersData?.data?.data ?? []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPeriod = () => {
    const lastPeriod = periods[periods.length - 1];
    const newPeriod = {
      periodNumber: periods.length + 1,
      startTime: lastPeriod ? lastPeriod.endTime : "14:00",
      endTime: "14:45",
      type: "class",
      subject: "",
      teacher: "",
      room: "",
    };
    setPeriods([...periods, newPeriod]);
  };

  const handleRemovePeriod = (index) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const handlePeriodChange = (index, field, value) => {
    const updated = [...periods];
    updated[index] = { ...updated[index], [field]: value };
    
    // Clear subject and teacher if type is not "class"
    if (field === "type" && value !== "class") {
      updated[index].subject = null;
      updated[index].teacher = null;
    }
    
    setPeriods(updated);
  };

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        classId,
        day,
        academicYear: "2026-2027", // You can make this dynamic
        periods: periods.map(p => ({
          periodNumber: p.periodNumber,
          startTime: p.startTime,
          endTime: p.endTime,
          type: p.type,
          subject: p.type === "class" && p.subject ? p.subject : null,
          teacher: p.type === "class" && p.teacher ? p.teacher : null,
          room: p.room || null,
        })),
      };

      console.log("Submitting timetable:", payload);
    //   return ;

      const res = await fetch("/api/admin/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to save timetable");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const dayLabel = DAYS.find(d => d.value === day)?.label || day;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Edit Timetable - {dayLabel}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {periods.map((period, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Period {period.periodNumber}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePeriod(index)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Start Time</Label>
                      <Input
                        type="time"
                        value={period.startTime}
                        onChange={(e) => handlePeriodChange(index, "startTime", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">End Time</Label>
                      <Input
                        type="time"
                        value={period.endTime}
                        onChange={(e) => handlePeriodChange(index, "endTime", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={period.type}
                        onValueChange={(v) => handlePeriodChange(index, "type", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PERIOD_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>


                  {period.type === "class" && (
                    <div className="grid grid-cols-3 gap-3">
                        {/* {console.log(period?.teacher?.user?.name,period?.subject?.name )} */}
                      <div className="space-y-1.5">
                        <Label className="text-xs">Subject</Label>
                        <Select
                          value={period.subject || period?.subject?.name || "none"}
                          onValueChange={(v) => handlePeriodChange(index, "subject", v === "none" ? "" : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* {console.log("subjects:", subjects)} */}
                            <SelectItem value="none">No subject</SelectItem>
                            {subjects.map((s) => (
                              <SelectItem key={s._id} value={s._id}>
                                {s.name} ({s.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Teacher</Label>
                        <Select
                          value={period.teacher || period?.teacher?.user?.name || "none"}
                          onValueChange={(v) => handlePeriodChange(index, "teacher", v === "none" ? "" : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* {console.log(teachers)} */}
                            <SelectItem value="none">No teacher</SelectItem>
                            {teachers.map((t) => (
                              <SelectItem key={t._id} value={t.teacherData._id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Room</Label>
                        <Input
                          value={period.room || ""}
                          onChange={(e) => handlePeriodChange(index, "room", e.target.value)}
                          placeholder="e.g. 101"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddPeriod}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Period
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || loading} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            Save Timetable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Day Timetable Card ────────────────────────────────────────────────────────

function DayTimetableCard({ day, timetable, onEdit, onDelete }) {
  const dayLabel = DAYS.find(d => d.value === day)?.label || day;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{dayLabel}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(day, timetable)}
              className="gap-1"
            >
              <Edit className="h-3 w-3" />
              Edit
            </Button>
            {timetable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(timetable._id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!timetable || timetable.periods.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No timetable set
          </p>
        ) : (
          <div className="space-y-2">
            {timetable.periods.map((period) => {
              const typeInfo = PERIOD_TYPES.find(t => t.type === period.type) || PERIOD_TYPES[0];
              const Icon = typeInfo.icon;

              return (
                <div
                  key={period._id}
                  className={`p-2 rounded-lg text-sm ${
                    period.type === "class" ? "bg-muted" : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-xs">
                        {period.startTime} - {period.endTime}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      P{period.periodNumber}
                    </Badge>
                  </div>
                  {period.type === "class" ? (
                    <div className="text-xs">
                      <p className="font-medium">
                        {period.subject?.name || "No Subject"}
                        {period.subject?.code && ` (${period.subject.code})`}
                      </p>
                      <p className="text-muted-foreground">
                        {period.teacher?.user?.name || "No Teacher"}
                        {period.room && ` • Room ${period.room}`}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-medium capitalize">{period.type}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminTimetablePage() {
  const [classes, setClasses] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedClass, setSelectedClass] = useState("");
  const [editDialog, setEditDialog] = useState({ open: false, day: null, timetable: null });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetables();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/classes?limit=1000");
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message ?? "Failed to fetch classes");
      setClasses(result.data?.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetables = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/timetable?classId=${selectedClass}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message ?? "Failed to fetch timetables");
      setTimetables(result.data.timetables || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (day, timetable) => {
    setEditDialog({ open: true, day, timetable });
  };

  const handleDelete = async (timetableId) => {
    if (!confirm("Are you sure you want to delete this timetable?")) return;
    
    try {
      const res = await fetch(`/api/admin/timetable/${timetableId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete timetable");
      fetchTimetables();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaved = () => {
    fetchTimetables();
  };

  // Create a map of day -> timetable
  const timetableMap = {};
  timetables.forEach(tt => {
    timetableMap[tt.day] = tt;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Timetable Management</h1>
        <p className="text-muted-foreground">Create and manage class timetables</p>
      </div>

      {/* Class Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-96">
                <SelectValue placeholder="Select a class to manage timetable" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls._id} value={cls._id}>
                    {cls.name} - Section {cls.section} ({cls.academicYear})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!selectedClass ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Please select a class to manage timetable</p>
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <LoadingState />
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={fetchTimetables}>Try Again</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DAYS.map((day) => (
            <DayTimetableCard
              key={day.value}
              day={day.value}
              timetable={timetableMap[day.value]}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editDialog.open && (
        <EditTimetableDialog
          classId={selectedClass}
          day={editDialog.day}
          existingTimetable={editDialog.timetable}
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}