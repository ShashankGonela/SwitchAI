// server.js - ExpressJS Backend Alternative
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAI } from "openai";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get("/models", (req,res)=>res.json({
  openai: ["gpt-4o-mini"], anthropic: [], gemini: ["gemini-2.5-pro", "gemini-2.5-flash"]
}));

app.post("/chat/:session_id/stream", async (req, res) => {
  try {
    const { messages, model = "gpt-4o-mini", provider = "openai" } = req.body;
    let reply = "";

    if (provider === "gemini" || model.startsWith("gemini")) {
      // Gemini API call
      const geminiModel = model || "gemini-2.5-pro";
      const prompt = messages.map(m => m.content).join("\n");
      const geminiResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      const data = await geminiResp.json();
      reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
    } else {
      // OpenAI API call
      const completion = await openai.chat.completions.create({
        model,
        messages,
        stream: false,
        max_tokens: Number(process.env.MAX_OUTPUT_TOKENS || 1024)
      });
      reply = completion.choices?.[0]?.message?.content || "No response from OpenAI.";
    }

    res.json({ response: reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// In-memory session storage
const sessions = {};
const messages = {};

// Create a new chat session
app.post("/sessions", (req, res) => {
  const { user_id, title } = req.body;
  const session_id = crypto.randomUUID();
  sessions[session_id] = { id: session_id, user_id, title, created_at: new Date().toISOString() };
  messages[session_id] = [];
  res.json({ session_id });
});

// List sessions for a user
app.get("/sessions", (req, res) => {
  const { user_id } = req.query;
  const userSessions = Object.values(sessions)
    .filter(s => s.user_id === user_id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(userSessions);
});


// Get messages for a session
app.get("/sessions/:session_id", async (req, res) => {
  const sessionId = req.params.session_id;
  const session = sessions[sessionId]; // <-- FIXED
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  // Return messages for this session
  res.json(messages[sessionId] || []);
});

// Save messages for a session
app.post("/sessions/:session_id/messages", (req, res) => {
  const { session_id } = req.params;
  const { messages: msgs } = req.body;
  if (!Array.isArray(msgs)) return res.status(400).json({ error: "messages must be an array" });
  messages[session_id] = msgs;
  res.json({ success: true });
});

app.patch("/sessions/:session_id", (req, res) => {
  const { session_id } = req.params;
  const { title } = req.body;
  if (!sessions[session_id]) {
    return res.status(404).json({ error: "Session not found" });
  }
  sessions[session_id].title = title;
  res.json({ success: true, session: sessions[session_id] });
});

app.delete("/sessions/:session_id", (req, res) => {
  const { session_id } = req.params;
  if (!sessions[session_id]) {
    return res.status(404).json({ error: "Session not found" });
  }
  delete sessions[session_id];
  delete messages[session_id];
  res.json({ success: true });
});

const PORT = process.env.PORT || 8003;
app.listen(PORT, ()=>console.log("Server on :8003"));
/*
// server.js - ExpressJS Backend Alternative
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OpenAI } from "openai";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get("/models", (req,res)=>res.json({
  openai: ["gpt-4o-mini"], anthropic: [], gemini: ["gemini-2.5-pro", "gemini-2.5-flash"]
}));

app.post("/chat/:session_id/stream", async (req, res) => {
  try {
    const { messages, model = "gpt-4o-mini", provider = "openai" } = req.body;
    let reply = "";

    if (provider === "gemini" || model.startsWith("gemini")) {
      // Gemini REST API call
      const geminiModel = model && model !== ":generateContent" ? model : "gemini-2.5-pro";
      const prompt = messages.map(m => m.content).join("\n");
      const geminiResp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );
      const data = await geminiResp.json();
      reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
    } else {
      // OpenAI non-streaming
      const completion = await openai.chat.completions.create({
        model,
        messages,
        stream: false,
        max_tokens: Number(process.env.MAX_OUTPUT_TOKENS || 1024)
      });
      reply = completion.choices?.[0]?.message?.content || "No response from OpenAI.";
    }

    res.json({ response: reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// In-memory session storage
const sessions = {};
const messages = {};

// Create a new chat session
app.post("/sessions", (req, res) => {
  const { user_id, title } = req.body;
  const session_id = crypto.randomUUID();
  sessions[session_id] = { id: session_id, user_id, title, created_at: new Date().toISOString() };
  messages[session_id] = [];
  res.json({ session_id });
});

// List sessions for a user
app.get("/sessions", (req, res) => {
  const { user_id } = req.query;
  const userSessions = Object.values(sessions)
    .filter(s => s.user_id === user_id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(userSessions);
});


// Get messages for a session
app.get("/sessions/:session_id", async (req, res) => {
  const sessionId = req.params.session_id;
  const session = sessions[sessionId]; // <-- FIXED
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  // Return messages for this session
  res.json(messages[sessionId] || []);
});

// Save messages for a session
app.post("/sessions/:session_id/messages", (req, res) => {
  const { session_id } = req.params;
  const { messages: msgs } = req.body;
  if (!Array.isArray(msgs)) return res.status(400).json({ error: "messages must be an array" });
  messages[session_id] = msgs;
  res.json({ success: true });
});

app.patch("/sessions/:session_id", (req, res) => {
  const { session_id } = req.params;
  const { title } = req.body;
  if (!sessions[session_id]) {
    return res.status(404).json({ error: "Session not found" });
  }
  sessions[session_id].title = title;
  res.json({ success: true, session: sessions[session_id] });
});

app.delete("/sessions/:session_id", (req, res) => {
  const { session_id } = req.params;
  if (!sessions[session_id]) {
    return res.status(404).json({ error: "Session not found" });
  }
  delete sessions[session_id];
  delete messages[session_id];
  res.json({ success: true });
});

app.listen(8003, ()=>console.log("Server on :8003"));*/
