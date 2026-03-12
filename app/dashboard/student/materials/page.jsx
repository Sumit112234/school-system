"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  FileText, Video, Link as LinkIcon, Image as ImageIcon, 
  Presentation, Download, Loader2, Search, ExternalLink
} from "lucide-react";

const MATERIAL_TYPES = [
  { value: "document", label: "Document", icon: FileText },
  { value: "video", label: "Video", icon: Video },
  { value: "link", label: "Link", icon: LinkIcon },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "presentation", label: "Presentation", icon: Presentation },
  { value: "other", label: "Other", icon: FileText },
];

function MaterialCard({ material, onDownload }) {
  const Icon = MATERIAL_TYPES.find(t => t.value === material.type)?.icon || FileText;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (material.type === "link") {
        window.open(material.externalLink, "_blank");
      } else if (material.file?.url) {
        window.open(material.file.url, "_blank");
      }
      await onDownload(material._id);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-lg ${
            material.type === "video" ? "bg-red-100" :
            material.type === "link" ? "bg-blue-100" :
            material.type === "image" ? "bg-green-100" :
            material.type === "presentation" ? "bg-orange-100" :
            "bg-purple-100"
          }`}>
            <Icon className={`h-6 w-6 ${
              material.type === "video" ? "text-red-600" :
              material.type === "link" ? "text-blue-600" :
              material.type === "image" ? "text-green-600" :
              material.type === "presentation" ? "text-orange-600" :
              "text-purple-600"
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight">{material.title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{material.subject?.name}</p>
            <p className="text-xs text-muted-foreground">
              By {material.teacher?.user?.name}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {material.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{material.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="capitalize">{material.type}</span>
          {material.file?.size && <span>{formatFileSize(material.file.size)}</span>}
        </div>

        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {material.tags.slice(0, 4).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {material.tags.length > 4 && (
              <Badge variant="secondary" className="text-xs">+{material.tags.length - 4}</Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Download className="h-3 w-3" />
            {material.downloads || 0} downloads
          </span>
          <Button 
            size="sm" 
            onClick={handleDownload}
            disabled={downloading}
            className="gap-2"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : material.type === "link" ? (
              <ExternalLink className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {material.type === "link" ? "Open" : "Download"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subjectId: "", type: "", search: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [materialsRes, subjectsRes] = await Promise.all([
        fetch("/api/student/materials"),
        fetch("/api/admin/subjects?limit=1000")
      ]);
      const [materialsData, subjectsData] = await Promise.all([materialsRes.json(), subjectsRes.json()]);
      
      if (materialsRes.ok) setMaterials(materialsData.data?.materials || []);
      if (subjectsRes.ok) setSubjects(subjectsData.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (materialId) => {
    try {
      await fetch("/api/student/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId }),
      });
      // Refresh to update download count
      fetchData();
    } catch (err) {
      console.error("Failed to track download:", err);
    }
  };

  const filteredMaterials = materials.filter(m => {
    if (filters.subjectId && m.subject._id !== filters.subjectId) return false;
    if (filters.type && m.type !== filters.type) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return m.title.toLowerCase().includes(search) ||
             m.description?.toLowerCase().includes(search) ||
             m.tags?.some(tag => tag.toLowerCase().includes(search));
    }
    return true;
  });

  // Group by subject
  const groupedMaterials = filteredMaterials.reduce((acc, m) => {
    const subjectName = m.subject?.name || "Other";
    if (!acc[subjectName]) acc[subjectName] = [];
    acc[subjectName].push(m);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Study Materials</h1>
        <p className="text-muted-foreground">Access learning resources shared by your teachers</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                className="pl-9"
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
              />
            </div>

            <Select value={filters.subjectId} onValueChange={v => setFilters({...filters, subjectId: v})}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Subjects">All Subjects</SelectItem>
                {subjects.map(s => (
                  <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={v => setFilters({...filters, type: v})}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                {MATERIAL_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{filteredMaterials.length}</p>
            <p className="text-xs text-muted-foreground">Total Materials</p>
          </CardContent>
        </Card>
        {MATERIAL_TYPES.slice(0, 3).map(type => {
          const count = filteredMaterials.filter(m => m.type === type.value).length;
          return (
            <Card key={type.value}>
              <CardContent className="pt-6 text-center">
                <type.icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{type.label}s</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Materials by Subject */}
      {Object.keys(groupedMaterials).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filters.search || filters.subjectId || filters.type
                ? "No materials found matching your filters"
                : "No materials available yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedMaterials).map(([subjectName, subjectMaterials]) => (
          <div key={subjectName}>
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {subjectName} ({subjectMaterials.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subjectMaterials.map(material => (
                <MaterialCard
                  key={material._id}
                  material={material}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}