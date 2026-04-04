"use client"
// IMPORTENT

import { useSession } from "next-auth/react"
import { AgreementChatbot } from "./agreement-chatbot"
import { useChatbot } from "@/lib/chatbot-context"

export function GlobalChatbotWrapper() {
  const { data: session, status } = useSession()
  const { isOpen, toggleOpen, documentContent, documentTitle } = useChatbot()

  // Only render chatbot when user is authenticated
  if (status !== "authenticated" || !session) return null

  return (
    <AgreementChatbot
      documentContent={documentContent}
      documentTitle={documentTitle}
      isOpen={isOpen}
      onToggle={toggleOpen}
    />
  )
}
