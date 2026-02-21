"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus,
  Bell,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Users,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Pin,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────

const NOTICE_TYPES = ["general", "academic", "event", "exam", "holiday", "urgent"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const TARGET_AUDIENCES = ["all", "students", "teachers", "parents", "staff"];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function priorityBadgeColor(priority) {
  switch (priority) {
    case "urgent":  return "bg-red-500 text-white hover:bg-red-600";
    case "high":    return "bg-destructive";
    case "medium":  return "bg-warning text-warning-foreground";
    case "low":     return "bg-muted text-muted-foreground";
    default:        return "bg-muted text-muted-foreground";
  }
}

function typeLabel(type) {
  return type
    ? type.charAt(0).toUpperCase() + type.slice(1)
    : "General";
}

// ─── Loading State ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading notices...</p>
      </div>
    </div>
  );
}

// ─── Add/Edit Notice Dialog ────────────────────────────────────────────────────

function NoticeDialog({ notice, open, onOpenChange, onSaved }) {
  const isEdit = !!notice;
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "general",
    priority: "medium",
    targetAudience: ["all"],
    startDate: "",
    endDate: "",
    isPinned: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);


  const handleOpenChange = (isOpen) => {
    console.log("opening dialog, isEdit:", isEdit, "notice:", notice);
    if (isOpen) {
      if (isEdit) {
        console.log("Opening edit dialog for notice:", notice);
        setForm({
          title:          notice.title          ?? "",
          content:        notice.content        ?? "",
          type:           notice.type           ?? "general",
          priority:       notice.priority       ?? "medium",
          targetAudience: notice.targetAudience ?? ["all"],
          startDate: notice.startDate
            ? new Date(notice.startDate).toISOString().slice(0, 10)
            : "",
          endDate: notice.endDate
            ? new Date(notice.endDate).toISOString().slice(0, 10)
            : "",
          isPinned: notice.isPinned ?? false,
        });
      } else {
        setForm({
          title: "", content: "", type: "general", priority: "medium",
          targetAudience: ["all"], startDate: "", endDate: "", isPinned: false,
        });
      }
      setError(null);
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

  const handleAudienceToggle = (audience) => {
    setForm((prev) => {
      const current = prev.targetAudience || [];
      if (audience === "all") {
        return { ...prev, targetAudience: ["all"] };
      }
      const filtered = current.filter((a) => a !== "all");
      if (filtered.includes(audience)) {
        const updated = filtered.filter((a) => a !== audience);
        return { ...prev, targetAudience: updated.length ? updated : ["all"] };
      } else {
        return { ...prev, targetAudience: [...filtered, audience] };
      }
    });
  };

  const handleSubmit = async () => {
    setError(null);
    if (!form.title || !form.content) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate || null,
        endDate:   form.endDate   || null,
      };

      const url  = isEdit ? `/api/admin/notices/${notice.id ?? notice._id}` : "/api/admin/notices";
      const method = isEdit ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? `Failed to ${isEdit ? "update" : "create"} notice`);
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEdit ? "Edit Notice" : "Create New Notice"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update the details for "${notice?.title}".`
              : "Fill in the details to publish a new notice."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Row 1: Title */}
          <div className="space-y-1.5">
            <Label htmlFor="notice-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="notice-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Annual Sports Day Announcement"
            />
          </div>

          {/* Row 2: Content */}
          <div className="space-y-1.5">
            <Label htmlFor="notice-content">
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="notice-content"
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Enter the notice details..."
              rows={5}
              className="resize-y"
            />
          </div>

          {/* Row 3: Type + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => handleSelect("type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {NOTICE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{typeLabel(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => handleSelect("priority", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Target Audience (multi-select checkboxes) */}
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <div className="flex flex-wrap gap-2">
              {TARGET_AUDIENCES.map((aud) => {
                const isSelected = form.targetAudience.includes(aud);
                return (
                  <button
                    key={aud}
                    type="button"
                    onClick={() => handleAudienceToggle(aud)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    {aud.charAt(0).toUpperCase() + aud.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Start Date + End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="notice-startDate">Start Date</Label>
              <Input
                id="notice-startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notice-endDate">End Date</Label>
              <Input
                id="notice-endDate"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 6: Pinned Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <Switch
              id="notice-pinned"
              checked={form.isPinned}
              onCheckedChange={(v) => setForm((prev) => ({ ...prev, isPinned: v }))}
            />
            <Label htmlFor="notice-pinned" className="cursor-pointer flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Pin this notice to the top
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Publish Notice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ─────────────────────────────────────────────────────

function DeleteNoticeDialog({ notice, open, onOpenChange, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState(null);

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      const res  = await fetch(`/api/admin/notices/${notice.id ?? notice._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to delete notice");
      onDeleted(notice.id ?? notice._id);
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
              <DialogTitle>Delete Notice</DialogTitle>
              <DialogDescription className="mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-foreground">"{notice?.title}"</span>? This notice will be
          permanently removed.
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
            Delete Notice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Notice Card ───────────────────────────────────────────────────────────────

function NoticeCard({ notice, onEdit, onDelete }) {
  const isPinned = notice.isPinned;
  const author = notice.author?.name ?? "Unknown";
  const createdAt = notice.createdAt
    ? new Date(notice.createdAt).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      })
    : "—";

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isPinned ? "border-primary" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isPinned && <Pin className="h-4 w-4 text-primary shrink-0" />}
              <CardTitle className="text-lg leading-tight">{notice.title}</CardTitle>
              <Badge className={priorityBadgeColor(notice.priority)}>
                {notice.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {createdAt}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {Array.isArray(notice.targetAudience)
                  ? notice.targetAudience.join(", ")
                  : notice.targetAudience}
              </span>
              <span>By: {author}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onEdit(notice)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(notice)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{notice.content}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>Type: {typeLabel(notice.type)}</span>
          {notice.startDate && (
            <span>
              Active from {new Date(notice.startDate).toLocaleDateString()}
              {notice.endDate && ` to ${new Date(notice.endDate).toLocaleDateString()}`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminNoticesPage() {
  const [notices, setNotices]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Filters & pagination
  const [typeFilter, setTypeFilter]         = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage]                     = useState(1);
  const [totalPages, setTotalPages]         = useState(1);
  const [totalNotices, setTotalNotices]     = useState(0);
  const LIMIT = 10;

  // Dialog state
  const [addOpen, setAddOpen]         = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, totalViews: 0 });

  const fetchNotices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: LIMIT,
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
      });

      const res  = await fetch(`/api/admin/notices?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Failed to fetch notices");

      const list  = data?.data?.data ?? data?.data ?? [];
      const total = data?.data?.total ?? list.length;
      setNotices(list);
      setTotalNotices(total);
      setTotalPages(Math.ceil(total / LIMIT));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch total notices
      const totalRes = await fetch("/api/admin/notices?limit=1");
      const totalData = await totalRes.json();
      const total = totalData?.data?.total ?? 0;

      // Calculate this month's notices (client-side approximation)
      const allRes = await fetch("/api/admin/notices?limit=1000");
      const allData = await allRes.json();
      const allNotices = allData?.data?.data ?? [];
      const now = new Date();
      const thisMonth = allNotices.filter((n) => {
        const created = new Date(n.createdAt);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length;

      setStats({ total, thisMonth, totalViews: 0 }); // Views not tracked in schema
    } catch {
      // stats are non-critical
    }
  };

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    // Reset to page 1 whenever filters change
    setPage(1);
  }, [typeFilter, priorityFilter]);

  useEffect(() => { fetchNotices(); }, [page, typeFilter, priorityFilter]);

  const handleCreated = () => {
    fetchNotices();
    fetchStats();
  };

  const handleSaved = () => {
    fetchNotices();
  };

  const handleDeleted = () => {
    fetchNotices();
    fetchStats();
  };

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notice Board</h1>
          <p className="text-muted-foreground">Manage school announcements and notices</p>
        </div>
        <Button
          className="gap-2 bg-admin hover:bg-admin/90"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Notice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Notices</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-admin" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold text-student">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-student" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Notices</p>
                <p className="text-2xl font-bold text-green-600">
                  {notices.filter((n) => {
                    if (!n.endDate) return true;
                    return new Date(n.endDate) >= new Date();
                  }).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filters:
            </div>

            {/* Type filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {NOTICE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{typeLabel(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notices List */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">Error loading notices: {error}</p>
          <Button onClick={fetchNotices}>Try Again</Button>
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No notices found. Create your first notice!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {notices.map((notice) => (
              <NoticeCard
                key={notice.id ?? notice._id}
                notice={notice}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, totalNotices)} of{" "}
                {totalNotices} notices
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

      {/* ── Add/Edit Dialog ── */}
      {(addOpen || editTarget) && (
        <NoticeDialog
          notice={editTarget}
          open={addOpen || !!editTarget}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setAddOpen(false);
              setEditTarget(null);
            }
          }}
          onSaved={editTarget ? handleSaved : handleCreated}
        />
      )}

      {/* ── Delete Dialog ── */}
      {deleteTarget && (
        <DeleteNoticeDialog
          notice={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(isOpen) => { if (!isOpen) setDeleteTarget(null); }}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}