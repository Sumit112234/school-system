"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  MessageSquare,
  Shield,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {


  const { user, loading, getDashboardPath } = useAuth();
  const router = useRouter();

  console.log("LandingPage render - user:", user, "loading:", loading);

  useEffect(() => {
    if (!loading && user) {
      router.push(getDashboardPath(user.role));
    }
  }, [user, loading, router, getDashboardPath]);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <GraduationCap className="h-12 w-12 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Users,
      title: "Multi-Role Access",
      description: "Separate dashboards for students, teachers, administrators, and support staff.",
    },
    {
      icon: BookOpen,
      title: "Course Management",
      description: "Organize classes, subjects, and study materials in one centralized location.",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Interactive timetables and calendar integration for all users.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Track attendance, grades, and performance with detailed insights.",
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Built-in messaging, announcements, and notification system.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Role-based access control with enterprise-grade security.",
    },
  ];

  const roles = [
    { name: "Student", color: "bg-student", email: "student@school.com" },
    { name: "Teacher", color: "bg-teacher", email: "teacher@school.com" },
    { name: "Admin", color: "bg-admin", email: "admin@school.com" },
    { name: "Helper", color: "bg-helper", email: "helper@school.com" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">EduConnect</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Roles
            </Link>
            <Link href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Demo
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 mb-6">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">Modern School Management</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
              Simplify Your School Management
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
              A comprehensive platform connecting students, teachers, administrators, and support staff. 
              Streamline operations, enhance learning, and build a connected educational community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make school management effortless and efficient.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Everyone
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tailored dashboards and features for each role in your educational institution.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-2 ${role.color}`} />
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3">{role.name}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {role.name === "Student" && (
                      <>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> View grades & attendance</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Submit assignments</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Take online quizzes</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Access study materials</li>
                      </>
                    )}
                    {role.name === "Teacher" && (
                      <>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Manage classes</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Grade assignments</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Track attendance</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Upload materials</li>
                      </>
                    )}
                    {role.name === "Admin" && (
                      <>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> User management</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> View analytics</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Fee management</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> System settings</li>
                      </>
                    )}
                    {role.name === "Helper" && (
                      <>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Student support</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Schedule sessions</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Track requests</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Generate reports</li>
                      </>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section id="demo" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Try the Demo
            </h2>
            <p className="text-muted-foreground mb-8">
              Explore the platform with these demo accounts. Password for all accounts is the role name followed by 123 (e.g., student123).
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {roles.map((role, index) => (
                <Card key={index} className="text-left">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full ${role.color} flex items-center justify-center`}>
                        <span className="text-sm font-medium text-white">{role.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{role.name}</p>
                        <p className="text-sm text-muted-foreground">{role.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/login">
                <Button size="lg">
                  Try Demo Now
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <GraduationCap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">EduConnect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for modern educational institutions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
