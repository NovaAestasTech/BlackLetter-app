"use client";

import type React from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, CheckCircle2 } from "lucide-react";

interface AuthPageProps {
  onAuth: (user: any) => void;
}

export function AuthPage({ onAuth }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!isLogin && !name) {
      setError("Please enter your name");
      return;
    }

    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: isLogin ? email.split("@")[0] : name,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("legal_user", JSON.stringify(user));
    onAuth(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-950 dark:to-blue-950 flex flex-col items-center justify-center p-4">
      {/* Logo Section */}
      <div className="mb-8 flex items-center gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-3 rounded-lg shadow-lg">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          LegalHub
        </h1>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isLogin ? "Sign In" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Access your legal agreements and workspaces"
              : "Join LegalHub to start collaborating"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-semibold text-slate-900 mb-2 block">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border-slate-300 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-slate-300 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-slate-300 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
        <div className="text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Templates</h3>
          <p className="text-sm text-slate-600">
            Professional legal agreement templates
          </p>
        </div>
        <div className="text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Collaborate</h3>
          <p className="text-sm text-slate-600">Work together in real-time</p>
        </div>
        <div className="text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Secure</h3>
          <p className="text-sm text-slate-600">Enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
}
