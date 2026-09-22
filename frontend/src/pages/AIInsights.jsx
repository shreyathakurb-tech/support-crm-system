import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./AIInsights.css";

const API_URL = "http://127.0.0.1:8000/api/ai/chat";

function AIInsights() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hi! I'm ResolveHub AI. I can help you understand tickets, ticket statuses, and the ResolveHub support process. How can I help you?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function handleSend(event) {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const token = localStorage.getItem("resolvehub_token");

    if (!token) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now(),
          sender: "ai",
          text: "Please log in before using ResolveHub AI.",
          timestamp: new Date(),
        },
      ]);

      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: message,
      timestamp: new Date(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to get a response from AI."
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: data.response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "ai",
          text:
            error.message ||
            "Something went wrong while contacting ResolveHub AI.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([
      {
        id: Date.now(),
        sender: "ai",
        text: "Chat cleared. How can I help you?",
        timestamp: new Date(),
      },
    ]);
  }

  async function copyMessage(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Ignore clipboard errors.
    }
  }

  function formatTime(timestamp) {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="ai-page">
      <div className="ai-container">
        <div className="ai-header">
          <div>
            <div className="ai-title-row">
              <div className="ai-icon">✦</div>

              <div>
                <h1>ResolveHub AI</h1>
                <p>
                  Your intelligent customer support assistant
                </p>
              </div>
            </div>
          </div>

          <button
            className="clear-chat-button"
            onClick={clearChat}
            type="button"
          >
            Clear chat
          </button>
        </div>

        <div className="ai-chat-card">
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-row ${message.sender}`}
              >
                {message.sender === "ai" && (
                  <div className="message-avatar">
                    R
                  </div>
                )}

                <div className="message-content">
                  <div className="message-bubble">
  {message.sender === "ai" ? (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {message.text}
    </ReactMarkdown>
  ) : (
    message.text
  )}
</div>

                  <div className="message-meta">
                    <span>{formatTime(message.timestamp)}</span>

                    {message.sender === "ai" && (
                      <button
                        type="button"
                        className="copy-button"
                        onClick={() =>
                          copyMessage(message.text)
                        }
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row ai">
                <div className="message-avatar">R</div>

                <div className="message-content">
                  <div className="message-bubble typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            className="chat-input-area"
            onSubmit={handleSend}
          >
            <input
              type="text"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Ask ResolveHub AI..."
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
            >
              Send
            </button>
          </form>
        </div>

        <div className="ai-suggestions">
          <p>Try asking:</p>

          <button
            type="button"
            onClick={() =>
              setInput("What do the ticket statuses mean?")
            }
          >
            What do the ticket statuses mean?
          </button>

          <button
            type="button"
            onClick={() =>
              setInput("How do I create a support ticket?")
            }
          >
            How do I create a ticket?
          </button>

          <button
            type="button"
            onClick={() =>
              setInput("What information should I include in a ticket?")
            }
          >
            What should I include in a ticket?
          </button>
        </div>
      </div>
    </main>
  );
}

export default AIInsights;