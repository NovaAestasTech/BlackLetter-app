"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Loader,
  Lightbulb,
  Copy,
  Check,
} from "lucide-react";

import { Message } from "@/utils/helper";
import { AgreementChatbotProps } from "@/utils/helper";

export function AgreementChatbot({
  documentContent,
  documentTitle,
  isOpen,
  onToggle,
}: AgreementChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hi! I'm your AI Agreement Assistant for "${documentTitle}". I can help you:

• **Summarize** the agreement
• **Answer questions** about specific clauses or terms
• **Extract key information** like dates, parties, and obligations
• **Provide suggestions** to improve the document
• **Identify risks** or unusual clauses

What would you like to know about this agreement?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/agreement-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userMessage: userMessage.content,
          documentContent,
          documentTitle,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-primary-foreground z-40 hover:scale-110"
          aria-label="Open agreement assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chatbot Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card rounded-lg shadow-2xl flex flex-col border border-border z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-secondary">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  AI Assistant
                </h3>
                <p className="text-xs text-muted-foreground">Agreement Analyzer</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-secondary text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.role === "assistant" && (
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="ml-2 mt-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary text-foreground px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border p-4 space-y-3 bg-secondary">
            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setInput("Summarize this agreement");
                  }}
                  className="text-xs px-3 py-2 rounded-lg bg-card border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left"
                >
                  Summarize
                </button>
                <button
                  onClick={() => {
                    setInput("What are the key obligations?");
                  }}
                  className="text-xs px-3 py-2 rounded-lg bg-card border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left"
                >
                  Key Points
                </button>
                <button
                  onClick={() => {
                    setInput("Identify any risks or unusual clauses");
                  }}
                  className="text-xs px-3 py-2 rounded-lg bg-card border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left"
                >
                  Risk Analysis
                </button>
                <button
                  onClick={() => {
                    setInput("Suggest improvements to this document");
                  }}
                  className="text-xs px-3 py-2 rounded-lg bg-card border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors text-left"
                >
                  Suggestions
                </button>
              </div>
            )}

            {/* Input Box */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about the agreement..."
                className="flex-1 bg-input border-border text-sm focus:border-primary text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3"
                size="sm"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Shift + Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
