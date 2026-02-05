"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Menu, Moon, Sun, User, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockNotifications } from "@/lib/mock-data";

export function DashboardHeader({ onToggleSidebar, collapsed }) {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const notifications = mockNotifications.filter((n) => !n.read);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
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

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 border-b bg-card/80 backdrop-blur-sm transition-all duration-300",
        collapsed ? "left-16" : "left-64"
      )}
    >
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:block relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">{notification.message}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", getRoleColor())}>
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
