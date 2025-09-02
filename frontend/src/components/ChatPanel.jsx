import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";

export default function ChatPanel({
  sessionId,
  provider,
  model,
  history,
  onUserSend,
  onAssistantDelta,
  onAssistantDone,
  theme,
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  useEffect(() => {
    setError("");
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId || loading) return;
    const msg = { role: "user", content: input, provider, model };
    const msgs = [...history, msg];
    onUserSend(msg);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE || "http://localhost:8003"}/chat/${sessionId}/stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: msgs, provider, model }),
        }
      );
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        onAssistantDone(data.response, model);
      }
    } catch (err) {
      setError("Failed to get response from assistant.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyErrorToClipboard = () => {
    navigator.clipboard.writeText(error);
  };

  const getMessageClass = (role) => {
    switch (role) {
      case "user":
        return "message user";
      case "assistant":
        return `message assistant ${theme}`; // <-- Applied theme class to assistant messages
      default:
        return "message error";
    }
  };

  return (
    <div
      className={`chat-panel ${theme}`} // <-- Applied theme class
      role="region"
      aria-label="Chat panel"
    >
      <div
        className="messages-container"
        aria-live="polite"
      >
        {history.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-8 select-none">
            Start the conversation by typing below...
          </p>
        )}

        {history.map((message, idx) => (
          <div key={idx} className={`message ${message.role} ${theme}`}>
            {message.role === "assistant" && message.model && (
              <div style={{
                fontSize: "0.85em",
                color: theme === "dark" ? "#b7aaff" : "#7b61ff",
                marginBottom: "4px",
                fontWeight: 600,
                letterSpacing: "0.5px"
              }}>
                {message.model === "gpt-4o-mini" && "GPT-4o Mini"}
                {message.model === "gemini-2.5-pro" && "Gemini 2.5 Pro"}
                {message.model === "gemini-2.5-flash" && "Gemini 2.5 Flash"}
              </div>
            )}
            <div>{message.content}</div>
          </div>
        ))}

        

        {error && (
          <div
            className="message error"
            role="alert"
          >
            <div className="error-content">
              <p>{error}</p>
            </div>
            <button
              onClick={copyErrorToClipboard}
              className="copy-btn"
              aria-label="Copy error to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                <path d="m4 16c-1.1 0-2-.9-2-2v-10c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
              </svg>
            </button>
          </div>
        )}

        {loading && (
          <div
            className="typing-indicator"
            aria-label="Assistant is typing"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={`input-container ${theme}`}>
        <div className={`input-wrapper ${theme}`}>
          <input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            aria-label="Message input"
          />

          {!loading ? (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`send-btn ${!input.trim() ? 'disabled' : ''}`}
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          ) : (
            <button
              className={`stop-btn ${theme}`}
              onClick={() => setLoading(false)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "none",
                background: theme === "dark" ? "#7b61ff" : "#ececff",
                color: theme === "dark" ? "#fff" : "#7b61ff",
                boxShadow: "0 2px 8px rgba(123,97,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.2em",
                transition: "background 0.2s, color 0.2s"
              }}
              title="Stop generating"
            >
              &#10005;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// When adding an assistant message to history:
// setHistory(prev => [
//   ...prev,
//   {
//     role: "assistant",
//     content: assistantText,
//     model: model // Store the model used for this response
//   }
// ]);

 function onAssistantDone(assistantText, model) {
   setHistory(prev => [
     ...prev,
     {
       role: "assistant",
       content: assistantText,
       model
     }
   ]);
   setError(""); // <-- Clear error after successful response
 }

// When you receive the full assistant response:
