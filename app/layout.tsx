import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ChatbotProvider } from "@/lib/chatbot-context";
import { GlobalChatbotWrapper } from "@/components/dashboard/global-chatbot-wrapper";
import "./globals.css";
import NextAuthProvider from "@/components/Provider/next-auth-provider";

export const metadata: Metadata = {
  title: "BlackLetter - Legal Agreement Dashboard",
  description:
    "Professional legal agreement management with real-time collaboration",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <NextAuthProvider>
          <ChatbotProvider>
            {children}
            <GlobalChatbotWrapper />
          </ChatbotProvider>
        </NextAuthProvider>

        <Analytics />
      </body>
    </html>
  );
}
