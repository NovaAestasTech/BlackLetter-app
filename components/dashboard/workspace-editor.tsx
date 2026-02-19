"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

      const response = await fetch("http://127.0.0.1:8000/parse_pdf", {
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
        const doc = {
          title: pdfName || "New Template Document",
          content: pdfText,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          createdBy: currentUser.id,
          fileType: "pdf",
          sharedWith: [],
        };

        await addDocument(doc, workspace._id);
        setDocuments((prev) => [doc, ...prev]);
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
        const res = await fetch("http://localhost:3001/api/ai/test-api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: selectedDoc.content }),
        });

        if (res.ok) {
          window.location.href = "http://localhost:3001/";
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    })();
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-2 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workspaces
      </Button>

      {/* Workspace Header Card */}
      <Card className="border-slate-200 bg-gradient-to-br from-white to-blue-50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl text-slate-900">
                {workspace.name}
              </CardTitle>
              <CardDescription className="text-slate-600 mt-2">
                {workspace.description}
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowShareDialog(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Share2 className="w-4 h-4" />
              Manage Access
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Members</p>
                <p className="text-lg font-bold text-slate-900">
                  {workspaceMembers.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Documents</p>
                <p className="text-lg font-bold text-slate-900">
                  {documents.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Created</p>
                <p className="text-lg font-bold text-slate-900">
                  {new Date(workspace.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <TemplatesDialog
        open={openTemplate}
        onOpenChange={setopenTemplate}
        onSelectTemplate={createTemplate}
      />

      {/* Share Dialog */}
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
          <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFileUpload(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </Button>
            <Button
              onClick={() => setShowNewDoc(!showNewDoc)}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Document
            </Button>
            <Button
              onClick={() => callTemplates()}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Use Template
            </Button>
          </div>
        </div>

        {showNewDoc && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6 space-y-4">
              <Input
                placeholder="Document title (e.g., Service Agreement Draft)"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                className="bg-white border-blue-300 focus:border-blue-500"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateDocument}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewDoc(false)}
                  className="border-slate-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {documents.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-300 bg-slate-50">
            <CardContent className="pt-12 pb-12 text-center space-y-4">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <p className="text-slate-900 font-semibold">No documents yet</p>
                <p className="text-slate-600 text-sm mt-1">
                  Create a new document or upload a file to start collaborating
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => setShowNewDoc(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Document
                </Button>
                <Button
                  onClick={() => setShowFileUpload(true)}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc) => {
              const activeCount = doc.activeUsers?.length || 0;
              const isUploadedFile = doc.fileType && doc.fileType !== "text";
              return (
                <Card
                  key={doc._id}
                  className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-slate-200 bg-white"
                >
                  <div
                    className={`h-16 flex items-center justify-between px-6 bg-gradient-to-br ${
                      isUploadedFile
                        ? "from-emerald-500 to-emerald-600"
                        : "from-blue-500 to-blue-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-white" />
                      {isUploadedFile && (
                        <span className="text-xs font-semibold text-white bg-white/20 px-2 py-1 rounded-full uppercase">
                          {doc.fileType}
                        </span>
                      )}
                    </div>
                    {activeCount > 0 && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                        <Users2 className="w-3 h-3" />
                        {activeCount} editing
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-5 pb-5 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-900 text-lg leading-tight">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Created {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {doc.content || "No content yet"}
                    </p>

                    {doc.sharedWith && doc.sharedWith.length > 0 && (
                      <div className="flex items-center gap-2 pt-2 pb-2 border-t border-slate-200">
                        <Users2 className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-slate-700">
                          Shared with {doc.sharedWith.length}{" "}
                          {doc.sharedWith.length === 1 ? "person" : "people"}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition-all group-hover:shadow-lg"
                        size="sm"
                        onClick={() => {
                          setDocumentContent(doc.content);
                          setDocumentTitle(doc.title);
                          setSelectedDoc(doc);
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareDocument(doc.id)}
                        className="gap-2 border-slate-300 hover:bg-blue-50"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-300 bg-transparent"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2 cursor-pointer text-slate-700">
                            <Copy className="w-4 h-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
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

      {/* Document Share Dialog */}
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
