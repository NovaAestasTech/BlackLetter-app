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
            className="relative border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer group"
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
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
            <p className="font-semibold text-slate-900 mb-1">
              Drop file here or click to browse
            </p>
            <p className="text-xs text-slate-500">PDF or DOCX up to 10MB</p>
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <Card className="bg-blue-50 border-blue-200 p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {selectedFile.name}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* File Title Input */}
          <div>
            <label className="text-sm font-medium text-slate-900 mb-2 block">
              Document Title
            </label>
            <Input
              placeholder="e.g., Service Agreement Draft"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
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
              className="gap-2 bg-blue-600 hover:bg-blue-700"
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
