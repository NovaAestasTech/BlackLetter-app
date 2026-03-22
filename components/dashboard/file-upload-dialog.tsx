"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

import { FileUploadDialogProps } from "@/utils/helper";

export function FileUploadDialog({
  open,
  onOpenChange,
  onFileUpload,
}: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileTitle, setFileTitle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const supportedFormats = [".pdf", ".docx", ".doc"];
  const maxFileSize = 10 * 1024 * 1024;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // Validate file type
    const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!supportedFormats.includes(fileExt)) {
      setError("Please upload a PDF or DOCX file");
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    // Auto-fill title from filename
    setFileTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileTitle.trim()) {
      setError("Please select a file and enter a title");
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onFileUpload(selectedFile, fileTitle);
      setSelectedFile(null);
      setFileTitle("");
      setError("");
      onOpenChange(false);
    } catch (err) {
      setError("Failed to upload file");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Legal Document</DialogTitle>
          <DialogDescription>
            Upload a PDF or DOCX file to start editing and collaborating
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          <div
            className="relative border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer group"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isProcessing}
            />
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
            <p className="font-semibold text-foreground mb-1">
              Drop file here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">PDF or DOCX up to 10MB</p>
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <Card className="bg-primary/10 border-primary/20 p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {selectedFile.name}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* File Title Input */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Document Title
            </label>
            <Input
              placeholder="e.g., Service Agreement Draft"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              disabled={isProcessing}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedFile(null);
                setFileTitle("");
                setError("");
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !fileTitle.trim() || isProcessing}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
