"use client";
// IMPORTENT

import { useState } from "react";
import {
  FileText,
  Scale,
  Cloud,
  BookOpen,
  Folder,
  FilePen,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { WorkspaceEditor } from "./workspace-editor";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { WorkspacesListProps } from "@/utils/helper";

// Deterministic icon + bg color based on workspace name
const ICONS = [Scale, BookOpen, Cloud, FileText, FilePen, Folder];
const ICON_COLORS = [
  "bg-stone-300",
  "bg-stone-200",
  "bg-lime-100",
  "bg-stone-300",
  "bg-stone-100",
  "bg-lime-100",
];

function getWorkspaceStyle(name: string) {
  const idx = name.charCodeAt(0) % ICONS.length;
  return { Icon: ICONS[idx], color: ICON_COLORS[idx] };
}

function formatRelativeTime(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function MemberAvatar({ initial, color }: { initial: string; color: string }) {
  return (
    <div
      className={`w-7 h-7 ${color} rounded-xl outline outline-2 outline-offset-[-2px] outline-stone-50 flex items-center justify-center -ml-2 first:ml-0`}
    >
      <span className="text-zinc-800 text-[10px] font-bold leading-4">
        {initial}
      </span>
    </div>
  );
}

interface ExtendedListProps extends WorkspacesListProps {
  title: string;
}

export function WorkspacesList({
  workspaces,
  currentUser,
  createWorkSpace,
  title,
  onOpenWorkspace,
}: ExtendedListProps) {
  const [items, setItems] = useState(workspaces);

  // Sync when parent prop changes (search filter)
  useEffect(() => {
    setItems(workspaces);
  }, [workspaces]);

  const deleteWorkSpace = async (id: string) => {
    try {
      const res = await fetch(`/api/workspace?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Error in Deleting");
      }
      setItems((prev) => prev.filter((ws) => ws._id !== String(id)));
    } catch (e) {
      if (e instanceof Error) throw new Error(e.message);
      throw new Error("Uncertain about Error");
    }
  };

  const AVATAR_COLORS = [
    "bg-neutral-200",
    "bg-lime-100",
    "bg-stone-300",
    "bg-stone-200",
  ];

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }}>
      {items.length > 0 ? (
        <div className="flex flex-col divide-y divide-neutral-200">
          {items.map((workspace, idx) => {
            const { Icon, color } = getWorkspaceStyle(workspace.name);
            const visibleMembers = workspace.members.slice(0, 2);
            const extraCount = workspace.members.length - 2;

            return (
              <div
                key={workspace._id || idx}
                onClick={() =>
                  onOpenWorkspace ? onOpenWorkspace(workspace) : null
                }
                className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors ${
                  idx > 0 ? "border-t border-neutral-400/20" : ""
                }`}
              >
                {/* Left: icon + info */}
                <div className="flex items-center gap-6">
                  <div
                    className={`w-10 h-10 ${color} rounded flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-stone-600" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-800 text-base font-medium leading-6">
                      {workspace.name}
                    </span>
                    <span className="text-stone-600 text-xs font-normal leading-4">
                      Last edited {formatRelativeTime(workspace.lastModified)} •{" "}
                      {workspace.documents?.length ?? 0} files
                    </span>
                  </div>
                </div>

                {/* Right: member avatars + delete menu */}
                <div
                  className="flex items-center gap-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Avatars */}
                  <div className="flex items-center">
                    {visibleMembers.map((m: any, i: number) => (
                      <MemberAvatar
                        key={m._id || i}
                        initial={(m.email?.[0] ?? "?").toUpperCase()}
                        color={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                      />
                    ))}
                    {extraCount > 0 && (
                      <MemberAvatar
                        initial={`+${extraCount}`}
                        color={AVATAR_COLORS[2]}
                      />
                    )}
                  </div>

                  {/* Delete dropdown (owner only) */}
                  {workspace.owner === currentUser.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-stone-500 hover:text-zinc-800"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer text-red-600"
                          onClick={async () => {
                            await deleteWorkSpace(workspace._id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border-2 border-dashed border-zinc-300 rounded-xl py-12 flex flex-col items-center gap-4 bg-stone-50">
          <FileText className="w-10 h-10 text-stone-300" />
          <div className="text-center">
            <p className="text-zinc-800 font-semibold text-sm">
              No workspaces yet
            </p>
            <p className="text-stone-600 text-xs mt-1">
              Create your first workspace to start collaborating
            </p>
          </div>
          <button
            onClick={createWorkSpace}
            className="text-sm font-semibold text-zinc-800 bg-stone-200 hover:bg-stone-300 px-4 py-2 rounded-lg transition-colors"
          >
            Create Workspace
          </button>
        </div>
      )}
    </div>
  );
}
