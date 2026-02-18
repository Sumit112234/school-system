"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLES = ["student", "teacher", "admin", "helper", "super-admin", "temporary"];
const GENDERS = ["male", "female", "other"];

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function roleBadgeVariant(role) {
  switch (role) {
    case "super-admin": return "destructive";
    case "admin":       return "default";
    case "teacher":     return "secondary";
    case "student":     return "outline";
    default:            return "outline";
  }
}

function roleLabel(role) {
  return role
    ? role.charAt(0).toUpperCase() + role.slice(1).replace("-", " ")
    : "—";
}

function avatarInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── Loading / Error States ────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    </div>
  );
}

// ─── Add User Dialog ───────────────────────────────────────────────────────────

function AddUserDialog({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    isActive: true,
    // student extras
    studentId: "",
    parentName: "",
    parentPhone: "",
    // teacher extras
    employeeId: "",
    department: "",
    designation: "",
    qualification: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  const handleOpenChange = (isOpen) => {
    if (isOpen) {
      setForm({
        name: "", email: "", password: "", role: "", phone: "",
        gender: "", dateOfBirth: "", isActive: true,
        studentId: "", parentName: "", parentPhone: "",
        employeeId: "", department: "", designation: "", qualification: "",
      });
      setError(null);
      setShowPassword(false);
    }
    onOpenChange(isOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.name || !form.email || !form.password || !form.role) {
      setError("Name, email, password, and role are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || null,
        gender: form.gender || null,
        dateOfBirth: form.dateOfBirth || null,
        isActive: form.isActive,
      };

      if (form.role === "student") {
        payload.studentId = form.studentId || undefined;
        payload.parentName = form.parentName || null;
        payload.parentPhone = form.parentPhone || null;
      } else if (form.role === "teacher") {
        payload.employeeId   = form.employeeId || undefined;
        payload.department   = form.department || null;
        payload.designation  = form.designation || "Teacher";
        payload.qualification = form.qualification || null;
      }

      const res  = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to create user");
      onCreated(data);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. Role-specific fields appear after selecting a role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Row 1: Name + Role */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Jane Smith"
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Role <span className="text-destructive">*</span>
              </Label>
              <Select value={form.role} onValueChange={(v) => handleSelect("role", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{roleLabel(r)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Email + Password */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jane@school.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="add-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Phone + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-phone">Phone</Label>
              <Input
                id="add-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => handleSelect("gender", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: DOB + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="add-dob">Date of Birth</Label>
              <Input
                id="add-dob"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="add-active"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((prev) => ({ ...prev, isActive: v }))}
              />
              <Label htmlFor="add-active" className="cursor-pointer">
                Active Account
              </Label>
            </div>
          </div>

          {/* ── Student-specific fields ── */}
          {form.role === "student" && (
            <div className="space-y-4 rounded-lg border border-dashed p-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Student Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="add-studentId">Student ID</Label>
                  <Input
                    id="add-studentId"
                    name="studentId"
                    value={form.studentId}
                    onChange={handleChange}
                    placeholder="Auto-generated if blank"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="add-parentName">Parent / Guardian Name</Label>
                  <Input
                    id="add-parentName"
                    name="parentName"
                    value={form.parentName}
                    onChange={handleChange}
                    placeholder="e.g. John Smith"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-parentPhone">Parent Phone</Label>
                <Input
                  id="add-parentPhone"
                  name="parentPhone"
                  value={form.parentPhone}
                  onChange={handleChange}
                  placeholder="+1 555 000 0000"
                />
              </div>
            </div>
          )}

          {/* ── Teacher-specific fields ── */}
          {form.role === "teacher" && (
            <div className="space-y-4 rounded-lg border border-dashed p-4">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Teacher Details
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="add-employeeId">Employee ID</Label>
                  <Input
                    id="add-employeeId"
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    placeholder="Auto-generated if blank"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="add-department">Department</Label>
                  <Input
                    id="add-department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Mathematics"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="add-designation">Designation</Label>
                  <Input
                    id="add-designation"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="e.g. Senior Teacher"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="add-qualification">Qualification</Label>
                  <Input
                    id="add-qualification"
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    placeholder="e.g. M.Sc. Physics"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit User Dialog ──────────────────────────────────────────────────────────

function EditUserDialog({ user, open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    isActive: true,
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  const handleOpenChange = (isOpen) => {
    if (isOpen && user) {
      setForm({
        name:        user.name        ?? "",
        phone:       user.phone       ?? "",
        gender:      user.gender      ?? "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().slice(0, 10)
          : "",
        address:     user.address ?? "",
        isActive:    user.isActive ?? true,
        password:    "",
      });
      setError(null);
      setShowPassword(false);
    }
    onOpenChange(isOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        name:        form.name,
        phone:       form.phone       || null,
        gender:      form.gender      || null,
        dateOfBirth: form.dateOfBirth || null,
        address:     form.address     || null,
        isActive:    form.isActive,
      };
      if (form.password) payload.password = form.password;

      const res  = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to update user");
      onSaved(data);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit User</DialogTitle>
          <DialogDescription>
            Update details for{" "}
            <span className="font-semibold text-foreground">{user?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Row 1: Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
            />
          </div>

          {/* Row 2: Phone + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => handleSelect("gender", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: DOB + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-dob">Date of Birth</Label>
              <Input
                id="edit-dob"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="edit-active"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((prev) => ({ ...prev, isActive: v }))}
              />
              <Label htmlFor="edit-active" className="cursor-pointer">
                Active Account
              </Label>
            </div>
          </div>

          {/* Row 4: Address */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-address">Address</Label>
            <Textarea
              id="edit-address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street, City, State..."
              rows={2}
              className="resize-y"
            />
          </div>

          {/* Row 5: New Password (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-password">New Password</Label>
            <div className="relative">
              <Input
                id="edit-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteUserDialog({ user, open, onOpenChange, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState(null);

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      const res  = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to delete user");
      onDeleted(user.id);
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription className="mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">{user?.name}</span>? Their account and all
          associated data will be permanently removed.
        </p>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-2"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── User Card ─────────────────────────────────────────────────────────────────

function UserCard({ user, onEdit, onDelete }) {
  const initials = avatarInitials(user.name);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials || "?"}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base leading-tight truncate">{user.name}</CardTitle>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge variant={roleBadgeVariant(user.role)}>{roleLabel(user.role)}</Badge>
            <span
              className={`text-xs font-medium ${
                user.isActive ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
              }`}
            >
              {user.isActive ? "● Active" : "○ Inactive"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium truncate">{user.phone || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Gender</p>
            <p className="font-medium capitalize">{user.gender || "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Joined</p>
            <p className="font-medium">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1 bg-transparent"
            onClick={() => onEdit(user)}
          >
            <Edit className="h-3 w-3" />
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(user)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // Filters & pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalUsers, setTotalUsers]   = useState(0);
  const LIMIT = 12;

  // Dialog state
  const [addOpen, setAddOpen]         = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, admins: 0 });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const res  = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to fetch users");

      const list  = data?.data?.data ?? data?.data ?? [];
      const total = data?.data?.total ?? list.length;
      setUsers(list);
      setTotalUsers(total);
      setTotalPages(Math.ceil(total / LIMIT));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [allRes, activeRes, adminRes] = await Promise.all([
        fetch("/api/admin/users?limit=1"),
        fetch("/api/admin/users?limit=1&status=active"),
        fetch("/api/admin/users?limit=1&role=admin"),
      ]);
      const [allData, activeData, adminData] = await Promise.all([
        allRes.json(), activeRes.json(), adminRes.json(),
      ]);
      const total    = allData?.data?.pagination?.total    ?? 0;
      const active   = activeData?.data?.pagination?.total ?? 0;
      const adminCnt = adminData?.data?.pagination?.total  ?? 0;

      
    //   console.log("Stats:", [allData, activeData, adminData]);
      setStats({ total, active, inactive: total - active, admins: adminCnt });
    } catch {
      // stats are non-critical
    }
  };

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    // Reset to page 1 whenever filters change
    setPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [page, searchQuery, roleFilter, statusFilter]);

  const handleCreated = () => {
    fetchUsers();
    fetchStats();
  };

  const handleSaved = () => {
    fetchUsers();
  };

  const handleDeleted = () => {
    fetchUsers();
    fetchStats();
  };

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage all users, roles, and accounts</p>
        </div>
        <Button
          className="gap-2 bg-admin hover:bg-admin/90"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-admin" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-muted-foreground">{stats.inactive}</p>
              </div>
              <UserX className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold text-destructive">{stats.admins}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Role filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{roleLabel(r)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">Error loading users: {error}</p>
          <Button onClick={fetchUsers}>Try Again</Button>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <UserCard
                key={user.id ?? user._id}
                user={user}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, totalUsers)} of{" "}
                {totalUsers} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Add Dialog ── */}
      <AddUserDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={handleCreated}
      />

      {/* ── Edit Dialog ── */}
      {editTarget && (
        <EditUserDialog
          user={editTarget}
          open={!!editTarget}
          onOpenChange={(isOpen) => { if (!isOpen) setEditTarget(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* ── Delete Dialog ── */}
      {deleteTarget && (
        <DeleteUserDialog
          user={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(isOpen) => { if (!isOpen) setDeleteTarget(null); }}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}