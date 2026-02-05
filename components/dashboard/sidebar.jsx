"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Users,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  ClipboardList,
  BarChart3,
  CreditCard,
  HelpCircle,
  UserCheck,
  Brain,
  FolderOpen,
  Clock,
} from "lucide-react";

const studentNavItems = [
  { title: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
  { title: "My Classes", href: "/dashboard/student/classes", icon: BookOpen },
  { title: "Timetable", href: "/dashboard/student/timetable", icon: Calendar },
  { title: "Assignments", href: "/dashboard/student/assignments", icon: FileText },
  { title: "Grades", href: "/dashboard/student/grades", icon: BarChart3 },
  { title: "Attendance", href: "/dashboard/student/attendance", icon: UserCheck },
  { title: "Study Materials", href: "/dashboard/student/materials", icon: FolderOpen },
  { title: "Quizzes", href: "/dashboard/student/quizzes", icon: Brain },
  { title: "Messages", href: "/dashboard/student/messages", icon: MessageSquare },
  { title: "AI Assistant", href: "/dashboard/student/ai-chat", icon: HelpCircle },
];

const teacherNavItems = [
  { title: "Dashboard", href: "/dashboard/teacher", icon: LayoutDashboard },
  { title: "My Classes", href: "/dashboard/teacher/classes", icon: BookOpen },
  { title: "Students", href: "/dashboard/teacher/students", icon: Users },
  { title: "Timetable", href: "/dashboard/teacher/timetable", icon: Calendar },
  { title: "Assignments", href: "/dashboard/teacher/assignments", icon: FileText },
  { title: "Attendance", href: "/dashboard/teacher/attendance", icon: ClipboardList },
  { title: "Grades", href: "/dashboard/teacher/grades", icon: BarChart3 },
  { title: "Materials", href: "/dashboard/teacher/materials", icon: FolderOpen },
  { title: "Quizzes", href: "/dashboard/teacher/quizzes", icon: Brain },
  { title: "Messages", href: "/dashboard/teacher/messages", icon: MessageSquare },
];

const adminNavItems = [
  { title: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Users", href: "/dashboard/admin/users", icon: Users },
  { title: "Classes", href: "/dashboard/admin/classes", icon: BookOpen },
  { title: "Subjects", href: "/dashboard/admin/subjects", icon: FolderOpen },
  { title: "Timetable", href: "/dashboard/admin/timetable", icon: Calendar },
  { title: "Attendance", href: "/dashboard/admin/attendance", icon: ClipboardList },
  { title: "Fee Management", href: "/dashboard/admin/fees", icon: CreditCard },
  { title: "Announcements", href: "/dashboard/admin/announcements", icon: Bell },
  { title: "Leave Requests", href: "/dashboard/admin/leaves", icon: Clock },
  { title: "Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
  { title: "Settings", href: "/dashboard/admin/settings", icon: Settings },
];

const helperNavItems = [
  { title: "Dashboard", href: "/dashboard/helper", icon: LayoutDashboard },
  { title: "Student Requests", href: "/dashboard/helper/requests", icon: HelpCircle },
  { title: "Sessions", href: "/dashboard/helper/sessions", icon: Calendar },
  { title: "Students", href: "/dashboard/helper/students", icon: Users },
  { title: "Messages", href: "/dashboard/helper/messages", icon: MessageSquare },
  { title: "Reports", href: "/dashboard/helper/reports", icon: BarChart3 },
];

export function DashboardSidebar({ collapsed = false }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case "student":
        return studentNavItems;
      case "teacher":
        return teacherNavItems;
      case "admin":
        return adminNavItems;
      case "helper":
        return helperNavItems;
      default:
        return [];
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case "student":
        return "bg-student";
      case "teacher":
        return "bg-teacher";
      case "admin":
        return "bg-admin";
      case "helper":
        return "bg-helper";
      default:
        return "bg-primary";
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", getRoleColor())}>
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-foreground">EduConnect</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                    {!collapsed && <span>{item.title}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User section */}
        <div className="border-t p-4">
          {!collapsed && user && (
            <div className="mb-3 flex items-center gap-3">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", getRoleColor())}>
                <span className="text-sm font-medium text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className={cn("w-full justify-start text-destructive hover:text-destructive", collapsed && "justify-center px-2")}
            onClick={logout}
          >
            <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && <span>Log out</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
