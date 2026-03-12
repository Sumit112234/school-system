"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Edit, Save, Loader2, AlertCircle, Award, TrendingUp, Users
} from "lucide-react";

const TERMS = ["first", "second", "third", "final"];
const EXAM_TYPES = ["midterm", "final", "quiz", "assignment", "practical", "project"];

function BulkGradeDialog({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({
    classId: "", subjectId: "", academicYear: "2026-2027", term: "first", examType: "midterm", totalMarks: "100"
  });
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchClasses();
      setForm({ classId: "", subjectId: "", academicYear: "2026-2027", term: "first", examType: "midterm", totalMarks: "100" });
      setStudents([]);
      setGrades({});
    }
  }, [open]);

  const fetchClasses = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        fetch("/api/teacher/classes"),
        fetch("/api/admin/subjects?limit=1000")
      ]);
      const [classesData, subjectsData] = await Promise.all([classesRes.json(), subjectsRes.json()]);
      setClasses(classesData.data?.classes || []);
      setSubjects(subjectsData.data?.data || []);

      console.log("Fetched classes:", classesData.data?.classes);
      console.log("Fetched subjects:", subjectsData.data?.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    if (!form.classId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/classes/${form.classId}/students`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      setStudents(data.data?.studentsInClass || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.classId) fetchStudents();
  }, [form.classId]);

  const handleGradeChange = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.classId || !form.subjectId) {
      setError("Class and subject are required");
      return;
    }

    const gradesData = students.map(s => ({
      studentId: s._id,
      classId: form.classId,
      subjectId: form.subjectId,
      academicYear: form.academicYear,
      term: form.term,
      examType: form.examType,
      marksObtained: Number(grades[s._id]?.marks || 0),
      totalMarks: Number(form.totalMarks),
      remarks: grades[s._id]?.remarks || null,
    })).filter(g => g.marksObtained > 0);

    if (gradesData.length === 0) {
      setError("Please enter marks for at least one student");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/teacher/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grades: gradesData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add Grades</DialogTitle></DialogHeader>

        <div className="space-y-4">
          {error && <div className="text-destructive text-sm p-2 bg-destructive/10 rounded">{error}</div>}

          <div className="grid grid-cols-3 gap-3">
            <div><Label>Class *</Label><Select value={form.classId} onValueChange={v => {
                setSubjects(classes.find(c => c._id === v)?.allSubjects || []);
                setForm({...form, classId: v})
                }}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name} - {c.section}</SelectItem>)}</SelectContent>
            </Select></div>

            <div><Label>Subject *</Label><Select value={form.subjectId} onValueChange={v => setForm({...form, subjectId: v})}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
            </Select></div>

            <div><Label>Academic Year</Label><Input value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} /></div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div><Label>Term</Label><Select value={form.term} onValueChange={v => setForm({...form, term: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select></div>

            <div><Label>Exam Type</Label><Select value={form.examType} onValueChange={v => setForm({...form, examType: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{EXAM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select></div>

            <div><Label>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: e.target.value})} /></div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : students.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3">
              {students.map(s => (
                <div key={s._id} className="grid grid-cols-12 gap-2 items-center p-2 border rounded">
                  <div className="col-span-5">
                    <p className="font-medium text-sm">{s.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{s.studentId}</p>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Marks"
                      min="0"
                      max={form.totalMarks}
                      value={grades[s._id]?.marks || ""}
                      onChange={e => handleGradeChange(s._id, "marks", e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      placeholder="Remarks (optional)"
                      value={grades[s._id]?.remarks || ""}
                      onChange={e => handleGradeChange(s._id, "remarks", e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : form.classId && <p className="text-sm text-muted-foreground text-center py-4">No students in this class</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || students.length === 0} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />Save Grades
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TeacherGradesPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [filters, setFilters] = useState({ term: "", examType: "" });

  useEffect(() => { fetchGrades(); }, [filters]);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/teacher/grades?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      setGrades(data.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    if (["A+", "A"].includes(grade)) return "text-green-600 bg-green-50";
    if (["B+", "B"].includes(grade)) return "text-blue-600 bg-blue-50";
    if (["C+", "C"].includes(grade)) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  // Group by subject and term
  const groupedGrades = grades.reduce((acc, g) => {
    const key = `${g.subject?.name}-${g.term}`;
    if (!acc[key]) acc[key] = { subject: g.subject, term: g.term, grades: [] };
    acc[key].grades.push(g);
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Grades</h1><p className="text-muted-foreground">Manage student grades and evaluations</p></div>
        <Button onClick={() => setBulkDialog(true)} className="gap-2"><Plus className="h-4 w-4" />Add Grades</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-2">
            <Select value={filters.term } onValueChange={v => setFilters({...filters, term: v})}>
              <SelectTrigger><SelectValue placeholder="All Terms" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Terms">All Terms</SelectItem>
                {TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select> 
             <Select value={filters.examType } onValueChange={v => setFilters({...filters, examType: v})}>
              <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                {EXAM_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {Object.values(groupedGrades).map(group => (
        <Card key={`${group.subject?._id}-${group.term}`}>
          <CardHeader>
            <CardTitle className="text-lg">{group.subject?.name} - {group.term} Term</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {group.grades.map(g => (
                <div key={g._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1">
                      <p className="font-medium">{g.student?.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{g.examType} • {g.academicYear}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">{g.marksObtained}/{g.totalMarks}</p>
                      <p className="text-xs text-muted-foreground">{g.percentage.toFixed(1)}%</p>
                    </div>
                    <Badge className={`${getGradeColor(g.grade)} border-0`}>{g.grade}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {grades.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No grades recorded yet</p>
          </CardContent>
        </Card>
      )}

      <BulkGradeDialog open={bulkDialog} onOpenChange={setBulkDialog} onSaved={fetchGrades} />
    </div>
  );
}