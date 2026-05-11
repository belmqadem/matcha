// test-chat.js
import { io } from "socket.io-client";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjNlYjg1YzM0LWYxNGUtNDA1MC04OWRmLWRiMTFlMGY3NmMwYyIsInVzZXJuYW1lIjoiYWJlbC1tcWEiLCJlbWFpbCI6ImFkaWxAZ21haWwuY29tIiwiaWF0IjoxNzc4NTI2NjM4LCJleHAiOjE3NzkxMzE0Mzh9.Uqm_w3WR14RNFlCWknvNDiC9jskCxhgqgOqvLDvW3CY";

const socket = io("http://localhost:3000", {
  auth: { token: TOKEN },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  socket.emit("chat:send", {
    to: "31221470-2009-4b10-83a6-3e7b283423e5",
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
