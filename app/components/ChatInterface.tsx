"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const SUGGESTIONS = [
  { icon: "🏦", label: "All Plans", prompt: "TILIL এর সব ইন্স্যুরেন্স প্ল্যান গুলো কি কি?" },
  { icon: "🕌", label: "Shariah Info", prompt: "How does Takaful differ from conventional insurance?" },
  { icon: "👶", label: "Child Plan", prompt: "শিশু নিরাপত্তা বীমা সম্পর্কে বিস্তারিত বলুন" },
  { icon: "🕋", label: "Hajj Savings", prompt: "How does the Hajj Insurance Plan work?" },
  { icon: "📊", label: "Compare Plans", prompt: "Compare the main TILIL plans in a table" },
  { icon: "🏥", label: "Health Plans", prompt: "What health insurance products does TILIL offer?" },
  { icon: "💼", label: "Group Insurance", prompt: "Tell me about group insurance for employers" },
  { icon: "🧓", label: "Pension", prompt: "পেনশন স্কিম কিভাবে কাজ করে?" },
];

export default function ChatInterface() {
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
    }, 50);
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "24px";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isStreaming) return;

    const userMsg: Message = {
      role: "user",
      content,
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", timestamp: Date.now() },
      ]);

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
                copy[copy.length - 1] = {
                  role: "assistant",
                  content: final_,
                  timestamp: Date.now(),
                };
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
          timestamp: Date.now(),
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

  return (
    <div className="app">
      {/* Sidebar / Header */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-mark">
            <span className="brand-icon">☪</span>
          </div>
          <div className="brand-text">
            <span className="brand-name">TILIL</span>
            <span className="brand-tag">Insurance Assistant</span>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="status-pill">
            <span className="status-dot" />
            <span>GitHub AI</span>
          </div>
          <button
            className="icon-btn"
            onClick={() => setMessages([])}
            title="New Chat"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-hero">
              <div className="hero-glow" />
              <div className="hero-icon">☪</div>
              <h1>Trust Islami Life Insurance</h1>
              <p className="hero-sub">
                Shariah-compliant insurance guidance in Bangla &amp; English
              </p>
              <p className="hero-hint">
                আপনি বাংলায় বা ইংরেজিতে যেকোনো প্রশ্ন করতে পারেন
              </p>
            </div>

            <div className="suggestions-grid">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-card"
                  onClick={() => sendMessage(s.prompt)}
                >
                  <span className="sug-icon">{s.icon}</span>
                  <span className="sug-label">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg msg-${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="msg-avatar">
                    <span>☪</span>
                  </div>
                )}
                <div className={`msg-body msg-body-${msg.role}`}>
                  {msg.role === "assistant" ? (
                    <div className="prose">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p>{children}</p>,
                          strong: ({ children }) => (
                            <strong>{children}</strong>
                          ),
                          ul: ({ children }) => (
                            <ul className="md-list">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="md-list md-ol">{children}</ol>
                          ),
                          li: ({ children }) => <li>{children}</li>,
                          h1: ({ children }) => (
                            <h3 className="md-heading">{children}</h3>
                          ),
                          h2: ({ children }) => (
                            <h3 className="md-heading">{children}</h3>
                          ),
                          h3: ({ children }) => (
                            <h4 className="md-heading">{children}</h4>
                          ),
                          table: ({ children }) => (
                            <div className="table-wrap">
                              <table>{children}</table>
                            </div>
                          ),
                          code: ({ children, className }) =>
                            className ? (
                              <pre className="code-block">
                                <code>{children}</code>
                              </pre>
                            ) : (
                              <code className="inline-code">{children}</code>
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
              </div>
            ))}

            {isStreaming &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <div className="msg msg-assistant">
                  <div className="msg-avatar"><span>☪</span></div>
                  <div className="msg-body msg-body-assistant">
                    <div className="dot-loader">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="input-dock">
        <div className="input-box">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="জিজ্ঞাসা করুন... Ask anything about TILIL insurance..."
            rows={1}
            disabled={isStreaming}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="dock-note">
          Powered by GitHub Models · Educational only · Not financial advice
        </p>
      </div>
    </div>
  );
}
