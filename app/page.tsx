"use client";

import { useState, useEffect } from "react";
import { AuthPage } from "@/components/auth/auth-page";
import { Dashboard } from "@/components/dashboard/dashboard";

export default function Home() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log(user);

  useEffect(() => {
    const storedUser = localStorage.getItem("legal_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? (
    <Dashboard
      user={user}
      onLogout={() => {
        localStorage.removeItem("legal_user");
        setUser(null);
      }}
    />
  ) : (
    <AuthPage onAuth={setUser} />
  );
}
