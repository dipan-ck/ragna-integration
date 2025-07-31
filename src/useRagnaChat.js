import { useState } from "react";

export function useRagnaChat(client) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (input) => {
    setIsLoading(true);
    
    // Add user message to the conversation
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    await client.sendMessage({
      message: input,
      onMessage: (updatedMessages) => {
        // Instead of replacing all messages, append only new assistant messages
        setMessages((prev) => {
          // If updatedMessages contains the full conversation including the user message we just added
          if (Array.isArray(updatedMessages)) {
            return updatedMessages;
          }
          
          // If updatedMessages is just the new assistant response
          // Check if it's already in the messages to avoid duplicates
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === updatedMessages.content) {
            return prev; // Don't add duplicate
          }
          
          // Add the new assistant message
          return [...prev, updatedMessages];
        });
      },
    });

    setIsLoading(false);
  };

  return { messages, sendMessage, isLoading };
}