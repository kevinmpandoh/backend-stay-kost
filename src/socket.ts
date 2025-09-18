import { Socket } from "socket.io";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { env } from "./config/env";

const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap: { [key: string]: string } = {};

export function getReceiverSocketId(userId: string) {
  if (!userId) {
    console.warn("User tanpa userId mencoba koneksi socket.");
    return;
  }
  return userSocketMap[userId];
}

io.on("connection", (socket: Socket) => {
  console.log("A user connected", socket.id);

  const userId = Array.isArray(socket.handshake.query.userId)
    ? socket.handshake.query.userId[0] // Jika array, ambil elemen pertama
    : socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // 📌 Join ke chat room terte
  socket.on("joinRoom", ({ chatRoomId }) => {
    socket.join(chatRoomId);
    console.log(`👥 User ${userId} masuk ke room ${chatRoomId}`);
  });

  // 📌 Notifikasi typing (opsional)
  socket.on("typing", (chatRoomId) => {
    socket.to(chatRoomId).emit("typing", "User sedang mengetik...");
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
  });
});

export { io, app, server };
