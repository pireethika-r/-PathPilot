import { CandidateInteraction } from "../models/CandidateInteraction.js";
import { MarketInsight } from "../models/MarketInsight.js";
import { Notification } from "../models/Notification.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { sendMailjetEmail } from "../services/emailService.js";

const buildInterviewEmailHtml = ({ candidateName, date, time, message }) => `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
              <tr>
                <td style="background:linear-gradient(135deg,#0f172a,#1d4ed8);padding:24px 28px;">
                  <h1 style="margin:0;font-size:24px;line-height:1.2;color:#ffffff;">Interview Invitation</h1>
                  <p style="margin:8px 0 0 0;font-size:14px;color:#dbeafe;">PathPilo Hiring Team</p>
                </td>
              </tr>
              <tr>
                <td style="padding:28px;">
                  <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;">
                    Hi <strong>${candidateName}</strong>, you have been invited for an interview.
                  </p>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin:0 0 20px 0;">
                    <tr>
                      <td style="padding:16px 18px;">
                        <p style="margin:0 0 8px 0;font-size:14px;"><strong>Date:</strong> ${date}</p>
                        <p style="margin:0 0 8px 0;font-size:14px;"><strong>Time:</strong> ${time}</p>
                        <p style="margin:0;font-size:14px;"><strong>Platform:</strong> PathPilo Interview Portal</p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 8px 0;font-size:14px;font-weight:bold;">Message from Hiring Team</p>
                  <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:12px 14px;border-radius:8px;font-size:14px;line-height:1.6;white-space:pre-line;">
                    ${message}
                  </div>

                  <p style="margin:22px 0 0 0;font-size:14px;line-height:1.6;">
                    Please confirm your availability at your earliest convenience.
                  </p>
                  <p style="margin:18px 0 0 0;font-size:14px;line-height:1.6;">
                    Regards,<br/>
                    <strong>PathPilo Hiring Team</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 20px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;text-align:center;">
                  This is an automated email from PathPilo. Please do not reply directly.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const formatCandidate = (profile, interactionMap) => {
  const interaction = interactionMap.get(String(profile._id));
  const status = interaction?.interviewStatus === "sent"
    ? "Interview Sent"
    : interaction?.shortlisted
      ? "Shortlisted"
      : "Available";

  return {
    profileId: String(profile._id),
    id: `C-${String(profile.user?._id || profile.user).slice(-6).toUpperCase()}`,
    name: profile.fullName || profile.user?.fullName || "Unknown",
    email: profile.email || profile.user?.email || "",
    program: profile.degree || "",
    university: profile.university || "",
    score: profile.profileScore || 0,
    match: profile.careerMatch || 0,
    skills: profile.skills || [],
    certifications: profile.certifications || [],
    completedCourses: profile.completedCourses || [],
    status,
    cvName: profile.cvName || "",
    cvSize: profile.cvSize || 0,
  };
};

const passesFilters = (candidate, query) => {
  const search = String(query.search || "").toLowerCase().trim();
  if (
    search &&
    !candidate.name.toLowerCase().includes(search) &&
    !candidate.program.toLowerCase().includes(search) &&
    !candidate.skills.some((s) => s.toLowerCase().includes(search))
  ) {
    return false;
  }

  if (query.skill && query.skill !== "All" && !candidate.skills.includes(query.skill)) {
    return false;
  }

  if (query.scoreMin && Number(candidate.score) < Number(query.scoreMin)) {
    return false;
  }

  if (query.matchMin && Number(candidate.match) < Number(query.matchMin)) {
    return false;
  }

  if (query.certifications === "has" && candidate.certifications.length === 0) {
    return false;
  }
  if (query.certifications === "none" && candidate.certifications.length > 0) {
    return false;
  }

  return true;
};

export const getCandidates = async (req, res) => {
  try {
    const profiles = await StudentProfile.find()
      .populate("user", "fullName email role")
      .sort({ updatedAt: -1 });

    const studentProfiles = profiles.filter((p) => p.user?.role === "student");
    const interactions = await CandidateInteraction.find({
      hiringManager: req.user.id,
      studentProfile: { $in: studentProfiles.map((p) => p._id) },
    });

    const interactionMap = new Map(
      interactions.map((interaction) => [String(interaction.studentProfile), interaction])
    );

    const candidates = studentProfiles
      .map((profile) => formatCandidate(profile, interactionMap))
      .filter((candidate) => passesFilters(candidate, req.query));

    const allSkills = Array.from(new Set(candidates.flatMap((c) => c.skills))).sort();

    return res.status(200).json({ candidates, allSkills });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleShortlist = async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.profileId).populate(
      "user",
      "role"
    );

    if (!profile || profile.user?.role !== "student") {
      return res.status(404).json({ message: "Candidate not found" });
    }

    let interaction = await CandidateInteraction.findOne({
      hiringManager: req.user.id,
      studentProfile: profile._id,
    });

    if (!interaction) {
      interaction = await CandidateInteraction.create({
        hiringManager: req.user.id,
        studentProfile: profile._id,
        shortlisted: true,
      });
    } else {
      interaction.shortlisted = !interaction.shortlisted;
      await interaction.save();
    }

    return res.status(200).json({
      message: interaction.shortlisted
        ? "Candidate shortlisted"
        : "Candidate removed from shortlist",
      shortlisted: interaction.shortlisted,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendInterviewInvite = async (req, res) => {
  try {
    const { date, time, message } = req.body;
    if (!date || !time || !message) {
      return res
        .status(400)
        .json({ message: "date, time and message are required" });
    }

    const profile = await StudentProfile.findById(req.params.profileId).populate(
      "user",
      "role fullName"
    );

    if (!profile || profile.user?.role !== "student") {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const interaction = await CandidateInteraction.findOneAndUpdate(
      { hiringManager: req.user.id, studentProfile: profile._id },
      {
        $set: {
          shortlisted: true,
          interviewStatus: "sent",
          interview: {
            date,
            time,
            message,
            sentAt: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    await Notification.create({
      user: profile.user._id,
      type: "interview",
      title: "Interview Invitation",
      message: `You have a new interview invitation on ${date} at ${time}.`,
      metadata: {
        profileId: String(profile._id),
        interviewDate: date,
        interviewTime: time,
      },
    });

    const emailResult = await sendMailjetEmail({
      toEmail: profile.email || "",
      toName: profile.fullName || profile.user.fullName || "Student",
      subject: "Interview Invitation - PathPilo",
      textPart: `Interview Invitation\n\nHi ${profile.fullName || profile.user.fullName || "Student"},\n\nYou have been invited for an interview.\nDate: ${date}\nTime: ${time}\n\nMessage:\n${message}\n\nRegards,\nPathPilo Hiring Team`,
      htmlPart: buildInterviewEmailHtml({
        candidateName: profile.fullName || profile.user.fullName || "Student",
        date,
        time,
        message,
      }),
    });

    return res.status(200).json({
      message: `Interview invitation sent to ${profile.fullName || profile.user.fullName}.`,
      interviewStatus: interaction.interviewStatus,
      emailSent: emailResult.sent,
      emailReason: emailResult.reason || null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const submitMarketInsights = async (req, res) => {
  try {
    const { skills, demandLevel, careerField, notes } = req.body;
    if (!careerField || !demandLevel) {
      return res
        .status(400)
        .json({ message: "careerField and demandLevel are required" });
    }

    if (!["High", "Medium", "Low"].includes(demandLevel)) {
      return res.status(400).json({ message: "Invalid demandLevel value" });
    }

    const insight = await MarketInsight.create({
      employer: req.user.id,
      skills: Array.isArray(skills) ? skills : [],
      demandLevel,
      careerField,
      notes: notes || "",
    });

    return res.status(201).json({
      message: "Market insight submitted",
      insight,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
