"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { WorkspacesList } from "./workspaces-list";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { FileText, LogOut, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DashboardProps {
  user: any;
  onLogout: () => void;
}
interface WorkSpace {
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

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [workspaces, setWorkspaces] = useState<WorkSpace[]>([]);
  const [personalWorkSpace, setPersonalWorksSpace] = useState<WorkSpace[]>([]);
  const [sharedWorkSpace, setsharedWorksSpace] = useState<WorkSpace[]>([]);
  useEffect(() => {
    const workspaces = async () => {
      try {
        const data = await fetch("/api/workspace", {
          method: "GET",
        });
        const res = await data.json();

        setWorkspaces(res);
        const shared = res.filter((ws: WorkSpace) => ws.sharewith.length > 0);
        setsharedWorksSpace(shared);
        const pershared = res.filter(
          (ws: WorkSpace) => ws.sharewith?.length == 0,
        );
        setPersonalWorksSpace(pershared);
      } catch (e) {
        if (e instanceof Error) {
          throw new Error(e.message);
        }
        throw new Error("Unknown error occurred");
      }
    };
    workspaces();
  }, []);

  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const addNewWorkSpace = async (workspace: WorkSpace) => {
    try {
      const res = await fetch("api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workspace),
      });
      const data = await res.json();
      return data;
      if (!res.ok) {
        throw new Error("WorkSpace not created");
      }
    } catch (e) {
      throw new Error("Workspace can't be created");
    }
  };
  const handleCreateWorkspace = async (data: any) => {
    const newWorkspace: WorkSpace = {
      name: data.name,
      description: data.description,
      createdAt: new Date().toISOString(),
      owner: user.id,
      members: [user.id],
      documents: [],
      sharewith: [],
      lastModified: new Date().toISOString(),
    };
    setPersonalWorksSpace([newWorkspace, ...personalWorkSpace]);
    await addNewWorkSpace(newWorkspace);
    setShowCreateWorkspace(false);
  };

  const handleUseTemplate = async (template: any) => {
    let newWorkspace;

    newWorkspace = {
      name: template.name,
      description: template.description,
      createdAt: new Date().toISOString(),
      owner: user.id,
      members: [user.id],
      documents: [],
      sharewith: [],
      lastModified: new Date().toISOString(),
    };

    const newDoc = {
      title: template.name,
      content: getTemplateContent(template.id),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      createdBy: user.id,
      versions: [],
      activeUsers: [user.id],
      sharedWith: [],
      fileType: "text",
      isTemplate: true,
      templateId: template.id,
    };
    const workspace = await addNewWorkSpace(newWorkspace);
    await addDocument(newDoc, workspace._id);

    let updated: WorkSpace = addDocToWorkspace(newWorkspace, newDoc);
    setPersonalWorksSpace((prev: any) => [...prev, updated]);
  };
  const addDocToWorkspace = (workspace: WorkSpace, doc: any) => {
    const updatedWorkspace = {
      ...workspace,
      documents: [doc, ...(workspace.documents || [])],
      lastModified: new Date().toISOString(),
    };
    return updatedWorkspace;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2.5 rounded-lg shadow-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">LegalHub</h1>
                <p className="text-sm text-slate-500">
                  Professional Agreement Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="gap-2 text-slate-600 hover:text-slate-900"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="workspaces" className="w-full">
          <TabsContent value="workspaces" className="space-y-8 mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">
                    Your Workspaces
                  </h2>
                  <p className="text-slate-600 mt-2">
                    Collaborate with your team on legal agreements
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateWorkspace(true)}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Create Workspace
                </Button>
              </div>
              <Tabs defaultValue="allWorkspaces" className="w-full mt-6">
                <TabsList className="grid grid-cols-2 border-b">
                  <TabsTrigger
                    value="allWorkspaces"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                  >
                    All Workspaces
                  </TabsTrigger>
                  <TabsTrigger
                    value="myWorkspaces"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600"
                  >
                    My Workspaces
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="allWorkspaces" className="p-4">
                  {sharedWorkSpace.length > 0 && (
                    <WorkspacesList
                      workspaces={sharedWorkSpace}
                      currentUser={user}
                      createWorkSpace={() => setShowCreateWorkspace(true)}
                    />
                  )}
                </TabsContent>

                <TabsContent value="myWorkspaces" className="p-4">
                  {personalWorkSpace.length > 0 && (
                    <WorkspacesList
                      workspaces={personalWorkSpace}
                      currentUser={user}
                      createWorkSpace={() => setShowCreateWorkspace(true)}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
        onCreate={handleCreateWorkspace}
      />
    </div>
  );
}

