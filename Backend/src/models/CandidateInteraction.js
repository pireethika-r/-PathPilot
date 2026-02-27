import mongoose from "mongoose";

const candidateInteractionSchema = new mongoose.Schema(
  {
    hiringManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
    },
    shortlisted: {
      type: Boolean,
      default: false,
    },
    interviewStatus: {
      type: String,
      enum: ["none", "sent"],
      default: "none",
    },
    interview: {
      date: { type: String, default: "" },
      time: { type: String, default: "" },
      message: { type: String, default: "" },
      sentAt: { type: Date },
    },
  },
  { timestamps: true }
);

candidateInteractionSchema.index(
  { hiringManager: 1, studentProfile: 1 },
  { unique: true }
);

export const CandidateInteraction = mongoose.model(
  "CandidateInteraction",
  candidateInteractionSchema
);
