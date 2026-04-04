"use client";
// IMPORTENT

import { AuthPage } from "@/components/auth/auth-page";
import { Dashboard } from "@/components/dashboard/dashboard";
import { signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (status === "authenticated" && session) {
    return (
      <Dashboard
        user={session.user}
        onLogout={() => signOut({ callbackUrl: "/" })}
      />
    );
  }

  return <AuthPage />;
}
