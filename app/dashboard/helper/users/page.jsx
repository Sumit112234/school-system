"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHelperUsers } from "@/hooks/use-admin-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  GraduationCap,
  Mail,
  Key,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    </div>
  );
}

export default function HelperUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { users, loading, error, refetch, resetPassword, unlockUser } = useHelperUsers();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading users: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const usersList = users?.data || [];
  const mockUsers = [
    { id: "USR001", name: "Sarah Johnson", email: "sarah@school.edu", role: "student", class: "10A", lastLogin: "Today 09:30", status: "active" },
    { id: "USR002", name: "Dr. John Smith", email: "john@school.edu", role: "teacher", subject: "Mathematics", lastLogin: "Today 08:00", status: "active" },
    { id: "USR003", name: "Mike Thompson", email: "mike@school.edu", role: "student", class: "10A", lastLogin: "Yesterday", status: "active" },
    { id: "USR004", name: "Emily Davis", email: "emily@school.edu", role: "student", class: "10B", lastLogin: "Today 07:45", status: "locked" },
    { id: "USR005", name: "Ms. Emily Brown", email: "ebrown@school.edu", role: "teacher", subject: "English", lastLogin: "Today 08:30", status: "active" },
    { id: "USR006", name: "James Wilson", email: "james@school.edu", role: "student", class: "9A", lastLogin: "2 days ago", status: "inactive" },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case "student":
        return "bg-student";
      case "teacher":
        return "bg-teacher";
      case "admin":
        return "bg-admin";
      default:
        return "bg-helper";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Directory</h1>
        <p className="text-muted-foreground">View and manage user accounts</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">1,320</p>
              </div>
              <Users className="h-8 w-8 text-helper" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold text-student">1,234</p>
              </div>
              <GraduationCap className="h-8 w-8 text-student" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold text-success">876</p>
              </div>
              <Badge className="bg-success">Online</Badge>
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
                placeholder="Search by name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Class/Subject</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className={getRoleColor(user.role)}>
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.class || user.subject || "-"}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.status === "active"
                          ? "bg-success"
                          : user.status === "locked"
                          ? "bg-destructive"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Key className="h-3 w-3" />
                        Reset
                      </Button>
                    </div>
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
