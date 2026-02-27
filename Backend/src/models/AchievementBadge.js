import mongoose from "mongoose";

const achievementBadgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    badgeKey: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    color: {
      type: String,
      default: "text-blue-500 bg-blue-100",
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

achievementBadgeSchema.index({ user: 1, badgeKey: 1 }, { unique: true });

export const AchievementBadge = mongoose.model(
  "AchievementBadge",
  achievementBadgeSchema
);
