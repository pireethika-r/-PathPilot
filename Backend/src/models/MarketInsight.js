import mongoose from "mongoose";

const marketInsightSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    demandLevel: {
      type: String,
      enum: ["High", "Medium", "Low"],
      required: true,
    },
    careerField: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export const MarketInsight = mongoose.model("MarketInsight", marketInsightSchema);
