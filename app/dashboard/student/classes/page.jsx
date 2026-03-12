"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, BookOpen, Calendar, MapPin, Award, Clock, Mail, Phone,
  Loader2, AlertCircle, GraduationCap, Shield, IdCard, Home
} from "lucide-react";

const DAYS = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
];

const PERIOD_TYPES = {
  class: { icon: BookOpen, color: "bg-blue-500", bgLight: "bg-blue-50", textColor: "text-blue-700" },
  break: { icon: Clock, color: "bg-orange-500", bgLight: "bg-orange-50", textColor: "text-orange-700" },
  lunch: { icon: Clock, color: "bg-green-500", bgLight: "bg-green-50", textColor: "text-green-700" },
  assembly: { icon: Users, color: "bg-purple-500", bgLight: "bg-purple-50", textColor: "text-purple-700" },
  free: { icon: Clock, color: "bg-gray-500", bgLight: "bg-gray-50", textColor: "text-gray-700" },
};

function getInitials(name) {
  return name?.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading class information...</p>
      </div>
    </div>
  );
}

function ClassmateCard({ classmate }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-md transition-shadow">
      <Avatar className="h-12 w-12">
        <AvatarImage src={classmate.avatar} />
        <AvatarFallback>{getInitials(classmate.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{classmate.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {classmate.rollNumber && <span>Roll {classmate.rollNumber}</span>}
          <span>•</span>
          <span>{classmate.studentId}</span>
        </div>
      </div>
    </div>
  );
}

function SubjectCard({ subject }) {
  const typeColors = {
    core: "bg-blue-100 text-blue-700",
    elective: "bg-green-100 text-green-700",
    optional: "bg-orange-100 text-orange-700",
    extracurricular: "bg-purple-100 text-purple-700",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight">{subject.name}</CardTitle>
            <p className="text-xs text-muted-foreground">{subject.code}</p>
          </div>
          <Badge className={typeColors[subject.type] || "bg-gray-100 text-gray-700"}>
            {subject.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span>{subject.credits} Credit{subject.credits !== 1 ? 's' : ''}</span>
        </div>
        {subject.teacher && (
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{subject.teacher.name}</span>
          </div>
        )}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Pass: {subject.passingMarks}/{subject.totalMarks} marks
        </div>
      </CardContent>
    </Card>
  );
}

function TimetableDay({ day, timetable }) {
  const dayLabel = DAYS.find(d => d.value === day)?.label || day;

  if (!timetable || !timetable.periods || timetable.periods.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">{dayLabel}</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground text-center py-4">No schedule</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{dayLabel}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {timetable.periods.map((period, i) => {
          const typeInfo = PERIOD_TYPES[period.type] || PERIOD_TYPES.class;
          const Icon = typeInfo.icon;

          return (
            <div key={i} className={`p-3 rounded-lg border-l-4 ${typeInfo.color}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${typeInfo.textColor}`} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {period.startTime} - {period.endTime}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">P{period.periodNumber}</Badge>
              </div>
              {period.type === "class" ? (
                <div>
                  <p className="font-medium text-sm">{period.subject?.name || "No Subject"}</p>
                  <p className="text-xs text-muted-foreground">
                    {period.teacher?.user?.name || "No Teacher"}
                    {period.room && ` • Room ${period.room}`}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-medium capitalize">{period.type}</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function StudentClassPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchClassInfo(); }, []);

  const fetchClassInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/class");
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to fetch class information");
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error: {error}</p>
      </div>
    );
  }

  if (!data?.class) {
    return (
      <div className="text-center py-12">
        <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">You are not assigned to any class yet</p>
      </div>
    );
  }

  const { myInfo, class: classData, classmates, timetable } = data;

  // Group timetable by day
  const timetableMap = {};
  timetable?.forEach(tt => {
    timetableMap[tt.day] = tt;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Class</h1>
        <p className="text-muted-foreground">
          {classData.name} - Section {classData.section}
        </p>
      </div>

      {/* Class Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Class Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Class Details</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Room:</span>
                    <span>{classData.room || "Not assigned"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Academic Year:</span>
                    <span>{classData.academicYear}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Students:</span>
                    <span>{classData.totalStudents}/{classData.capacity}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">My Information</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Student ID:</span>
                    <span>{myInfo.studentId}</span>
                  </div>
                  {myInfo.rollNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Roll Number:</span>
                      <span>{myInfo.rollNumber}</span>
                    </div>
                  )}
                  {myInfo.bloodGroup && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Blood Group:</span>
                      <span>{myInfo.bloodGroup}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Class Teacher */}
            <div>
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Class Teacher
              </p>
              {classData.classTeacher ? (
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={classData.classTeacher.avatar} />
                    <AvatarFallback>{getInitials(classData.classTeacher.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{classData.classTeacher.name}</p>
                    <div className="space-y-1 mt-2">
                      {classData.classTeacher.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{classData.classTeacher.email}</span>
                        </div>
                      )}
                      {classData.classTeacher.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{classData.classTeacher.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not assigned</p>
              )}
            </div>
          </div>

          {classData.description && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-medium mb-2">About Class</p>
                <p className="text-sm text-muted-foreground">{classData.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Subjects, Classmates, Timetable */}
      <Tabs defaultValue="subjects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subjects">
            Subjects ({classData.subjects.length})
          </TabsTrigger>
          <TabsTrigger value="classmates">
            Classmates ({classmates.length})
          </TabsTrigger>
          <TabsTrigger value="timetable">
            Timetable
          </TabsTrigger>
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classData.subjects.map(subject => (
              <SubjectCard key={subject._id} subject={subject} />
            ))}
          </div>
          {classData.subjects.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No subjects assigned yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Classmates Tab */}
        <TabsContent value="classmates" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {classmates.map(classmate => (
              <ClassmateCard key={classmate._id} classmate={classmate} />
            ))}
          </div>
          {classmates.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No classmates yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Timetable Tab */}
        <TabsContent value="timetable" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DAYS.map(day => (
              <TimetableDay
                key={day.value}
                day={day.value}
                timetable={timetableMap[day.value]}
              />
            ))}
          </div>
          {timetable?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No timetable available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}