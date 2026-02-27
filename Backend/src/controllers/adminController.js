import { StudentProfile } from "../models/StudentProfile.js";
import { User } from "../models/User.js";

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
