"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminSettings } from "@/hooks/use-admin-data";
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { settings, loading, error, refetch, updateSettings } = useAdminSettings();
  const [formData, setFormData] = useState(settings?.data || {});

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive mb-4">Error loading settings: {error}</p>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground">Manage school system configuration</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Database className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Basic school details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>School Name</Label>
                  <Input defaultValue="Excellence Academy" />
                </div>
                <div className="space-y-2">
                  <Label>School Code</Label>
                  <Input defaultValue="EA2024" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="admin@excellenceacademy.edu" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Input defaultValue="123 Education Street, Knowledge City, ED 12345" />
                </div>
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Settings</CardTitle>
              <CardDescription>Configure academic year and grading</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Current Academic Year</Label>
                  <Input defaultValue="2025-2026" />
                </div>
                <div className="space-y-2">
                  <Label>Grading System</Label>
                  <Input defaultValue="GPA (4.0 Scale)" />
                </div>
              </div>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure email notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Enrollment Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when new students enroll
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Fee Payment Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about fee payments
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Attendance Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily attendance summary notifications
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Leave Request Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications for pending leave requests
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>Email server settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input placeholder="smtp.example.com" />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input placeholder="587" />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="********" />
                </div>
              </div>
              <Button className="gap-2">
                <Mail className="h-4 w-4" />
                Test Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Auto logout after 30 minutes of inactivity
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Policy</Label>
                  <p className="text-sm text-muted-foreground">
                    Enforce strong password requirements
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activity Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all admin activities
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Connection</CardTitle>
              <CardDescription>MongoDB connection settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Connection URI</Label>
                <Input placeholder="mongodb://localhost:27017/school" type="password" />
              </div>
              <Button className="gap-2">
                <Database className="h-4 w-4" />
                Test Connection
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Integration</CardTitle>
              <CardDescription>OpenAI API for AI Assistant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input placeholder="sk-..." type="password" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable AI Assistant</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow students and teachers to use AI chat
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button className="gap-2">
                <Globe className="h-4 w-4" />
                Verify API Key
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
