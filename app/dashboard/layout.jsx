"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar collapsed={collapsed} />
      <DashboardHeader
        collapsed={collapsed}
        onToggleSidebar={() => setCollapsed(!collapsed)}
      />
      <main
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          collapsed ? "pl-16" : "pl-64"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
