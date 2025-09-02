# SwitchAI ⚡

A **multi-model conversational AI assistant** with an **ExpressJS backend** and a **React + Vite frontend**.  
Switch between **OpenAI** and **Gemini** seamlessly and chat in real time with streaming responses.

---

## 📂 Project Structure

```
SwitchAI/
├── backend/                # ExpressJS Backend
│   ├── providers/          # AI Provider Integrations
│   │   ├── base.py         # Abstract base provider
│   │   ├── openai_provider.py
│   │   └── gemini_provider.py
│   ├── server.js           # Main ExpressJS server
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Example environment variables
│
├── frontend/               # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Sidebar, ChatPanel, ModelSwitcher
│   │   ├── hooks/          # Custom hooks (e.g. SSE)
│   │   ├── api/            # API calls
│   │   ├── App.jsx         # Main app
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite config
│
├── .env.example            # Example API keys
└── README.md               # Documentation
```

---

## 🚀 Features

- 🔄 Switch between **OpenAI** and **Gemini**
- 💬 Real-time chat with **Server-Sent Events (SSE)**
- 🎨 Modern **React + Vite frontend**
- ⚡ Lightweight **ExpressJS backend**

---

## 🛠️ Setup & Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/switchai.git
cd switchai
```

### 2️⃣ Backend Setup (ExpressJS)
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see `.env.example`).

Run the backend:
```bash
node server.js
```

### 3️⃣ Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file in `backend/` with:

```
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
PORT=5000
```

---

## 🧪 Usage

1. Start backend (`node server.js`).
2. Start frontend (`npm run dev`).
3. Open [http://localhost:5173](http://localhost:5173).
4. Select your model (OpenAI or Gemini) and start chatting 🚀

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open an issue or submit a PR.
