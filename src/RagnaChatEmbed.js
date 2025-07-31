'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRagnaChat } from "./index";
import ReactMarkdown from 'react-markdown';

const defaultLogo = (
  <svg xmlns="http://www.w3.org/2000/svg" width="14278" height="14278" viewBox="0 0 14278 14278" fill="none">
    <path d="M13456 11536.1H9396.7L5522.26 7140.62H9396.7L13456 11536.1Z" fill="white"/>
    <path d="M1554.92 8781.02V11553H5521.31V7142.17H3438.02C1926.56 7142.17 1554.92 8002.66 1554.92 8781.02Z" fill="white"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M9759.72 2725H1553L5522.26 7140.02V2839.94L9380.42 7136.78C11305.7 7136.78 11981.9 5733.56 11981.9 4730.7C11981.9 3507.55 10895.7 2725 9759.72 2725Z" fill="white"/>
  </svg>
);

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-4xl font-medium text-neutral-100 mt-4 mb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-medium text-neutral-200 mt-3 mb-1">{children}</h2>
  ),
  p: ({ children }) => (
    <p className="text-neutral-200 leading-relaxed mb-2">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-neutral-200 pl-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-neutral-200 pl-4">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-neutral-100">{children}</strong>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-[#2194FF] hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="border-neutral-600 my-4" />,
};

function getStoredMessages(storageKey) {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}
  return [];
}

function setStoredMessages(storageKey, messages) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  } catch (e) {}
}

export function RagnaChatEmbed({ logoUrl, size = 60, name = "Ragna", client }) {
  const [isOpen, setIsOpen] = useState(false);

  // Use a unique key for localStorage per project/client if possible
  const storageKey = `ragna-chat-messages`;

  // Use useRagnaChat, but override messages state to persist in localStorage
  const { messages: rawMessages, sendMessage, isLoading } = useRagnaChat(client);

  // Local state for messages, initialized from localStorage
  const [messages, setMessages] = useState(() => getStoredMessages(storageKey));

  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  // On mount, sync messages from localStorage if available
  useEffect(() => {
    setMessages(getStoredMessages(storageKey));
    // eslint-disable-next-line
  }, []);

  // When a new message is received from useRagnaChat, append it and persist
  useEffect(() => {
    // Only update if new messages are present
    if (rawMessages && rawMessages.length > 0) {
      setMessages((prev) => {
        // If last message is the same as last in prev, don't add
        if (
          prev.length > 0 &&
          rawMessages.length === prev.length &&
          prev[prev.length - 1].content === rawMessages[rawMessages.length - 1].content &&
          prev[prev.length - 1].role === rawMessages[rawMessages.length - 1].role
        ) {
          return prev;
        }
        setStoredMessages(storageKey, rawMessages);
        return rawMessages;
      });
    }
    // eslint-disable-next-line
  }, [rawMessages]);

  // Scroll to bottom on new message or open
  useEffect(() => {
    if (isOpen && chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === '/') {
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = inputRef.current?.value || '';
    if (!input.trim()) return;
    await sendMessage(input);
    // The new message will be added via useRagnaChat and effect above
    inputRef.current.value = '';
  };

  // Helper to render logo (img if url, else svg)
  const renderLogo = (className = "") => {
    if (logoUrl) {
      return <img src={logoUrl} alt="Chatbot" className={className + " object-contain"} />;
    }
    // Render SVG directly
    return (
      <span className={className} style={{ display: "inline-block" }}>
        {defaultLogo}
      </span>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className="fixed bottom-8 right-8 z-50 cursor-pointer border border-neutral-400 dark:border-neutral-600 bg-white dark:bg-black rounded-full flex items-center justify-center transition hover:scale-110 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: size,
          height: size,
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)",
        }}
        title="Toggle Chat (Ctrl+/)"
      >
        {renderLogo("w-2/3 h-2/3")}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 w-[400px] max-w-[98vw] h-[600px] border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-2xl z-50 flex flex-col animate-fade-in overflow-hidden backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-black/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              {renderLogo("w-8 h-8")}
              <span className="text-black dark:text-white font-bold text-base tracking-wide">{name}</span>
            </div>
            <button
              className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white text-2xl rounded-full w-9 h-9 flex items-center justify-center transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              tabIndex={0}
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>

          {/* Chat Body */}
          <div
            ref={chatWindowRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 bg-gradient-to-b from-white/80 dark:from-black/80 to-white/100 dark:to-black/100"
            style={{ transition: "background 0.3s" }}
          >
            {messages.length === 0 && (
              <div className="text-center text-neutral-400 dark:text-neutral-500 pt-16">
                <p className="text-base font-medium">Ask me anything!</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative px-5 py-3 rounded-3xl text-base max-w-[85%] break-words shadow-sm transition
                    ${msg.role === 'user'
                      ? 'bg-neutral-800 text-white rounded-br-lg dark:bg-white dark:text-black border border-neutral-700 dark:border-neutral-200'
                      : 'bg-neutral-200 text-black rounded-bl-lg dark:bg-neutral-800 dark:text-white border border-neutral-300 dark:border-neutral-700'
                    }`}
                >
                  <div className="absolute -top-4 left-2 text-[11px] mb-1 opacity-60 font-semibold select-none">
                    {msg.role === 'user' ? 'You' : name}
                  </div>
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <ReactMarkdown components={markdownComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-1 text-base px-5 py-3 rounded-3xl bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 shadow-sm">
                  <span className="animate-pulse">Typing</span>
                  <span className="animate-bounce delay-75">.</span>
                  <span className="animate-bounce delay-150">.</span>
                  <span className="animate-bounce delay-300">.</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-white/90 dark:bg-black/90 flex gap-3 items-center"
            style={{ boxShadow: "0 -2px 12px 0 rgba(0,0,0,0.03)" }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-xl text-base bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white placeholder:text-neutral-400 focus:outline-none border border-neutral-200 dark:border-neutral-800 focus:ring-2 focus:ring-[#2194FF]/30 transition"
              disabled={isLoading}
              autoFocus
              autoComplete="off"
              spellCheck="true"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl text-base font-semibold hover:opacity-90 disabled:opacity-40 shadow transition focus:outline-none focus:ring-2 focus:ring-[#2194FF]/40"
            >
              <span className="hidden sm:inline">Send</span>
              <span className="sm:hidden">→</span>
            </button>
          </form>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.22s cubic-bezier(0.4,0,0.2,1);
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          border-radius: 4px;
        }
        /* Custom scrollbar for better UI */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }
        .dark .scrollbar-thin {
          scrollbar-color: #374151 #111827;
        }
        /* Responsive for mobile */
        @media (max-width: 500px) {
          .fixed.bottom-28.right-8 {
            bottom: 0.5rem !important;
            right: 0.5rem !important;
            width: 98vw !important;
            height: 90vh !important;
            border-radius: 1.25rem !important;
          }
        }
      `}</style>
    </>
  );
}
