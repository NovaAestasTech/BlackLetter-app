"use client";
// IMPORTENT

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

import { CreateWorkspaceDialogProps } from "@/utils/helper";
export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate({ name, description });
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a workspace to collaborate with your team on legal agreements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Workspace Name
            </label>
            <Input
              placeholder="e.g., Q1 Contract Review"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Description (Optional)
            </label>
            <Input
              placeholder="Describe the purpose of this workspace"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Workspace</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
