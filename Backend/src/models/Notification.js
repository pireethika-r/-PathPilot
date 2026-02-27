import mongoose from "mongoose";
import { emitNotificationToUser } from "../services/realtimeGateway.js";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["interview", "system", "payment", "achievement"],
      default: "system",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

notificationSchema.post("save", function pushRealtimeNotification(doc) {
  emitNotificationToUser(doc.user, {
    id: String(doc._id),
    type: doc.type,
    title: doc.title,
    message: doc.message,
    read: doc.read,
    metadata: doc.metadata || {},
    createdAt: doc.createdAt,
  });
});

export const Notification = mongoose.model("Notification", notificationSchema);
