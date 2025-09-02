// App.jsx
import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import ModelSwitcher from "./components/ModelSwitcher";
import { createSession, getSession, listSessions, saveSessionMessages, renameSession, deleteSession } from "./api/client";

function getUserId() {
  let userId = localStorage.getItem("user_id");
  if (!userId) { 
    userId = crypto.randomUUID(); 
    localStorage.setItem("user_id", userId); 
  }
  return userId;
}

export default function App() {
  const userId = useRef(getUserId());
  const [sessions, setSessions] = useState([]);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [model, setModel] = useState("gpt-4o-mini");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [autoNamed, setAutoNamed] = useState(false); // Add this state

  const refreshSessions = async () => {
    try {
      setLoading(true);
      const sessionsList = await listSessions(userId.current);
      setSessions(sessionsList);
      
      if (sessionsList.length && !current) {
        await selectSession(sessionsList[0].id);
      }
      
      setError(null);
    } catch (err) {
      setError("Failed to load sessions");
      console.error("Failed to refresh sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (sessionId) => {
    try {
      setCurrent(sessionId);
      const messages = await getSession(sessionId);
      setHistory(Array.isArray(messages) ? messages : []);
    } catch (err) {
      setHistory([]);
      console.error("Failed to pick session:", err);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await createSession(userId.current, "New Chat");
      
      if (response?.session_id) {
        const newSession = {
          id: response.session_id,
          user_id: userId.current,
          title: "New Chat",
          created_at: new Date().toISOString()
        };
        
        setSessions(prev => [newSession, ...prev]);
        setCurrent(response.session_id);
        setHistory([]);
        setAutoNamed(false); // Reset autoNamed state
      } else {
        throw new Error("No session_id returned");
      }
    } catch (err) {
      console.error("Failed to add session:", err);
      setError("Failed to create new session");
    }
  };

  const handleUserSend = async (message) => {
    setHistory(prevHistory => {
      const newHistory = [...prevHistory, message];
      if (current) {
        saveSessionMessages(current, newHistory).catch(err => {
          console.error("Failed to save messages:", err);
        });
        // Auto name if first user message
        if (!autoNamed && newHistory.length === 1 && message.role === "user") {
          handleRenameSession(current, message.content.slice(0, 32)); // First 32 chars
          setAutoNamed(true);
        }
      }
      return newHistory;
    });
  };

  const handleAssistantDelta = (delta) => {
    setHistory(prevHistory => {
      let newHistory;
      
      if (model === "gemini-2.5-pro") {
        const content = delta && delta.trim() ? delta : "No response from Gemini.";
        newHistory = [...prevHistory, { 
          role: "assistant", 
          content, 
          model 
        }];
      } else {
        const lastMessage = prevHistory[prevHistory.length - 1];
        
        if (!lastMessage || lastMessage.role !== "assistant") {
          newHistory = [...prevHistory, { 
            role: "assistant", 
            content: delta, 
            provider: model.startsWith("gemini") ? "gemini" : "openai", 
            model: model 
          }];
        } else {
          newHistory = [...prevHistory];
          newHistory[newHistory.length - 1] = { 
            ...lastMessage, 
            content: (lastMessage.content || "") + delta 
          };
        }
      }
      
      if (current) {
        saveSessionMessages(current, newHistory).catch(err => {
          console.error("Failed to save messages:", err);
        });
      }
      
      return newHistory;
    });
  };

  const handleAssistantDone = (assistantText, model) => {
    setHistory(prev => [
      ...prev,
      {
        role: "assistant",
        content: assistantText,
        model
      }
    ]);
    setError(""); // Optional: clear error
  };

  useEffect(() => { 
    refreshSessions(); 
  }, []);

  const handleRenameSession = async (sessionId, newTitle) => {
    setSessions(sessions =>
      sessions.map(s =>
        s.id === sessionId ? { ...s, title: newTitle } : s
      )
    );
    await renameSession(sessionId, newTitle); // Update backend
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(sessionId); // Call backend
      setSessions(sessions => sessions.filter(s => s.id !== sessionId));
      if (current === sessionId) {
        setCurrent(sessions.length ? sessions[0].id : null);
        setHistory([]);
      }
    } catch (err) {
      setError("Failed to delete conversation.");
    }
  };

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <div className={`layout ${theme}`} style={{ display: 'flex', height: '100vh' }}>
      <Sidebar 
        sessions={sessions} 
        currentId={current} 
        onNew={createNewSession} 
        onPick={selectSession}
        onRename={handleRenameSession}
        onDelete={handleDeleteSession}
        theme={theme}
        toggleTheme={toggleTheme}
        className={theme}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
  className={`toolbar ${theme}`}
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 32px 8px 32px",
    fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif"
  }}
>
  <div
    style={{
      marginLeft: "32px",
      fontWeight: 700,
      fontSize: "2rem",
      color: theme === "dark" ? "#b7aaff" : "#7b61ff",
      letterSpacing: "1px"
    }}
  >
    {current && (sessions.find(s => s.id === current)?.title || "")}
  </div>
  <ModelSwitcher value={model} onChange={setModel} />
</div>
        {loading ? (
          <div className="loading" aria-label="Loading" style={{ padding: '2rem', textAlign: 'center' }}>
            Loading sessions...
          </div>
        ) : current ? (
          <div className={`chat-panel ${theme}`} style={{ flex: 1 }}>
            <ChatPanel
              sessionId={current}
              model={model}
              history={history}
              onUserSend={handleUserSend}
              onAssistantDelta={handleAssistantDelta}
              onAssistantDone={handleAssistantDone}
              theme={theme}
            />
          </div>
        ) : (
          <div className="empty" style={{ padding: '2rem', textAlign: 'center' }}>
            Create a new chat to begin.
          </div>
        )}
      </main>
    </div>
  );
}