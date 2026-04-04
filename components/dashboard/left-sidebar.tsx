"use client";

import { useState } from "react";
import { LayoutDashboard, FolderOpen, PlusCircle, Settings, LogOut, X } from "lucide-react";
import Link from "next/link";

interface LeftSidebarProps {
  activeTab: "dashboard" | "all" | "create";
  onTabChange: (tab: "dashboard" | "all" | "create") => void;
  onCreateWorkspace: () => void;
  onLogout: () => void;
  userEmail: string;
}

const NAV_ITEMS = [
  { id: "dashboard" as const, label: "Dashboard", Icon: LayoutDashboard },
  { id: "all" as const, label: "All Workspaces", Icon: FolderOpen },
  { id: "create" as const, label: "Create Workspace", Icon: PlusCircle },
];

export function LeftSidebar({
  activeTab,
  onTabChange,
  onCreateWorkspace,
  onLogout,
  userEmail,
}: LeftSidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <aside
        className="w-56 shrink-0 h-screen sticky top-0 flex flex-col bg-stone-100 shadow-[4px_0_4px_rgba(0,0,0,0.08)] z-40"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        {/* Logo — Image */}
        <Link href="/">
          <div className="px-6 pt-9 pb-10 flex items-center ">
            <img src="/logo.png" alt="Voyatri Logo" className="h-5  w-auto opacity-80 object-contain" />
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5 mt-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  if (id === "create") {
                    onCreateWorkspace();
                  } else {
                    onTabChange(id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${isActive
                  ? "bg-stone-300 text-zinc-800 font-semibold"
                  : "text-stone-600 hover:bg-stone-200 font-normal"
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom — Settings only */}
        <div className="relative px-3 pb-8 z-50">
          {/* Settings Backdrop */}
          {settingsOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setSettingsOpen(false)}
            />
          )}

          {settingsOpen && (
            <div className="absolute bottom-[calc(100%-24px)] left-3 mb-2 w-[calc(100%-24px)] 
                            bg-white/95 backdrop-blur-xl 
                            rounded-xl shadow-lg shadow-black/5 border border-stone-200/80 
                            overflow-hidden z-50 animate-in fade-in zoom-in-95">

              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-stone-100 bg-stone-50/50">

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-stone-200 
                                flex items-center justify-center text-zinc-800 font-bold text-xs ring-1 ring-stone-300">
                  {userEmail?.[0]?.toUpperCase()}
                </div>

                {/* User Info */}
                <div className="flex flex-col min-w-0 justify-center">
                  <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-0.5">Account</span>
                  <span className="text-sm font-semibold text-zinc-800 truncate leading-4">
                    {userEmail}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-1.5 pb-5">
                <button
                  onClick={() => {
                    setSettingsOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg 
                            hover:bg-stone-100 text-stone-600 hover:text-zinc-800 
                            transition-all duration-200 text-left group"
                >
                  <LogOut className="w-4 h-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-sm font-semibold">Sign out</span>
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm 
                      transition-all duration-200 relative z-50 group
                      ${settingsOpen
                ? "bg-stone-300 text-zinc-800 font-semibold"
                : "text-stone-600 hover:bg-stone-200 hover:text-zinc-800 font-normal"
              }`}
          >
            {/* Icon */}
            <Settings className={`w-4 h-4 shrink-0 transition-transform duration-200 
                                ${settingsOpen ? "rotate-90 text-zinc-800" : "group-hover:rotate-12"}`} />

            {/* Label */}
            <span className={settingsOpen ? "font-semibold" : ""}>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
}