function getTemplateContent(templateId: string): string {
  const templateContents: Record<string, string> = {
    "1": `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into as of [DATE] between [CLIENT NAME] ("Client") and [SERVICE PROVIDER NAME] ("Provider").

1. SERVICES
Provider agrees to provide the following services: [DESCRIBE SERVICES]

2. TERM
The initial term of this Agreement shall be [NUMBER] months, commencing on [START DATE].

3. COMPENSATION
Client agrees to pay Provider [AMOUNT] [PAYMENT FREQUENCY] for the services described herein.

4. CONFIDENTIALITY
Both parties agree to maintain confidentiality of any proprietary information shared during the term of this Agreement.

5. TERMINATION
Either party may terminate this Agreement with [NOTICE PERIOD] written notice.

6. GOVERNING LAW
This Agreement shall be governed by the laws of [JURISDICTION].`,

    "2": `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of [DATE] between [DISCLOSING PARTY] ("Discloser") and [RECEIVING PARTY] ("Recipient").

1. DEFINITION OF CONFIDENTIAL INFORMATION
Confidential Information includes but is not limited to: trade secrets, business plans, technical data, and financial information.

2. OBLIGATIONS
The Recipient agrees to:
- Maintain strict confidentiality
- Limit access to authorized personnel only
- Not disclose without prior written consent

3. PERMITTED DISCLOSURE
Disclosure is permitted only as required by law or court order.

4. TERM
This Agreement shall remain in effect for [NUMBER] years from the date of execution.

5. RETURN OF INFORMATION
Upon request, Recipient shall return or destroy all Confidential Information.`,

    "3": `EMPLOYMENT CONTRACT

This Employment Contract ("Agreement") is entered into as of [DATE] between [COMPANY NAME] ("Employer") and [EMPLOYEE NAME] ("Employee").

1. POSITION & DUTIES
Employee shall serve as [POSITION TITLE] and shall perform duties as assigned.

2. COMPENSATION
Annual salary: $[AMOUNT]
Benefits: [LIST BENEFITS]

3. TERM OF EMPLOYMENT
Employment shall be on an at-will basis unless otherwise specified.

4. WORK SCHEDULE
Standard work schedule: [DAYS/HOURS]

5. CONFIDENTIALITY & NON-COMPETE
Employee agrees to maintain confidentiality and not compete during employment and [NUMBER] years after.

6. TERMINATION
Either party may terminate employment with [NOTICE PERIOD] written notice.`,

    "4": `INDEPENDENT CONTRACTOR AGREEMENT

This Independent Contractor Agreement ("Agreement") is entered into as of [DATE] between [CLIENT NAME] ("Client") and [CONTRACTOR NAME] ("Contractor").

1. ENGAGEMENT
Client engages Contractor to provide: [DESCRIBE SERVICES]

2. COMPENSATION & PAYMENT
Contractor shall be compensated: $[AMOUNT] [PAYMENT TERMS]

3. INDEPENDENT CONTRACTOR STATUS
Contractor is an independent contractor and not an employee.

4. TAXES & INSURANCE
Contractor is responsible for all taxes, insurance, and other statutory obligations.

5. INTELLECTUAL PROPERTY
All work product created shall be the property of [CLIENT/CONTRACTOR].

6. CONFIDENTIALITY
Contractor agrees to maintain confidentiality of Client's proprietary information.`,

    "5": `TERMS OF SERVICE

Last Updated: [DATE]

1. ACCEPTANCE OF TERMS
By accessing this service, you accept these Terms of Service.

2. USE LICENSE
We grant you a limited, non-exclusive license to use our service for lawful purposes.

3. DISCLAIMER OF WARRANTIES
This service is provided on an "as-is" basis. We disclaim all warranties.

4. LIMITATION OF LIABILITY
In no event shall we be liable for damages exceeding [AMOUNT].

5. USER RESPONSIBILITIES
Users agree to: not violate laws, not infringe rights, not transmit harmful content.

6. INTELLECTUAL PROPERTY
All content is protected by copyright. Unauthorized use is prohibited.`,

    "6": `VENDOR AGREEMENT

This Vendor Agreement ("Agreement") is entered into as of [DATE] between [COMPANY NAME] ("Buyer") and [VENDOR NAME] ("Vendor").

1. PRODUCTS/SERVICES
Vendor agrees to provide: [DESCRIBE PRODUCTS/SERVICES]

2. PRICING & PAYMENT TERMS
Unit price: $[AMOUNT]
Payment terms: [TERMS]

3. DELIVERY
Delivery shall occur: [DELIVERY TERMS]

4. QUALITY STANDARDS
All products/services shall meet specified quality standards.

5. TERMINATION
Either party may terminate with [NOTICE PERIOD] notice for material breach.

6. LIABILITY
Vendor's liability shall not exceed the value of products/services provided.`,
  };

  return templateContents[templateId] || "Template content not found";
}
