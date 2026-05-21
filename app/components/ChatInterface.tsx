"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Plus,
  ShieldCheck,
  Crown,
  FolderOpen,
  ClipboardCheck,
  Headset,
  Send,
  Trash2,
  Zap,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import VoiceInput from "./VoiceInput";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ACTION_CARDS = [
  {
    id: "new-policy",
    label: "New Policy",
    prompt: "I want to know about getting a new insurance policy with TILIL. What plans are available and which would suit me best?",
    icon: ShieldCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800/40",
  },
  {
    id: "premium",
    label: "Premium Policy",
    prompt: "I want to learn about premium payments for TILIL policies. How can I calculate and pay my premium?",
    icon: Crown,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800/40",
  },
  {
    id: "existing",
    label: "Existing Policy",
    prompt: "I have an existing policy with TILIL. How can I check my policy status and payment history?",
    icon: FolderOpen,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800/40",
  },
  {
    id: "claim",
    label: "Claim",
    prompt: "I need information about the insurance claim process at TILIL. How do I file a claim?",
    icon: ClipboardCheck,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-800/40",
  },
  {
    id: "help",
    label: "Help",
    prompt: "I need help. What can you assist me with regarding TILIL insurance?",
    icon: Headset,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800/40",
  },
];

export default function ChatInterface() {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 60);
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "24px";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isStreaming) return;

    const userMsg: Message = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);

        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const { content: c, error } = JSON.parse(data);
            if (error) throw new Error(error);
            if (c) {
              accumulated += c;
              const final_ = accumulated;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: final_ };
                return copy;
              });
            }
          } catch {}
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ **Error:** ${err.message}\n\nMake sure your \`.env.local\` has a valid \`GITHUB_TOKEN\`.`,
        },
      ]);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setInput((prev) => (prev ? prev + " " + text : text));
    inputRef.current?.focus();
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-screen max-w-[860px] mx-auto bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      {/* ═══════ HEADER ═══════ */}
      <header className="sticky top-0 z-20 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border transition-colors duration-300">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl
                bg-brand-500 shadow-md shadow-brand-500/25 text-white text-lg sm:text-xl"
              aria-hidden="true"
            >
              ☪
            </div>
            <div className="flex flex-col">
              <h1 className="text-[15px] sm:text-[17px] font-bold text-gray-900 dark:text-gray-100 leading-tight tracking-tight">
                Trust Islami Life Insurance PLC
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium">
                AI-Powered Insurance Assistant
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* GitHub AI Badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400
                text-[11px] font-semibold"
            >
              <Zap className="w-3 h-3" />
              <span>GitHub AI</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                bg-gray-100 dark:bg-dark-hover border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-gray-400
                hover:bg-amber-50 dark:hover:bg-amber-900/20
                hover:text-amber-600 dark:hover:text-amber-400
                hover:border-amber-300 dark:hover:border-amber-700
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <AnimatePresence mode="wait">
                {theme === "light" ? (
                  <motion.div key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon className="w-[16px] h-[16px]" />
                  </motion.div>
                ) : (
                  <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun className="w-[16px] h-[16px]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Clear Chat */}
            <button
              onClick={clearChat}
              aria-label="Start new chat"
              className="w-9 h-9 flex items-center justify-center rounded-xl
                bg-gray-100 dark:bg-dark-hover border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-gray-400
                hover:bg-red-50 dark:hover:bg-red-900/20
                hover:text-red-500 dark:hover:text-red-400
                hover:border-red-300 dark:hover:border-red-700
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <Plus className="w-[16px] h-[16px]" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════ CHAT AREA ═══════ */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 scroll-smooth">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            {/* Hero */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl mb-5 drop-shadow-lg"
              aria-hidden="true"
            >
              ☪
            </motion.div>
            <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">
              Trust Islami Life Insurance PLC
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md leading-relaxed mb-1">
              Shariah-compliant insurance guidance in Bangla &amp; English
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 italic mb-8">
              আপনি বাংলায় বা ইংরেজিতে যেকোনো প্রশ্ন করতে পারেন
            </p>

            {/* Action Cards — 5 cards grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 w-full max-w-lg">
              {ACTION_CARDS.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.button
                    key={card.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
                    whileHover={{ y: -4, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(card.prompt)}
                    aria-label={card.label}
                    className={`
                      flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl
                      border ${card.border} ${card.bg}
                      hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/20
                      transition-shadow duration-200 cursor-pointer
                      focus:outline-none focus:ring-2 focus:ring-brand-500/40
                    `}
                  >
                    <div className={`${card.color}`}>
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.8} />
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300 text-center leading-tight">
                      {card.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-1">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 py-1.5 ${msg.role === "user" ? "justify-end" : "justify-start items-start"}`}
                >
                  {/* Avatar (assistant only) */}
                  {msg.role === "assistant" && (
                    <div
                      className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-xl
                        bg-brand-500 text-white text-sm shadow-md shadow-brand-500/20 mt-0.5"
                      aria-hidden="true"
                    >
                      ☪
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`
                      max-w-[80%] px-4 py-3 text-[14.5px] leading-[1.7] break-words
                      ${
                        msg.role === "user"
                          ? "bg-brand-500 text-white rounded-2xl rounded-br-md shadow-sm shadow-brand-500/15"
                          : "bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md shadow-sm"
                      }
                    `}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose-tilil">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2.5 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
                            ul: ({ children }) => <ul className="my-2 pl-4 space-y-1 list-disc marker:text-brand-500">{children}</ul>,
                            ol: ({ children }) => <ol className="my-2 pl-4 space-y-1 list-decimal marker:text-brand-500">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            h1: ({ children }) => <h3 className="text-[15px] font-bold text-brand-600 dark:text-brand-400 mt-3.5 mb-1.5 first:mt-0">{children}</h3>,
                            h2: ({ children }) => <h3 className="text-[15px] font-bold text-brand-600 dark:text-brand-400 mt-3.5 mb-1.5 first:mt-0">{children}</h3>,
                            h3: ({ children }) => <h4 className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-3 mb-1 first:mt-0">{children}</h4>,
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-3 rounded-xl border border-gray-200 dark:border-dark-border">
                                <table className="w-full text-[13px] border-collapse">{children}</table>
                              </div>
                            ),
                            thead: ({ children }) => <thead>{children}</thead>,
                            th: ({ children }) => (
                              <th className="bg-brand-50 dark:bg-brand-900/20 px-3 py-2.5 text-left font-semibold text-brand-700 dark:text-brand-400 border-b-2 border-brand-200 dark:border-brand-800 whitespace-nowrap">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-3 py-2 border-b border-gray-100 dark:border-dark-border text-gray-600 dark:text-gray-400">
                                {children}
                              </td>
                            ),
                            code: ({ children, className }) =>
                              className ? (
                                <pre className="bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl p-3 overflow-x-auto text-[13px] my-2.5">
                                  <code>{children}</code>
                                </pre>
                              ) : (
                                <code className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md text-[13px] font-medium">
                                  {children}
                                </code>
                              ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-3 border-brand-400 dark:border-brand-600 pl-3 my-2.5 text-gray-500 dark:text-gray-400 italic text-[13px]">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {msg.content || "..."}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2.5 py-1.5 items-start"
              >
                <div className="w-8 h-8 min-w-[32px] flex items-center justify-center rounded-xl bg-brand-500 text-white text-sm shadow-md shadow-brand-500/20">
                  ☪
                </div>
                <div className="px-5 py-3.5 rounded-2xl rounded-bl-md bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((n) => (
                      <motion.span
                        key={n}
                        className="w-2 h-2 rounded-full bg-brand-500"
                        animate={{ scale: [0.7, 1, 0.7], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: n * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ═══════ INPUT AREA ═══════ */}
      <div className="sticky bottom-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border px-4 sm:px-5 pt-3 pb-4 transition-colors duration-300">
        <div
          className="flex items-end gap-2.5 bg-gray-50 dark:bg-dark-input
            border-2 border-gray-200 dark:border-dark-border rounded-2xl
            px-4 py-1.5
            focus-within:border-brand-500 dark:focus-within:border-brand-500
            focus-within:shadow-lg focus-within:shadow-brand-500/8
            transition-all duration-200"
        >
          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="জিজ্ঞাসা করুন... Ask anything about TILIL insurance..."
            rows={1}
            disabled={isStreaming}
            aria-label="Type your message"
            className="flex-1 bg-transparent border-none outline-none text-gray-800 dark:text-gray-200
              text-[14.5px] font-sans leading-relaxed resize-none py-2.5
              min-h-[24px] max-h-[120px]
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              disabled:opacity-40"
          />

          {/* Voice Input */}
          <VoiceInput onTranscript={handleVoiceTranscript} disabled={isStreaming} />

          {/* Send Button */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            aria-label="Send message"
            className="w-10 h-10 min-w-[40px] flex items-center justify-center rounded-xl
              bg-brand-500 text-white shadow-md shadow-brand-500/25
              hover:bg-brand-600 hover:scale-[1.04]
              disabled:opacity-25 disabled:shadow-none disabled:cursor-not-allowed
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            <Send className="w-[18px] h-[18px]" />
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-2.5 leading-relaxed" role="contentinfo">
          Powered by GitHub Models · Educational only · Not financial advice
        </p>
      </div>
    </div>
  );
}
