import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { apiFetch } from "../../services/apiClient";
import "./Chatbot.css";

type ChatMessage = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hello! Welcome to our store. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    setMessages((previous) => [
      ...previous,
      { id: Date.now(), sender: "user", text: userMessage },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiFetch("/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setMessages((previous) => [
        ...previous,
        { id: Date.now() + 1, sender: "bot", text: data.reply },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "Sorry, I cannot connect to the server right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <i className="bi bi-chat-dots-fill" aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <i className="bi bi-robot" aria-hidden="true" />
              </div>
              <div>
                <h3>Store Assistant</h3>
                <span>Online - Ready to help</span>
              </div>
            </div>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${message.sender}`}
              >
                <div className="message-bubble">{message.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message bot">
                <div className="message-bubble typing">Typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <i className="bi bi-send-fill" aria-hidden="true" />
            </button>
          </form>
          <div className="chatbot-footer">Powered by Store Assistant</div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
