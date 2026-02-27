import { User } from "../models/User.js";
import mongoose from "mongoose";

const toSafeString = (value, maxLen = 500) => {
  try {
    const str = String(value ?? "");
    return str.length > maxLen ? str.slice(0, maxLen) : str;
  } catch (_error) {
    return "";
  }
};

const mapUser = (user) => {
  const role = ["student", "admin", "hiring"].includes(user?.role)
    ? user.role
    : "student";

  return {
    id: toSafeString(user?._id, 64),
    fullName: toSafeString(user?.fullName, 150),
    email: toSafeString(user?.email, 254),
    role,
    phone: toSafeString(user?.phone, 30),
    title: toSafeString(user?.title, 120),
    bio: toSafeString(user?.bio, 500),
    avatarUrl: toSafeString(user?.avatarUrl, 2_500_000),
  };
};

export const getMe = async (req, res) => {
  try {
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(String(req.user.id))) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user: mapUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const { fullName, email, phone, title, bio, avatarUrl } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (fullName !== undefined) {
      if (!String(fullName).trim()) {
        return res.status(400).json({ message: "fullName is required" });
      }
      user.fullName = String(fullName).trim();
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).toLowerCase().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const existing = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });
      if (existing) {
        return res.status(409).json({ message: "Email is already in use" });
      }
      user.email = normalizedEmail;
    }

    if (phone !== undefined) user.phone = String(phone || "").trim();
    if (title !== undefined) user.title = String(title || "").trim();
    if (bio !== undefined) user.bio = String(bio || "").trim().slice(0, 500);

    if (avatarUrl !== undefined) {
      const avatar = String(avatarUrl || "");
      if (avatar && !avatar.startsWith("data:image/")) {
        return res.status(400).json({ message: "Invalid avatar image format" });
      }
      if (avatar.length > 2_500_000) {
        return res.status(400).json({ message: "Avatar image is too large" });
      }
      user.avatarUrl = avatar;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: mapUser(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
