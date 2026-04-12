"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, ShieldAlert, User, Send, Check, Lock } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";

import mongoose, { ObjectId } from "mongoose";

interface RequestPermissionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: any;
  user: any;
  workspace: any;
  onSendRequest: (data: {
    message: string;
    accessType: "read" | "edit";
    id: ObjectId;
    docId: ObjectId;
    doctitle: string;
  }) => void;
}

export function DocumentermissionRequestDialog({
  open,
  onOpenChange,
  workspace,
  document,
  user,
  onSendRequest,
}: RequestPermissionProps) {
  const [message, setMessage] = useState("");
  const [accessType, setAccessType] = useState<"read" | "edit">("edit");
  const [isSent, setIsSent] = useState(false);
  const [Email, setEmail] = useState("");
  const [id, setId] = useState<ObjectId>();
  useEffect(() => {
    try {
      async function gatherInfo(workspace: any) {
        const res = await fetch(`/api/userInfo?owner=${workspace.owner}`, {
          method: "POST",
        });
        const data = await res.json();
        setEmail(data.Email);
        setId(data.id);
        return;
      }
      gatherInfo(workspace);
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
      throw new Error("Unidentifed Error");
    }
  }, [workspace]);

  const handleRequest = () => {
    if (!id) {
      throw new Error("Id not found");
    }
    if (id === user.id) {
      return;
    }

    onSendRequest({
      message,
      accessType,
      id,
      docId: document._id,
      doctitle: document.title,
    });
    setIsSent(true);

    setTimeout(() => {
      setIsSent(false);
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden border-zinc-300 bg-stone-50"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <DialogTitle></DialogTitle>
        <main className="flex flex-col h-full">
          {/* Dashboard-style Header */}
          <div className="px-8 pt-8 pb-4 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-stone-200 rounded-lg">
                <Lock className="w-4 h-4 text-zinc-800" />
              </div>
              <span className="text-[12px] font-bold text-stone-500 uppercase tracking-wider">
                Access Required
              </span>
            </div>
            <h1
              className="text-zinc-800 font-extrabold"
              style={{
                fontSize: "32px",
                lineHeight: "40px",
              }}
            >
              Request Access
            </h1>
            <p className="text-stone-500 text-sm font-medium mt-1">
              Requesting permission for:{" "}
              <span className="text-zinc-800 font-bold">{document.title}</span>
            </p>
          </div>

          <div className="px-8 pb-8 space-y-6">
            {/* Owner Section - Styled like your Workspace boxes */}
            <div className="bg-white rounded-2xl border border-zinc-300 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-stone-100/50 border-b border-zinc-200">
                <h2 className="text-zinc-800 font-bold text-[14px]">
                  Document Owner
                </h2>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-800">{Email}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-stone-100 border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-600 uppercase">
                  Owner
                </div>
              </div>
            </div>

            {/* Request Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-500 uppercase ml-1">
                  Access Level
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setAccessType("read")}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                      accessType === "read"
                        ? "bg-zinc-800 border-zinc-800 text-white shadow-md"
                        : "bg-white border-zinc-300 text-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    <span className="text-sm font-bold">View Only</span>
                    {accessType === "read" && <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setAccessType("edit")}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                      accessType === "edit"
                        ? "bg-zinc-800 border-zinc-800 text-white shadow-md"
                        : "bg-white border-zinc-300 text-zinc-600 hover:border-zinc-400"
                    }`}
                  >
                    <span className="text-sm font-bold">Full Edit</span>
                    {accessType === "edit" && <Check className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-500 uppercase ml-1">
                  Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="I need access to..."
                  className="min-h-[102px] bg-white border-zinc-300 rounded-xl focus:ring-zinc-800 text-sm"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-zinc-200">
              <div className="flex items-center gap-2 text-stone-400">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-[11px] font-medium">
                  Request will be sent via email
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="text-stone-500 font-bold hover:text-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequest}
                  disabled={isSent}
                  className="bg-zinc-800 hover:bg-zinc-900 text-white px-8 rounded-xl font-bold transition-all h-11"
                >
                  {isSent ? (
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> Sent
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" /> Send Request
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
}
