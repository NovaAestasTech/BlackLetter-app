import { Template } from "@/app/templates/templates";
export interface WorkSpace {
  id?: string;
  name: string;
  description: string;
  createdAt: string;
  owner: string;
  members: string[];
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
