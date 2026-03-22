"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Plus,
  Share2,
  Clock,
  Users,
  Users2,
  FileText,
  MoreVertical,
  Copy,
  ExternalLink,
  Upload,
} from "lucide-react";

import { SharePermissionsDialog } from "./share-permissions-dialog";
import { DocumentShareDialog } from "./document-share-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileUploadDialog } from "./file-upload-dialog";
import { useStore } from "@/store/useStore";
import { useChatbot } from "@/lib/chatbot-context";
import { TemplatesDialog } from "./Template-dialog";
import { Template } from "@/app/templates/templates";

import { ParsedDocument } from "@/utils/helper";
import { WorkspaceEditorProps } from "@/utils/helper";

export function WorkspaceEditor({
  workspace,
  currentUser,
  onBack,
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
  const { pdfName, pdfText } = useStore();
  const { setDocumentContent, setDocumentTitle } = useChatbot();
  const [isCreating, setIsCreating] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState([
    {
      id: workspace.owner,
      email: currentUser.email,
      name: currentUser.name,
      role: "owner",
      joinedAt: workspace.createdAt,
      permissions: ["edit", "share", "delete", "manage_members"],
    },
  ]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/documents?id=${workspace._id}`, {
          method: "GET",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch documents");
        }

        const data = await res.json();
        setDocuments(data.documents);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchData();
  }, [workspace._id]);

  const addDocument = async (doc: any, id: string) => {
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          doc,
        }),
      });
      const data = await res.json();
      return;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
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
      const content = data["html"];

      const doc = {
        title: title,
        content: content,
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

  const handleRemoveMember = (memberId: string) => {
    setWorkspaceMembers(workspaceMembers.filter((m) => m.id !== memberId));
  };

  const handleUpdateMemberRole = (memberId: string, newRole: string) => {
    setWorkspaceMembers(
      workspaceMembers.map((m) =>
        m.id === memberId
          ? {
              ...m,
              role: newRole,
              permissions: getRolePermissions(newRole),
            }
          : m,
      ),
    );
  };

  const handleShareDocument = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    setSelectedDocToShare(doc);
    setShowDocumentShare(true);
  };
  const callTemplates = async () => {
    try {
      setopenTemplate(true);
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
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
        const content = data["html"];
        const doc = {
          title: pdfName || "New Template Document",
          content: content,
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
    try {
      setIsCreating(true);
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unidentified Error");
    }
  };

  const handleDocumentShareConfirm = (sharedWith: any[]) => {
    if (selectedDocToShare) {
      const updatedDocs = documents.map((doc) =>
        doc.id === selectedDocToShare.id ? { ...doc, sharedWith } : doc,
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

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workspaces
      </button>

      {/* Workspace Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {workspace.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {workspace.description}
            </p>
          </div>
          <Button
            onClick={() => setShowShareDialog(true)}
            className="gap-2 bg-secondary hover:bg-muted text-foreground border border-border rounded-lg"
          >
            <Share2 className="w-4 h-4" />
            Manage Access
          </Button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-sm font-semibold text-foreground">
                {workspaceMembers.length}
              </p>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Documents</p>
              <p className="text-sm font-semibold text-foreground">
                {documents.length}
              </p>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-semibold text-foreground">
                {new Date(workspace.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

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
      />

      {/* Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Documents</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFileUpload(true)}
              className="gap-2 bg-secondary hover:bg-muted text-foreground border border-border rounded-lg text-sm h-9"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </Button>
            <Button
              onClick={() => setShowNewDoc(!showNewDoc)}
              className="gap-2 bg-secondary hover:bg-muted text-foreground border border-border rounded-lg text-sm h-9"
            >
              <Plus className="w-3.5 h-3.5" />
              New Doc
            </Button>
            <Button
              onClick={() => callTemplates()}
              className="gap-2 bg-primary text-primary-foreground border border-primary hover:opacity-90 rounded-lg text-sm h-9 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              Template
            </Button>
          </div>
        </div>

        {showNewDoc && (
          <div className="bg-card border border-border rounded-xl p-5">
            <Input
              placeholder="Document title (e.g., Service Agreement Draft)"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground mb-3 focus:border-primary/50"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCreateDocument}
                className="bg-primary hover:opacity-90 text-primary-foreground font-medium text-sm h-9 transition-opacity"
              >
                Create
              </Button>
              <Button
                onClick={() => setShowNewDoc(false)}
                className="bg-secondary hover:bg-muted text-foreground border border-border text-sm h-9"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">No documents yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new document or upload a file to start
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => setShowNewDoc(true)}
                className="bg-primary hover:opacity-90 text-primary-foreground font-medium text-sm transition-opacity"
              >
                Create Document
              </Button>
              <Button
                onClick={() => setShowFileUpload(true)}
                className="gap-2 bg-secondary hover:bg-muted text-foreground border border-border text-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => {
              const activeCount = doc.activeUsers?.length || 0;
              const isUploadedFile = doc.fileType && doc.fileType !== "text";
              return (
                <div
                  key={doc._id}
                  className="group bg-card border border-border rounded-xl p-5 hover:border-muted-foreground/30 hover:bg-secondary/40 transition-all duration-200 flex flex-col"
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-secondary`}>
                        <FileText className={`w-3.5 h-3.5 text-muted-foreground`} />
                      </div>
                      {isUploadedFile && (
                        <span className="text-[10px] font-semibold text-foreground bg-secondary border border-border px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {doc.fileType}
                        </span>
                      )}
                      {activeCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] text-primary-foreground bg-primary px-1.5 py-0.5 rounded">
                          <Users2 className="w-2.5 h-2.5" />
                          {activeCount}
                        </span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem className="gap-2 cursor-pointer text-foreground focus:bg-secondary">
                          <Copy className="w-3.5 h-3.5" />
                          <span>Duplicate</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Doc Info */}
                  <h3 className="font-semibold text-foreground text-[15px] mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                    {doc.content || "No content yet"}
                  </p>

                  {doc.sharedWith && doc.sharedWith.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                      <Users2 className="w-3 h-3 text-foreground" />
                      <span>
                        Shared with {doc.sharedWith.length}{" "}
                        {doc.sharedWith.length === 1 ? "person" : "people"}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-border/60">
                    <button
                      className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg bg-primary hover:opacity-90 text-primary-foreground text-sm font-medium transition-opacity"
                      onClick={() => {
                        setDocumentContent(doc.content);
                        setDocumentTitle(doc.title);
                        setSelectedDoc(doc);
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open
                    </button>
                    <button
                      onClick={() => handleShareDocument(doc.id)}
                      className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground text-sm border border-border transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

function getRolePermissions(role: string) {
  const rolePermissions: Record<string, string[]> = {
    owner: ["edit", "share", "delete", "manage_members"],
    editor: ["edit", "share"],
    viewer: ["view"],
    commenter: ["view", "comment"],
  };
  return rolePermissions[role] || [];
}
