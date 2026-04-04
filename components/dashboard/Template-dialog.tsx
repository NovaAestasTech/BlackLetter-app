"use client";
// IMPORTENT

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
      <DialogContent 
        className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden bg-white border-0 shadow-2xl rounded-2xl p-0 gap-0"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle className="text-zinc-800 font-extrabold text-xl tracking-tight">Choose a Template</DialogTitle>
          <DialogDescription className="text-stone-500 font-medium tracking-wide">
            Select a template to start your document with pre-filled content and
            structure
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 gap-3 p-6 pt-2">
            {TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all border rounded-xl overflow-hidden ${
                selectedTemplate?.id === template.id
                  ? "border-zinc-800 border-2 bg-stone-50 shadow-sm"
                  : "border-stone-200 hover:border-zinc-400 hover:shadow-md bg-white opacity-80 hover:opacity-100"
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <div className="bg-stone-200 p-3 rounded-xl flex-shrink-0">
                    <FileText className="w-6 h-6 text-stone-600" />
                  </div>
                  <div className="flex-1 mt-0.5">
                    <h3 className="font-bold text-zinc-800">
                      {template.name}
                    </h3>
                    <p className="text-sm text-stone-500 mt-1 font-medium">
                      {template.description}
                    </p>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <div className="flex-shrink-0 bg-zinc-800 rounded-full p-1 mt-1 shadow-md">
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
        </div>

        <div className="flex gap-3 justify-end p-6 pt-5 border-t border-stone-200 shrink-0 bg-white">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-stone-300 text-stone-600 hover:bg-stone-100 font-semibold rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTemplate}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
          >
            Use Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
