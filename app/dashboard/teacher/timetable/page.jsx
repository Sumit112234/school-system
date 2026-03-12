"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  BookOpen,
  Coffee,
  Users,
  MapPin,
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

const PERIOD_TYPES = {
  class: { icon: BookOpen, color: "bg-blue-500", textColor: "text-blue-700", bgLight: "bg-blue-50" },
  break: { icon: Coffee, color: "bg-orange-500", textColor: "text-orange-700", bgLight: "bg-orange-50" },
  lunch: { icon: Coffee, color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50" },
  assembly: { icon: Users, color: "bg-purple-500", textColor: "text-purple-700", bgLight: "bg-purple-50" },
  free: { icon: Clock, color: "bg-gray-500", textColor: "text-gray-700", bgLight: "bg-gray-50" },
};

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

// ─── Period Card ───────────────────────────────────────────────────────────────

function PeriodCard({ period }) {
  const typeInfo = PERIOD_TYPES[period.type] || PERIOD_TYPES.class;
  const Icon = typeInfo.icon;

  return (
    <div className={`p-4 rounded-lg border-l-4 ${typeInfo.color} bg-card shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${typeInfo.bgLight}`}>
            <Icon className={`h-4 w-4 ${typeInfo.textColor}`} />
          </div>
          <div>
            <p className="font-semibold text-sm">Period {period.periodNumber}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{period.startTime} - {period.endTime}</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="capitalize">
          {period.type}
        </Badge>
      </div>

      {period.type === "class" ? (
        <div className="space-y-1 mt-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3 w-3 text-muted-foreground" />
            <p className="font-medium text-sm">
              {period.subject?.name || "No Subject"}
              {period.subject?.code && (
                <span className="text-muted-foreground ml-1">({period.subject.code})</span>
              )}
            </p>
          </div>
          {period.teacher && (
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {period.teacher.user?.name || "No Teacher"}
              </p>
            </div>
          )}
          {period.room && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Room {period.room}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mt-2 capitalize">{period.type} Time</p>
      )}
    </div>
  );
}

// ─── Day Timetable View ────────────────────────────────────────────────────────

function DayTimetableView({ timetable }) {
  if (!timetable || !timetable.periods || timetable.periods.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No timetable available for this day</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {timetable.periods.map((period) => (
        <PeriodCard key={period._id} period={period} />
      ))}
    </div>
  );
}

// ─── Weekly Timetable View ─────────────────────────────────────────────────────

function WeeklyTimetableView({ timetables }) {
  const timetableMap = {};
  timetables.forEach(tt => {
    timetableMap[tt.day] = tt;
  });

  // Find max periods
  const maxPeriods = Math.max(...timetables.map(tt => tt.periods?.length || 0), 0);

  if (maxPeriods === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No timetable available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            <th className="border p-3 text-left font-semibold min-w-[100px]">Period</th>
            {DAYS.map(day => (
              <th key={day.value} className="border p-3 text-center font-semibold min-w-[150px]">
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxPeriods }).map((_, periodIndex) => {
            const periodNumber = periodIndex + 1;
            
            return (
              <tr key={periodIndex} className="hover:bg-muted/50">
                <td className="border p-3 font-medium bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>P{periodNumber}</span>
                  </div>
                </td>
                {DAYS.map(day => {
                  const dayTimetable = timetableMap[day.value];
                  const period = dayTimetable?.periods?.[periodIndex];
                  
                  if (!period) {
                    return <td key={day.value} className="border p-3 text-center text-muted-foreground">—</td>;
                  }

                  const typeInfo = PERIOD_TYPES[period.type] || PERIOD_TYPES.class;

                  return (
                    <td key={day.value} className={`border p-3 ${typeInfo.bgLight}`}>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-muted-foreground">
                            {period.startTime}-{period.endTime}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {period.type}
                          </Badge>
                        </div>
                        {period.type === "class" ? (
                          <>
                            <p className="font-semibold text-sm">
                              {period.subject?.code || "—"}
                            </p>
                            <p className="text-muted-foreground truncate">
                              {period.teacher?.user?.name || "—"}
                            </p>
                            {period.room && (
                              <p className="text-muted-foreground">Room {period.room}</p>
                            )}
                          </>
                        ) : (
                          <p className="font-semibold text-sm capitalize">{period.type}</p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TeacherTimetablePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedClass, setSelectedClass] = useState("");
  const [viewMode, setViewMode] = useState("weekly"); // "weekly" or "daily"
  const [selectedDay, setSelectedDay] = useState("monday");

  useEffect(() => {
    fetchTimetables();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTimetables(selectedClass);
    }
  }, [selectedClass]);

  const fetchTimetables = async (classId = null) => {
    setLoading(true);
    setError(null);
    try {
      const url = classId
        ? `/api/teacher/timetable?classId=${classId}`
        : "/api/teacher/timetable";
      
      const res = await fetch(url);
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message ?? "Failed to fetch timetables");
      
      setData(result.data);
      
      // Auto-select first class if viewing all
      if (!classId && result.data.teacherClasses?.length > 0) {
        setSelectedClass(result.data.teacherClasses[0]._id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const teacherClasses = data?.teacherClasses || [];
  const timetables = selectedClass && data?.timetables
    ? (Array.isArray(data.timetables)
        ? data.timetables
        : data.timetables.find(g => g.class._id === selectedClass)?.timetables || []
      )
    : [];

  const timetableMap = {};
  timetables.forEach(tt => {
    timetableMap[tt.day] = tt;
  });

  const currentDayTimetable = timetableMap[selectedDay];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Timetable</h1>
        <p className="text-muted-foreground">View your class schedules</p>
      </div>

      {/* Class Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-96">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {teacherClasses.map((cls) => (
                  <SelectItem key={cls._id} value={cls._id}>
                    {cls.name} - Section {cls.section} ({cls.academicYear})
                  </SelectItem>
                ))}
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
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={() => fetchTimetables()}>Try Again</Button>
        </div>
      ) : !selectedClass ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Please select a class to view timetable</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Timetable</CardTitle>
              <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList>
                  <TabsTrigger value="weekly">Weekly View</TabsTrigger>
                  <TabsTrigger value="daily">Daily View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "weekly" ? (
              <WeeklyTimetableView timetables={timetables} />
            ) : (
              <>
                <div className="mb-4">
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map(day => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DayTimetableView timetable={currentDayTimetable} />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// "use client";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { useTeacherTimetable } from "@/hooks/use-teacher-data";
// import { Clock, MapPin, Users, Loader2, AlertCircle } from "lucide-react";

// function LoadingState() {
//   return (
//     <div className="flex items-center justify-center min-h-96">
//       <div className="text-center">
//         <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
//         <p className="text-muted-foreground">Loading your timetable...</p>
//       </div>
//     </div>
//   );
// }

// export default function TeacherTimetable() {
//   const { timetable, loading, error, refetch } = useTeacherTimetable();

//   if (loading) {
//     return <LoadingState />;
//   }

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
//         <p className="text-destructive mb-4">Error loading timetable: {error}</p>
//         <Button onClick={refetch}>Try Again</Button>
//       </div>
//     );
//   }

//   const scheduleData = timetable?.data || [];
//   const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
//   const timeSlots = Array.from(new Set(scheduleData.map((s) => s.startTime))).sort();

//   const getScheduleForSlot = (day, time) => {
//     return scheduleData.find((s) => s.day === day && s.startTime === time);
//   };

//   const getSubjectColor = (subjectName) => {
//     const colors = {
//       Mathematics: "bg-blue-100 text-blue-800 border-blue-200",
//       Physics: "bg-purple-100 text-purple-800 border-purple-200",
//       Chemistry: "bg-green-100 text-green-800 border-green-200",
//       English: "bg-yellow-100 text-yellow-800 border-yellow-200",
//       History: "bg-orange-100 text-orange-800 border-orange-200",
//     };
//     return colors[subjectName] || "bg-gray-100 text-gray-800 border-gray-200";
//   };

//   // Count classes per day
//   const classesPerDay = days.map((day) => ({
//     day,
//     count: mockSchedule.filter((s) => s.day === day).length,
//   }));

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-bold text-foreground">My Timetable</h1>
//         <p className="text-muted-foreground">Your weekly teaching schedule</p>
//       </div>

//       {/* Stats */}
//       <div className="grid gap-4 md:grid-cols-5">
//         {classesPerDay.map((item) => (
//           <Card key={item.day}>
//             <CardContent className="p-4 text-center">
//               <p className="text-sm text-muted-foreground">{item.day}</p>
//               <p className="text-2xl font-bold text-foreground">{item.count}</p>
//               <p className="text-xs text-muted-foreground">classes</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Desktop View */}
//       <Card className="hidden lg:block">
//         <CardContent className="p-0">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b">
//                   <th className="p-4 text-left font-medium text-muted-foreground w-20">Time</th>
//                   {days.map((day) => (
//                     <th key={day} className="p-4 text-left font-medium text-muted-foreground">
//                       {day}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {timeSlots.map((time) => (
//                   <tr key={time} className="border-b">
//                     <td className="p-4 font-medium text-foreground">{time}</td>
//                     {days.map((day) => {
//                       const schedule = getScheduleForSlot(day, time);
//                       return (
//                         <td key={`${day}-${time}`} className="p-2">
//                           {schedule ? (
//                             <div className={`p-3 rounded-lg border ${getSubjectColor(schedule.subjectName)}`}>
//                               <p className="font-medium text-sm">{schedule.subjectName}</p>
//                               <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
//                                 <span className="flex items-center gap-1">
//                                   <MapPin className="h-3 w-3" />
//                                   {schedule.room}
//                                 </span>
//                                 <span className="flex items-center gap-1">
//                                   <Users className="h-3 w-3" />
//                                   10-A
//                                 </span>
//                               </div>
//                             </div>
//                           ) : (
//                             <div className="h-16" />
//                           )}
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Mobile View */}
//       <div className="lg:hidden space-y-4">
//         {days.map((day) => {
//           const daySchedule = mockSchedule.filter((s) => s.day === day);
//           if (daySchedule.length === 0) return null;

//           return (
//             <Card key={day}>
//               <CardHeader className="pb-3">
//                 <CardTitle className="text-lg">{day}</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {daySchedule.map((schedule, index) => (
//                   <div
//                     key={index}
//                     className={`p-3 rounded-lg border ${getSubjectColor(schedule.subjectName)}`}
//                   >
//                     <div className="flex items-center justify-between">
//                       <p className="font-medium">{schedule.subjectName}</p>
//                       <Badge variant="outline" className="text-xs">
//                         <Clock className="h-3 w-3 mr-1" />
//                         {schedule.time}
//                       </Badge>
//                     </div>
//                     <div className="flex items-center gap-3 mt-1 text-xs opacity-75">
//                       <span className="flex items-center gap-1">
//                         <MapPin className="h-3 w-3" />
//                         {schedule.room}
//                       </span>
//                       <span className="flex items-center gap-1">
//                         <Users className="h-3 w-3" />
//                         Class 10-A
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
