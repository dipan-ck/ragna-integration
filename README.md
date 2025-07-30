# 🧠 ragna-integration

**Ragna Integration** is a lightweight JavaScript client and React hook that makes it easy to connect your frontend to [Ragna](https://ragna.ai)'s powerful chat API.

---

## 🚀 Quick Start

### 1. Install the package

```bash
npm install ragna-integration
```


## 🚀 Quick Start

### 1. Import the client and the hook

```js
import { useRagnaChat } from 'ragna-integration';
import { RagnaClient } from 'ragna-integration';
```

### 2. Initialize the Ragna client

```js
const client = new RagnaClient('your-api-key', 'your-project-id');
```


### 3. Use inside a React component

```js
import React from 'react';
import { useRagnaChat } from 'ragna-integration';
import { RagnaClient } from 'ragna-integration';

const client = new RagnaClient('your-api-key', 'your-project-id');

export default function ChatBox() {
  const { messages, sendMessage, isLoading } = useRagnaChat(client);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const input = e.target.elements.message.value;
    await sendMessage(input);
    e.target.reset();
  };

  return (
    <div>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>
            <strong>{msg.role}:</strong> {msg.content}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <input name="message" type="text" placeholder="Ask something..." />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```







