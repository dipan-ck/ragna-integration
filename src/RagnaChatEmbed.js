"use client"


import {useRagnaChat} from "./index"
import ReactMarkdown from 'react-markdown';
import { useState, useRef, useEffect } from "react";


const defaultLogo = "";

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
      <li className="my-1">{children}</li>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-neutral-100">{children}</strong>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-[#2194FF] hover:underline transition-colors duration-200"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    hr: () => <hr className="border-neutral-600 my-4" />,
};

export function RagnaChatEmbed({ logoUrl, size = 60, name="Ragna", client }) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages: apiMessages, sendMessage, isLoading } = useRagnaChat(client);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (isOpen && chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [apiMessages, isOpen]);

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
    inputRef.current.value = '';
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className="fixed bottom-20 right-6 z-50 cursor-pointer border border-neutral-400 dark:border-neutral-600 bg-white dark:bg-black rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: size, height: size }}
        title="Toggle Chat (Ctrl+/)"
      >
        <img
          src={logoUrl || defaultLogo}
          alt="Chatbot"
          className="w-2/3 h-2/3 transition-opacity hover:opacity-80"
        />
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[470px] max-w-[95vw] h-[540px] border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700 rounded-4xl shadow-2xl z-50 flex flex-col animate-fade-in overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 dark:border-neutral-700 bg-opacity-95">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl || defaultLogo}
                alt="Bot Logo"
                className="w-7 h-7 rounded-full"
              />
              <span className="text-black dark:text-white font-medium">{name}</span>
            </div>
            <button
              className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white text-2xl transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Chat Body */}
          <div
            ref={chatWindowRef}
            className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
          >
            {apiMessages.length === 0 && (
              <div className="text-center text-neutral-400 dark:text-neutral-500 pt-16">
                <p className="text-base font-medium">Ask me anything!</p>
                <p className="text-sm mt-2 opacity-75">I'm here to help you find answers.</p>
              </div>
            )}

            {apiMessages.map((msg, i) => (
              <div
                key={`${msg.role}-${i}-${msg.content?.substring(0, 20) || ''}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] break-words shadow-sm
                    ${msg.role === 'user'
                      ? 'bg-neutral-800 text-white rounded-br-sm dark:bg-white dark:text-black'
                      : 'bg-neutral-200 text-black rounded-bl-sm dark:bg-neutral-800 dark:text-white'
                    }`}
                >
  
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  ) : (
                    <ReactMarkdown components={markdownComponents}>
                      {msg.content || ''}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-1.5 text-sm px-5 py-3 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                  <span className="animate-pulse">Thinking</span>
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
            className="px-6 py-2 bg-white dark:bg-black "
          >
            <div className="relative flex items-center">
              <textarea
                ref={inputRef}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-5 pr-14 py-3.5 rounded-2xl text-sm bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all resize-none overflow-auto shadow-sm"
                disabled={isLoading}
                autoFocus
                style={{
                  minHeight: '52px',
                  maxHeight: '200px'
                }}
                onInput={(e) => {
                  const textarea = e.target;
                  textarea.style.height = 'auto';
                  textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
                }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 p-3 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 disabled:opacity-40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 transform hover:scale-105 active:scale-95"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-5 h-5"
                >
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </div>
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
          animation: fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          border-radius: 4px;
        }
      `}</style>
    </>
  );
}