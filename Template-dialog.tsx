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
                  ? "border-primary border-2 bg-primary/10"
                  : "border-border hover:border-primary/40 hover:shadow-md"
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/15 p-3 rounded-lg flex-shrink-0">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <div className="flex-shrink-0 bg-primary rounded-full p-1">
                      <svg
                        className="w-5 h-5 text-primary-foreground"
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

        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTemplate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
