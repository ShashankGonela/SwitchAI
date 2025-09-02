// Sidebar.jsx
import React, { useState } from "react";

export default function Sidebar({ sessions, onNew, onPick, currentId, onRename, onDelete, theme, toggleTheme }) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [hovered, setHovered] = useState(null);

  const handleNewChat = () => {
    onNew();
  };

  const handleSelectChat = (id) => {
    onPick(id);
  };

  const handleEdit = (session) => {
    setEditingId(session.id);
    setEditValue(session.title);
  };

  const handleSave = () => {
    onRename(editingId, editValue);
    setEditingId(null);
    setEditValue("");
  };

  const handleDeleteSession = (id) => {
    onDelete(id);
  };

  return (
    <aside 
      className={`sidebar ${theme}`}
      role="region"
      aria-label="Chat sidebar"
    >
      <div className="sidebar-header">
        <button
          onClick={handleNewChat}
          className="new-chat-btn"
          aria-label="Start a new chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Chat
        </button>
      </div>
      
      <div className="chat-history">
        <h3>Chat History</h3>
        
        <ul role="list">
          {sessions.length === 0 && (
            <li className="text-gray-500 dark:text-gray-400 italic text-sm">
              No chats yet.
            </li>
          )}
          
          {sessions.map(({ id, title }) => (
            <li
              key={id}
              style={{ position: "relative" }}
              className="chat-list-item"
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
            >
              {editingId === id ? (
                <input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") {
                      setEditingId(null);
                      setEditValue("");
                    }
                  }}
                  autoFocus
                  style={{
                    width: "80%",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: theme === "dark" ? "1px solid #7b61ff" : "1px solid #b7aaff",
                    background: theme === "dark" ? "#23263a" : "#f7f7fa",
                    color: theme === "dark" ? "#fff" : "#222",
                    fontSize: "1em",
                    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
                    outline: "none",
                    boxShadow: theme === "dark"
                      ? "0 2px 8px rgba(123,97,255,0.08)"
                      : "0 2px 8px rgba(183,170,255,0.08)"
                  }}
                  placeholder="Rename conversation"
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative"
                  }}
                  className="chat-item-row"
                >
                  {hovered === id && (
                    <>
                      <button
                        onClick={() => handleEdit({ id, title })}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          marginRight: "8px",
                          color: theme === "dark" ? "#b7aaff" : "#7b61ff",
                          fontSize: "1.2em",
                          transition: "color 0.2s"
                        }}
                        title="Edit chat name"
                      >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteSession(id)}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: theme === "dark" ? "#b7aaff" : "#7b61ff",
                          fontSize: "1em",
                          opacity: 0.8,
                          transition: "color 0.2s, opacity 0.2s"
                        }}
                        title="Delete conversation"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect x="7" y="9" width="10" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
                          <path d="M9 9V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                          <line x1="10" y1="12" x2="10" y2="16" stroke="currentColor" strokeWidth="2"/>
                          <line x1="14" y1="12" x2="14" y2="16" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleSelectChat(id)}
                    className={`chat-item ${id === currentId ? 'active' : ''}`}
                    aria-current={id === currentId ? "page" : undefined}
                    style={{
                      flex: 1,
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      color: theme === "dark" ? "#fff" : "#222",
                      fontWeight: id === currentId ? 700 : 400,
                      fontSize: "1em",
                      fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
                      padding: "8px 0"
                    }}
                  >
                    <span className="chat-title">{title || "Untitled"}</span>
                    {id === currentId && (
                      <span className="active-indicator" aria-hidden="true" />
                    )}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      <button
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          padding: "8px 16px",
          borderRadius: "6px",
          border: "none",
          background: theme === "dark" ? "#7b61ff" : "#b7aaff",
          color: theme === "dark" ? "#fff" : "#222",
          fontWeight: "bold",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          cursor: "pointer",
          transition: "background 0.2s, color 0.2s"
        }}
        onClick={toggleTheme}
        title="Switch theme"
      >
        {theme === "dark" ? "🌙 Dark" : "🌞 Light"}
      </button>
    </aside>
  );
}