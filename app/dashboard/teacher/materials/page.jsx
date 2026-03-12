"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Plus, Edit, Trash2, Download, Loader2, AlertCircle, FileText, 
  Video, Link as LinkIcon, Image as ImageIcon, Presentation, Upload, X
} from "lucide-react";

const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "your-cloud-name";

const MATERIAL_TYPES = [
  { value: "document", label: "Document", icon: FileText, accept: ".pdf,.doc,.docx,.txt" },
  { value: "video", label: "Video", icon: Video, accept: "video/*" },
  { value: "link", label: "External Link", icon: LinkIcon, accept: null },
  { value: "image", label: "Image", icon: ImageIcon, accept: "image/*" },
  { value: "presentation", label: "Presentation", icon: Presentation, accept: ".ppt,.pptx" },
  { value: "other", label: "Other", icon: FileText, accept: "*" },
];

function MaterialDialog({ material, open, onOpenChange, onSaved }) {
  const [form, setForm] = useState({
    title: "", description: "", type: "document", classId: "", subjectId: "",
    externalLink: "", tags: "", isPublished: true
  });
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      fetchData();
      if (material) {
        setForm({
          title: material.title,
          description: material.description || "",
          type: material.type,
          classId: material.class._id,
          subjectId: material.subject._id,
          externalLink: material.externalLink || "",
          tags: material.tags?.join(", ") || "",
          isPublished: material.isPublished
        });
        setExistingFile(material.file);
        setFile(null);
      } else {
        setForm({
          title: "", description: "", type: "document", classId: "", subjectId: "",
          externalLink: "", tags: "", isPublished: true
        });
        setFile(null);
        setExistingFile(null);
      }
    }
  }, [open, material]);

  const fetchData = async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        fetch("/api/teacher/classes"),
        fetch("/api/admin/subjects?limit=1000")
      ]);
      const [classesData, subjectsData] = await Promise.all([classesRes.json(), subjectsRes.json()]);
      setClasses(classesData.data?.classes || []);
      setSubjects(subjectsData.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setExistingFile(null);
    }
  };

  const uploadToCloudinary = async () => {
    if (!file) return existingFile;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      
      // Determine resource type based on material type
      let resourceType = "auto";
      if (form.type === "video") resourceType = "video";
      else if (form.type === "image") resourceType = "image";
      else resourceType = "raw";

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      return {
        name: file.name,
        url: data.secure_url,
        publicId: data.public_id,
        size: data.bytes,
        format: data.format,
      };
    } catch (err) {
      throw new Error("Failed to upload file: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteFromCloudinary = async (publicId) => {
    // Note: Deletion requires backend with Cloudinary secret
    // For security, you should create a backend endpoint
    console.log("Delete from Cloudinary:", publicId);
    // Backend should call cloudinary.v2.uploader.destroy(publicId)
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.title || !form.classId || !form.subjectId) {
      setError("Title, class, and subject are required");
      return;
    }

    if (form.type === "link" && !form.externalLink) {
      setError("External link is required for link type");
      return;
    }

    if (form.type !== "link" && !file && !existingFile) {
      setError("File is required");
      return;
    }

    setSaving(true);
    try {
      let uploadedFile = existingFile;

      if (file) {
        uploadedFile = await uploadToCloudinary();
      }

      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        classId: form.classId,
        subjectId: form.subjectId,
        file: form.type !== "link" ? uploadedFile : null,
        externalLink: form.type === "link" ? form.externalLink : null,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        isPublished: form.isPublished,
      };

      const url = material ? `/api/teacher/materials/${material._id}` : "/api/teacher/materials";
      const method = material ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to save");

      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const typeInfo = MATERIAL_TYPES.find(t => t.value === form.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{material ? "Edit Material" : "Upload Material"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && <div className="text-destructive text-sm p-2 bg-destructive/10 rounded">{error}</div>}

          <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
          
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} /></div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label>Type *</Label><Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MATERIAL_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      <t.icon className="h-4 w-4" />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select></div>

            <div><Label>Class *</Label><Select value={form.classId} onValueChange={v => {
                setSubjects(classes.find(c => c._id === v)?.allSubjects || []);
                setForm({...form, classId: v})
                }}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>{classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name} - {c.section}</SelectItem>)}</SelectContent>
            </Select></div>
          </div>

          <div><Label>Subject *</Label><Select value={form.subjectId} onValueChange={v => setForm({...form, subjectId: v})}>
            <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
            <SelectContent>{subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
          </Select></div>

          {form.type === "link" ? (
            <div><Label>External Link *</Label><Input value={form.externalLink} onChange={e => setForm({...form, externalLink: e.target.value})} placeholder="https://..." /></div>
          ) : (
            <div>
              <Label>Upload File *</Label>
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={typeInfo?.accept || "*"}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full gap-2"
                  disabled={uploading}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {file ? file.name : existingFile ? existingFile.name : "Choose File"}
                </Button>
                {(file || existingFile) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setFile(null); setExistingFile(null); }}
                    className="mt-2"
                  >
                    <X className="h-4 w-4 mr-1" />Remove
                  </Button>
                )}
              </div>
            </div>
          )}

          <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="physics, chapter-1, important" /></div>

          <div className="flex items-center gap-2">
            <Switch checked={form.isPublished} onCheckedChange={v => setForm({...form, isPublished: v})} />
            <Label>Published (students can see)</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving || uploading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || uploading} className="gap-2">
            {(saving || uploading) && <Loader2 className="h-4 w-4 animate-spin" />}
            {uploading ? "Uploading..." : "Save Material"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TeacherMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [materialDialog, setMaterialDialog] = useState({ open: false, material: null });

  useEffect(() => { fetchMaterials(); }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/materials");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      setMaterials(data.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (material) => {
    if (!confirm("Delete this material?")) return;
    try {
      const res = await fetch(`/api/teacher/materials/${material._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchMaterials();
    } catch (err) {
      alert(err.message);
    }
  };

  const getTypeIcon = (type) => {
    const typeInfo = MATERIAL_TYPES.find(t => t.value === type);
    return typeInfo ? typeInfo.icon : FileText;
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Study Materials</h1><p className="text-muted-foreground">Upload and manage learning resources</p></div>
        <Button onClick={() => setMaterialDialog({ open: true, material: null })} className="gap-2">
          <Plus className="h-4 w-4" />Upload Material
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {materials.map(m => {
          const Icon = getTypeIcon(m.type);
          return (
            <Card key={m._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base leading-tight truncate">{m.title}</CardTitle>
                    <p className="text-xs text-muted-foreground truncate">{m.subject?.name}</p>
                  </div>
                  <Badge variant={m.isPublished ? "default" : "secondary"} className="shrink-0">
                    {m.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {m.description && <p className="text-sm text-muted-foreground line-clamp-2">{m.description}</p>}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{m.class?.name} - {m.class?.section}</span>
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {m.downloads || 0}
                  </span>
                </div>

                {m.tags && m.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {m.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                    {m.tags.length > 3 && <Badge variant="outline" className="text-xs">+{m.tags.length - 3}</Badge>}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setMaterialDialog({ open: true, material: m })}>
                    <Edit className="h-3 w-3 mr-1" />Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(m)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {materials.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No materials yet. Upload your first material!</p>
          </CardContent>
        </Card>
      )}

      <MaterialDialog {...materialDialog} onOpenChange={open => setMaterialDialog({...materialDialog, open})} onSaved={fetchMaterials} />
    </div>
  );
}