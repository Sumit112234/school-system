"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudentTimetable } from "@/hooks/use-student-data";
import { Clock, MapPin, Loader2, AlertCircle } from "lucide-react";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your timetable...</p>
      </div>
    </div>
  );
}

export default function StudentTimetable() {
  const { timetable, loading, error, refetch } = useStudentTimetable();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading timetable: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const scheduleData = timetable?.data || [];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = Array.from(new Set(scheduleData.map((s) => s.startTime))).sort();

  const getScheduleForSlot = (day, time) => {
    return scheduleData.find((s) => s.day === day && s.startTime === time);
  };

  const getSubjectColor = (subjectName) => {
    const colors = {
      Mathematics: "bg-blue-100 text-blue-800 border-blue-200",
      Physics: "bg-purple-100 text-purple-800 border-purple-200",
      Chemistry: "bg-green-100 text-green-800 border-green-200",
      English: "bg-yellow-100 text-yellow-800 border-yellow-200",
      History: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[subjectName] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Timetable</h1>
        <p className="text-muted-foreground">Your weekly class schedule</p>
      </div>

      {/* Desktop View */}
      <Card className="hidden lg:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium text-muted-foreground w-20">Time</th>
                  {days.map((day) => (
                    <th key={day} className="p-4 text-left font-medium text-muted-foreground">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="border-b">
                    <td className="p-4 font-medium text-foreground">{time}</td>
                    {days.map((day) => {
                      const schedule = getScheduleForSlot(day, time);
                      return (
                        <td key={`${day}-${time}`} className="p-2">
                          {schedule ? (
                            <div className={`p-3 rounded-lg border ${getSubjectColor(schedule.subjectName)}`}>
                              <p className="font-medium text-sm">{schedule.subjectName}</p>
                              <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                                <MapPin className="h-3 w-3" />
                                {schedule.room}
                              </div>
                            </div>
                          ) : (
                            <div className="h-16" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {days.map((day) => {
          const daySchedule = mockSchedule.filter((s) => s.day === day);
          if (daySchedule.length === 0) return null;

          return (
            <Card key={day}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {daySchedule.map((schedule, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getSubjectColor(schedule.subjectName)}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{schedule.subjectName}</p>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {schedule.time}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs opacity-75">
                      <MapPin className="h-3 w-3" />
                      {schedule.room}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subject Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {["Mathematics", "Physics", "Chemistry", "English", "History"].map((subject) => (
              <div key={subject} className={`px-3 py-1 rounded-lg border text-sm ${getSubjectColor(subject)}`}>
                {subject}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
