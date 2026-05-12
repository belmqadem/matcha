// This is a simple test script to verify that the chat functionality works.
// It connects to the Socket.io server, sends a test message, and listens for responses.
import { io } from "socket.io-client";

const TOKEN = "your_jwt_token_here";

const socket = io("http://localhost:3000", {
  auth: { token: TOKEN },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  socket.emit("chat:send", {
    to: "recipient_user_id_here",
    content: "Hello from test script!",
  });
});

socket.on("chat:sent", (data) => {
  console.log("✅ Message sent:", data);
  socket.disconnect();
  process.exit(0);
});

socket.on("chat:receive", (data) => {
  console.log("📨 Message received:", data);
});

socket.on("chat:error", (err) => {
  console.error("❌ Chat error:", err);
  socket.disconnect();
  process.exit(1);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection failed:", err.message);
  process.exit(1);
});
