import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { setRealtimeIO } from "../services/realtimeGateway.js";

const getTokenFromHandshake = (socket) => {
  const authToken = socket.handshake.auth?.token;
  if (authToken) return String(authToken);

  const header = String(socket.handshake.headers?.authorization || "");
  if (header.startsWith("Bearer ")) return header.slice(7);

  const queryToken = socket.handshake.query?.token;
  if (queryToken) return String(queryToken);

  return "";
};

export const initializeSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = getTokenFromHandshake(socket);
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) return next(new Error("Unauthorized"));

      socket.data.userId = String(decoded.id);
      return next();
    } catch (_error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);
  });

  setRealtimeIO(io);
  return io;
};
