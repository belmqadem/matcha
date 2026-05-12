// test-chat.js
import { io } from "socket.io-client";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMxMjIxNDcwLTIwMDktNGIxMC04M2E2LTNlN2IyODM0MjNlNSIsInVzZXJuYW1lIjoia2tvdWF6IiwiZW1haWwiOiJrb3VhejA0QGdtYWlsLmNvbSIsImlhdCI6MTc3ODUzOTM2MiwiZXhwIjoxNzc5MTQ0MTYyfQ.4FqJxVfvKWklLT2arlsUM2FGnfE0dfQJdEOAH7__ZIA";

const socket = io("http://localhost:3000", {
  auth: { token: TOKEN },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  socket.emit("chat:send", {
    to: "3eb85c34-f14e-4050-89df-db11e0f76c0c",
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
