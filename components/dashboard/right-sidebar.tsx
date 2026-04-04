"use client";

import { useState } from "react";
import { Search, FileText } from "lucide-react";
import { TEMPLATES, type Template } from "@/app/templates/templates";

const F = "'Manrope', sans-serif";

interface RightSidebarProps {
  view?: string;
  onSelectTemplate?: (template: Template) => void;
  selectedTemplate?: Template | null;
  onSelectFile?: (file: File | null) => void;
  selectedFile?: File | null;
}

export function RightSidebar({ view, onSelectTemplate, selectedTemplate, onSelectFile, selectedFile }: RightSidebarProps) {
  const isCreateMenu = view === "create-workspace";
  const [search, setSearch] = useState("");

  const filtered = TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      className="w-[288px] shrink-0 h-screen sticky top-0 flex flex-col overflow-hidden"
      style={{
        fontFamily: F,
        margin: "12px 12px 12px 0",
        height: "calc(100vh - 24px)",
        ...(isCreateMenu ? {} : {
          background: "#D9E8C4",
          borderRadius: "20px",
          border: "1.5px solid #c8d9b4",
        })
      }}
    >
      {isCreateMenu ? (
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          {/* Templates Section - Top Card */}
          <div 
            className="flex flex-col gap-4 flex-1 overflow-hidden p-6"
            style={{ background: "#D9E8C4", borderRadius: "12px" }}
          >
            <h2 className="text-zinc-800 font-bold leading-7 shrink-0 text-lg" style={{ fontFamily: F }}>
              Templates
            </h2>

            {/* Search */}
            <div className="border-b border-neutral-400/20 pb-2 flex items-center gap-2 shrink-0">
              <Search className="w-3 h-3 text-stone-600/40 shrink-0" />
              <input
                className="w-full bg-transparent text-gray-500 text-xs font-normal outline-none placeholder:text-gray-500"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontFamily: F }}
              />
            </div>

            {/* Template List */}
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
              {filtered.length === 0 && (
                <p className="text-stone-600/50 text-xs text-center py-4" style={{ fontFamily: F }}>
                  No templates found.
                </p>
              )}
              {filtered.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => onSelectTemplate?.(template)}
                    className={`w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors border ${
                      isSelected
                        ? "bg-white border-stone-400 shadow-sm"
                        : "bg-white/40 border-transparent hover:bg-white/70"
                    }`}
                  >
                    <div className="w-8 h-8 bg-stone-200 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-stone-600" />
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span
                        className="text-zinc-800 text-xs font-semibold leading-4 truncate"
                        style={{ fontFamily: F }}
                      >
                        {template.name.replace(".pdf", "")}
                      </span>
                      <span
                        className="text-stone-600/70 text-[10px] font-normal leading-4 line-clamp-2"
                        style={{ fontFamily: F }}
                      >
                        {template.description}
                      </span>
                      <span
                        className="text-stone-500 text-[9px] font-bold uppercase tracking-wide"
                        style={{ fontFamily: F }}
                      >
                        {template.category}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-stone-600 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Docs Section - Bottom Card */}
          <div 
            className="flex flex-col gap-3 shrink-0 p-6 relative"
            style={{ background: "#D9E8C4", borderRadius: "12px" }}
          >
            <h2 className="text-stone-600 text-xs font-medium uppercase leading-5 tracking-wide" style={{ fontFamily: F }}>
              UPLOAD DOCS
            </h2>
            <label className={`w-full rounded-lg border border-dashed border-neutral-400/50 py-8 px-4 flex flex-col items-center gap-1.5 hover:bg-white/40 transition-colors cursor-pointer ${selectedFile ? "bg-white/40" : ""}`}>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onSelectFile?.(e.target.files[0]);
                  }
                }}
              />
              <span className="text-stone-600 text-sm font-medium text-center leading-5 line-clamp-1" style={{ fontFamily: F }}>
                {selectedFile ? selectedFile.name : "Drag files here or click to browse"}
              </span>
              <span className="text-neutral-400/70 text-[10px] font-normal leading-4" style={{ fontFamily: F }}>
                {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "Support PDF, DOCX, TXT up to 25MB"}
              </span>
            </label>
            {selectedFile && (
              <button 
                onClick={() => onSelectFile?.(null)}
                className="absolute top-6 right-6 text-stone-500 hover:text-stone-800"
              >
                ×
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="px-6 pt-7 pb-4">
            <h2 className="text-stone-600 text-sm font-extrabold uppercase leading-4 tracking-widest">
              Notification
            </h2>
          </div>
          <div className="flex-1" />
        </>
      )}
    </aside>
  );
}
