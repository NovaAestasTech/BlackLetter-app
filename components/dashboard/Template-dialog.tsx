"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TEMPLATES, type Template } from "@/app/templates/templates";
import { FileText } from "lucide-react";
import { useStore } from "@/store/useStore";
import { TemplatesDialogProps } from "@/utils/helper";

export function TemplatesDialog({
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplatesDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };
  const fetchPdfData = useStore((state) => state.fetchPdfData);

  const handleConfirm = async () => {
    if (selectedTemplate) {
      await fetchPdfData(selectedTemplate.name);
      onSelectTemplate(selectedTemplate);

      setSelectedTemplate(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Select a template to start your document with pre-filled content and
            structure
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 py-4">
          {TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate?.id === template.id
                  ? "border-blue-500 border-2 bg-blue-50"
                  : "border-slate-200 hover:border-blue-300 hover:shadow-md"
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {template.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {template.description}
                    </p>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <div className="flex-shrink-0 bg-blue-500 rounded-full p-1">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTemplate}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
