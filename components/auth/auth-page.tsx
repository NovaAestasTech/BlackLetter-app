"use client";
// IMPORTENT

import type React from "react";
import { useState } from "react";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import DarkVeil from "@/components/ui/DarkVeil";

const FONT = "'Playfair Display', serif";
const PANEL_PAD = "44px 52px";
const HEADING_SIZE = "36px";
const TAGLINE_SIZE = "30px";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      if (isLogin) {
        const result = await nextAuthSignIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (result?.error) {
          setError("Invalid email or password");
        } else {
          router.push("/");
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed");
        } else {
          await nextAuthSignIn("credentials", {
            email,
            password,
            callbackUrl: "/",
          });
        }
      }
    } catch (e) {
      setIsLoading(false);
      if (e instanceof Error) throw new Error(e.message);
      throw new Error("Unidentified Error");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "13px",
    fontFamily: FONT,
    background: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    color: "#374151",
    marginBottom: "4px",
    fontFamily: FONT,
    fontWeight: 600,
  };

  if (isLogin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          fontFamily: FONT,
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700;1,900&display=swap');`}</style>

        {/* LEFT — DarkVeil panel */}
        <div
          style={{
            width: "45%",
            position: "relative",
            background: "#000",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "32px",
            flexShrink: 0,
          }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            <DarkVeil hueShift={0} speed={0.3} warpAmount={1.2} noiseIntensity={0.04} />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)",
              pointerEvents: "none",
            }}
          />
          {/* Top logo */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <span style={{ color: "#fff", fontSize: "15px", fontFamily: FONT, fontWeight: 500 }}>
              blackletter.
            </span>
          </div>
          {/* Bottom tagline */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <h2
              style={{
                color: "#fff",
                fontSize: TAGLINE_SIZE,
                fontWeight: 700,
                lineHeight: 1.15,
                fontFamily: FONT,
                margin: 0,
              }}
            >
              Workspace<br />for Modern Law.
            </h2>
          </div>
        </div>

        {/* RIGHT — Form panel */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#F7FFDC",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: PANEL_PAD,
          }}
        >
          <h1
            style={{
              fontSize: HEADING_SIZE,
              fontWeight: 700,
              fontFamily: FONT,
              color: "#111827",
              marginBottom: "28px",
              marginTop: 0,
              lineHeight: 1.1,
                justifySelf: "center",
            }}
          >
            Welcome Back
          </h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                placeholder="Enter Your Email ID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontFamily: FONT, color: "#374151", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: "14px", height: "14px", accentColor: "#1a1a2e" }}
                />
                Remember me
              </label>
              <button type="button" style={{ fontSize: "12px", fontFamily: FONT, color: "#374151", background: "none", border: "none", cursor: "pointer" }}>
                Forgot password?
              </button>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", color: "#dc2626", fontSize: "13px", padding: "10px 14px", borderRadius: "6px", border: "1px solid #fecaca", fontFamily: FONT }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                background: "#0f0f2d",
                color: "#fff",
                padding: "13px",
                borderRadius: "6px",
                fontSize: "15px",
                fontWeight: 600,
                fontFamily: FONT,
                border: "none",
                cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >
              Sign In
            </button>

            <div style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", fontFamily: FONT, display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ flex: 1, height: "1px", background: "#d1d5db" }} />
              or
              <span style={{ flex: 1, height: "1px", background: "#d1d5db" }} />
            </div>

            <button
              type="button"
              style={{
                background: "#fff",
                color: "#374151",
                padding: "13px",
                borderRadius: "6px",
                fontSize: "15px",
                fontFamily: FONT,
                border: "1px solid #d1d5db",
                cursor: "pointer",
              }}
            >
              Login With SSO
            </button>
          </form>

          <p style={{ marginTop: "24px", fontSize: "13px", fontFamily: FONT, color: "#6b7280", textAlign: "center" }}>
            Don&apos;t have an account?{" "}
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              style={{ fontWeight: 700, color: "#111827", background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: "13px" }}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ── SIGNUP ──
  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: FONT }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700;1,900&display=swap');`}</style>

      {/* LEFT — Form panel */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#F7FFDC",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: PANEL_PAD,
        }}
      >
        <h1
          style={{
            fontSize: HEADING_SIZE,
            fontWeight: 700,
            fontFamily: FONT,
            color: "#111827",
            marginBottom: "28px",
            marginTop: 0,
            lineHeight: 1.1,
          }}
        >
          Create your account
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                placeholder="Enter Your First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                placeholder="Enter Your Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              placeholder="Enter Your Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontFamily: FONT, color: "#374151", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: "14px", height: "14px", accentColor: "#1a1a2e" }}
            />
            Remember me
          </label>

          {error && (
            <div style={{ background: "#fef2f2", color: "#dc2626", fontSize: "13px", padding: "10px 14px", borderRadius: "6px", border: "1px solid #fecaca", fontFamily: FONT }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              background: "#0f0f2d",
              color: "#fff",
              padding: "11px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: FONT,
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}
          >
            Sign Up
          </button>

          <div style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", fontFamily: FONT, display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ flex: 1, height: "1px", background: "#d1d5db" }} />
            or
            <span style={{ flex: 1, height: "1px", background: "#d1d5db" }} />
          </div>

          <button
            type="button"
            style={{
              background: "#fff",
              color: "#374151",
              padding: "11px",
              borderRadius: "6px",
              fontSize: "14px",
              fontFamily: FONT,
              border: "1px solid #d1d5db",
              cursor: "pointer",
            }}
          >
            Login With SSO
          </button>
        </form>

        <p style={{ marginTop: "32px", fontSize: "14px", fontFamily: FONT, color: "#6b7280", textAlign: "center" }}>
          Already have an account?{" "}
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            style={{ fontWeight: 700, color: "#111827", background: "none", border: "none", cursor: "pointer", fontFamily: FONT, fontSize: "14px" }}
          >
            Login
          </button>
        </p>
      </div>

      {/* RIGHT — DarkVeil panel */}
      <div
        style={{
          width: "45%",
          position: "relative",
          background: "#000",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "32px",
          flexShrink: 0,
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <DarkVeil hueShift={15} speed={0.3} warpAmount={1.2} noiseIntensity={0.04} />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "flex-end" }}>
          <span style={{ color: "#fff", fontSize: "15px", fontFamily: FONT, fontWeight: 500 }}>
            blackletter.
          </span>
        </div>
        <div style={{ position: "relative", zIndex: 10, textAlign: "right" }}>
          <h2
            style={{
              color: "#fff",
              fontSize: TAGLINE_SIZE,
              fontWeight: 700,
              lineHeight: 1.15,
              fontFamily: FONT,
              fontStyle: "italic",
              margin: 0,
            }}
          >
            Replace chaos with<br />synchronicity.
          </h2>
        </div>
      </div>
    </div>
  );
}
