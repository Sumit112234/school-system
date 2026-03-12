"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User, Mail, Phone, MapPin, Calendar, BookOpen, Heart, Users,
  Edit, Save, X, Loader2, AlertCircle, IdCard, GraduationCap
} from "lucide-react";

function getInitials(name) {
  return name?.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "?";
}

function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [editForm, setEditForm] = useState({
    phone: "",
    avatar: "",
    address: "",
    emergencyContact: "",
    parentPhone: "",
    parentEmail: "",
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/student/profile");
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to fetch profile");
      setProfile(result.data.profile);
      setEditForm({
        phone: result.data.profile.phone || "",
        avatar: result.data.profile.avatar || "",
        address: result.data.profile.address || "",
        emergencyContact: result.data.profile.emergencyContact || "",
        parentPhone: result.data.profile.parentPhone || "",
        parentEmail: result.data.profile.parentEmail || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to update profile");
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  if (error && !profile) return (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <p className="text-destructive">{error}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)} className="gap-2">
            <Edit className="h-4 w-4" />Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setEditing(false); fetchProfile(); }} disabled={saving}>
              <X className="h-4 w-4 mr-2" />Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />Save
            </Button>
          </div>
        )}
      </div>

      {error && editing && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Avatar & Basic Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={editing ? editForm.avatar : profile?.avatar} />
                  <AvatarFallback className="text-2xl">{getInitials(profile?.name)}</AvatarFallback>
                </Avatar>
                {editing && (
                  <div className="w-full">
                    <Label className="text-xs">Avatar URL</Label>
                    <Input
                      value={editForm.avatar}
                      onChange={e => setEditForm({...editForm, avatar: e.target.value})}
                      placeholder="https://..."
                      className="text-xs"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{profile?.name}</h2>
                  <p className="text-muted-foreground">{profile?.email}</p>
                  <Badge className="mt-2" variant={profile?.isActive ? "default" : "secondary"}>
                    {profile?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student ID Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IdCard className="h-4 w-4" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Student ID</p>
                <p className="font-bold text-lg">{profile?.studentId}</p>
              </div>
              {profile?.rollNumber && (
                <div>
                  <p className="text-xs text-muted-foreground">Roll Number</p>
                  <p className="font-medium">{profile?.rollNumber}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Class</p>
                <p className="font-medium">
                  {profile?.class?.name} - Section {profile?.class?.section}
                </p>
              </div>
              {profile?.admissionDate && (
                <div>
                  <p className="text-xs text-muted-foreground">Admission Date</p>
                  <p className="font-medium">
                    {new Date(profile.admissionDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <ProfileField icon={Mail} label="Email" value={profile?.email} />
                
                {editing ? (
                  <div>
                    <Label className="text-sm">Phone Number</Label>
                    <Input
                      value={editForm.phone}
                      onChange={e => setEditForm({...editForm, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                ) : (
                  <ProfileField icon={Phone} label="Phone" value={profile?.phone} />
                )}

                <ProfileField 
                  icon={User} 
                  label="Gender" 
                  value={profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : null} 
                />
                
                <ProfileField 
                  icon={Calendar} 
                  label="Date of Birth" 
                  value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null} 
                />

                {profile?.bloodGroup && (
                  <ProfileField icon={Heart} label="Blood Group" value={profile.bloodGroup} />
                )}
              </div>

              <Separator />

              {editing ? (
                <div>
                  <Label className="text-sm">Address</Label>
                  <Textarea
                    value={editForm.address}
                    onChange={e => setEditForm({...editForm, address: e.target.value})}
                    placeholder="Enter your address"
                    rows={3}
                  />
                </div>
              ) : (
                <ProfileField icon={MapPin} label="Address" value={profile?.address} />
              )}

              {editing ? (
                <div>
                  <Label className="text-sm">Emergency Contact</Label>
                  <Input
                    value={editForm.emergencyContact}
                    onChange={e => setEditForm({...editForm, emergencyContact: e.target.value})}
                    placeholder="Enter emergency contact number"
                  />
                </div>
              ) : profile?.emergencyContact && (
                <ProfileField icon={Phone} label="Emergency Contact" value={profile.emergencyContact} />
              )}
            </CardContent>
          </Card>

          {/* Parent/Guardian Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Parent/Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <ProfileField icon={User} label="Parent Name" value={profile?.parentName} />
                
                {editing ? (
                  <div>
                    <Label className="text-sm">Parent Phone</Label>
                    <Input
                      value={editForm.parentPhone}
                      onChange={e => setEditForm({...editForm, parentPhone: e.target.value})}
                      placeholder="Enter parent phone"
                    />
                  </div>
                ) : (
                  <ProfileField icon={Phone} label="Parent Phone" value={profile?.parentPhone} />
                )}

                {editing ? (
                  <div className="md:col-span-2">
                    <Label className="text-sm">Parent Email</Label>
                    <Input
                      value={editForm.parentEmail}
                      onChange={e => setEditForm({...editForm, parentEmail: e.target.value})}
                      placeholder="Enter parent email"
                    />
                  </div>
                ) : profile?.parentEmail && (
                  <div className="md:col-span-2">
                    <ProfileField icon={Mail} label="Parent Email" value={profile.parentEmail} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Subjects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Enrolled Subjects ({profile?.subjects?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {profile?.subjects?.map(subject => (
                  <div key={subject._id} className="flex items-center gap-2 p-3 rounded-lg border">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">{subject.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}