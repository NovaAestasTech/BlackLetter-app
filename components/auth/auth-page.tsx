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
import { CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Logo Section */}
      <div className="mb-8 flex items-center gap-3">
        <svg
          className="w-10 h-10 text-primary"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="40" height="40" rx="8" fill="currentColor" fillOpacity="0.15" />
          <path
            d="M12 10h4v20h-4V10zm6 0h4v20h-4V10zm6 0h4v20h-4V10z"
            fill="currentColor"
            fillOpacity="0.6"
          />
          <rect x="10" y="14" width="20" height="2" rx="1" fill="currentColor" />
          <rect x="10" y="24" width="20" height="2" rx="1" fill="currentColor" />
        </svg>
        <h1 className="text-3xl font-bold text-primary">
          BlackLetter
        </h1>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md shadow-2xl border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl text-card-foreground">
            {isLogin ? "Sign In" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin
              ? "Access your legal agreements and workspaces"
              : "Join BlackLetter to start collaborating"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-input border-border focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-input border-border focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-input border-border focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-primary hover:text-primary/80 font-semibold"
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
          <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Templates</h3>
          <p className="text-sm text-muted-foreground">
            Professional legal agreement templates
          </p>
        </div>
        <div className="text-center">
          <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Collaborate</h3>
          <p className="text-sm text-muted-foreground">Work together in real-time</p>
        </div>
        <div className="text-center">
          <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Secure</h3>
          <p className="text-sm text-muted-foreground">Enterprise-grade security</p>
        </div>
      </div>
    </div>
  );
}
