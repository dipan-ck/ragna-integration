import { useState } from "react";

export function useRagnaChat(client) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (input) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    await client.sendMessage({
      message: input,
      onMessage: (updatedMessages) => {
        setMessages(updatedMessages);
      },
    });

    setIsLoading(false);
  };

  return { messages, sendMessage, isLoading };
}
