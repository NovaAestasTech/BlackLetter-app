"use client";
// IMPORTENT

import { useEffect, useState, useRef } from "react";
import { Search, Plus, MoreHorizontal } from "lucide-react";

import { SharePermissionsDialog } from "./share-permissions-dialog";
import { DocumentShareDialog } from "./document-share-dialog";
import { FileUploadDialog } from "./file-upload-dialog";
import { LeftSidebar } from "./left-sidebar";
import { useStore } from "@/store/useStore";
import { useChatbot } from "@/lib/chatbot-context";
import { TemplatesDialog } from "./Template-dialog";
import { Template } from "@/app/templates/templates";

import { ParsedDocument } from "@/utils/helper";
import { WorkspaceEditorProps } from "@/utils/helper";

const F = "'Manrope', sans-serif";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRelativeTime(isoDate: string) {
  if (!isoDate) return "—";
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

function getInitials(email: string) {
  const name = email?.split("@")[0] ?? "";
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatActivity(isoDate: string) {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getRolePermissions(role: string) {
  const rolePermissions: Record<string, string[]> = {
    owner: ["edit", "share", "delete", "manage_members"],
    editor: ["edit", "share"],
    viewer: ["view"],
    commenter: ["view", "comment"],
  };
  return rolePermissions[role] || [];
}

// ─── Component ────────────────────────────────────────────────────────────────
export function WorkspaceEditor({
  workspace,
  currentUser,
  onBack,
  onTabChange,
  onCreateWorkspace,
  onLogout,
  initialTemplateToLoad,
  initialFileToUpload,
}: WorkspaceEditorProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ParsedDocument | null>(null);
  const [showNewDoc, setShowNewDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDocumentShare, setShowDocumentShare] = useState(false);
  const [selectedDocToShare, setSelectedDocToShare] = useState<any>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [openTemplate, setopenTemplate] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const { pdfName, pdfText, fetchPdfData } = useStore();
  const { setDocumentContent, setDocumentTitle } = useChatbot();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/documents?id=${workspace._id}`, { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch documents");
        const data = await res.json();
        setDocuments(data.documents);
        setWorkspaceMembers(data.members);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchData();
  }, [workspace._id]);

  const hasInitializedExternalDocs = useRef(false);
  useEffect(() => {
    if (hasInitializedExternalDocs.current) return;
    hasInitializedExternalDocs.current = true;

    if (initialFileToUpload) {
      handleFileUpload(initialFileToUpload, initialFileToUpload.name);
    } else if (initialTemplateToLoad) {
      fetchPdfData(initialTemplateToLoad.name).then(() => {
        setIsCreating(true);
      });
    }
  }, [initialFileToUpload, initialTemplateToLoad]);

  const addDocument = async (doc: any, id: string) => {
    try {
      await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, doc }),
      });
    } catch (e) {
      if (e instanceof Error) throw new Error(e.message);
      throw new Error("Unidentified Error");
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return;
    const doc = {
      title: newDocTitle,
      content: "",
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      createdBy: currentUser.id,
      versions: [],
      activeUsers: [currentUser.id],
      sharedWith: [],
      fileType: "text",
    };
    setDocuments([doc, ...documents]);
    setNewDocTitle("");
    setShowNewDoc(false);
    await addDocument(doc, workspace._id);
  };

  const handleFileUpload = async (file: File, title: string) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("https://python-parser-mkqr.onrender.com/parse_pdf", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      const doc = {
        title,
        content: data["html"],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        createdBy: currentUser.id,
        versions: [],
        activeUsers: [currentUser.id],
        sharedWith: [],
        fileType: file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "docx",
        originalFileName: file.name,
        fileSize: file.size,
      };
      await addDocument(doc, workspace._id);
      setDocuments([doc, ...documents]);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleAddMember = (data: any) => {
    const newMember = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      name: data.email.split("@")[0],
      role: data.role,
      joinedAt: new Date().toISOString(),
      permissions: getRolePermissions(data.role),
    };
    workspace.sharewith.push(newMember);
    setWorkspaceMembers([...workspaceMembers, newMember]);
  };

  const handleRemoveMember = async (memberId: string) => {
    await fetch(`/api/workspace?mId=${memberId}&wId=${workspace._id}&userId=${currentUser.id}`, {
      method: "PATCH",
    });
    setWorkspaceMembers(workspaceMembers.filter((m: any) => m._id !== memberId));
  };

  const handleUpdateMemberRole = (memberId: string, newRole: string) => {
    setWorkspaceMembers(
      workspaceMembers.map((m) =>
        m.id === memberId ? { ...m, role: newRole, permissions: getRolePermissions(newRole) } : m
      )
    );
  };

  const handleShareDocument = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    setSelectedDocToShare(doc);
    setShowDocumentShare(true);
  };

  const callTemplates = async () => {
    try { setopenTemplate(true); } catch (e) {
      if (e instanceof Error) throw new Error(e.message);
      throw new Error("Unidentified Error");
    }
  };

  useEffect(() => {
    if (isCreating && pdfText) {
      const saveNewTemplateDoc = async () => {
        const formData = new FormData();
        formData.append("text", pdfText);
        const response = await fetch("https://python-parser-mkqr.onrender.com/parse_text", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        const doc = {
          title: pdfName || "New Template Document",
          content: data["html"],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          createdBy: currentUser.id,
          fileType: "pdf",
          sharedWith: [],
        };
        setDocuments((prev) => [doc, ...prev]);
        await addDocument(doc, workspace._id);
        setIsCreating(false);
      };
      saveNewTemplateDoc();
    }
  }, [pdfText, pdfName, isCreating]);

  const createTemplate = async (template: Template) => {
    try { setIsCreating(true); } catch (e) {
      if (e instanceof Error) throw new Error(e.message);
      throw new Error("Unidentified Error");
    }
  };

  const handleDocumentShareConfirm = (sharedWith: any[]) => {
    if (selectedDocToShare) {
      const updatedDocs = documents.map((doc) =>
        doc.id === selectedDocToShare.id ? { ...doc, sharedWith } : doc
      );
      setDocuments(updatedDocs);
    }
    setShowDocumentShare(false);
    setSelectedDocToShare(null);
  };

  if (selectedDoc) {
    (async () => {
      try {
        const res = await fetch("https://editor.blackletter.co.in/api/ai/test-api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: selectedDoc.content }),
        });
        if (res.ok) {
          setSelectedDoc(null);
          window.location.href = "https://editor.blackletter.co.in/";
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    })();
  }

  // Filtered members for sidebar search
  const filteredMembers = workspaceMembers.filter((m: any) =>
    !memberSearch || (m.email + (m.name ?? "")).toLowerCase().includes(memberSearch.toLowerCase())
  );

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="h-screen w-full overflow-hidden flex bg-stone-50"
      style={{ fontFamily: F }}
    >
      {/* ─── Left Sidebar ─────────────────────────────────── */}
      <LeftSidebar
        activeTab="dashboard"
        onTabChange={(tab) => { 
          if (tab === "dashboard") onBack(); 
          else onTabChange(tab); 
        }}
        onCreateWorkspace={onCreateWorkspace}
        onLogout={onLogout}
        userEmail={currentUser.email}
      />

      {/* ─── Main Content ─────────────────────────────────── */}
      <main className="flex-1 min-w-0 h-screen flex flex-col overflow-hidden">
        {/* Search bar */}
        <div className="px-6 pt-5 pb-0 shrink-0">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-stone-100 rounded-2xl border border-zinc-300">
            <Search className="w-4 h-4 text-stone-600 shrink-0" />
            <span className="text-stone-600/50 text-sm font-normal">
              Search Document...
            </span>
          </div>
        </div>

        {/* Page title */}
        <div className="px-6 pt-3 pb-1 shrink-0">
          <h1
            className="text-zinc-800 font-bold leading-10"
            style={{ fontSize: "36px", fontFamily: F }}
          >
            Workspace Detail
          </h1>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 pb-6 flex flex-col gap-4">

          {/* ── Info Card ──────────────────────────────────── */}
          <div className="bg-stone-100 rounded-lg p-5">
            <div className="flex items-start gap-10">
              {/* Name */}
              <div className="flex flex-col gap-1 min-w-[120px]">
                <span className="text-stone-600/50 text-[10px] font-bold uppercase leading-4 tracking-wide">
                  Name
                </span>
                <span
                  className="text-zinc-800 text-2xl font-light leading-8"
                  style={{ fontFamily: F }}
                >
                  {workspace.name}
                </span>
              </div>
              {/* Members */}
              <div className="flex flex-col gap-3">
                <span className="text-stone-600/50 text-[10px] font-bold uppercase leading-4 tracking-wide">
                  Members
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {workspaceMembers.slice(0, 4).map((m: any, i: number) => (
                    <div
                      key={m._id || i}
                      className="w-8 h-8 bg-neutral-200 rounded-md flex items-center justify-center"
                      title={m.email}
                    >
                      <span className="text-stone-600 text-[10px] font-bold leading-4">
                        {getInitials(m.email)}
                      </span>
                    </div>
                  ))}
                  {workspaceMembers.length > 4 && (
                    <div className="w-8 h-8 rounded-md border border-neutral-400 flex items-center justify-center">
                      <Plus className="w-3 h-3 text-zinc-800" />
                    </div>
                  )}
                  {workspaceMembers.length === 0 && (
                    <div className="w-8 h-8 rounded-md border border-neutral-400 flex items-center justify-center">
                      <Plus className="w-3 h-3 text-zinc-800" />
                    </div>
                  )}
                </div>
              </div>
              {/* Files */}
              <div className="flex flex-col gap-1">
                <span className="text-stone-600/50 text-[10px] font-bold uppercase leading-4 tracking-wide">
                  Files
                </span>
                <span
                  className="text-zinc-800 text-xl font-medium leading-7"
                  style={{ fontFamily: F }}
                >
                  {documents.length}
                </span>
              </div>
              {/* Activity */}
              <div className="flex flex-col gap-1">
                <span className="text-stone-600/50 text-[10px] font-bold uppercase leading-4 tracking-wide">
                  Activity
                </span>
                <span
                  className="text-zinc-800 text-xl font-medium leading-7"
                  style={{ fontFamily: F }}
                >
                  {formatActivity(workspace.lastModified)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Documents Section ──────────────────────────── */}
          <div>
            {/* Section header */}
            <div className="flex items-center justify-between mb-3">
              <h2
                className="text-zinc-800 text-xl font-bold leading-7"
                style={{ fontFamily: F }}
              >
                Documents
              </h2>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setShowNewDoc(!showNewDoc)}
                  className="text-stone-600 text-sm font-medium hover:text-zinc-800 transition-colors"
                  style={{ fontFamily: F }}
                >
                  New Document
                </button>
                <button
                  onClick={() => callTemplates()}
                  className="text-stone-600 text-sm font-medium hover:text-zinc-800 transition-colors"
                  style={{ fontFamily: F }}
                >
                  Use Template
                </button>
              </div>
            </div>

            {/* New doc inline form */}
            {showNewDoc && (
              <div className="mb-3 flex gap-2 items-center px-4 py-3 bg-white rounded-lg border border-zinc-200">
                <input
                  className="flex-1 bg-transparent outline-none text-sm text-zinc-800 placeholder:text-stone-400"
                  placeholder="Document title..."
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateDocument()}
                  style={{ fontFamily: F }}
                  autoFocus
                />
                <button
                  onClick={handleCreateDocument}
                  className="px-3 py-1.5 bg-stone-600 text-orange-50 text-xs font-bold rounded-md uppercase tracking-wide"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewDoc(false)}
                  className="px-3 py-1.5 text-stone-600 text-xs font-medium hover:text-zinc-800"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Table header */}
              <div className="flex border-b border-neutral-400/20">
                <div className="w-96 px-6 py-4">
                  <span className="text-stone-600/50 text-[10px] font-bold uppercase tracking-wide">
                    Name
                  </span>
                </div>
                <div className="w-56 px-6 py-4">
                  <span className="text-stone-600/50 text-[10px] font-bold uppercase tracking-wide">
                    Type
                  </span>
                </div>
                <div className="flex-1 px-6 py-4">
                  <span className="text-stone-600/50 text-[10px] font-bold uppercase tracking-wide">
                    Last Edited
                  </span>
                </div>
              </div>

              {/* Document rows */}
              {documents.length === 0 ? (
                <div className="px-6 py-12 text-center text-stone-600/50 text-sm">
                  No documents yet. Create one above.
                </div>
              ) : (
                documents.map((doc, idx) => (
                  <div
                    key={doc._id || idx}
                    className={`flex items-center cursor-pointer hover:bg-stone-50 transition-colors group ${
                      idx > 0 ? "border-t border-neutral-400/20" : ""
                    }`}
                    onClick={() => {
                      setDocumentContent(doc.content);
                      setDocumentTitle(doc.title);
                      setSelectedDoc(doc);
                    }}
                  >
                    <div className="w-96 px-6 py-5">
                      <span
                        className="text-zinc-800 text-sm font-medium leading-5"
                        style={{ fontFamily: F }}
                      >
                        {doc.title}
                      </span>
                    </div>
                    <div className="w-56 px-6 py-5">
                      <span
                        className="text-stone-600 text-sm font-normal leading-5"
                        style={{ fontFamily: F }}
                      >
                        {doc.fileType === "pdf"
                          ? "PDF"
                          : doc.fileType === "docx"
                          ? "DOCX"
                          : doc.fileType || workspace.name}
                      </span>
                    </div>
                    <div className="flex-1 px-6 py-5 flex items-center justify-between">
                      <span
                        className="text-stone-600 text-sm font-normal leading-5"
                        style={{ fontFamily: F }}
                      >
                        {formatRelativeTime(doc.lastModified)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShareDocument(doc.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity mr-4"
                      >
                        <MoreHorizontal className="w-4 h-4 text-stone-600" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ─── Right Sidebar ────────────────────────────────── */}
      <aside className="w-72 h-screen flex flex-col gap-3 pt-5 pb-2 pr-2 pl-2 shrink-0 overflow-hidden">

        {/* Manage Access */}
        <div className="bg-[#DEE6C4] rounded-lg p-5 flex flex-col gap-4 flex-1 overflow-hidden">
          <h3
            className="text-zinc-800 text-xl font-bold leading-7"
            style={{ fontFamily: F }}
          >
            Manage Access
          </h3>

          {/* Invite Member */}
          <div className="flex flex-col gap-3">
            <span className="text-stone-600 text-[10px] font-bold uppercase leading-4 tracking-wide">
              Invite Member
            </span>
            <input
              className="w-full px-4 py-3 bg-white rounded-md text-gray-500 text-sm font-normal outline-none"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{ fontFamily: F }}
            />
            <button
              onClick={() => {
                if (inviteEmail.trim()) {
                  setShowShareDialog(true);
                }
              }}
              className="w-full py-3 bg-stone-600 hover:bg-stone-700 rounded-md text-orange-50 text-xs font-bold uppercase tracking-wider transition-colors"
              style={{ fontFamily: F }}
            >
              Send Invitation
            </button>
          </div>

          {/* Current Members */}
          <div className="flex flex-col gap-3 mt-1">
            <span className="text-stone-600 text-[10px] font-bold uppercase leading-4 tracking-wide">
              Current Members
            </span>
            {/* Member search */}
            <div className="relative border-b border-neutral-400/20 pb-2">
              <Search className="absolute left-0 top-0.5 w-2.5 h-2.5 text-stone-600/40" />
              <input
                className="w-full pl-5 bg-transparent text-gray-500 text-xs font-normal outline-none"
                placeholder="Search members..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                style={{ fontFamily: F }}
              />
            </div>
            {/* Member cards */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {filteredMembers.map((m: any, i: number) => (
                <div
                  key={m._id || i}
                  className="p-3 bg-white rounded flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-neutral-200 rounded-md flex items-center justify-center shrink-0">
                      <span className="text-stone-600 text-xs font-bold leading-4">
                        {getInitials(m.email)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span
                        className="text-zinc-800 text-sm font-semibold leading-5"
                        style={{ fontFamily: F }}
                      >
                        {m.name || m.email?.split("@")[0]}
                      </span>
                      <span
                        className="text-stone-600/60 text-xs font-normal leading-4"
                        style={{ fontFamily: F }}
                      >
                        {m.email}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-stone-600 text-xs font-bold leading-6 capitalize"
                    style={{ fontFamily: F }}
                  >
                    {m.role || "Editor"}
                  </span>
                </div>
              ))}
              {filteredMembers.length === 0 && (
                <p className="text-stone-600/50 text-xs text-center py-2">No members found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Upload Docs */}
        <div className="bg-[#DEE6C4] rounded-lg p-4 flex flex-col gap-3">
          <span
            className="text-stone-600 text-sm font-semibold uppercase leading-5 tracking-wide"
            style={{ fontFamily: F }}
          >
            Upload Docs
          </span>
          <button
            onClick={() => setShowFileUpload(true)}
            className="w-full rounded-lg border-2 border-dashed border-neutral-400/30 py-8 flex flex-col items-center gap-2 hover:bg-white/30 transition-colors"
          >
            <span
              className="text-stone-600 text-sm font-medium leading-5"
              style={{ fontFamily: F }}
            >
              Drag files here or click to browse
            </span>
            <span
              className="text-neutral-400 text-[10px] font-normal leading-4"
              style={{ fontFamily: F }}
            >
              Support PDF, DOCX, TXT up to 25MB
            </span>
          </button>
        </div>
      </aside>

      {/* ─── Dialogs ──────────────────────────────────────── */}
      <TemplatesDialog
        open={openTemplate}
        onOpenChange={setopenTemplate}
        onSelectTemplate={createTemplate}
      />
      <SharePermissionsDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        members={workspaceMembers}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        onUpdateRole={handleUpdateMemberRole}
        currentUser={currentUser}
        workspace={workspace}
      />
      <FileUploadDialog
        open={showFileUpload}
        onOpenChange={setShowFileUpload}
        onFileUpload={handleFileUpload}
      />
      {selectedDocToShare && (
        <DocumentShareDialog
          open={showDocumentShare}
          onOpenChange={setShowDocumentShare}
          document={selectedDocToShare}
          workspaceMembers={workspaceMembers}
          sharedWith={selectedDocToShare.sharedWith || []}
          onShare={handleDocumentShareConfirm}
        />
      )}
    </div>
  );
}
