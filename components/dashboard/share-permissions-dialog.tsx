"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area"; // Added for document list
import { Trash2, ShieldCheck, Lock, FileText, UserPlus } from "lucide-react";
import { SharePermissionsDialogProps } from "@/utils/helper";
import { useRef } from "react";

export function SharePermissionsDialog({
  open,
  onOpenChange,
  members,
  onRemoveMember,
  currentUser,
  workspace,
  documents,
}: SharePermissionsDialogProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // 1. Local state to track permissions per document: { docId: "read" | "write" }
  const [docPermissions, setDocPermissions] = useState<
    Record<string, "read" | "write">
  >({});

  // Initialize permissions: Default all to 'read' whenever dialog opens
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      initializedRef.current = false; // reset for next open
      return;
    }
    if (open && documents && !initializedRef.current) {
      initializedRef.current = true;
      const initial: Record<string, "read" | "write"> = {};
      documents.forEach((doc: any) => {
        initial[doc._id] = "read";
      });
      setDocPermissions(initial);
    }
  }, [open, workspace, documents]);

  const handleAddMember = async () => {
    if (!email) {
      setError("Please enter an email address");
      return;
    }

    setIsInviting(true);
    setError("");
    console.log(docPermissions);

    const editableDocIds = Object.entries(docPermissions)
      .filter(([_, level]) => level === "write")
      .map(([id]) => id);

    try {
      const response = await fetch("/api/workspace/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          workspace_id: workspace._id,
          editableDocIds: editableDocIds,
          inviterId: currentUser.id,
        }),
      });

      if (response.ok) {
        setEmail("");
        onOpenChange(false);
      } else {
        const data = await response.json();
        setError(data.message || "Invitation failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-white border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-stone-800" />
            Workspace Permissions
          </DialogTitle>
          <DialogDescription>
            Invite a collaborator and choose which documents they are allowed to
            edit.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-8">
          {/* Invite Section */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                Collaborator Email
              </label>
              <div className="flex gap-2">
                <Input
                  className="bg-stone-50 border-stone-200"
                  placeholder="partner@legal-firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  disabled={isInviting}
                  onClick={handleAddMember}
                  className="bg-stone-800 hover:bg-black text-white px-6"
                >
                  {isInviting ? "Inviting..." : "Add Member"}
                </Button>
              </div>
              {error && (
                <p className="text-xs text-red-500 font-medium">{error}</p>
              )}
            </div>
          </div>

          {/* Selective Document Access List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Assign Edit Rights
              </h3>
              <Badge
                variant="secondary"
                className="bg-stone-100 text-stone-500 text-[9px] uppercase font-bold"
              >
                Default: Read-Only
              </Badge>
            </div>

            <div className="border border-stone-100 rounded-xl overflow-hidden bg-stone-50/50">
              <ScrollArea className="h-[250px] w-full">
                <div className="divide-y divide-stone-100">
                  {documents.map((doc: any, idx: number) => (
                    <div
                      key={doc._id || idx}
                      className="flex items-center justify-between p-4 hover:bg-white transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-stone-700 truncate max-w-[300px]">
                          {doc.title || "Untitled Document"}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium uppercase">
                          {doc.fileType}
                        </span>
                      </div>

                      {workspace.owner === currentUser.id && (
                        <Select
                          value={docPermissions[doc._id]}
                          onValueChange={(val: "read" | "write") =>
                            setDocPermissions((prev) => ({
                              ...prev,
                              [doc._id]: val,
                            }))
                          }
                        >
                          <SelectTrigger
                            className={`w-[110px] h-8 text-[11px] font-bold ${
                              docPermissions[doc._id] === "write"
                                ? "border-blue-200 bg-blue-50 text-blue-600"
                                : "bg-white"
                            }`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="read" className="text-xs">
                              <div className="flex items-center gap-2">
                                <Lock className="w-3 h-3" /> read
                              </div>
                            </SelectItem>
                            <SelectItem value="write" className="text-xs">
                              <div className="flex items-center gap-2 text-blue-600">
                                <ShieldCheck className="w-3 h-3" /> write
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Existing Members List View */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-800">
              Workspace Members
            </h3>
            <div className="space-y-2">
              {members.map((member: any, idx: number) => (
                <Card
                  key={member._id || idx}
                  className="border-stone-100 shadow-none bg-stone-50"
                >
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-700">
                        {member.email}
                      </p>
                      <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tight">
                        {member._id === workspace.owner ? "Owner" : "Member"}
                      </p>
                    </div>
                    {workspace.owner === currentUser.id &&
                      member.email !== currentUser.email && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            onRemoveMember(
                              member._id,
                              workspace._id,
                              currentUser.id,
                            )
                          }
                          className="h-8 w-8 text-stone-300 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-stone-500 font-bold text-xs uppercase"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
