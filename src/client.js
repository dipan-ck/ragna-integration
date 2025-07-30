export class RagnaClient {
    constructor(apiKey, projectId, stream = true) {
      this.apiKey = apiKey;
      this.projectId = projectId;
      this.stream = stream;
    }
  
    async sendMessage({ message, onMessage }) {
      const messages = [{ role: "user", content: message }];
      const modelMessage = { role: "model", content: "" };
  
      const res = await fetch(`http://localhost:8000/api/project/${this.projectId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ message }),
      });
  
      if (!res.ok || !res.body) throw new Error("Stream connection failed");
  
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
  
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonData = line.replace("data: ", "").trim();
            if (jsonData === "[DONE]") continue;
  
            try {
              const parsed = JSON.parse(jsonData);
              if (parsed.chunk) {
                modelMessage.content += parsed.chunk;
                if (this.stream) {
                  onMessage?.([...messages, { ...modelMessage }]);
                }
              }
            } catch {}
          }
        }
      }
  
      messages.push(modelMessage);
      if (!this.stream) {
        onMessage?.(messages);
      }
  
      return messages;
    }
  }
  