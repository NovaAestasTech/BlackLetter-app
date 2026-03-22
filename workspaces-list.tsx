"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  MoreVertical,
  Trash2,
  Plus,
} from "lucide-react";
import { WorkspaceEditor } from "./workspace-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { WorkspacesListProps } from "@/utils/helper";
export function WorkspacesList({
  workspaces,
  currentUser,
  createWorkSpace,
}: WorkspacesListProps) {
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  if (selectedWorkspace) {
    return (
      <WorkspaceEditor
        workspace={selectedWorkspace}
        currentUser={currentUser}
        onBack={() => setSelectedWorkspace(null)}
      />
    );
  }

  const deleteWorkSpace = async (id: string) => {
    try {
      const res = await fetch(`/api/workspace?id=${id}`, {
        method: "DELETE",
      });
      window.location.reload();
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Uncertain about Error");
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* New Workspace Card */}
      <button
        onClick={createWorkSpace}
        className="group border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-secondary/50 transition-all duration-200 min-h-[180px] cursor-pointer"
      >
        <div className="w-12 h-12 rounded-lg border-2 border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
          <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
        </div>
        <span className="text-sm text-muted-foreground group-hover:text-primary font-medium">
          New Workspace
        </span>
      </button>

      {/* Workspace Cards */}
      {workspaces.map((workspace) => (
        <div
          key={workspace._id}
          onClick={() => setSelectedWorkspace(workspace)}
          className="group bg-card border border-border rounded-xl p-5 hover:border-muted-foreground/30 hover:bg-secondary/40 transition-all duration-200 cursor-pointer min-h-[180px] flex flex-col"
        >
          {/* Top Row: Icon + Menu */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
              <FileText className="w-4 h-4" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-card border-border">
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWorkSpace(workspace._id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Workspace Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-[15px] mb-1.5">
              {workspace.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {workspace.description || "No description"}
            </p>
          </div>

          {/* Bottom Row: Stats */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileText className="w-3 h-3" />
              <span>{workspace.documents?.length || 0} docs</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(workspace.lastModified)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
