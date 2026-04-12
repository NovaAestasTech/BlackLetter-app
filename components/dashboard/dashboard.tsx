"use client";
// IMPORTENT

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { WorkspacesList } from "./workspaces-list";
import { WorkspaceEditor } from "./workspace-editor";
import { AllWorkspacesView } from "./all-workspaces-view";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { CreateWorkspaceView } from "./create-workspace-view";
import { LeftSidebar } from "./left-sidebar";
import { RightSidebar } from "./right-sidebar";
import { type Template } from "@/app/templates/templates";

import { WorkSpace, DashboardProps } from "@/utils/helper";
import { InboxView } from "./Inbox";

type View = "dashboard" | "all-workspaces" | "create-workspace" | "inbox";

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [workspaces, setWorkspaces] = useState<WorkSpace[]>([]);
  const [view, setView] = useState<View>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [request, setrequest] = useState<any[]>([]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const data = await fetch(
          `/api/workspace?userId=${user.id}&userMail=${encodeURIComponent(user.email)}`,
          { method: "GET" },
        );
        const res = await data.json();
        setWorkspaces(res);
      } catch (e) {
        if (e instanceof Error) throw new Error(e.message);
        throw new Error("Unknown error occurred");
      }
    };
    const fetchRequest = async () => {
      try {
        const res = await fetch(`/api/inbox?userId=${user.id}`);

        const data = await res.json();

        setrequest(data);
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(e.message);
        }
        throw new Error("Unidentified Error");
      }
    };

    fetchWorkspaces();
    fetchRequest();
  }, []);

  const addNewWorkSpace = async (workspace: WorkSpace) => {
    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaces: workspace, user: user }),
      });
      return await res.json();
    } catch {
      throw new Error("Workspace can't be created");
    }
  };

  const handleCreateWorkspace = async (data: any) => {
    const newWorkspace: WorkSpace = {
      name: data.name,
      description: data.description,
      createdAt: new Date().toISOString(),
      owner: user.id,
      members: [{ _id: user.id, email: user.email, role: "owner" }],
      documents: [],
      sharewith: [],
      lastModified: new Date().toISOString(),
    };

    // Create via API first to get MongoDB _id
    const responseData = await addNewWorkSpace(newWorkspace);
    const createdWorkspace = responseData?.workspace || responseData;

    setWorkspaces((prev) => [createdWorkspace, ...prev]);
    setSelectedWorkspace(createdWorkspace);
    setView("dashboard");
  };

  const filtered = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const recent = [...filtered]
    .sort(
      (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime(),
    )
    .slice(0, 5);

  // Sidebar tab → view mapping
  const handleTabChange = (tab: "dashboard" | "all" | "create" | "inbox") => {
    if (tab === "all") {
      setSelectedTemplate(null);
      setSelectedFile(null);
      setView("all-workspaces");
      return;
    }
    if (tab === "inbox") {
      setView("inbox");
      return;
    }
    if (tab === "create") {
      setView("create-workspace");
      return;
    }
    if (tab === "dashboard") {
      setSelectedTemplate(null);
      setSelectedFile(null);
      setView("dashboard");
      return;
    }
  };

  const activeTab: "dashboard" | "all" | "create" | "inbox" =
    view === "all-workspaces"
      ? "all"
      : view === "create-workspace"
        ? "create"
        : view === "inbox"
          ? "inbox"
          : "dashboard";

  return (
    <div
      className="h-screen overflow-hidden flex bg-stone-50"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Full-screen workspace editor — replaces everything */}
      {selectedWorkspace ? (
        <WorkspaceEditor
          workspace={selectedWorkspace}
          currentUser={user}
          initialTemplateToLoad={selectedTemplate}
          initialFileToUpload={selectedFile}
          onBack={() => {
            setSelectedWorkspace(null);
            setSelectedTemplate(null);
            setSelectedFile(null);
          }}
          onTabChange={(tab) => {
            setSelectedWorkspace(null);
            handleTabChange(tab);
          }}
          onCreateWorkspace={() => {
            setSelectedWorkspace(null);
            setView("create-workspace");
          }}
          onLogout={onLogout}
        />
      ) : (
        <>
          {/* Left Sidebar — always visible */}
          <LeftSidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onCreateWorkspace={() => setView("create-workspace")}
            onLogout={onLogout}
            userEmail={user.email}
          />

          {/* Main content — switches between views */}
          {view === "create-workspace" ? (
            <CreateWorkspaceView onCreate={handleCreateWorkspace} />
          ) : view === "all-workspaces" ? (
            <AllWorkspacesView
              workspaces={workspaces}
              currentUser={user}
              onCreateWorkspace={() => setView("create-workspace")}
              onOpenWorkspace={(ws) => setSelectedWorkspace(ws)}
            />
          ) : view === "inbox" ? (
            <InboxView user={user} data={request} />
          ) : (
            /* ── Dashboard overview ────────────────────────────── */
            <main className="flex-1 h-screen flex flex-col overflow-hidden">
              {/* Search Bar */}
              <div className="px-6 pt-5 pb-0 shrink-0">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-stone-100 rounded-2xl border border-zinc-300">
                  <Search className="w-4 h-4 text-stone-600 shrink-0" />
                  <input
                    className="flex-1 bg-transparent outline-none text-sm text-zinc-800 placeholder:text-stone-500/70 font-normal"
                    placeholder="Search workspaces..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                  />
                </div>
              </div>

              {/* Page Title */}
              <div className="px-6 pt-4 pb-1 shrink-0">
                <h1
                  className="text-zinc-800 font-extrabold"
                  style={{
                    fontSize: "36px",
                    lineHeight: "44px",
                    fontFamily: "'Manrope', sans-serif",
                  }}
                >
                  Dashboard
                </h1>
              </div>

              {/* Two scrollable workspace boxes */}
              <div className="flex-1 flex flex-col gap-4 px-6 pb-5 overflow-hidden min-h-0">
                {/* Recent Workspaces */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl border border-zinc-300 overflow-hidden min-h-0">
                  <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
                    <h2
                      className="text-zinc-800 font-semibold"
                      style={{
                        fontSize: "15px",
                        fontFamily: "'Manrope', sans-serif",
                      }}
                    >
                      Recent Workspaces
                    </h2>
                    <button
                      className="text-stone-600 text-sm font-medium hover:text-zinc-800 transition-colors"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                      View all
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-4">
                    <WorkspacesList
                      workspaces={recent}
                      currentUser={user}
                      createWorkSpace={() => setView("create-workspace")}
                      onOpenWorkspace={(ws) => setSelectedWorkspace(ws)}
                      title=""
                    />
                  </div>
                </div>

                {/* All Workspaces */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl border border-zinc-300 overflow-hidden min-h-0">
                  <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
                    <h2
                      className="text-zinc-800 font-semibold"
                      style={{
                        fontSize: "15px",
                        fontFamily: "'Manrope', sans-serif",
                      }}
                    >
                      All Workspaces
                    </h2>
                    {/* "View all" navigates to the table view */}
                    <button
                      onClick={() => setView("all-workspaces")}
                      className="text-stone-600 text-sm font-medium hover:text-zinc-800 transition-colors"
                      style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                      View all
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-4">
                    <WorkspacesList
                      workspaces={filtered}
                      currentUser={user}
                      createWorkSpace={() => setView("create-workspace")}
                      onOpenWorkspace={(ws) => setSelectedWorkspace(ws)}
                      title=""
                    />
                  </div>
                </div>
              </div>
            </main>
          )}

          {/* Right Sidebar — contextual based on view */}
          {/* <RightSidebar
            view={view}
            onSelectTemplate={(t) => {
              setSelectedTemplate(t);
              setSelectedFile(null);
              setView("create-workspace");
            }}
            selectedTemplate={selectedTemplate}
            onSelectFile={(f) => {
              setSelectedFile(f);
              setSelectedTemplate(null);
              setView("create-workspace");
            }}
            selectedFile={selectedFile}
          /> */}
        </>
      )}
    </div>
  );
}
