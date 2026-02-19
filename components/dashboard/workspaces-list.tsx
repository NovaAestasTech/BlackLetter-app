"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  Clock,
  ArrowRight,
  MoreVertical,
  Trash2,
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
  const [Workspaces, setWorkspaces] = useState(workspaces);
  if (selectedWorkspace) {
    return (
      <WorkspaceEditor
        workspace={selectedWorkspace}
        currentUser={currentUser}
        onBack={() => setSelectedWorkspace(null)}
      />
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  const deleteWorkSpace = async (id: string) => {
    try {
      const res = await fetch(`/api/workspace?id=${id}`, {
        method: "DELETE",
      });
      setWorkspaces((prev) => prev.filter((ws) => ws._id != id));
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Uncertain about Error");
    }
  };

  return (
    <div>
      {Workspaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Workspaces.map((workspace) => (
            <Card
              key={workspace._id}
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-slate-200 bg-white cursor-pointer hover:border-blue-300"
              onClick={() => setSelectedWorkspace(workspace)}
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 h-20 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                    {getInitials(workspace.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {workspace.name}
                    </h3>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWorkSpace(workspace._id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardContent className="pt-5 pb-5 space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {workspace.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">
                      {workspace.members.length} member
                      {workspace.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>
                      Modified{" "}
                      {new Date(workspace.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedWorkspace(workspace)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all group-hover:shadow-lg"
                  size="sm"
                >
                  Open Workspace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-slate-300 bg-slate-50">
          <CardContent className="pt-12 pb-12 text-center space-y-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <p className="text-slate-900 font-semibold">No workspaces yet</p>
              <p className="text-slate-600 text-sm mt-1">
                Create your first workspace to start collaborating
              </p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={createWorkSpace}
            >
              Create Workspace
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
