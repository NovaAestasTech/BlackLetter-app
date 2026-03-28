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
];

export function SharePermissionsDialog({
  open,
  onOpenChange,
  members,
  onAddMember,
  onRemoveMember,
  onUpdateRole,
  currentUser,
  workspace,
}: SharePermissionsDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleAddMember = async () => {
    const response = await fetch("api/workspace/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        role: role,
        workspace_id: workspace._id,
        user: currentUser,
      }),
    });
    const res = await response.json();
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
                <Card key={member._id}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {member.email}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {member.role}
                        </Badge>

                        {/* Show (You) if the member is the current user */}
                        {member.email === currentUser.email && (
                          <span className="text-xs text-muted-foreground italic">
                            (You)
                          </span>
                        )}

                        {/* Show a special style or icon if the member is the owner */}
                        {member._id === workspace.owner && (
                          <span className="text-xs text-amber-600 font-medium">
                            ★ Workspace Creator
                          </span>
                        )}
                      </div>

                      {workspace.owner === currentUser.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onRemoveMember(
                              member._id,
                              workspace._id,

                              currentUser.id,
                            )
                          }
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
