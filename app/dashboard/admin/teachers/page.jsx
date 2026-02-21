"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminTeachers } from "@/hooks/use-admin-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Users,
  BookOpen,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading teachers...</p>
      </div>
    </div>
  );
}

export default function AdminTeachersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { teachers, loading, error, refetch } = useAdminTeachers();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading teachers: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const teachersList = teachers?.data || [];
  const mockTeacherData = [
    { id: "TCH001", name: "Dr. John Smith", subject: "Mathematics", email: "john@school.edu", phone: "555-1001", classes: 5, students: 145, status: "active" },
    { id: "TCH002", name: "Ms. Emily Brown", subject: "English", email: "emily@school.edu", phone: "555-1002", classes: 4, students: 120, status: "active" },
    { id: "TCH003", name: "Mr. David Wilson", subject: "Physics", email: "david@school.edu", phone: "555-1003", classes: 3, students: 90, status: "on-leave" },
    { id: "TCH004", name: "Dr. Sarah Miller", subject: "Chemistry", email: "sarah@school.edu", phone: "555-1004", classes: 4, students: 115, status: "active" },
    { id: "TCH005", name: "Mr. Robert Garcia", subject: "History", email: "robert@school.edu", phone: "555-1005", classes: 3, students: 85, status: "active" },
    { id: "TCH006", name: "Ms. Jennifer Lee", subject: "Biology", email: "jennifer@school.edu", phone: "555-1006", classes: 4, students: 110, status: "active" },
  ];

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teacher Management</h1>
          <p className="text-muted-foreground">Manage all teacher records and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/dashboard/admin/teachers/add">
            <Button className="gap-2 bg-teacher hover:bg-teacher/90">
              <Plus className="h-4 w-4" />
              Add Teacher
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <p className="text-2xl font-bold">86</p>
              </div>
              <Users className="h-8 w-8 text-teacher" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-success">82</p>
              </div>
              <Badge className="bg-success">95.3%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subjects Covered</p>
                <p className="text-2xl font-bold text-admin">24</p>
              </div>
              <BookOpen className="h-8 w-8 text-admin" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold">4.7</p>
              </div>
              <Award className="h-8 w-8 text-warning" />
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
              placeholder="Search by name or subject..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Teachers ({filteredTeachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-teacher text-teacher-foreground">
                          {teacher.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-sm text-muted-foreground">{teacher.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{teacher.subject}</Badge>
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.classes}</TableCell>
                  <TableCell>{teacher.students}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        teacher.status === "active"
                          ? "bg-success"
                          : "bg-warning"
                      }
                    >
                      {teacher.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
