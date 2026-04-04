"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";


// ─── Types ───────────────────────────────────────────────────────────────────
interface AllWorkspacesViewProps {
  workspaces: any[];
  currentUser: any;
  onCreateWorkspace: () => void;
  onOpenWorkspace?: (workspace: any) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatRelativeTime(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Derive a status from workspace data (active vs draft based on member count)
function getStatus(ws: any) {
  if (ws.locked) return "LOCKED";
  if (ws.members?.length > 1) return "ACTIVE";
  if (ws.documents?.length > 0) return "ACTIVE";
  return "DRAFT";
}

function getStatusPill(status: string) {
  if (status === "ACTIVE")
    return (
      <span className="px-2 py-0.5 bg-stone-300 rounded-sm text-stone-600 text-[10px] font-bold uppercase tracking-wide">
        Active
      </span>
    );
  if (status === "LOCKED")
    return (
      <span className="px-2 py-0.5 bg-red-400/20 rounded-sm text-orange-800 text-[10px] font-bold uppercase tracking-wide">
        Locked
      </span>
    );
  return (
    <span className="px-2 py-0.5 bg-stone-200 rounded-sm text-stone-600 text-[10px] font-bold uppercase tracking-wide">
      Draft
    </span>
  );
}

// Dot color based on status
function getDotColor(status: string) {
  if (status === "LOCKED") return "bg-orange-800";
  if (status === "DRAFT") return "bg-neutral-400";
  return "bg-stone-600";
}

// Owner: first member's email username or "—"
function getOwnerName(ws: any) {
  if (!ws.members || ws.members.length === 0) return "—";
  const owner = ws.members.find((m: any) => m.role === "owner") || ws.members[0];
  return (owner.email?.split("@")[0] ?? "—");
}

// ─── Component ───────────────────────────────────────────────────────────────
const F = "'Manrope', sans-serif";

export function AllWorkspacesView({
  workspaces,
  currentUser,
  onCreateWorkspace,
  onOpenWorkspace,
}: AllWorkspacesViewProps) {
  const [filter, setFilter] = useState<"my" | "all">("all");
  const [searchLocal, setSearchLocal] = useState("");

  const filtered = useMemo(() => {
    let result = workspaces;
    if (filter === "my") result = result.filter((ws) => ws.owner === currentUser.id);
    if (searchLocal.trim()) result = result.filter((ws) => ws.name.toLowerCase().includes(searchLocal.toLowerCase()));
    return result;
  }, [workspaces, filter, currentUser.id, searchLocal]);


  return (
    <div
      className="flex-1 h-screen flex flex-col overflow-hidden"
      style={{ fontFamily: F }}
    >
      {/* ── Search bar ─────────────────────────────────────────── */}
      <div className="px-10 pt-5 pb-0 shrink-0">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-stone-100 rounded-2xl border border-zinc-300">
          <Search className="w-4 h-4 text-stone-600 shrink-0" />
          <input
            className="flex-1 bg-transparent outline-none text-sm text-zinc-800 placeholder:text-stone-500/70 font-normal"
            placeholder="Search workspaces..."
            value={searchLocal}
            onChange={(e) => setSearchLocal(e.target.value)}
            style={{ fontFamily: F }}
          />
        </div>
      </div>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-10 pt-5 pb-0 shrink-0">
        {/* Title row */}
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <h1
              className="text-zinc-800 font-bold leading-10"
              style={{ fontSize: "40px", fontFamily: F }}
            >
              All Workspaces
            </h1>
            <p className="text-stone-600/70 text-base font-normal leading-6">
              Manage and organize your editorial environments.
            </p>
          </div>
          <button
            onClick={onCreateWorkspace}
            className="flex items-center gap-2 px-6 py-2.5 bg-stone-600 hover:bg-stone-700 transition-colors rounded-md"
          >
            <Plus className="w-2.5 h-2.5 text-orange-50 shrink-0" />
            <span className="text-orange-50 text-sm font-medium" style={{ fontFamily: F }}>
              Create Workspace
            </span>
          </button>
        </div>

        {/* ── Filter / Sort row ───────────────────────────────── */}
        <div className="mt-6 pb-3 border-b border-neutral-400/10 flex items-center gap-8">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <span className="text-stone-600 text-[10px] font-normal uppercase leading-4 tracking-wide">
              Filter
            </span>
            <button
              onClick={() => setFilter(filter === "my" ? "all" : "my")}
              className="text-stone-600 text-sm font-medium leading-5 hover:text-zinc-800 transition-colors"
            >
              {filter === "my" ? "My Workspace" : "All Workspaces"}
            </button>
          </div>
          {/* Sort (non-functional visual) */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-600 text-[10px] font-normal uppercase leading-4 tracking-wide">
              Sort by
            </span>
            <span className="text-stone-600 text-sm font-medium leading-5">
              Last Accessed
            </span>
          </div>
        </div>

        {/* ── Table header ────────────────────────────────────── */}
        <div className="flex items-center mt-0 pt-1 pb-2">
          <div className="w-96 px-px pt-1 pb-1">
            <span className="text-stone-600/50 text-[10px] font-medium uppercase tracking-wide">
              Name
            </span>
          </div>
          <div className="w-64 px-px pt-1 pb-1">
            <span className="text-stone-600/50 text-[10px] font-medium uppercase tracking-wide">
              Owner
            </span>
          </div>
          <div className="w-28 px-px pt-1 pb-1">
            <span className="text-stone-600/50 text-[10px] font-medium uppercase tracking-wide">
              Status
            </span>
          </div>
          <div className="flex-1 px-px pt-1 pb-1 text-right">
            <span className="text-stone-600/50 text-[10px] font-medium uppercase tracking-wide">
              Last Edited
            </span>
          </div>
        </div>
      </div>

      {/* ── Scrollable table rows ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0 px-10 pb-6">
        {filtered.length > 0 ? (
          <div className="flex flex-col">
            {filtered.map((ws, idx) => {
              const status = getStatus(ws);
              return (
                <div
                  key={ws._id || idx}
                  onClick={() => onOpenWorkspace ? onOpenWorkspace(ws) : null}
                  className={`flex items-center cursor-pointer hover:bg-stone-50/80 transition-colors py-4 ${
                    idx > 0 ? "border-t border-neutral-400/10" : ""
                  }`}
                >
                  {/* Name */}
                  <div className="w-96 flex items-center gap-4 pl-px">
                    <div className={`w-2 h-2 ${getDotColor(status)} rounded-full shrink-0`} />
                    <span className="text-zinc-800 text-base font-medium" style={{ fontFamily: F }}>
                      {ws.name}
                    </span>
                  </div>
                  {/* Owner */}
                  <div className="w-64 px-4">
                    <span className="text-stone-600 text-base font-normal capitalize" style={{ fontFamily: F }}>
                      {getOwnerName(ws)}
                    </span>
                  </div>
                  {/* Status */}
                  <div className="w-28">{getStatusPill(status)}</div>
                  {/* Last Edited */}
                  <div className="flex-1 text-right pr-1">
                    <span className="text-stone-600 text-base font-normal" style={{ fontFamily: F }}>
                      {formatRelativeTime(ws.lastModified)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* End of list element */}
        <div className="mt-4 py-10 rounded-lg border border-neutral-400/20 flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-neutral-400/30 rounded-md flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-neutral-400" stroke="currentColor" strokeWidth={1.5}>
              <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <p className="text-stone-600/50 text-base font-normal leading-6" style={{ fontFamily: F }}>
            End of workspace list.
          </p>
        </div>
      </div>
    </div>
  );
}
