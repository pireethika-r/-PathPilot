import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    dob: { type: String, default: "" },
    gender: { type: String, default: "" },
    address: { type: String, default: "" },
    university: { type: String, default: "" },
    degree: { type: String, default: "" },
    yearOfStudy: { type: String, default: "" },
    gpa: { type: String, default: "" },
    graduationDate: { type: String, default: "" },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    certifications: { type: [String], default: [] },
    completedCourses: { type: [String], default: [] },
    careerMatch: { type: Number, default: 0, min: 0, max: 100 },
    cvName: { type: String, default: "" },
    cvSize: { type: Number, default: 0 },
    cvType: { type: String, default: "" },
    cvFilePath: { type: String, default: "" },
    profileScore: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["Complete", "Incomplete"],
      default: "Incomplete",
    },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);
