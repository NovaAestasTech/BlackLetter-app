"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  {
    id: "1",
    name: "Service Agreement",
    category: "Commercial",
    description: "Standard service agreement template for B2B services",
    color: "from-blue-500 to-blue-600",
    icon: "📋",
  },
  {
    id: "2",
    name: "NDA",
    category: "Legal",
    description: "Non-Disclosure Agreement for confidential information",
    color: "from-purple-500 to-purple-600",
    icon: "🔒",
  },
  {
    id: "3",
    name: "Employment Contract",
    category: "HR",
    description: "Full-time employment contract template",
    color: "from-emerald-500 to-emerald-600",
    icon: "👔",
  },
  {
    id: "4",
    name: "Independent Contractor Agreement",
    category: "Legal",
    description: "Agreement for independent contractors and freelancers",
    color: "from-orange-500 to-orange-600",
    icon: "🤝",
  },
  {
    id: "5",
    name: "Terms of Service",
    category: "Legal",
    description: "Standard terms of service for digital products",
    color: "from-red-500 to-red-600",
    icon: "⚖️",
  },
  {
    id: "6",
    name: "Vendor Agreement",
    category: "Commercial",
    description: "Agreement template for vendor relationships",
    color: "from-indigo-500 to-indigo-600",
    icon: "🏢",
  },
];

interface TemplatesListProps {
  searchQuery?: string;
  onUseTemplate?: (template: any) => void;
}

export function TemplatesList({
  searchQuery = "",
  onUseTemplate,
}: TemplatesListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(TEMPLATES.map((t) => t.category)));

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "rounded-full",
            selectedCategory === null
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "border-slate-300 hover:border-slate-400 text-slate-700",
          )}
        >
          All Templates
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "rounded-full",
              selectedCategory === category
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "border-slate-300 hover:border-slate-400 text-slate-700",
            )}
          >
            <Tag className="w-3 h-3 mr-1.5" />
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-slate-200 bg-white cursor-pointer hover:border-blue-300"
            >
              <div
                className={cn(
                  "bg-gradient-to-br h-24 flex items-center justify-center text-4xl transition-transform group-hover:scale-105",
                  template.color,
                )}
              >
                {template.icon}
              </div>

              <CardContent className="pt-5 pb-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                        {template.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {template.description}
                  </p>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all group-hover:shadow-lg"
                  size="sm"
                  onClick={() => onUseTemplate?.(template)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No templates found</p>
            <p className="text-slate-500 text-sm">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
