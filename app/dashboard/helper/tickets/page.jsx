"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useHelperTickets } from "@/hooks/use-admin-data";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  MessageSquare,
  Clock,
  User,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading tickets...</p>
      </div>
    </div>
  );
}

export default function HelperTicketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { tickets, loading, error, refetch, resolveTicket, addReply } = useHelperTickets();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading tickets: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const ticketsList = tickets?.data || [];
  const mockTickets = [
    {
      id: "TKT-001",
      title: "Cannot access grade portal",
      description: "I am trying to view my grades but the portal shows an error message saying 'Access Denied'.",
      user: "Sarah Johnson",
      userRole: "student",
      priority: "high",
      status: "open",
      createdAt: "2026-02-03 09:30",
      messages: [
        { sender: "Sarah Johnson", message: "I cannot access my grades. Please help!", time: "09:30 AM" },
      ],
    },
    {
      id: "TKT-002",
      title: "Password reset request",
      description: "I forgot my password and the reset email is not arriving.",
      user: "Mike Thompson",
      userRole: "student",
      priority: "medium",
      status: "in-progress",
      createdAt: "2026-02-03 08:45",
      messages: [
        { sender: "Mike Thompson", message: "Password reset not working", time: "08:45 AM" },
        { sender: "Support", message: "Let me check your email settings", time: "09:00 AM" },
      ],
    },
    {
      id: "TKT-003",
      title: "Assignment submission error",
      description: "Getting error when trying to submit my math assignment.",
      user: "Emily Davis",
      userRole: "student",
      priority: "high",
      status: "open",
      createdAt: "2026-02-03 08:00",
      messages: [
        { sender: "Emily Davis", message: "Cannot submit assignment", time: "08:00 AM" },
      ],
    },
    {
      id: "TKT-004",
      title: "Timetable display issue",
      description: "My timetable is showing wrong class timings.",
      user: "James Wilson",
      userRole: "student",
      priority: "low",
      status: "resolved",
      createdAt: "2026-02-02 14:30",
      messages: [
        { sender: "James Wilson", message: "Wrong timings on timetable", time: "02:30 PM" },
        { sender: "Support", message: "Fixed the display issue", time: "03:00 PM" },
      ],
    },
    {
      id: "TKT-005",
      title: "Attendance marked wrong",
      description: "I was present yesterday but marked absent in the system.",
      user: "Dr. John Smith",
      userRole: "teacher",
      priority: "medium",
      status: "open",
      createdAt: "2026-02-03 07:30",
      messages: [
        { sender: "Dr. John Smith", message: "Please correct my attendance", time: "07:30 AM" },
      ],
    },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
        <p className="text-muted-foreground">Manage and respond to user support requests</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedTicket(ticket)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{ticket.id}</Badge>
                    <Badge
                      className={
                        ticket.priority === "high"
                          ? "bg-destructive"
                          : ticket.priority === "medium"
                          ? "bg-warning"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {ticket.priority}
                    </Badge>
                    <Badge
                      className={
                        ticket.status === "open"
                          ? "bg-destructive"
                          : ticket.status === "in-progress"
                          ? "bg-helper"
                          : "bg-success"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg">{ticket.title}</h3>
                  <p className="text-sm text-muted-foreground">{ticket.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {ticket.user} ({ticket.userRole})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {ticket.createdAt}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {ticket.messages.length} messages
                    </span>
                  </div>
                </div>
                <Button>Open Ticket</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedTicket.id}</Badge>
                  <DialogTitle>{selectedTicket.title}</DialogTitle>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      selectedTicket.priority === "high"
                        ? "bg-destructive"
                        : selectedTicket.priority === "medium"
                        ? "bg-warning"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {selectedTicket.priority} priority
                  </Badge>
                  <Badge
                    className={
                      selectedTicket.status === "open"
                        ? "bg-destructive"
                        : selectedTicket.status === "in-progress"
                        ? "bg-helper"
                        : "bg-success"
                    }
                  >
                    {selectedTicket.status}
                  </Badge>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">From: {selectedTicket.user}</p>
                  <p>{selectedTicket.description}</p>
                </div>

                <div className="space-y-3">
                  <Label>Conversation</Label>
                  {selectedTicket.messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg ${
                        msg.sender === "Support"
                          ? "bg-helper/10 ml-8"
                          : "bg-muted/50 mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Reply</Label>
                  <Textarea placeholder="Type your response..." rows={3} />
                </div>

                <div className="flex justify-between">
                  <Select defaultValue={selectedTicket.status}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="gap-2">
                    <Send className="h-4 w-4" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
