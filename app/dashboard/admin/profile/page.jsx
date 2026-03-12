"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, Phone, MapPin, Calendar, Shield,
  Edit, Save, X, Loader2, AlertCircle
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

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [editForm, setEditForm] = useState({
    phone: "",
    avatar: "",
    address: "",
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/me");
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Failed to fetch profile");
      setProfile(result.data);
      setEditForm({
        phone: result.data.phone || "",
        avatar: result.data.avatar || "",
        address: result.data.address || "",
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
      // You'll need to create a PUT /api/auth/me endpoint for updating admin profile
      const res = await fetch("/api/auth/me", {
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
        {/* Left Column */}
        <div>
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
                <div className="w-full">
                  <h2 className="text-2xl font-bold">{profile?.name}</h2>
                  <p className="text-muted-foreground text-sm">{profile?.email}</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Badge variant="default" className="capitalize">
                      <Shield className="h-3 w-3 mr-1" />
                      {profile?.role}
                    </Badge>
                    <Badge variant={profile?.isActive ? "default" : "secondary"}>
                      {profile?.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
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
              </div>

              {editing ? (
                <div>
                  <Label className="text-sm">Address</Label>
                  <Textarea
                    value={editForm.address}
                    onChange={e => setEditForm({...editForm, address: e.target.value})}
                    placeholder="Enter your address"
                    rows={4}
                  />
                </div>
              ) : (
                <ProfileField icon={MapPin} label="Address" value={profile?.address} />
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{profile?.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={profile?.isActive ? "default" : "secondary"}>
                    {profile?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Created</p>
                  <p className="font-medium">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}