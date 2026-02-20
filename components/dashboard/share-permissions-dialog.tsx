"use client";

import { useState } from "react";
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
import { Trash2, Copy, Check } from "lucide-react";
import { SharePermissionsDialogProps } from "@/utils/helper";
const ROLES = [
  {
    value: "owner",
    label: "Owner",
    description: "Full control, can manage members and delete workspace",
  },
  {
    value: "editor",
    label: "Editor",
    description: "Can edit documents and share with others",
  },
  {
    value: "commenter",
    label: "Commenter",
    description: "Can view and leave comments",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access to workspace",
  },
];

export function SharePermissionsDialog({
  open,
  onOpenChange,
  members,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
  currentUser,
}: SharePermissionsDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleAddMember = () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (members.some((m) => m.email === email)) {
      setError("This member is already invited");
      return;
    }

    onAddMember({ email, role });
    setEmail("");
    setRole("editor");
  };

  const shareLink = `https://legalhub.app/join/${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Access & Permissions</DialogTitle>
          <DialogDescription>
            Control who has access to this workspace and what they can do
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Share Link Section */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Share Link
            </h3>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="bg-background" />
              <Button
                variant="outline"
                onClick={copyShareLink}
                className="gap-2 bg-transparent"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Anyone with this link can join the workspace
            </p>
          </div>

          {/* Invite Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Invite Members
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddMember}>Add</Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Members ({members.length})
            </h3>
            <div className="space-y-2">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {member.role === "owner" ? (
                        <Badge variant="outline">
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </Badge>
                      ) : (
                        <Select
                          value={member.role}
                          onValueChange={(newRole) =>
                            onUpdateRole(member.id, newRole)
                          }
                          disabled={member.id === currentUser.id}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {member.id !== currentUser.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveMember(member.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Permissions Guide */}
          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Role Permissions
            </h3>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <div key={r.value} className="text-sm">
                  <p className="font-medium text-foreground">{r.label}</p>
                  <p className="text-muted-foreground">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
