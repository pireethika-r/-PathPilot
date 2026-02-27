import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    courseDescription: {
      type: String,
      default: "",
      trim: true,
    },
    duration: {
      type: String,
      default: "",
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      default: "",
    },
    totalModules: {
      type: Number,
      default: 1,
      min: 1,
    },
    modulesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountApplied: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    payment: {
      method: {
        type: String,
        enum: ["Stripe"],
        default: "Stripe",
      },
      status: {
        type: String,
        enum: ["Paid", "Pending", "Failed"],
        default: "Paid",
      },
      transactionId: {
        type: String,
        required: true,
      },
      receiptNumber: {
        type: String,
        required: true,
      },
      paidAt: {
        type: Date,
        required: true,
      },
    },
    assessmentScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    certificateId: {
      type: String,
      default: "",
    },
    certificateIssuedAt: {
      type: Date,
      default: null,
    },
    lastAccessedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, courseId: 1 }, { unique: true });

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
