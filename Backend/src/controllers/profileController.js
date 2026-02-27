import { StudentProfile } from "../models/StudentProfile.js";

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
  "profileScore",
  "status",
];

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

export const getMyProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const upsertMyProfile = async (req, res) => {
  try {
    const payload = pickPayload(req.body);

    if (!payload.fullName || !payload.email || !payload.university || !payload.degree) {
      return res.status(400).json({
        message: "fullName, email, university and degree are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return res.status(400).json({ message: "Invalid email format" });
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
      const allowedCvTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

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

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: payload, $setOnInsert: { user: req.user.id } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Profile saved successfully",
      profile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
