"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockStudyMaterials, mockSubjects } from "@/lib/mock-data";
import { 
  FileText, 
  Video, 
  FileIcon, 
  Download, 
  Search, 
  FolderOpen,
  Eye,
  Clock
} from "lucide-react";
import { toast } from "sonner";

export default function StudentMaterials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const filteredMaterials = mockStudyMaterials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || material.subjectId === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />;
      case "video":
        return <Video className="h-6 w-6 text-blue-500" />;
      case "ppt":
        return <FileIcon className="h-6 w-6 text-orange-500" />;
      default:
        return <FolderOpen className="h-6 w-6 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (fileType) => {
    switch (fileType) {
      case "pdf":
        return "PDF Document";
      case "video":
        return "Video";
      case "ppt":
        return "Presentation";
      default:
        return "File";
    }
  };

  const handleDownload = (material) => {
    toast.success("Download started", {
      description: `Downloading ${material.title}...`,
    });
  };

  const handlePreview = (material) => {
    toast.info("Preview", {
      description: `Opening preview for ${material.title}...`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Study Materials</h1>
        <p className="text-muted-foreground">Access course materials and resources</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border rounded-md bg-card text-foreground"
        >
          <option value="all">All Subjects</option>
          {mockSubjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-student/10">
                <FolderOpen className="h-6 w-6 text-student" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockStudyMaterials.length}</p>
                <p className="text-sm text-muted-foreground">Total Materials</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <FileText className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockStudyMaterials.filter((m) => m.fileType === "pdf").length}
                </p>
                <p className="text-sm text-muted-foreground">PDF Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Video className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockStudyMaterials.filter((m) => m.fileType === "video").length}
                </p>
                <p className="text-sm text-muted-foreground">Video Lectures</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Materials by Subject */}
      <Tabs defaultValue="all">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          {mockSubjects.slice(0, 5).map((subject) => (
            <TabsTrigger key={subject.id} value={subject.id}>
              {subject.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <MaterialsGrid materials={filteredMaterials} onDownload={handleDownload} onPreview={handlePreview} getFileIcon={getFileIcon} getFileTypeLabel={getFileTypeLabel} />
        </TabsContent>
        
        {mockSubjects.slice(0, 5).map((subject) => (
          <TabsContent key={subject.id} value={subject.id} className="mt-4">
            <MaterialsGrid 
              materials={filteredMaterials.filter((m) => m.subjectId === subject.id)} 
              onDownload={handleDownload} 
              onPreview={handlePreview}
              getFileIcon={getFileIcon}
              getFileTypeLabel={getFileTypeLabel}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function MaterialsGrid({ materials, onDownload, onPreview, getFileIcon, getFileTypeLabel }) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No materials found.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {materials.map((material) => (
        <Card key={material.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                {getFileIcon(material.fileType)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{material.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{material.description}</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <Badge variant="outline">{material.subjectName}</Badge>
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {material.downloads} downloads
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(material.uploadedAt).toLocaleDateString()}
              </span>
              <span>{getFileTypeLabel(material.fileType)}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onPreview(material)}>
                <Eye className="mr-1 h-3 w-3" />
                Preview
              </Button>
              <Button size="sm" className="flex-1" onClick={() => onDownload(material)}>
                <Download className="mr-1 h-3 w-3" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
