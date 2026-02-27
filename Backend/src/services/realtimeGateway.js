let ioInstance = null;

export const setRealtimeIO = (io) => {
  ioInstance = io;
};

export const getRealtimeIO = () => ioInstance;

export const emitNotificationToUser = (userId, payload) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${String(userId)}`).emit("notification:new", payload);
};
