"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Link2, Mail, Lock, Globe } from "lucide-react"

interface DocumentShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: any
  workspaceMembers: any[]
  sharedWith: any[]
  onShare: (sharedWith: any[]) => void
}

export function DocumentShareDialog({
  open,
  onOpenChange,
  document,
  workspaceMembers,
  sharedWith,
  onShare,
}: DocumentShareDialogProps) {
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(sharedWith.map((s) => s.memberId)))
  const [copied, setCopied] = useState(false)
  const [linkAccess, setLinkAccess] = useState<"view" | "edit">("view")
  const [shareMode, setShareMode] = useState<"members" | "link">("members")

  const shareLink = `https://legalhub.app/documents/${document.id}/access/${Math.random().toString(36).substr(2, 12)}`

  const handleToggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId)
    } else {
      newSelected.add(memberId)
    }
    setSelectedMembers(newSelected)
  }

  const handleSaveShare = () => {
    const sharedWithData = workspaceMembers
      .filter((m) => selectedMembers.has(m.id))
      .map((m) => ({
        memberId: m.id,
        memberName: m.name,
        memberEmail: m.email,
        sharedAt: new Date().toISOString(),
        access: "view",
      }))

    onShare(sharedWithData)
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>Share "{document.title}" with team members or via link</DialogDescription>
        </DialogHeader>

        <Tabs value={shareMode} onValueChange={(value) => setShareMode(value as "members" | "link")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members" className="gap-2">
              <Mail className="w-4 h-4" />
              Share with Members
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-2">
              <Link2 className="w-4 h-4" />
              Share Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4 py-4">
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {workspaceMembers.map((member) => (
                <Card key={member.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedMembers.has(member.id)}
                      onCheckedChange={() => handleToggleMember(member.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {member.role}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {selectedMembers.size > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900">
                  Sharing with {selectedMembers.size} member{selectedMembers.size !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleSaveShare()
                  onOpenChange(false)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Share Document
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 py-4">
            <div className="space-y-4">
              {/* Link Access Control */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                <h3 className="font-semibold text-slate-900 text-sm">Link Access Level</h3>
                <div className="space-y-2">
                  <label
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-white cursor-pointer transition-colors"
                    onClick={() => setLinkAccess("view")}
                  >
                    <input type="radio" checked={linkAccess === "view"} onChange={() => setLinkAccess("view")} />
                    <div>
                      <p className="font-medium text-slate-900">View Only</p>
                      <p className="text-xs text-slate-600">Recipients can only view the document</p>
                    </div>
                  </label>
                  <label
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-white cursor-pointer transition-colors"
                    onClick={() => setLinkAccess("edit")}
                  >
                    <input type="radio" checked={linkAccess === "edit"} onChange={() => setLinkAccess("edit")} />
                    <div>
                      <p className="font-medium text-slate-900">Can Edit</p>
                      <p className="text-xs text-slate-600">Recipients can view and edit the document</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Share Link */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Link2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Shareable Link</p>
                    <p className="text-xs text-slate-600">Anyone with this link can access the document</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input value={shareLink} readOnly className="bg-white font-mono text-sm text-slate-700" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyShareLink}
                    className="gap-2 whitespace-nowrap bg-transparent"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Link Preview Card */}
              <Card className="p-4 bg-slate-50 border-slate-200">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg flex-shrink-0">
                      <Globe className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">Link Preview</p>
                      <p className="text-sm text-slate-600 mt-1">When someone opens this link, they'll see:</p>
                    </div>
                  </div>

                  {/* Preview Box */}
                  <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <p className="font-semibold text-slate-900 text-sm">{document.title}</p>
                    </div>
                    <p className="text-xs text-slate-600">
                      Shared document • {linkAccess === "view" ? "View only" : "Can edit"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Permissions Info */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-600" />
                  <p className="text-sm font-medium text-slate-900">Privacy & Security</p>
                </div>
                <ul className="text-xs text-slate-600 space-y-1 ml-6">
                  <li>• Only people with the link can access</li>
                  <li>• Link access can be revoked anytime</li>
                  <li>• All edits are tracked in version history</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
