"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockSchedule } from "@/lib/mock-data";
import { Clock, MapPin, Users } from "lucide-react";

export default function TeacherTimetable() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

  const getScheduleForSlot = (day, time) => {
    return mockSchedule.find((s) => s.day === day && s.time === time);
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

  // Count classes per day
  const classesPerDay = days.map((day) => ({
    day,
    count: mockSchedule.filter((s) => s.day === day).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Timetable</h1>
        <p className="text-muted-foreground">Your weekly teaching schedule</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {classesPerDay.map((item) => (
          <Card key={item.day}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{item.day}</p>
              <p className="text-2xl font-bold text-foreground">{item.count}</p>
              <p className="text-xs text-muted-foreground">classes</p>
            </CardContent>
          </Card>
        ))}
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
                              <div className="flex items-center gap-2 mt-1 text-xs opacity-75">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {schedule.room}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  10-A
                                </span>
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
                    <div className="flex items-center gap-3 mt-1 text-xs opacity-75">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {schedule.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Class 10-A
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
