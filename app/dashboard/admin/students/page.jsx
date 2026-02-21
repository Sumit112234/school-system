"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminStudents } from "@/hooks/use-admin-data";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  GraduationCap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading students...</p>
      </div>
    </div>
  );
}

export default function AdminStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { students, loading, error, refetch } = useAdminStudents();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading students: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const studentsList = students?.data || [];
  const mockStudentData = [
    { id: "STU001", name: "Sarah Johnson", class: "10A", email: "sarah@school.edu", phone: "555-0101", status: "active", gpa: 3.8 },
    { id: "STU002", name: "Mike Thompson", class: "10A", email: "mike@school.edu", phone: "555-0102", status: "active", gpa: 3.5 },
    { id: "STU003", name: "Emily Davis", class: "10B", email: "emily@school.edu", phone: "555-0103", status: "active", gpa: 3.9 },
    { id: "STU004", name: "James Wilson", class: "9A", email: "james@school.edu", phone: "555-0104", status: "inactive", gpa: 3.2 },
    { id: "STU005", name: "Lisa Anderson", class: "9B", email: "lisa@school.edu", phone: "555-0105", status: "active", gpa: 3.7 },
    { id: "STU006", name: "Robert Brown", class: "11A", email: "robert@school.edu", phone: "555-0106", status: "active", gpa: 3.4 },
    { id: "STU007", name: "Jennifer Martinez", class: "11B", email: "jennifer@school.edu", phone: "555-0107", status: "pending", gpa: 0 },
    { id: "STU008", name: "David Lee", class: "12A", email: "david@school.edu", phone: "555-0108", status: "active", gpa: 3.6 },
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === "all" || student.class === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground">Manage all student records and information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Link href="/dashboard/admin/students/add">
            <Button className="gap-2 bg-student hover:bg-student/90">
              <Plus className="h-4 w-4" />
              Add Student
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
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <GraduationCap className="h-8 w-8 text-student" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-success">1,180</p>
              </div>
              <Badge className="bg-success">95.6%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold text-student">24</p>
              </div>
              <Badge variant="outline">+12%</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. GPA</p>
                <p className="text-2xl font-bold">3.54</p>
              </div>
              <Badge className="bg-admin">A-</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="9A">Class 9A</SelectItem>
                <SelectItem value="9B">Class 9B</SelectItem>
                <SelectItem value="10A">Class 10A</SelectItem>
                <SelectItem value="10B">Class 10B</SelectItem>
                <SelectItem value="11A">Class 11A</SelectItem>
                <SelectItem value="11B">Class 11B</SelectItem>
                <SelectItem value="12A">Class 12A</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{student.gpa > 0 ? student.gpa.toFixed(1) : "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.status === "active"
                          ? "default"
                          : student.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        student.status === "active"
                          ? "bg-success"
                          : student.status === "pending"
                          ? "bg-warning"
                          : ""
                      }
                    >
                      {student.status}
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
                          Delete
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
