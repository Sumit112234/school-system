"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Headphones,
} from "lucide-react";
import Link from "next/link";

export default function HelperDashboard() {
  const stats = [
    {
      title: "Open Tickets",
      value: "12",
      change: "-3 from yesterday",
      icon: MessageSquare,
      color: "bg-helper",
    },
    {
      title: "Resolved Today",
      value: "8",
      change: "+2 from average",
      icon: CheckCircle,
      color: "bg-success",
    },
    {
      title: "Avg. Response Time",
      value: "15 min",
      change: "-5 min improvement",
      icon: Clock,
      color: "bg-student",
    },
    {
      title: "Satisfaction Rate",
      value: "94%",
      change: "+2% this week",
      icon: TrendingUp,
      color: "bg-teacher",
    },
  ];

  const recentTickets = [
    { id: "TKT-001", title: "Cannot access grade portal", user: "Sarah Johnson", priority: "high", status: "open", time: "5 min ago" },
    { id: "TKT-002", title: "Password reset request", user: "Mike Thompson", priority: "medium", status: "in-progress", time: "20 min ago" },
    { id: "TKT-003", title: "Assignment submission error", user: "Emily Davis", priority: "high", status: "open", time: "1 hour ago" },
    { id: "TKT-004", title: "Timetable display issue", user: "James Wilson", priority: "low", status: "resolved", time: "2 hours ago" },
    { id: "TKT-005", title: "Library access problem", user: "Lisa Anderson", priority: "medium", status: "open", time: "3 hours ago" },
  ];

  const quickActions = [
    { label: "View All Tickets", href: "/dashboard/helper/tickets", icon: MessageSquare },
    { label: "User Directory", href: "/dashboard/helper/users", icon: Users },
    { label: "Knowledge Base", href: "/dashboard/helper/knowledge", icon: Headphones },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Dashboard</h1>
          <p className="text-muted-foreground">Manage support tickets and assist users</p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      ticket.priority === "high"
                        ? "bg-destructive"
                        : ticket.priority === "medium"
                        ? "bg-warning"
                        : "bg-muted-foreground"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ticket.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {ticket.id}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ticket.user} - {ticket.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      ticket.status === "open"
                        ? "bg-destructive"
                        : ticket.status === "in-progress"
                        ? "bg-warning"
                        : "bg-success"
                    }
                  >
                    {ticket.status}
                  </Badge>
                  <Button size="sm">View</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-3xl font-bold text-destructive">3</p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium Priority</p>
                <p className="text-3xl font-bold text-warning">5</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-muted-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Priority</p>
                <p className="text-3xl font-bold">4</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
