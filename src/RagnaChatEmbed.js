import React, { useRef, useState, useEffect } from 'react';
import {useRagnaChat} from "./index"
import ReactMarkdown from 'react-markdown';


const defaultLogo =  (
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

export  function RagnaChatEmbed({ logoUrl, size = 60, name="Ragna", client }) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, isLoading } = useRagnaChat(client);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

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
    inputRef.current.value = '';
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className="fixed bottom-6 right-6 z-50 cursor-pointer border border-neutral-400 dark:border-neutral-600 bg-white dark:bg-black rounded-full flex items-center justify-center transition hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: size, height: size }}
        title="Toggle Chat (Ctrl+/)"
      >
        <img
          src={logoUrl || defaultLogo}
          alt="Chatbot"
          className="w-2/3 h-2/3"
        />
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[370px] max-w-[95vw] h-[540px] border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700 rounded-xl shadow-lg z-50 flex flex-col animate-fade-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <img
                src={logoUrl || defaultLogo}
                alt="Bot Logo"
                className="w-6 h-6"
              />
              <span className="text-black dark:text-white font-semibold text-sm">{name}</span>
            </div>
            <button
              className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white text-xl"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Chat Body */}
          <div
            ref={chatWindowRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
          >
            {messages.length === 0 && (
              <div className="text-center text-neutral-400 dark:text-neutral-500 pt-12">
                <p className="text-sm">Ask me anything!</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] break-words
                    ${msg.role === 'user'
                      ? 'bg-neutral-800 text-white rounded-br-md dark:bg-white dark:text-black'
                      : 'bg-neutral-200 text-black rounded-bl-md dark:bg-neutral-800 dark:text-white'
                    }`}
                >
                  <div className="text-[10px] mb-1 opacity-50 font-semibold">
                    {msg.role === 'user' ? 'You' : 'Ragna'}
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
                <div className="flex items-center space-x-1 text-sm px-4 py-2 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
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
            className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black flex gap-2 items-center"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white placeholder:text-neutral-400 focus:outline-none"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40"
            >
              Send
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
          animation: fade-in 0.2s ease-out;
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