import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const PORT = 3000;

  // Real-time collaboration state
  const rooms = new Map<string, { 
    code: string, 
    language: string,
    users: Map<string, { name: string, color: string, cursor?: { line: number, ch: number } }> 
  }>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", ({ roomId, userName, color }) => {
      socket.join(roomId);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { 
          code: "// Welcome to DevSync\n\nfunction hello() {\n  console.log('Hello World');\n}", 
          language: "javascript",
          users: new Map() 
        });
      }
      
      const room = rooms.get(roomId)!;
      room.users.set(socket.id, { name: userName, color });
      
      // Send current state to the new user
      socket.emit("room-state", {
        code: room.code,
        language: room.language,
        users: Array.from(room.users.entries())
      });

      // Notify others
      socket.to(roomId).emit("user-joined", {
        id: socket.id,
        name: userName,
        color
      });
    });

    socket.on("code-change", ({ roomId, code }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.code = code;
        socket.to(roomId).emit("code-update", code);
      }
    });

    socket.on("cursor-move", ({ roomId, cursor }) => {
      const room = rooms.get(roomId);
      if (room) {
        const user = room.users.get(socket.id);
        if (user) {
          user.cursor = cursor;
          socket.to(roomId).emit("cursor-update", { id: socket.id, cursor });
        }
      }
    });

    socket.on("chat-message", ({ roomId, message, userName }) => {
      io.to(roomId).emit("new-message", {
        id: Math.random().toString(36).substr(2, 9),
        text: message,
        sender: userName,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("disconnect", () => {
      rooms.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id);
          io.to(roomId).emit("user-left", socket.id);
        }
      });
    });
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/execute", express.json(), (req, res) => {
    const { code, language } = req.body;
    
    if (language !== "javascript" && language !== "typescript") {
      return res.json({ output: "Execution only supported for JavaScript/TypeScript in this demo." });
    }

    const fileName = `temp_${Date.now()}.js`;
    fs.writeFileSync(fileName, code);

    exec(`node ${fileName}`, (error, stdout, stderr) => {
      fs.unlinkSync(fileName);
      if (error) {
        return res.json({ output: stderr || error.message });
      }
      res.json({ output: stdout });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`DevSync server running on http://localhost:${PORT}`);
  });
}

startServer();
