import { Template } from "@/app/templates/templates";
export interface WorkSpace {
  id?: string;
  name: string;
  description: string;
  createdAt: string;
  owner: string;
  members: any[];
  sharewith: string[];
  documents: any[];
  lastModified: string;
}
export interface DashboardProps {
  user: any;
  onLogout: () => void;
}
export interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: Template) => void;
}
export interface WorkspaceEditorProps {
  workspace: any;
  currentUser: any;
  onBack: () => void;
}
export interface ParsedDocument {
  content: string;
}
export interface WorkspacesListProps {
  workspaces: any[];
  currentUser: any;
  createWorkSpace: () => void;
}
export interface SharePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: any[];
  onAddMember: (data: { email: string; role: string }) => void;
  onRemoveMember: (memberId: string) => void;
  onUpdateRole: (memberId: string, role: string) => void;
  currentUser: any;
  workspace: any;
}

export interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (file: File, title: string) => void;
}

export interface DocumentShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: any;
  workspaceMembers: any[];
  sharedWith: any[];
  onShare: (sharedWith: any[]) => void;
}

export interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; description: string }) => void;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AgreementChatbotProps {
  documentContent: string;
  documentTitle: string;
  isOpen: boolean;
  onToggle: () => void;
}
