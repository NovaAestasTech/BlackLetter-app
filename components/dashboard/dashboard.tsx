"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { WorkspacesList } from "./workspaces-list";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { FileText, LogOut, Plus } from "lucide-react";

import { WorkSpace } from "@/utils/helper";
import { DashboardProps } from "@/utils/helper";
export function Dashboard({ user, onLogout }: DashboardProps) {
  const [workspaces, setWorkspaces] = useState<WorkSpace[]>([]);
  const [personalWorkSpace, setPersonalWorksSpace] = useState<WorkSpace[]>([]);
  const [sharedWorkSpace, setsharedWorksSpace] = useState<WorkSpace[]>([]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-md border border-white/50">
                <img src="/Matte1.png" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">BlackLetter</h1>
                <p className="text-sm text-slate-500">
                  Professional Agreement Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="gap-2 text-slate-600 hover:text-slate-900"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="workspaces" className="w-full">
          <TabsContent value="workspaces" className="space-y-8 mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    Your Workspaces
                  </h2>
                  <p className="text-slate-600 mt-2">
                    Collaborate with your team on legal agreements
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateWorkspace(true)}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Create Workspace
                </Button>
              </div>
              <Tabs defaultValue="allWorkspaces" className="w-full mt-6">
                <TabsList className="grid grid-cols-2 border-b">
                  <TabsTrigger
                    value="allWorkspaces"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                  >
                    All Workspaces
                  </TabsTrigger>
                  <TabsTrigger
                    value="myWorkspaces"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                  >
                    My Workspaces
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="allWorkspaces" className="p-4">
                  {sharedWorkSpace.length > 0 && (
                    <WorkspacesList
                      workspaces={sharedWorkSpace}
                      currentUser={user}
                      createWorkSpace={() => setShowCreateWorkspace(true)}
                    />
                  )}
                </TabsContent>

                <TabsContent value="myWorkspaces" className="p-4">
                  {personalWorkSpace.length > 0 && (
                    <WorkspacesList
                      workspaces={personalWorkSpace}
                      currentUser={user}
                      createWorkSpace={() => setShowCreateWorkspace(true)}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
        onCreate={handleCreateWorkspace}
      />
    </div>
  );
}
