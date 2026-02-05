"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Bell,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Users,
} from "lucide-react";

export default function AdminNoticesPage() {
  const [isOpen, setIsOpen] = useState(false);

  const notices = [
    {
      id: 1,
      title: "Annual Sports Day Announcement",
      content: "The annual sports day will be held on March 15th. All students are required to participate.",
      date: "2026-02-01",
      target: "All",
      priority: "high",
      views: 1234,
    },
    {
      id: 2,
      title: "Mid-Term Examination Schedule",
      content: "Mid-term examinations will commence from February 20th. Please check the detailed schedule.",
      date: "2026-01-28",
      target: "Students",
      priority: "high",
      views: 890,
    },
    {
      id: 3,
      title: "Parent-Teacher Meeting",
      content: "PTM will be held on February 10th from 10 AM to 4 PM.",
      date: "2026-01-25",
      target: "Parents",
      priority: "medium",
      views: 567,
    },
    {
      id: 4,
      title: "Library Book Return Reminder",
      content: "All borrowed books must be returned by the end of this month.",
      date: "2026-01-20",
      target: "Students",
      priority: "low",
      views: 345,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notice Board</h1>
          <p className="text-muted-foreground">Manage school announcements and notices</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-admin hover:bg-admin/90">
              <Plus className="h-4 w-4" />
              New Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Notice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Enter notice title" />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea placeholder="Enter notice content" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="teachers">Teachers</SelectItem>
                      <SelectItem value="parents">Parents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsOpen(false)}>Publish Notice</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Notices</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Bell className="h-8 w-8 text-admin" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-student">8</p>
              </div>
              <Calendar className="h-8 w-8 text-student" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold text-success">3,036</p>
              </div>
              <Eye className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {notices.map((notice) => (
          <Card key={notice.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{notice.title}</CardTitle>
                    <Badge
                      className={
                        notice.priority === "high"
                          ? "bg-destructive"
                          : notice.priority === "medium"
                          ? "bg-warning"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {notice.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {notice.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {notice.target}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {notice.views} views
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{notice.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
