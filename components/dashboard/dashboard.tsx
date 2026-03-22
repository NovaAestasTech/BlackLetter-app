"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { WorkspacesList } from "./workspaces-list";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { LogOut, Plus, Search } from "lucide-react";

import { WorkSpace } from "@/utils/helper";
import { DashboardProps } from "@/utils/helper";
export function Dashboard({ user, onLogout }: DashboardProps) {
  const [workspaces, setWorkspaces] = useState<WorkSpace[]>([]);
  const [personalWorkSpace, setPersonalWorksSpace] = useState<WorkSpace[]>([]);
  const [sharedWorkSpace, setsharedWorksSpace] = useState<WorkSpace[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const workspaces = async () => {
      try {
        const data = await fetch("/api/workspace", {
          method: "GET",
        });
        const res = await data.json();

        setWorkspaces(res);
        const shared = res.filter((ws: WorkSpace) => ws.sharewith.length > 0);
        setsharedWorksSpace(shared);
        const pershared = res.filter(
          (ws: WorkSpace) => ws.sharewith?.length == 0,
        );
        setPersonalWorksSpace(pershared);
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(e.message);
        }
        throw new Error("Unknown error occurred");
      }
    };
    workspaces();
  }, []);

  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  const addNewWorkSpace = async (workspace: WorkSpace) => {
    try {
      const res = await fetch("api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workspace),
      });
      const data = await res.json();
      return data;
    } catch (e) {
      throw new Error("Workspace can't be created");
    }
  };
  const handleCreateWorkspace = async (data: any) => {
    const newWorkspace: WorkSpace = {
      name: data.name,
      description: data.description,
      createdAt: new Date().toISOString(),
      owner: user.id,
      members: [user.id],
      documents: [],
      sharewith: [],
      lastModified: new Date().toISOString(),
    };
    setPersonalWorksSpace([newWorkspace, ...personalWorkSpace]);
    await addNewWorkSpace(newWorkspace);
    setShowCreateWorkspace(false);
  };

  const currentWorkspaces = activeTab === "all" ? sharedWorkSpace : personalWorkSpace;
  const filteredWorkspaces = searchQuery
    ? currentWorkspaces.filter((ws) =>
        ws.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentWorkspaces;

  const totalCount = currentWorkspaces.length;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Professional Nav Bar */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-primary"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="6" fill="currentColor" fillOpacity="0.12" />
              <text x="6" y="24" fill="currentColor" fontSize="20" fontWeight="bold" fontFamily="Georgia, serif">B.</text>
            </svg>
            <span className="font-semibold text-lg tracking-tight text-foreground ml-1">BlackLetter</span>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-medium text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background">
                  {getInitials(user.name)}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  className="text-muted-foreground cursor-pointer focus:bg-secondary focus:text-foreground hover:text-foreground flex items-center gap-2"
                  onClick={onLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title Row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Workspaces</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {totalCount} workspace{totalCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            onClick={() => setShowCreateWorkspace(true)}
            className="gap-2 bg-primary text-primary-foreground hover:opacity-90 rounded-full px-5 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Workspace
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 h-11 bg-card border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-0"
          />
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "text-muted-foreground hover:text-foreground border-transparent hover:bg-secondary"
            }`}
          >
            All Workspaces
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeTab === "my"
                ? "bg-primary text-primary-foreground border-primary"
                : "text-muted-foreground hover:text-foreground border-transparent hover:bg-secondary"
            }`}
          >
            My Workspaces
          </button>
        </div>

        {/* Workspaces Grid */}
        <WorkspacesList
          workspaces={filteredWorkspaces}
          currentUser={user}
          createWorkSpace={() => setShowCreateWorkspace(true)}
        />
      </main>

      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
        onCreate={handleCreateWorkspace}
      />
    </div>
  );
}
