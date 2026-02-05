"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  BookOpen,
  Building,
} from "lucide-react";
import Link from "next/link";

export default function AdminClassesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const classes = [
    { id: "CLS001", name: "Class 9A", grade: 9, section: "A", students: 32, teacher: "Dr. John Smith", room: "101", subjects: 8 },
    { id: "CLS002", name: "Class 9B", grade: 9, section: "B", students: 30, teacher: "Ms. Emily Brown", room: "102", subjects: 8 },
    { id: "CLS003", name: "Class 10A", grade: 10, section: "A", students: 35, teacher: "Mr. David Wilson", room: "201", subjects: 9 },
    { id: "CLS004", name: "Class 10B", grade: 10, section: "B", students: 33, teacher: "Dr. Sarah Miller", room: "202", subjects: 9 },
    { id: "CLS005", name: "Class 11A", grade: 11, section: "A", students: 28, teacher: "Mr. Robert Garcia", room: "301", subjects: 6 },
    { id: "CLS006", name: "Class 11B", grade: 11, section: "B", students: 26, teacher: "Ms. Jennifer Lee", room: "302", subjects: 6 },
    { id: "CLS007", name: "Class 12A", grade: 12, section: "A", students: 24, teacher: "Dr. Michael Chen", room: "401", subjects: 5 },
    { id: "CLS008", name: "Class 12B", grade: 12, section: "B", students: 22, teacher: "Ms. Amanda White", room: "402", subjects: 5 },
  ];

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Class Management</h1>
          <p className="text-muted-foreground">Manage all classes and sections</p>
        </div>
        <Link href="/dashboard/admin/classes/add">
          <Button className="gap-2 bg-admin hover:bg-admin/90">
            <Plus className="h-4 w-4" />
            Add Class
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold">48</p>
              </div>
              <Building className="h-8 w-8 text-admin" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-student">1,234</p>
              </div>
              <Users className="h-8 w-8 text-student" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Class Size</p>
                <p className="text-2xl font-bold">29</p>
              </div>
              <BookOpen className="h-8 w-8 text-teacher" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by class name or teacher..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((cls) => (
          <Card key={cls.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{cls.name}</CardTitle>
                <Badge variant="outline">Room {cls.room}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Class Teacher</p>
                  <p className="font-medium">{cls.teacher}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Students</p>
                  <p className="font-medium">{cls.students}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Grade</p>
                  <p className="font-medium">{cls.grade}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Subjects</p>
                  <p className="font-medium">{cls.subjects}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-1 bg-transparent">
                  <Users className="h-3 w-3" />
                  Students
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
