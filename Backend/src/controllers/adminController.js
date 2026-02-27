import { StudentProfile } from "../models/StudentProfile.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { Course } from "../models/Course.js";

const formatStudentId = (userId) => `STU-${String(userId).slice(-6).toUpperCase()}`;

const mapStudent = (profile) => ({
  profileId: String(profile._id),
  id: formatStudentId(profile.user?._id || profile.user),
  name: profile.fullName || profile.user?.fullName || "Unknown",
  email: profile.email || profile.user?.email || "",
  phone: profile.phone || "",
  program: profile.degree || "",
  university: profile.university || "",
  score: profile.profileScore || 0,
  status: profile.status || "Incomplete",
  date: profile.updatedAt,
  skills: profile.skills || [],
  interests: profile.interests || [],
  cvName: profile.cvName || "",
  cvSize: profile.cvSize || 0,
});

const mapCourse = (course) => ({
  id: String(course._id),
  code: course.code,
  title: course.title,
  description: course.description || "",
  duration: course.duration || "",
  skills: course.skills || [],
  totalModules: course.totalModules || 1,
  price: course.price || 0,
  image: course.image || "bg-slate-500",
  isActive: Boolean(course.isActive),
  createdAt: course.createdAt,
  updatedAt: course.updatedAt,
});

export const getAllStudentProfiles = async (req, res) => {
  try {
    const profiles = await StudentProfile.find()
      .populate("user", "fullName email role")
      .sort({ updatedAt: -1 });

    const students = profiles
      .filter((p) => p.user && p.user.role === "student")
      .map(mapStudent);

    const totalStudents = students.length;
    const completeProfiles = students.filter((s) => s.status === "Complete").length;
    const pendingReviews = students.filter((s) => s.status === "Incomplete").length;
    const avgScore = totalStudents
      ? Math.round(students.reduce((sum, s) => sum + s.score, 0) / totalStudents)
      : 0;

    return res.status(200).json({
      students,
      stats: {
        totalStudents,
        completeProfiles,
        pendingReviews,
        avgScore,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getStudentProfileById = async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.profileId).populate(
      "user",
      "fullName email role"
    );

    if (!profile || !profile.user || profile.user.role !== "student") {
      return res.status(404).json({ message: "Student profile not found" });
    }

    return res.status(200).json({ student: mapStudent(profile) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStudentProfileStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Complete", "Incomplete"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const profile = await StudentProfile.findById(req.params.profileId).populate(
      "user",
      "fullName email role"
    );
    if (!profile || !profile.user || profile.user.role !== "student") {
      return res.status(404).json({ message: "Student profile not found" });
    }

    profile.status = status;
    await profile.save();

    return res.status(200).json({
      message: "Profile status updated",
      student: mapStudent(profile),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getValidatedStudentProfile = async (profileId) => {
  const profile = await StudentProfile.findById(profileId).populate(
    "user",
    "fullName email role"
  );
  if (!profile || !profile.user || profile.user.role !== "student") {
    return null;
  }
  return profile;
};

export const approveStudentProfile = async (req, res) => {
  try {
    const profile = await getValidatedStudentProfile(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    profile.status = "Complete";
    await profile.save();

    await Notification.create({
      user: profile.user._id,
      type: "system",
      title: "Profile Approved",
      message: "Your profile has been approved by the admin team.",
      metadata: {
        profileId: String(profile._id),
        action: "approved",
      },
    });

    return res.status(200).json({
      message: "Profile approved successfully",
      student: mapStudent(profile),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const requestStudentProfileUpdate = async (req, res) => {
  try {
    const { reason } = req.body;
    const profile = await getValidatedStudentProfile(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    profile.status = "Incomplete";
    await profile.save();

    const reasonText = String(reason || "").trim();
    await Notification.create({
      user: profile.user._id,
      type: "system",
      title: "Profile Update Requested",
      message: reasonText
        ? `Admin requested profile updates: ${reasonText}`
        : "Admin requested updates to your profile. Please review and update your details.",
      metadata: {
        profileId: String(profile._id),
        action: "request_update",
        reason: reasonText,
      },
    });

    return res.status(200).json({
      message: "Update request sent to student",
      student: mapStudent(profile),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdminOverview = async (_req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: "student" });
    const profileCount = await StudentProfile.countDocuments();
    return res.status(200).json({
      studentCount,
      profileCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdminCourses = async (_req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ courses: courses.map(mapCourse) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createAdminCourse = async (req, res) => {
  try {
    const {
      code,
      title,
      description = "",
      duration = "",
      skills = [],
      totalModules,
      price,
      image = "bg-slate-500",
      isActive = true,
    } = req.body;

    if (!code || !String(code).trim()) {
      return res.status(400).json({ message: "code is required" });
    }
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "title is required" });
    }

    const modules = Number(totalModules);
    if (Number.isNaN(modules) || modules < 1) {
      return res.status(400).json({ message: "totalModules must be at least 1" });
    }

    const coursePrice = Number(price);
    if (Number.isNaN(coursePrice) || coursePrice < 0) {
      return res.status(400).json({ message: "price must be a valid non-negative number" });
    }

    const normalizedCode = String(code).trim().toUpperCase();
    const existing = await Course.findOne({ code: normalizedCode }).lean();
    if (existing) {
      return res.status(409).json({ message: "Course code already exists" });
    }

    const created = await Course.create({
      code: normalizedCode,
      title: String(title).trim(),
      description: String(description || "").trim(),
      duration: String(duration || "").trim(),
      skills: Array.isArray(skills)
        ? skills.map((item) => String(item).trim()).filter(Boolean)
        : [],
      totalModules: modules,
      price: coursePrice,
      image: String(image || "bg-slate-500").trim(),
      isActive: Boolean(isActive),
    });

    return res.status(201).json({
      message: "Course created successfully",
      course: mapCourse(created),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAdminCourse = async (req, res) => {
  try {
    const updates = {};
    const {
      title,
      description,
      duration,
      skills,
      totalModules,
      price,
      image,
      isActive,
    } = req.body;

    if (title !== undefined) updates.title = String(title || "").trim();
    if (description !== undefined) updates.description = String(description || "").trim();
    if (duration !== undefined) updates.duration = String(duration || "").trim();
    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({ message: "skills must be an array" });
      }
      updates.skills = skills.map((item) => String(item).trim()).filter(Boolean);
    }
    if (totalModules !== undefined) {
      const modules = Number(totalModules);
      if (Number.isNaN(modules) || modules < 1) {
        return res.status(400).json({ message: "totalModules must be at least 1" });
      }
      updates.totalModules = modules;
    }
    if (price !== undefined) {
      const coursePrice = Number(price);
      if (Number.isNaN(coursePrice) || coursePrice < 0) {
        return res.status(400).json({ message: "price must be a valid non-negative number" });
      }
      updates.price = coursePrice;
    }
    if (image !== undefined) updates.image = String(image || "").trim();
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const updated = await Course.findByIdAndUpdate(
      req.params.courseId,
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
      message: "Course updated successfully",
      course: mapCourse(updated),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
