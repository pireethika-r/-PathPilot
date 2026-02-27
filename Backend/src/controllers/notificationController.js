import { Notification } from "../models/Notification.js";

const mapNotification = (item) => ({
  id: String(item._id),
  type: item.type,
  title: item.title,
  message: item.message,
  read: Boolean(item.read),
  metadata: item.metadata || {},
  createdAt: item.createdAt,
});

export const getMyNotifications = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: false,
    });

    return res.status(200).json({
      notifications: notifications.map(mapNotification),
      unreadCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user.id },
      { $set: { read: true } },
      { new: true }
    ).lean();

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: false,
    });

    return res.status(200).json({
      message: "Notification marked as read",
      notification: mapNotification(notification),
      unreadCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({
      message: "All notifications marked as read",
      unreadCount: 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
