"use client";

import type React from "react";
import { AgreementChatbot } from "./agreement-chatbot";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Clock,
  Users2,
  Copy,
  Check,
  Share2,
  X,
  Mail,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DocumentShareDialog } from "./document-share-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useChatbot } from "@/lib/chatbot-context";

interface CollaborativeEditorProps {
  document: any;
  currentUser: any;
  documents: any[];
  onClose: (updatedDoc: any) => void;
  workspaceMembers: any[];
}

interface CursorPosition {
  userId: string;
  userName: string;
  position: number;
  color: string;
}

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
];

export function CollaborativeEditor({
  document,
  currentUser,
  documents,
  onClose,
  workspaceMembers,
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(document.content);
  const [cursorPositions, setCursorPositions] = useState<CursorPosition[]>([]);
  const [typingIndicators, setTypingIndicators] = useState<
    Record<string, boolean>
  >({});
  const [versions, setVersions] = useState(document.versions || []);
  const [isSaving, setIsSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [lastSaved, setLastSaved] = useState(document.lastModified);
  const [copied, setCopied] = useState(false);
  const [showDocumentShare, setShowDocumentShare] = useState(false);
  const [documentSharedWith, setDocumentSharedWith] = useState(
    document.sharedWith || []
  );
  const [shareNotification, setShareNotification] = useState<{
    show: boolean;
    message: string;
  }>({
    show: false,
    message: "",
  });

  const { toggleOpen, setDocumentContent, setDocumentTitle, isOpen } =
    useChatbot();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setDocumentContent(content);
    setDocumentTitle(document.title);
  }, [document.id, setDocumentContent, setDocumentTitle]);

  useEffect(() => {
    if (shareNotification.show) {
      const timer = setTimeout(() => {
        setShareNotification({ show: false, message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [shareNotification.show]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setDocumentContent(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (textareaRef.current) {
      const position = textareaRef.current.selectionStart;
      setCursorPositions((prev) => {
        const filtered = prev.filter((c) => c.userId !== currentUser.id);
        return [
          ...filtered,
          {
            userId: currentUser.id,
            userName: currentUser.name,
            position,
            color: COLORS[0],
          },
        ];
      });
    }

    typingTimeoutRef.current = setTimeout(() => {
      setCursorPositions((prev) =>
        prev.filter((c) => c.userId !== currentUser.id)
      );
    }, 5000);
  };

  const handleSaveDocument = async () => {
    setIsSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const newVersion = {
      timestamp: new Date().toISOString(),
      content: document.content,
      author: currentUser.name,
    };

    const updatedDoc = {
      ...document,
      content,
      lastModified: new Date().toISOString(),
      versions: [...versions, newVersion],
      activeUsers: [currentUser.id],
      sharedWith: documentSharedWith,
    };

    setVersions(updatedDoc.versions);
    setLastSaved(updatedDoc.lastModified);
    setIsSaving(false);
  };

  const handleRevertToVersion = (versionIndex: number) => {
    const version = versions[versionIndex];
    setContent(version.content);
    setDocumentContent(version.content);
    handleSaveDocument();
    setShowVersions(false);
  };

  const handleShareDocument = (sharedWith: any[]) => {
    setDocumentSharedWith(sharedWith);
    const count = sharedWith.length;
    setShareNotification({
      show: true,
      message: `Document shared with ${count} member${count !== 1 ? "s" : ""}!`,
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActiveUserCount = () => {
    return 1;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Share Notification */}
      {shareNotification.show && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-lg">
            <div className="flex items-center gap-3 px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-medium text-green-900">
                {shareNotification.message}
              </p>
              <button
                onClick={() =>
                  setShareNotification({ show: false, message: "" })
                }
                className="ml-auto text-green-600 hover:text-green-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Editor Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const updatedDoc = {
                    ...document,
                    content,
                    lastModified: lastSaved,
                    versions,
                    sharedWith: documentSharedWith,
                  };
                  onClose(updatedDoc);
                }}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground">
                  {document.title}
                </h2>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Last saved {new Date(lastSaved).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <Users2 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {getActiveUserCount()} editing
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-semibold">{currentUser.name} (You)</p>
                    {documentSharedWith.length > 0 && (
                      <>
                        <p className="text-xs text-gray-400 mt-2">
                          Shared with:
                        </p>
                        {documentSharedWith.map((share) => (
                          <p key={share.memberId} className="text-sm">
                            {share.memberName}
                          </p>
                        ))}
                      </>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="relative">
              <Button
                onClick={() => setShowDocumentShare(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700 relative"
              >
                <Share2 className="w-4 h-4" />
                Share
                {documentSharedWith.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-white/20 text-white border-0"
                  >
                    {documentSharedWith.length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="gap-2 bg-transparent"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersions(!showVersions)}
                disabled={versions.length === 0}
              >
                History ({versions.length})
              </Button>
              <Button
                onClick={handleSaveDocument}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={toggleOpen}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <MessageCircle className="w-4 h-4" />
                Assistant
              </Button>
            </div>
          </div>

          {Object.entries(typingIndicators).some(
            ([_, isTyping]) => isTyping
          ) && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              {Object.entries(typingIndicators)
                .filter(([_, isTyping]) => isTyping)
                .map(([userId]) => {
                  const cursor = cursorPositions.find(
                    (c) => c.userId === userId
                  );
                  return (
                    <div key={userId} className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                      <span>{cursor?.userName} is typing...</span>
                    </div>
                  );
                })}
            </div>
          )}

          {documentSharedWith.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">
                Shared with:
              </span>
              <div className="flex flex-wrap gap-2">
                {documentSharedWith.slice(0, 3).map((share) => (
                  <Badge
                    key={share.memberId}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    {share.memberName}
                  </Badge>
                ))}
                {documentSharedWith.length > 3 && (
                  <Badge
                    variant="outline"
                    className="bg-slate-50 text-slate-600 border-slate-200"
                  >
                    +{documentSharedWith.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Version History Panel */}
      {showVersions && versions.length > 0 && (
        <div className="border-b border-border bg-muted/50 px-4 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm font-semibold text-foreground mb-3">
              Version History
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {versions.slice(-10).map((version, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevertToVersion(idx)}
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  <Clock className="w-3 h-3 mr-1" />v{idx + 1} -{" "}
                  {new Date(version.timestamp).toLocaleTimeString()}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Document Share Dialog */}
      <DocumentShareDialog
        open={showDocumentShare}
        onOpenChange={setShowDocumentShare}
        document={document}
        workspaceMembers={workspaceMembers}
        sharedWith={documentSharedWith}
        onShare={handleShareDocument}
      />

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden">
        <div className="relative h-full">
          {/* Main Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            className="w-full h-full p-6 font-mono text-sm resize-none focus:outline-none bg-background text-foreground border-0"
            placeholder="Start typing your agreement..."
            spellCheck="true"
          />
        </div>
      </div>

      {/* Agreement Chatbot */}
      <AgreementChatbot
        documentContent={content}
        documentTitle={document.title}
        isOpen={isOpen}
        onToggle={toggleOpen}
      />

      {/* Status Bar */}
      <div className="border-t border-border bg-card px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          <span>{content.length} characters</span>
          <span className="mx-2">•</span>
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>All changes saved</span>
        </div>
      </div>
    </div>
  );
}
