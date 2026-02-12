"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ChatbotContextType {
  isOpen: boolean
  toggleOpen: () => void
  documentContent: string
  setDocumentContent: (content: string) => void
  documentTitle: string
  setDocumentTitle: (title: string) => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [documentContent, setDocumentContent] = useState("No document selected. Ask me general legal questions!")
  const [documentTitle, setDocumentTitle] = useState("General Assistant")

  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        toggleOpen,
        documentContent,
        setDocumentContent,
        documentTitle,
        setDocumentTitle,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error("useChatbot must be used within ChatbotProvider")
  }
  return context
}
