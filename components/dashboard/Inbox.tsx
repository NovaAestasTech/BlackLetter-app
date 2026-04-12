"use client";

import { Mail, Clock, Check, X, User } from "lucide-react";
import mongoose, { ObjectId } from "mongoose";
import useSWR from "swr";
export function InboxView({ user, data }: { user: any; data: any[] }) {
  const F = "'Manrope', sans-serif";
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const {
    data: requests,

    mutate,
  } = useSWR(`/api/inbox?userId=${user.id}`, fetcher, {
    refreshInterval: 3000,
  });

  const handleAction = async (
    id: ObjectId,
    action: "approved" | "denied",
    requester_id: ObjectId,
    docId: string,
  ) => {
    const res = await fetch(
      `/api/inbox?docId=${new mongoose.Types.ObjectId(docId)}&requesterId=${requester_id}&reqId=${id}`,
      {
        method: "PATCH",
        headers: {
          action: action,
        },
      },
    );

    const newres = await res.json();

    mutate();

    return;
  };

  return (
    <main className="flex-1 h-screen flex flex-col overflow-hidden bg-stone-50/20">
      {/* Page Title */}
      <div className="px-6 pt-9 pb-1 shrink-0">
        <h1
          className="text-zinc-800 font-extrabold tracking-tight"
          style={{ fontSize: "36px", fontFamily: F }}
        >
          Inbox
        </h1>
        <p className="text-stone-500 text-sm font-medium">
          Manage your workspace invitations and document access requests.
        </p>
      </div>

      <div className="flex-1 px-6 pt-6 pb-10 overflow-hidden">
        <div className="h-full bg-white rounded-2xl border border-zinc-300 flex flex-col overflow-hidden shadow-sm">
          {/* List Header */}
          <div className="px-6 py-4 border-b border-zinc-100 bg-stone-50/50 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
              {requests?.length || 0} Pending Requests
            </span>
            {requests?.length > 0 && (
              <button className="text-stone-600 text-xs font-semibold hover:text-zinc-800 transition-colors">
                Mark all as read
              </button>
            )}
          </div>

          {/* List Section */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {requests && requests.length > 0 ? (
              requests.map((req: any, idx: any) => (
                <div
                  key={req._id | idx}
                  className="p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-stone-50/50 transition-all flex items-center gap-4 bg-white"
                >
                  {/* Requester Avatar Circle */}
                  <div className="w-11 h-11 rounded-full bg-stone-100 flex items-center justify-center font-bold text-zinc-700 border border-zinc-200 uppercase text-xs">
                    {req.requester.name}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-zinc-800 truncate">
                        {req.requester.name}
                        <span className="font-medium text-stone-400 ml-1">
                          requested access
                        </span>
                      </p>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-600 uppercase">
                        {req.requestedAccess}
                      </span>
                    </div>

                    {/* Document & Workspace Info */}
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs font-semibold text-blue-600 truncate">
                        {req.documentTitle}
                      </p>
                      <span className="text-stone-300 text-[10px]">|</span>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wide">
                        WS:{req.workspaceId.name}
                      </p>{" "}
                    </div>

                    {/* Optional Message */}
                    {req.message && (
                      <p className="text-xs text-stone-500 mt-2 italic bg-stone-50 p-2 rounded-lg border-l-2 border-stone-200">
                        "{req.message}"
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() =>
                        handleAction(
                          req._id,
                          "approved",
                          req.requester.id,
                          req.documentId,
                        )
                      }
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Check className="w-3 h-3" /> Accept
                    </button>
                    <button
                      onClick={() =>
                        handleAction(
                          req._id,
                          "denied",
                          req.requester.id,
                          req.documentId,
                        )
                      }
                      className="px-3 py-2 bg-white hover:bg-red-50 text-stone-500 hover:text-red-600 rounded-lg text-xs font-bold border border-zinc-200 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-stone-600" />
                </div>
                <h3
                  className="text-lg font-bold text-zinc-800"
                  style={{ fontFamily: F }}
                >
                  Your inbox is empty
                </h3>
                <p className="text-sm max-w-[200px] font-medium text-stone-500">
                  New access requests for your documents will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-6 py-3 border-t border-zinc-100 flex items-center gap-2 bg-stone-50/30">
            <Clock className="w-3 h-3 text-stone-400" />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Auto-refreshes every 10 seconds
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
