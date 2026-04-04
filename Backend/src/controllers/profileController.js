import { StudentProfile } from "../models/StudentProfile.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const PREDEFINED_SKILLS = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "SQL",
  "Java",
  "C++",
  "Figma",
  "AWS",
  "Docker",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CV_STORAGE_DIR = path.resolve(__dirname, "../../uploads/cvs");

const allowedFields = [
  "fullName",
  "email",
  "phone",
  "dob",
  "gender",
  "address",
  "university",
  "degree",
  "yearOfStudy",
  "gpa",
  "graduationDate",
  "skills",
  "interests",
  "certifications",
  "completedCourses",
  "careerMatch",
  "cvName",
  "cvSize",
  "cvType",
  "cvFilePath",
  "profileScore",
  "status",
];

const allowedCvTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const getExtensionFromMimeType = (mimeType) => {
  if (mimeType === "application/pdf") return ".pdf";
  if (mimeType === "application/msword") return ".doc";
  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return ".docx";
  }
  return "";
};

const sanitizeFileStem = (value) =>
  String(value || "cv")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "cv";

const ensureCvStorageDir = async () => {
  await fs.mkdir(CV_STORAGE_DIR, { recursive: true });
};

const saveCvFile = async ({ userId, cvName, cvType, cvBase64 }) => {
  const base64Content = String(cvBase64 || "").trim();
  if (!base64Content) return "";

  const fileBuffer = Buffer.from(base64Content, "base64");
  const extension = getExtensionFromMimeType(cvType);
  const safeName = sanitizeFileStem(cvName);
  const storedFileName = `${String(userId)}-${Date.now()}-${safeName}${extension}`;

  await ensureCvStorageDir();
  await fs.writeFile(path.join(CV_STORAGE_DIR, storedFileName), fileBuffer);

  return path.join("uploads", "cvs", storedFileName).replace(/\\/g, "/");
};

const removeStoredCvFile = async (relativePath) => {
  if (!relativePath) return;

  const absolutePath = path.resolve(__dirname, "../../", relativePath);
  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

const pickPayload = (body) =>
  allowedFields.reduce((acc, field) => {
    if (body[field] !== undefined) {
      acc[field] = body[field];
    }
    return acc;
  }, {});

const computeProfileScore = (payload) => {
  const fieldsToTrack = [
    "fullName",
    "email",
    "phone",
    "dob",
    "gender",
    "address",
    "university",
    "degree",
    "yearOfStudy",
    "gpa",
    "graduationDate",
  ];

  let filledCount = 0;
  fieldsToTrack.forEach((field) => {
    if (payload[field]) filledCount += 1;
  });
  if (Array.isArray(payload.skills) && payload.skills.length > 0) filledCount += 1;
  if (Array.isArray(payload.interests) && payload.interests.length > 0) filledCount += 1;
  if (payload.cvName) filledCount += 1;

  const totalFields = fieldsToTrack.length + 3;
  return Math.round((filledCount / totalFields) * 100);
};

const validateDob = (value) => {
  if (!value) {
    return "";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "Date of Birth must be a valid date";
  }

  const dob = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dob.getTime())) {
    return "Date of Birth must be a valid date";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dob > today) {
    return "Date of Birth cannot be in the future";
  }

  const minimumDob = new Date(today);
  minimumDob.setFullYear(minimumDob.getFullYear() - 16);

  if (dob > minimumDob) {
    return "Student must be at least 16 years old";
  }

  return "";
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({
      profile: {
        ...profile.toObject(),
        hasCvFile: Boolean(profile.cvFilePath),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const upsertMyProfile = async (req, res) => {
  try {
    const payload = pickPayload(req.body);
    const cvBase64 = req.body.cvBase64;

    if (!payload.fullName || !payload.email || !payload.university || !payload.degree) {
      return res.status(400).json({
        message: "fullName, email, university and degree are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const dobError = validateDob(payload.dob);
    if (dobError) {
      return res.status(400).json({ message: dobError });
    }

    if (payload.skills && !Array.isArray(payload.skills)) {
      return res.status(400).json({ message: "skills must be an array" });
    }

    if (
      payload.skills &&
      payload.skills.some((skill) => !PREDEFINED_SKILLS.includes(skill))
    ) {
      return res
        .status(400)
        .json({ message: "skills must use predefined options only" });
    }

    if (payload.cvType) {
      if (!allowedCvTypes.includes(payload.cvType)) {
        return res
          .status(400)
          .json({ message: "Invalid CV file type. Only PDF and DOC/DOCX allowed." });
      }
    }

    if (payload.cvSize && Number(payload.cvSize) > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "CV file size exceeds 5MB limit." });
    }

    if (
      payload.careerMatch !== undefined &&
      (Number(payload.careerMatch) < 0 || Number(payload.careerMatch) > 100)
    ) {
      return res
        .status(400)
        .json({ message: "careerMatch must be between 0 and 100" });
    }

    const profileScore = computeProfileScore(payload);
    payload.profileScore = profileScore;
    payload.status = profileScore >= 70 ? "Complete" : "Incomplete";

    const existingProfile = await StudentProfile.findOne({ user: req.user.id });

    if (cvBase64) {
      if (!payload.cvName || !payload.cvType) {
        return res.status(400).json({ message: "CV name and type are required" });
      }
      payload.cvFilePath = await saveCvFile({
        userId: req.user.id,
        cvName: payload.cvName,
        cvType: payload.cvType,
        cvBase64,
      });
      await removeStoredCvFile(existingProfile?.cvFilePath);
    } else if (existingProfile?.cvFilePath && payload.cvName) {
      payload.cvFilePath = existingProfile.cvFilePath;
    } else if (!payload.cvName) {
      payload.cvFilePath = "";
      await removeStoredCvFile(existingProfile?.cvFilePath);
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: payload, $setOnInsert: { user: req.user.id } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Profile saved successfully",
      profile: {
        ...profile.toObject(),
        hasCvFile: Boolean(profile.cvFilePath),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
