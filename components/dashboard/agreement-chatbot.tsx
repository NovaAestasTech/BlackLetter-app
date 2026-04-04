"use client";
// IMPORTENT

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
          className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-zinc-800 shadow-xl shadow-black/10 hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-white z-40 hover:bg-zinc-700 hover:-translate-y-1"
          aria-label="Open agreement assistant"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}

      {/* Chatbot Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-stone-200 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-hidden"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-stone-200 flex items-center justify-center shadow-sm">
                <Lightbulb className="w-4 h-4 text-stone-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-zinc-800 text-sm tracking-tight">
                  AI Assistant
                </h3>
                <p className="text-xs text-stone-500 font-medium tracking-wide font-sans">{documentTitle?.slice(0, 25) || "Agreement"}...</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="text-stone-400 hover:text-zinc-800 transition-colors"
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
                  className={`max-w-xs px-4 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-zinc-800 text-white rounded-2xl rounded-br-sm"
                      : "bg-stone-100 text-zinc-800 rounded-2xl rounded-bl-sm border border-stone-200/50"
                  }`}
                >
                  <p className="whitespace-pre-wrap font-medium">
                    {message.content}
                  </p>
                  <p
                    className={`text-[10px] mt-1 font-bold ${message.role === "user" ? "text-zinc-300" : "text-stone-400"}`}
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
                    className="ml-2 mt-1 text-stone-400 hover:text-zinc-800 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-stone-100 border border-stone-200/50 text-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1.5 items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-stone-200 p-4 space-y-3 bg-white">
            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setInput("Summarize this agreement");
                  }}
                  className="text-xs px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-zinc-800 font-medium transition-colors text-left"
                >
                  Summarize
                </button>
                <button
                  onClick={() => {
                    setInput("What are the key obligations?");
                  }}
                  className="text-xs px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-zinc-800 font-medium transition-colors text-left"
                >
                  Key Points
                </button>
                <button
                  onClick={() => {
                    setInput("Identify any risks or unusual clauses");
                  }}
                  className="text-xs px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-zinc-800 font-medium transition-colors text-left"
                >
                  Risk Analysis
                </button>
                <button
                  onClick={() => {
                    setInput("Suggest improvements to this document");
                  }}
                  className="text-xs px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-zinc-800 font-medium transition-colors text-left"
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
                className="flex-1 bg-stone-50 border-stone-200 text-sm focus-visible:ring-zinc-800 rounded-xl"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-zinc-800 hover:bg-zinc-700 px-3 rounded-xl shadow-none"
                size="sm"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest text-center">
              Shift + Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
