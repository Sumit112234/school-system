"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileJson,
  Users,
  Download,
  Copy,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function BulkStudentUploadPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const sampleData = {
    students: [
      {
        name: "John Doe",
        email: "john.doe@school.com",
        password: "student123",
        phone: "+91-9876543210",
        dateOfBirth: "2010-03-15",
        gender: "male",
        address: "123 Main Street, City",
        studentId: "STU2024001",
        rollNumber: "001",
        section: "A",
        parentName: "Jane Doe",
        parentPhone: "+91-9876543211",
        parentEmail: "jane.doe@email.com",
        bloodGroup: "O+",
        emergencyContact: "+91-9876543212",
        isActive: true
      },
      {
        name: "Sarah Smith",
        email: "sarah.smith@school.com",
        password: "student123",
        phone: "+91-9876543220",
        dateOfBirth: "2010-05-22",
        gender: "female",
        address: "456 Oak Avenue, City",
        studentId: "STU2024002",
        rollNumber: "002",
        section: "A",
        parentName: "Mike Smith",
        parentPhone: "+91-9876543221",
        parentEmail: "mike.smith@email.com",
        bloodGroup: "A+",
        emergencyContact: "+91-9876543222",
        isActive: true
      }
    ]
  };

  const handleLoadSample = () => {
    setJsonInput(JSON.stringify(sampleData, null, 2));
    setResult(null);
    setError(null);
  };

  const handleCopySample = async () => {
    await navigator.clipboard.writeText(JSON.stringify(sampleData, null, 2));
  };

  const validateAndParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      if (!parsed.students || !Array.isArray(parsed.students)) {
        throw new Error("JSON must contain a 'students' array");
      }

      if (parsed.students.length === 0) {
        throw new Error("Students array cannot be empty");
      }

      if (parsed.students.length > 100) {
        throw new Error("Cannot upload more than 100 students at once");
      }

      // Basic validation for required fields
      const missingFields = [];
      parsed.students.forEach((student, index) => {
        if (!student.name || !student.email || !student.password) {
          missingFields.push(index);
        }
      });

      if (missingFields.length > 0) {
        throw new Error(
          `Students at indices [${missingFields.join(", ")}] are missing required fields (name, email, password)`
        );
      }

      return parsed;
    } catch (err) {
      throw new Error(`Invalid JSON: ${err.message}`);
    }
  };

  const handleUpload = async () => {
    setError(null);
    setResult(null);

    try {
      const data = validateAndParse();
      
      setUploading(true);

      const res = await fetch("/api/admin/users/bulk-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok && res.status !== 207) {
        throw new Error(responseData?.message ?? "Failed to upload students");
      }

      setResult(responseData.data);
      
      // Clear input on full success
      if (responseData.data.failed.length === 0) {
        setJsonInput("");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadResults = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upload-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bulk Student Upload</h1>
        <p className="text-muted-foreground">
          Upload multiple students at once by pasting JSON data
        </p>
      </div>

      {/* Instructions */}
      <Alert>
        <FileJson className="h-4 w-4" />
        <AlertTitle>How to use</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Paste your student data in JSON format below</li>
            <li>Click "Load Sample" to see the expected format</li>
            <li>Maximum 100 students per upload</li>
            <li>Required fields: name, email, password</li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Paste Student Data
            </CardTitle>
            <CardDescription>
              Paste your JSON data containing student information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="json-input">JSON Data</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopySample}
                    className="gap-1 text-xs"
                  >
                    <Copy className="h-3 w-3" />
                    Copy Sample
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSample}
                    className="gap-1 text-xs"
                  >
                    <FileJson className="h-3 w-3" />
                    Load Sample
                  </Button>
                </div>
              </div>
              <Textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{\n  "students": [\n    {\n      "name": "Student Name",\n      "email": "student@school.com",\n      "password": "password123",\n      ...\n    }\n  ]\n}'
                className="font-mono text-xs h-96 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {jsonInput ? `${jsonInput.split('\n').length} lines` : "No data"}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleUpload}
              disabled={!jsonInput || uploading}
              className="w-full gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Students
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Upload Results
            </CardTitle>
            <CardDescription>
              Summary of the upload operation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No upload results yet. Paste your data and click upload.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <p className="text-2xl font-bold">{result.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {result.successful.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Success</p>
                  </div>
                  <div className="rounded-lg border bg-red-50 dark:bg-red-950/20 p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {result.failed.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleDownloadResults}
                >
                  <Download className="h-4 w-4" />
                  Download Results
                </Button>

                {/* Successful Students */}
                {result.successful.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <h4 className="text-sm font-semibold">
                        Successfully Created ({result.successful.length})
                      </h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg border p-3">
                      {result.successful.map((s) => (
                        <div
                          key={s.index}
                          className="flex items-center justify-between text-sm p-2 rounded bg-green-50 dark:bg-green-950/20"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{s.user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {s.user.email}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0 ml-2">
                            {s.studentId}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failed Students */}
                {result.failed.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <h4 className="text-sm font-semibold">
                        Failed ({result.failed.length})
                      </h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg border p-3">
                      {result.failed.map((f) => (
                        <div
                          key={f.index}
                          className="text-sm p-2 rounded bg-red-50 dark:bg-red-950/20"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium">
                              Index {f.index}: {f.student?.name || "Unknown"}
                            </p>
                            <Badge variant="destructive" className="shrink-0 text-xs">
                              Error
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {f.student?.email || "No email"}
                          </p>
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {f.error}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Format Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">JSON Format Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Required Fields</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• name (string)</li>
                <li>• email (string, unique)</li>
                <li>• password (string, min 6 chars)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Optional Fields</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• phone, dateOfBirth, gender, address</li>
                <li>• studentId, rollNumber, section</li>
                <li>• parentName, parentPhone, parentEmail</li>
                <li>• bloodGroup (A+, A-, B+, B-, AB+, AB-, O+, O-)</li>
                <li>• emergencyContact, admissionDate</li>
                <li>• classId (MongoDB ObjectId), subjects (array)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}