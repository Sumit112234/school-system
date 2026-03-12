"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award, TrendingUp, TrendingDown, Minus, Loader2, BarChart3
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";



const TERMS = ["first", "second", "third", "final"];

function GradeCard({ grade }) {
  const getGradeColor = (g) => {
    if (["A+", "A"].includes(g)) return "bg-green-500";
    if (["B+", "B"].includes(g)) return "bg-blue-500";
    if (["C+", "C"].includes(g)) return "bg-orange-500";
    return "bg-red-500";
  };



  // useEffect(() => {
    
  // }, []);

  return (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{grade.examType}</p>
          <p className="text-xs text-muted-foreground">
            {grade.term} Term • {grade.academicYear}
          </p>
        </div>
        <Badge className={`${getGradeColor(grade.grade)} text-white border-0`}>
          {grade.grade}
        </Badge>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>Marks</span>
          <span className="font-bold">{grade.marksObtained}/{grade.totalMarks}</span>
        </div>
        <Progress value={grade.percentage} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">{grade.percentage.toFixed(1)}%</p>
      </div>

      {grade.remarks && (
        <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
          {grade.remarks}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Teacher: {grade.teacher?.user?.name}
      </p>
    </div>
  );
}

function SubjectPerformance({ data }) {
  const getTrendIcon = () => {
    if (data.grades.length < 2) return <Minus className="h-4 w-4" />;
    const latest = data.grades[0].percentage;
    const previous = data.grades[1].percentage;
    if (latest > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (latest < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4" />;
  };

  const getAverageGrade = (avg) => {
    if (avg >= 90) return "A+";
    if (avg >= 80) return "A";
    if (avg >= 70) return "B+";
    if (avg >= 60) return "B";
    if (avg >= 50) return "C+";
    if (avg >= 40) return "C";
    if (avg >= 35) return "D";
    return "F";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{data.subject.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{data.subject.code}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{data.average.toFixed(1)}%</p>
            <Badge variant="outline">{getAverageGrade(data.average)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {getTrendIcon()}
          <span>{data.grades.length} evaluation{data.grades.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="grid gap-2">
          {data.grades.map(g => (
            <GradeCard key={g._id} grade={g} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentGradesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ term: "", subjectId: "" });

  //   const { user } = useAuth();
  // console.log("GradeCard user:", user);

  useEffect(() => { fetchGrades(); }, [filters]);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/student/grades?${params}`);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed");
      setData(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  const stats = data?.stats || {};
  const gradesBySubject = data?.gradesBySubject || [];

  const getGradeColorClass = (avg) => {
    if (avg >= 90) return "text-green-600";
    if (avg >= 70) return "text-blue-600";
    if (avg >= 50) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Grades</h1>
        <p className="text-muted-foreground">View your academic performance and grades</p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.totalGrades || 0}</p>
            <p className="text-xs text-muted-foreground">Total Grades</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className={`text-2xl font-bold ${getGradeColorClass(stats.averagePercentage)}`}>
              {stats.averagePercentage?.toFixed(1) || 0}%
            </p>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-600">
              {stats.highestGrade?.toFixed(1) || 0}%
            </p>
            <p className="text-xs text-muted-foreground">Highest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingDown className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold text-orange-600">
              {stats.lowestGrade?.toFixed(1) || 0}%
            </p>
            <p className="text-xs text-muted-foreground">Lowest</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-2">
            <Select value={filters.term} onValueChange={v => setFilters({...filters, term: v})}>
              <SelectTrigger><SelectValue placeholder="All Terms" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Terms">All Terms</SelectItem>
                {TERMS.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.subjectId} onValueChange={v => setFilters({...filters, subjectId: v})}>
              <SelectTrigger><SelectValue placeholder="All Subjects" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All Subjects">All Subjects</SelectItem>
                {gradesBySubject.map(s => (
                  <SelectItem key={s.subject._id} value={s.subject._id}>{s.subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grades by Subject */}
      <Tabs defaultValue="subject" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subject">By Subject</TabsTrigger>
          <TabsTrigger value="all">All Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="subject" className="space-y-4">
          {gradesBySubject.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No grades available yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {gradesBySubject.map(subject => (
                <SubjectPerformance key={subject.subject._id} data={subject} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {data?.grades?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No grades available yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data?.grades?.map(grade => (
                <div key={grade._id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{grade.subject?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {grade.examType} • {grade.term}
                      </p>
                    </div>
                    <Badge className={getGradeColorClass(grade.percentage)}>{grade.grade}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-bold">{grade.marksObtained}/{grade.totalMarks}</span>
                  </div>
                  <Progress value={grade.percentage} className="h-1.5" />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}