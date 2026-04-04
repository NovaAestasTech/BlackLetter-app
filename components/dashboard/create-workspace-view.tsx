"use client";

import { useState, useEffect } from "react";

const F = "'Manrope', sans-serif";

interface CreateWorkspaceViewProps {
  onCreate: (data: { name: string; description: string }) => void;
  prefilledName?: string;
}

export function CreateWorkspaceView({ onCreate, prefilledName }: CreateWorkspaceViewProps) {
  const [name, setName] = useState(prefilledName ?? "");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (prefilledName) setName(prefilledName);
  }, [prefilledName]);

  return (
    <main className="flex-1 min-w-0 h-screen flex flex-col overflow-hidden bg-stone-50">
      <div className="flex-1 overflow-y-auto px-10 md:px-32 pt-16 pb-24 flex flex-col items-start transition-all">
        <div className="w-full max-w-[768px] flex flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-zinc-800 text-3xl font-bold leading-9" style={{ fontFamily: F }}>
              Create Workspace
            </h1>
            <p className="text-stone-600 text-sm font-normal leading-6" style={{ fontFamily: F }}>
              Establish a new environment for your team&apos;s projects and collective<br />focus.
            </p>
          </div>

          {/* Form Area */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="text-stone-600/40 text-[10px] font-bold uppercase leading-4 tracking-wide" style={{ fontFamily: F }}>01</span>
              <span className="text-stone-600 text-sm font-semibold uppercase leading-5 tracking-wide" style={{ fontFamily: F }}>Workspace Info</span>
            </div>

            <div className="p-8 bg-white rounded-lg border border-neutral-400/10 flex flex-col gap-8 shadow-sm">
              <div className="flex flex-col gap-1">
                <label className="text-stone-600 text-[10px] font-bold uppercase leading-4 tracking-wide" style={{ fontFamily: F }}>
                  Workspace Name
                </label>
                <div className="border-b border-neutral-400/30 overflow-hidden">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Autumn Design Sprint"
                    className="w-full px-3 py-3.5 bg-transparent outline-none text-zinc-800 text-lg font-normal placeholder:text-neutral-400/50"
                    style={{ fontFamily: F }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-stone-600 text-[10px] font-bold uppercase leading-4 tracking-wide" style={{ fontFamily: F }}>
                  Description
                </label>
                <div className="border-b border-neutral-400/30 overflow-hidden">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly define the purpose..."
                    className="w-full px-3 pt-3 pb-8 bg-transparent outline-none resize-none text-zinc-800 text-sm font-normal placeholder:text-neutral-400/50"
                    style={{ fontFamily: F }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                if (name.trim()) {
                  onCreate({ name, description });
                }
              }}
              disabled={!name.trim()}
              className="px-10 py-4 bg-stone-600 hover:bg-stone-700 transition-colors rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-orange-50 text-sm font-bold leading-5" style={{ fontFamily: F }}>
                Create Workspace
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
