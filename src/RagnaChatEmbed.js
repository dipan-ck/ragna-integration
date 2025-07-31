import React, { useRef, useState, useEffect } from 'react';
import { useRagnaChat } from "./index";
import ReactMarkdown from 'react-markdown';

const defaultLogo = "";

// Move markdownComponents to use function syntax for compatibility with older parsers
function getMarkdownComponents() {
  return {
    h1: function H1(props) {
      return React.createElement(
        'h1',
        { className: "text-4xl font-medium text-neutral-100 mt-4 mb-2" },
        props.children
      );
    },
    h2: function H2(props) {
      return React.createElement(
        'h2',
        { className: "text-2xl font-medium text-neutral-200 mt-3 mb-1" },
        props.children
      );
    },
    p: function P(props) {
      return React.createElement(
        'p',
        { className: "text-neutral-200 leading-relaxed mb-2" },
        props.children
      );
    },
    ul: function UL(props) {
      return React.createElement(
        'ul',
        { className: "list-disc list-inside text-neutral-200 pl-4" },
        props.children
      );
    },
    ol: function OL(props) {
      return React.createElement(
        'ol',
        { className: "list-decimal list-inside text-neutral-200 pl-4" },
        props.children
      );
    },
    li: function LI(props) {
      return React.createElement(
        'li',
        { className: "" },
        props.children
      );
    },
    strong: function Strong(props) {
      return React.createElement(
        'strong',
        { className: "font-bold text-neutral-100" },
        props.children
      );
    },
    a: function A(props) {
      return React.createElement(
        'a',
        {
          href: props.href,
          className: "text-[#2194FF] hover:underline",
          target: "_blank",
          rel: "noopener noreferrer"
        },
        props.children
      );
    },
    hr: function HR() {
      return React.createElement('hr', { className: "border-neutral-600 my-4" });
    }
  };
}

export function RagnaChatEmbed({ logoUrl, size = 60, name = "Ragna", client }) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, isLoading } = useRagnaChat(client);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  useEffect(function () {
    if (isOpen && chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(function () {
    function handler(e) {
      if (e.ctrlKey && e.key === '/') {
        setIsOpen(function (prev) { return !prev; });
      }
    }
    window.addEventListener('keydown', handler);
    return function () {
      window.removeEventListener('keydown', handler);
    };
  }, []);

  const handleSubmit = async function (e) {
    e.preventDefault();
    const input = (inputRef.current && inputRef.current.value) || '';
    if (!input.trim()) return;
    await sendMessage(input);
    if (inputRef.current) inputRef.current.value = '';
  };

  const markdownComponents = getMarkdownComponents();

  return React.createElement(
    React.Fragment,
    null,
    // Floating Button
    React.createElement(
      'div',
      {
        className: "fixed bottom-6 right-6 z-50 cursor-pointer border border-neutral-400 dark:border-neutral-600 bg-white dark:bg-black rounded-full flex items-center justify-center transition hover:scale-105",
        onClick: function () { setIsOpen(!isOpen); },
        style: { width: size, height: size },
        title: "Toggle Chat (Ctrl+/)"
      },
      React.createElement(
        'img',
        {
          src: logoUrl || defaultLogo,
          alt: "Chatbot",
          className: "w-2/3 h-2/3"
        }
      )
    ),
    // Chat Window
    isOpen && React.createElement(
      'div',
      {
        className: "fixed bottom-24 right-6 w-[370px] max-w-[95vw] h-[540px] border bg-white dark:bg-black border-neutral-300 dark:border-neutral-700 rounded-xl shadow-lg z-50 flex flex-col animate-fade-in overflow-hidden"
      },
      // Header
      React.createElement(
        'div',
        { className: "flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-700" },
        React.createElement(
          'div',
          { className: "flex items-center gap-2" },
          React.createElement(
            'img',
            {
              src: logoUrl || defaultLogo,
              alt: "Bot Logo",
              className: "w-6 h-6"
            }
          ),
          React.createElement(
            'span',
            { className: "text-black dark:text-white font-semibold text-sm" },
            name
          )
        ),
        React.createElement(
          'button',
          {
            className: "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white text-xl",
            onClick: function () { setIsOpen(false); }
          },
          '\u00D7'
        )
      ),
      // Chat Body
      React.createElement(
        'div',
        {
          ref: chatWindowRef,
          className: "flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
        },
        messages.length === 0 && React.createElement(
          'div',
          { className: "text-center text-neutral-400 dark:text-neutral-500 pt-12" },
          React.createElement(
            'p',
            { className: "text-sm" },
            "Ask me anything!"
          )
        ),
        messages.map(function (msg, i) {
          return React.createElement(
            'div',
            {
              key: i,
              className: "flex " + (msg.role === 'user' ? 'justify-end' : 'justify-start')
            },
            React.createElement(
              'div',
              {
                className:
                  "px-4 py-2 rounded-2xl text-sm max-w-[80%] break-words " +
                  (msg.role === 'user'
                    ? 'bg-neutral-800 text-white rounded-br-md dark:bg-white dark:text-black'
                    : 'bg-neutral-200 text-black rounded-bl-md dark:bg-neutral-800 dark:text-white')
              },
              React.createElement(
                'div',
                { className: "text-[10px] mb-1 opacity-50 font-semibold" },
                msg.role === 'user' ? 'You' : 'Ragna'
              ),
              msg.role === 'user'
                ? React.createElement(
                    'div',
                    { className: "whitespace-pre-wrap" },
                    msg.content
                  )
                : React.createElement(
                    ReactMarkdown,
                    { components: markdownComponents },
                    msg.content
                  )
            )
          );
        }),
        isLoading && React.createElement(
          'div',
          { className: "flex justify-start" },
          React.createElement(
            'div',
            { className: "flex items-center space-x-1 text-sm px-4 py-2 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400" },
            React.createElement('span', { className: "animate-pulse" }, "Typing"),
            React.createElement('span', { className: "animate-bounce delay-75" }, "."),
            React.createElement('span', { className: "animate-bounce delay-150" }, "."),
            React.createElement('span', { className: "animate-bounce delay-300" }, ".")
          )
        )
      ),
      // Input
      React.createElement(
        'form',
        {
          onSubmit: handleSubmit,
          className: "px-4 py-3 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-black flex gap-2 items-center"
        },
        React.createElement(
          'input',
          {
            ref: inputRef,
            type: "text",
            placeholder: "Type your message...",
            className: "flex-1 px-3 py-2 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white placeholder:text-neutral-400 focus:outline-none",
            disabled: isLoading,
            autoFocus: true
          }
        ),
        React.createElement(
          'button',
          {
            type: "submit",
            disabled: isLoading,
            className: "px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-40"
          },
          "Send"
        )
      )
    ),
    // Animations
    React.createElement(
      'style',
      { jsx: true, global: true },
      `
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
      `
    )
  );
}