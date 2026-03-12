"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock, Calendar, BookOpen, MapPin, User, Loader2, AlertCircle, Coffee, Users
} from "lucide-react";

const DAYS = [
  { value: "monday", label: "Monday", short: "Mon" },
  { value: "tuesday", label: "Tuesday", short: "Tue" },
  { value: "wednesday", label: "Wednesday", short: "Wed" },
  { value: "thursday", label: "Thursday", short: "Thu" },
  { value: "friday", label: "Friday", short: "Fri" },
  { value: "saturday", label: "Saturday", short: "Sat" },
];

const PERIOD_TYPES = {
  class: { icon: BookOpen, color: "bg-blue-500", bgLight: "bg-blue-50", textColor: "text-blue-700" },
  break: { icon: Coffee, color: "bg-orange-500", bgLight: "bg-orange-50", textColor: "text-orange-700" },
  lunch: { icon: Coffee, color: "bg-green-500", bgLight: "bg-green-50", textColor: "text-green-700" },
  assembly: { icon: Users, color: "bg-purple-500", bgLight: "bg-purple-50", textColor: "text-purple-700" },
  free: { icon: Clock, color: "bg-gray-500", bgLight: "bg-gray-50", textColor: "text-gray-700" },
};

function CurrentPeriodCard({ period, label }) {
  if (!period) return null;

  const typeInfo = PERIOD_TYPES[period.type] || PERIOD_TYPES.class;
  const Icon = typeInfo.icon;

  return (
    <Card className="border-primary shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-4 rounded-lg ${typeInfo.bgLight}`}>
          <div className="flex items-center gap-3 mb-3">
            <Icon className={`h-6 w-6 ${typeInfo.textColor}`} />
            <div>
              <p className="text-xs text-muted-foreground">Period {period.periodNumber}</p>
              <p className="font-semibold">{period.startTime} - {period.endTime}</p>
            </div>
          </div>
          {period.type === "class" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{period.subject?.name || "No Subject"}</p>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {period.teacher?.user?.name || "No Teacher"}
                </p>
              </div>
              {period.room && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Room {period.room}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium capitalize">{period.type} Time</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PeriodCard({ period, isCurrentPeriod }) {
  const typeInfo = PERIOD_TYPES[period.type] || PERIOD_TYPES.class;
  const Icon = typeInfo.icon;

  return (
    <div className={`p-3 rounded-lg border-l-4 ${typeInfo.color} ${
      isCurrentPeriod ? "ring-2 ring-primary bg-primary/5" : "bg-card"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${typeInfo.textColor}`} />
          <span className="text-xs font-medium text-muted-foreground">
            {period.startTime} - {period.endTime}
          </span>
        </div>
        <Badge variant="outline" className="text-xs">
          P{period.periodNumber}
          {isCurrentPeriod && <span className="ml-1">• Now</span>}
        </Badge>
      </div>
      {period.type === "class" ? (
        <div className="space-y-1">
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
}

function DayTimetable({ day, timetable, currentDay, currentTime }) {
  const dayLabel = DAYS.find(d => d.value === day)?.label || day;
  const isToday = day === currentDay;

  if (!timetable || !timetable.periods || timetable.periods.length === 0) {
    return (
      <Card className={isToday ? "border-primary" : ""}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {dayLabel}
            {isToday && <Badge variant="default">Today</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No schedule</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={isToday ? "border-primary" : ""}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {dayLabel}
          {isToday && <Badge variant="default">Today</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {timetable.periods.map((period, i) => {
          const isCurrentPeriod = isToday && 
            currentTime >= period.startTime && 
            currentTime <= period.endTime;

          return (
            <PeriodCard
              key={i}
              period={period}
              isCurrentPeriod={isCurrentPeriod}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function StudentTimetablePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toTimeString().slice(0, 5));

  useEffect(() => {
    fetchTimetable();
    
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date().toTimeString().slice(0, 5));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/timetable");
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to fetch timetable");
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <p className="text-destructive">{error}</p>
    </div>
  );

  const timetables = data?.timetables || [];
  const currentPeriod = data?.currentPeriod;
  const nextPeriod = data?.nextPeriod;
  const currentDay = data?.currentDay;

  // Group timetables by day
  const timetableMap = {};
  timetables.forEach(tt => {
    timetableMap[tt.day] = tt;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Timetable</h1>
        <p className="text-muted-foreground">
          View your class schedule • {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Current & Next Period */}
      <div className="grid gap-4 md:grid-cols-2">
        <CurrentPeriodCard period={currentPeriod} label="Current Period" />
        <CurrentPeriodCard period={nextPeriod} label="Next Period" />
      </div>

      {/* Timetable Tabs */}
      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DAYS.map(day => (
              <DayTimetable
                key={day.value}
                day={day.value}
                timetable={timetableMap[day.value]}
                currentDay={currentDay}
                currentTime={currentTime}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          {timetableMap[currentDay] ? (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {timetableMap[currentDay].periods.map((period, i) => {
                    const isCurrentPeriod = 
                      currentTime >= period.startTime && 
                      currentTime <= period.endTime;

                    return (
                      <PeriodCard
                        key={i}
                        period={period}
                        isCurrentPeriod={isCurrentPeriod}
                      />
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No schedule for today</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {timetables.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No timetable available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}