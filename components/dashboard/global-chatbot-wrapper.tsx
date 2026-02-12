"use client"

import { AgreementChatbot } from "./agreement-chatbot"
import { useChatbot } from "@/lib/chatbot-context"

export function GlobalChatbotWrapper() {
  const { isOpen, toggleOpen, documentContent, documentTitle } = useChatbot()

  return (
    <AgreementChatbot
      documentContent={documentContent}
      documentTitle={documentTitle}
      isOpen={isOpen}
      onToggle={toggleOpen}
    />
  )
}
