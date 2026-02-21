"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/contexts/LanguageContext";

const N8N_WEBHOOK_URL = "https://n8n-yj8ukitqk4qu.uranium.sumopod.my.id/webhook/b8a7764b-ab8d-4c72-8d70-e16cf1d7ea38/chat";

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

const generateSessionId = () => {
  if (typeof window === 'undefined') return `session-${Date.now()}`;

  const stored = sessionStorage.getItem("dd_chat_session");
  if (stored) return stored;
  const id = `dd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  sessionStorage.setItem("dd_chat_session", id);
  return id;
};

const ChatWidget = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSessionId(generateSessionId());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "bot",
          text: t({
            id: "Halo! 👋 Saya Asisten AI Derma-DFU. Ada yang bisa saya bantu mengenai perawatan luka diabetes?",
            en: "Hello! 👋 I am the Derma-DFU AI Assistant. How can I help you with diabetic wound care?"
          }),
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, t]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendMessage",
          sessionId,
          chatInput: trimmed,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "bot",
        text: data.output || data.text || data.response || t({ id: "Maaf, saya tidak mengerti. Bisa ulangi?", en: "Sorry, I didn't catch that. Could you repeat?" }),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "bot",
          text: t({
            id: "Maaf, koneksi terputus. Silakan coba lagi dalam beberapa saat. 🙏",
            en: "Sorry, connection lost. Please try again in a moment. 🙏"
          }),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sessionId, t]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Hide logic
  const [isHidden, setIsHidden] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/auth') || path.startsWith('/admin')) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
    }
  }, []);

  if (isHidden) return null;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#d9738e] text-white shadow-lg shadow-[#d9738e]/30 hover:shadow-xl hover:shadow-[#d9738e]/40 transition-shadow"
            aria-label="Buka Chat AI"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-400 border-2 border-white" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
            style={{ height: "min(600px, calc(100vh - 4rem))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#d9738e] to-[#7ab8dc] px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                  <img src="/logo/logo-derma-dfu-low-res.png" alt="Derma DFU AI" className="h-6 w-6 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Derma-DFU Assistant
                  </h3>
                  <p className="text-[11px] text-white/90 flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-300" />
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Tutup Chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 px-4 py-3">
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex max-w-[85%] gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      {msg.role === "bot" && (
                        <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white border border-gray-100 overflow-hidden shadow-sm">
                          <img src="/logo/logo-derma-dfu-low-res.png" alt="Bot" className="h-5 w-5 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                      <div>
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${msg.role === "user"
                            ? "bg-[#d9738e] text-white rounded-br-md"
                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                            }`}
                        >
                          {msg.role === "bot" ? (
                            <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 text-[13px] leading-relaxed break-words [&_a]:text-[#7ab8dc] [&_a]:underline">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ node, ...props }) => <p {...props} className="mb-1 last:mb-0" />,
                                  ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-4 mb-2" />,
                                  ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-4 mb-2" />,
                                  li: ({ node, ...props }) => <li {...props} className="mb-0.5" />,
                                }}
                              >
                                {msg.text}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            msg.text
                          )}
                        </div>
                        <p
                          className={`mt-1 text-[10px] text-gray-400 ${msg.role === "user" ? "text-right" : "text-left ml-1"
                            }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white border border-gray-100 overflow-hidden shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-[#d9738e]" />
                    </div>
                    <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3 shadow-sm rounded-bl-md">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 bg-white px-3 py-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t({ id: "Ketik pesan...", en: "Type a message..." })}
                  disabled={isLoading}
                  className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#d9738e] focus:ring-1 focus:ring-[#d9738e]/20 transition-all disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#d9738e] text-white shadow-md hover:shadow-lg disabled:opacity-40 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
                  aria-label="Kirim"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 ml-0.5" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                Powered by Derma-DFU AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
