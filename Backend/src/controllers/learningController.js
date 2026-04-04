import PDFDocument from "pdfkit";
import Stripe from "stripe";
import { AchievementBadge } from "../models/AchievementBadge.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { Notification } from "../models/Notification.js";
import { Payment } from "../models/Payment.js";
import { StudentProfile } from "../models/StudentProfile.js";
import { User } from "../models/User.js";
import { sendMailjetEmail } from "../services/emailService.js";

const PAYMENT_METHODS = ["Stripe"];
const parsedDiscountRate = Number(process.env.BUNDLE_DISCOUNT_RATE);
const BUNDLE_DISCOUNT_RATE =
  Number.isFinite(parsedDiscountRate) && parsedDiscountRate >= 0 && parsedDiscountRate <= 1
    ? parsedDiscountRate
    : 0.15;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
let stripeClient = null;
const getStripeClient = () => {
  if (stripeClient) return stripeClient;
  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  if (!secretKey) return null;
  stripeClient = new Stripe(secretKey);
  return stripeClient;
};

const round2 = (value) => Math.round(value * 100) / 100;

const mapCourseDoc = (course) => ({
  id: course.code,
  title: course.title,
  description: course.description || "",
  duration: course.duration || "",
  skills: Array.isArray(course.skills) ? course.skills : [],
  totalModules: course.totalModules || 1,
  price: course.price,
  image: course.image || "bg-slate-500",
});

const buildPaymentSlipEmailHtml = ({
  toName,
  receiptNumber,
  transactionId,
  paymentMethod,
  paymentTime,
  pricing,
}) => {
  const itemsHtml = pricing.lineItems
    .map(
      (course) => `
        <tr>
          <td style="padding:10px 0;color:#0f172a;border-bottom:1px solid #e2e8f0;">${course.title}</td>
          <td style="padding:10px 0;text-align:right;color:#0f172a;border-bottom:1px solid #e2e8f0;">$${Number(course.finalPrice).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#eef2ff;font-family:Arial,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:20px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #cbd5e1;">
                <tr>
                  <td style="background:linear-gradient(135deg,#0f172a,#1d4ed8);padding:22px 26px;">
                    <h1 style="margin:0;font-size:24px;line-height:1.2;color:#ffffff;">Payment Slip</h1>
                    <p style="margin:8px 0 0 0;font-size:13px;color:#bfdbfe;">PathPilo Learning Platform</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:26px;">
                    <p style="margin:0 0 14px 0;font-size:16px;">Hi <strong>${toName}</strong>,</p>
                    <p style="margin:0 0 18px 0;font-size:14px;color:#334155;line-height:1.6;">
                      Thanks for your payment. Your enrollment has been confirmed. Here is your official payment slip.
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;margin:0 0 18px 0;">
                      <tr><td style="padding:5px 0;color:#475569;">Receipt Number</td><td style="padding:5px 0;text-align:right;color:#0f172a;">${receiptNumber}</td></tr>
                      <tr><td style="padding:5px 0;color:#475569;">Transaction ID</td><td style="padding:5px 0;text-align:right;color:#0f172a;">${transactionId}</td></tr>
                      <tr><td style="padding:5px 0;color:#475569;">Payment Method</td><td style="padding:5px 0;text-align:right;color:#0f172a;">${paymentMethod}</td></tr>
                      <tr><td style="padding:5px 0;color:#475569;">Paid At</td><td style="padding:5px 0;text-align:right;color:#0f172a;">${new Date(paymentTime).toLocaleString()}</td></tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                      <tr>
                        <td style="font-size:14px;font-weight:bold;color:#0f172a;padding-bottom:8px;">Purchased Courses</td>
                        <td></td>
                      </tr>
                      ${itemsHtml}
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">
                      <tr><td style="padding:4px 0;color:#475569;">Subtotal</td><td style="padding:4px 0;text-align:right;color:#0f172a;">$${Number(pricing.subtotal).toFixed(2)}</td></tr>
                      <tr><td style="padding:4px 0;color:#475569;">Discount</td><td style="padding:4px 0;text-align:right;color:#0f172a;">$${Number(pricing.totalDiscount).toFixed(2)}</td></tr>
                      <tr><td style="padding:8px 0;font-size:16px;font-weight:bold;color:#0f172a;">Total Paid</td><td style="padding:8px 0;text-align:right;font-size:16px;font-weight:bold;color:#0f172a;">$${Number(pricing.finalTotal).toFixed(2)}</td></tr>
                    </table>

                    <p style="margin:20px 0 0 0;font-size:13px;color:#64748b;">
                      Keep this email as proof of payment. If you need support, contact the PathPilo team.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 20px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;text-align:center;">
                    This is an automated email from PathPilo.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

const calculatePricing = (selectedCourses) => {
  const subtotal = selectedCourses.reduce((sum, c) => sum + c.price, 0);
  const hasBundleDiscount = selectedCourses.length > 1;

  const lineItems = selectedCourses.map((course) => {
    const discount = hasBundleDiscount ? round2(course.price * BUNDLE_DISCOUNT_RATE) : 0;
    const finalPrice = round2(course.price - discount);
    return {
      ...course,
      discount,
      finalPrice,
    };
  });

  const totalDiscount = round2(lineItems.reduce((sum, item) => sum + item.discount, 0));
  const finalTotal = round2(lineItems.reduce((sum, item) => sum + item.finalPrice, 0));

  return {
    subtotal: round2(subtotal),
    totalDiscount,
    finalTotal,
    discountRate: hasBundleDiscount ? BUNDLE_DISCOUNT_RATE : 0,
    lineItems,
  };
};

const resolveSelectedCourses = async (courseIds, alreadyEnrolledIds = []) => {
  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    return { invalidIds: [], selectedCourses: [], alreadyEnrolled: [] };
  }

  const uniqueIds = Array.from(new Set(courseIds.map((id) => String(id).trim())));
  const courseDocs = await Course.find({
    code: { $in: uniqueIds },
    isActive: true,
  }).lean();
  const courseMap = new Map(courseDocs.map((course) => [course.code, mapCourseDoc(course)]));

  const selectedCourses = [];
  const invalidIds = [];
  const alreadyEnrolled = [];

  uniqueIds.forEach((courseId) => {
    if (!courseMap.has(courseId)) {
      invalidIds.push(courseId);
      return;
    }
    if (alreadyEnrolledIds.includes(courseId)) {
      alreadyEnrolled.push(courseId);
      return;
    }
    selectedCourses.push(courseMap.get(courseId));
  });

  return { selectedCourses, invalidIds, alreadyEnrolled };
};

const formatDateLabel = (date) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const getCourseStatus = (enrollment) => {
  if (enrollment.progress <= 0) return "Not Started";
  if (enrollment.progress >= 100) return "Completed";
  return "In Progress";
};

const getLastAccessedLabel = (dateValue) => {
  if (!dateValue) return "Never";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  const now = Date.now();
  const diffMs = now - parsed.getTime();
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / day);

  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  return `${weeks} weeks ago`;
};

const mapEnrollmentForDashboard = (enrollment, badgeMap = new Map()) => ({
  enrollmentId: String(enrollment._id),
  courseId: enrollment.courseId,
  title: enrollment.courseName,
  description: enrollment.courseDescription,
  duration: enrollment.duration,
  skills: enrollment.skills,
  image: enrollment.image,
  progress: enrollment.progress,
  status: getCourseStatus(enrollment),
  modulesCompleted: enrollment.modulesCompleted,
  totalModules: enrollment.totalModules,
  lastAccessed: getLastAccessedLabel(enrollment.lastAccessedAt || enrollment.updatedAt),
  canDownloadCertificate: enrollment.progress >= 100 && Boolean(enrollment.certificateIssuedAt),
  certificateId: enrollment.certificateId || "",
  assessmentScore: enrollment.assessmentScore,
  completedAt: enrollment.certificateIssuedAt
    ? formatDateLabel(enrollment.certificateIssuedAt)
    : null,
  earnedBadge: badgeMap.get(`course_complete_${enrollment.courseId}`) || null,
});

const createBadgeIfMissing = async (userId, badge) => {
  const existing = await AchievementBadge.findOne({
    user: userId,
    badgeKey: badge.badgeKey,
  });

  if (existing) return null;

  const created = await AchievementBadge.create({
    user: userId,
    badgeKey: badge.badgeKey,
    title: badge.title,
    description: badge.description,
    color: badge.color,
    earnedAt: new Date(),
  });

  await Notification.create({
    user: userId,
    type: "achievement",
    title: "New Achievement Badge",
    message: `You earned "${badge.title}".`,
    metadata: { badgeKey: badge.badgeKey },
  });

  return created;
};

const awardBadgesForCompletion = async (userId, enrollment) => {
  const earnedBadges = [];

  const completionBadge = await createBadgeIfMissing(userId, {
    badgeKey: `course_complete_${enrollment.courseId}`,
    title: `${enrollment.courseName} Completed`,
    description: "Awarded for successfully completing the course.",
    color: "text-blue-500 bg-blue-100",
  });
  if (completionBadge) earnedBadges.push(completionBadge);

  if (Number(enrollment.assessmentScore) >= 90) {
    const highPerformanceBadge = await createBadgeIfMissing(userId, {
      badgeKey: "high_performer",
      title: "High Performer",
      description: "Awarded for scoring 90% or higher in a course assessment.",
      color: "text-amber-500 bg-amber-100",
    });
    if (highPerformanceBadge) earnedBadges.push(highPerformanceBadge);
  }

  const completedCount = await Enrollment.countDocuments({
    user: userId,
    progress: { $gte: 100 },
  });

  if (completedCount >= 3) {
    const multiCourseBadge = await createBadgeIfMissing(userId, {
      badgeKey: "multi_course_3",
      title: "Multi-Course Achiever",
      description: "Awarded for completing 3 or more courses.",
      color: "text-purple-500 bg-purple-100",
    });
    if (multiCourseBadge) earnedBadges.push(multiCourseBadge);
  }

  return earnedBadges;
};

const resolveBadgeIconKey = (badgeKey = "") => {
  if (String(badgeKey).includes("high_performer")) return "high_performer";
  if (String(badgeKey).includes("multi_course")) return "multi_course";
  return "course_complete";
};

const createEnrollmentsFromPricing = async ({
  userId,
  pricing,
  paymentMethod,
  transactionId,
  receiptNumber,
  paymentTime,
}) => {
  const enrollmentDocs = pricing.lineItems.map((course) => ({
    user: userId,
    courseId: course.id,
    courseName: course.title,
    courseDescription: course.description,
    duration: course.duration,
    skills: course.skills,
    image: course.image,
    totalModules: course.totalModules || 1,
    modulesCompleted: 0,
    progress: 0,
    status: "Not Started",
    originalPrice: course.price,
    discountApplied: course.discount,
    finalPrice: course.finalPrice,
    payment: {
      method: paymentMethod,
      status: "Paid",
      transactionId,
      receiptNumber,
      paidAt: paymentTime,
    },
    lastAccessedAt: null,
  }));

  await Payment.create({
    user: userId,
    method: paymentMethod,
    status: "Paid",
    transactionId,
    receiptNumber,
    amountPaid: pricing.finalTotal,
    subtotal: pricing.subtotal,
    totalDiscount: pricing.totalDiscount,
    courseIds: pricing.lineItems.map((course) => course.id),
    paidAt: paymentTime,
  });

  await Enrollment.insertMany(enrollmentDocs);

  await Notification.create({
    user: userId,
    type: "payment",
    title: "Payment Successful",
    message: `Payment completed. You are enrolled in ${pricing.lineItems.length} course(s).`,
    metadata: {
      transactionId,
      receiptNumber,
      totalPaid: pricing.finalTotal,
    },
  });

  try {
    const user = await User.findById(userId).lean();
    const toEmail = String(user?.email || "").trim();
    if (toEmail) {
      const toName = String(user?.fullName || "Student").trim();
      const itemsText = pricing.lineItems
        .map((course) => `- ${course.title}: $${Number(course.finalPrice).toFixed(2)}`)
        .join("\n");

      await sendMailjetEmail({
        toEmail,
        toName,
        subject: "Payment Slip - PathPilo",
        textPart: `Payment Slip\n\nHi ${toName},\n\nYour payment was successful.\n\nReceipt Number: ${receiptNumber}\nTransaction ID: ${transactionId}\nPayment Method: ${paymentMethod}\nPaid At: ${new Date(paymentTime).toLocaleString()}\n\nCourses:\n${itemsText}\n\nSubtotal: $${Number(pricing.subtotal).toFixed(2)}\nDiscount: $${Number(pricing.totalDiscount).toFixed(2)}\nTotal Paid: $${Number(pricing.finalTotal).toFixed(2)}\n\nThank you,\nPathPilo`,
        htmlPart: buildPaymentSlipEmailHtml({
          toName,
          receiptNumber,
          transactionId,
          paymentMethod,
          paymentTime,
          pricing,
        }),
      });
    }
  } catch (error) {
    console.error("Failed to send payment slip email:", error);
  }
};

const finalizeStripeEnrollmentForUser = async ({ userId, session }) => {
  const transactionId = session.payment_intent || session.id;
  const receiptNumber = session.id;
  const paymentTime = new Date(session.created * 1000);

  const existingTransaction = await Enrollment.findOne({
    user: userId,
    "payment.transactionId": transactionId,
  });

  if (existingTransaction) {
    const existingSummaryEnrollments = await Enrollment.find({
      user: userId,
      "payment.transactionId": transactionId,
    });
    const selectedCourses = existingSummaryEnrollments.map((enrollment) => ({
      id: enrollment.courseId,
      title: enrollment.courseName,
      description: enrollment.courseDescription,
      duration: enrollment.duration,
      skills: enrollment.skills,
      image: enrollment.image,
      price: enrollment.originalPrice,
      discount: enrollment.discountApplied,
      finalPrice: enrollment.finalPrice,
    }));
    const pricing = {
      lineItems: selectedCourses,
      subtotal: round2(selectedCourses.reduce((sum, c) => sum + c.price, 0)),
      totalDiscount: round2(selectedCourses.reduce((sum, c) => sum + c.discount, 0)),
      finalTotal: round2(selectedCourses.reduce((sum, c) => sum + c.finalPrice, 0)),
      discountRate: selectedCourses.length > 1 ? BUNDLE_DISCOUNT_RATE : 0,
    };

    return {
      created: false,
      alreadyEnrolledCourseIds: [],
      pricing,
      payment: {
        transactionId,
        receiptNumber,
        paymentMethod: "Stripe",
        paidAt: paymentTime,
      },
    };
  }

  let courseIds = [];
  try {
    const parsed = JSON.parse(session.metadata?.courseIds || "[]");
    if (Array.isArray(parsed)) {
      courseIds = parsed.map((id) => String(id));
    }
  } catch (_error) {
    throw new Error("INVALID_COURSE_METADATA");
  }

  const existingEnrollments = await Enrollment.find({ user: userId }, { courseId: 1 });

  const { selectedCourses, invalidIds, alreadyEnrolled } = await resolveSelectedCourses(
    courseIds,
    existingEnrollments.map((item) => item.courseId)
  );

  if (invalidIds.length > 0 || selectedCourses.length === 0) {
    throw new Error("UNABLE_TO_CONFIRM_ENROLLMENT");
  }

  const pricing = calculatePricing(selectedCourses);
  await createEnrollmentsFromPricing({
    userId,
    pricing,
    paymentMethod: "Stripe",
    transactionId,
    receiptNumber,
    paymentTime,
  });

  return {
    created: true,
    alreadyEnrolledCourseIds: alreadyEnrolled,
    pricing,
    payment: {
      transactionId,
      receiptNumber,
      paymentMethod: "Stripe",
      paidAt: paymentTime,
    },
  };
};

export const getCourseCatalog = async (_req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ courses: courses.map(mapCourseDoc) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCheckoutSummary = async (req, res) => {
  try {
    const existingEnrollments = await Enrollment.find(
      { user: req.user.id },
      { courseId: 1 }
    );

    const { selectedCourses, invalidIds, alreadyEnrolled } = await resolveSelectedCourses(
      req.body.courseIds,
      existingEnrollments.map((item) => item.courseId)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: "One or more selected courses are invalid.",
        invalidCourseIds: invalidIds,
      });
    }

    if (selectedCourses.length === 0) {
      return res.status(400).json({
        message: "No new courses available for checkout.",
        alreadyEnrolledCourseIds: alreadyEnrolled,
      });
    }

    const pricing = calculatePricing(selectedCourses);

    return res.status(200).json({
      selectedCourses: pricing.lineItems,
      subtotal: pricing.subtotal,
      discountRate: pricing.discountRate,
      totalDiscount: pricing.totalDiscount,
      finalTotal: pricing.finalTotal,
      alreadyEnrolledCourseIds: alreadyEnrolled,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const enrollWithPayment = async (req, res) => {
  const paymentMethod = req.body.paymentMethod || "Stripe";
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ message: "Invalid payment method." });
  }

  return res.status(400).json({
    message: "Direct enrollment is disabled. Use Stripe checkout session endpoints.",
  });
};

export const createStripeCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({
        message: "Stripe is not configured. Set STRIPE_SECRET_KEY in backend environment.",
      });
    }

    const existingEnrollments = await Enrollment.find(
      { user: req.user.id },
      { courseId: 1 }
    );

    const { selectedCourses, invalidIds, alreadyEnrolled } = await resolveSelectedCourses(
      req.body.courseIds,
      existingEnrollments.map((item) => item.courseId)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        message: "One or more selected courses are invalid.",
        invalidCourseIds: invalidIds,
      });
    }

    if (selectedCourses.length === 0) {
      return res.status(400).json({
        message: "No new courses available for checkout.",
        alreadyEnrolledCourseIds: alreadyEnrolled,
      });
    }

    const pricing = calculatePricing(selectedCourses);
    const lineItems = pricing.lineItems.map((course) => ({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(course.finalPrice * 100),
        product_data: {
          name: course.title,
          description: course.description,
          metadata: {
            courseId: course.id,
          },
        },
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${FRONTEND_URL}/?view=courses&payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/?view=courses&payment=cancelled`,
      metadata: {
        userId: String(req.user.id),
        courseIds: JSON.stringify(pricing.lineItems.map((course) => course.id)),
      },
    });

    return res.status(200).json({
      checkoutUrl: session.url,
      sessionId: session.id,
      summary: {
        selectedCourses: pricing.lineItems,
        subtotal: pricing.subtotal,
        discountRate: pricing.discountRate,
        totalDiscount: pricing.totalDiscount,
        finalTotal: pricing.finalTotal,
      },
      alreadyEnrolledCourseIds: alreadyEnrolled,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create Stripe checkout session." });
  }
};

export const confirmStripeCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({
        message: "Stripe is not configured. Set STRIPE_SECRET_KEY in backend environment.",
      });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: "sessionId is required." });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ message: "Stripe session is not paid." });
    }

    if (String(session.metadata?.userId || "") !== String(req.user.id)) {
      return res.status(403).json({ message: "This payment session does not belong to the user." });
    }

    const result = await finalizeStripeEnrollmentForUser({
      userId: req.user.id,
      session,
    });

    return res.status(result.created ? 201 : 200).json({
      message: result.created
        ? "Stripe payment confirmed and enrollment completed."
        : "Stripe payment already confirmed.",
      payment: result.payment,
      summary: {
        selectedCourses: result.pricing.lineItems,
        subtotal: result.pricing.subtotal,
        discountRate: result.pricing.discountRate,
        totalDiscount: result.pricing.totalDiscount,
        finalTotal: result.pricing.finalTotal,
      },
      alreadyEnrolledCourseIds: result.alreadyEnrolledCourseIds,
    });
  } catch (error) {
    console.error(error);
    if (error?.code === 11000) {
      return res
        .status(409)
        .json({ message: "One or more courses are already enrolled." });
    }
    return res.status(500).json({ message: "Failed to confirm Stripe session." });
  }
};

export const handleStripeWebhook = async (req, res) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured." });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
    if (!webhookSecret) {
      return res.status(500).json({ message: "Stripe webhook secret is not configured." });
    }

    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({ message: "Missing Stripe signature." });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (error) {
      return res.status(400).json({ message: `Webhook Error: ${error.message}` });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = String(session?.metadata?.userId || "").trim();
      if (userId && session?.payment_status === "paid") {
        try {
          await finalizeStripeEnrollmentForUser({ userId, session });
        } catch (error) {
          console.error("Failed to finalize Stripe webhook enrollment:", error?.message || error);
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getLearningDashboard = async (req, res) => {
  try {
    const [enrollments, badges] = await Promise.all([
      Enrollment.find({ user: req.user.id }).sort({ updatedAt: -1 }),
      AchievementBadge.find({ user: req.user.id }).sort({ earnedAt: -1 }),
    ]);

    const completedCourses = enrollments.filter((item) => item.progress >= 100).length;
    const totalProgress = enrollments.reduce((sum, item) => sum + Number(item.progress || 0), 0);
    const averageProgress = enrollments.length
      ? round2(totalProgress / enrollments.length)
      : 0;
    const completionRate = enrollments.length
      ? round2((completedCourses / enrollments.length) * 100)
      : 0;
    const certificates = enrollments
      .filter((item) => item.progress >= 100 && item.certificateIssuedAt)
      .map((item) => ({
        enrollmentId: String(item._id),
        courseId: item.courseId,
        title: item.courseName,
        certificateId: item.certificateId || "",
        issuedAt: formatDateLabel(item.certificateIssuedAt),
      }));

    const mappedBadges = badges.map((badge) => ({
      id: String(badge._id),
      badgeKey: badge.badgeKey,
      iconKey: resolveBadgeIconKey(badge.badgeKey),
      title: badge.title,
      description: badge.description,
      color: badge.color,
      earnedDate: formatDateLabel(badge.earnedAt),
    }));

    const badgeMap = new Map(mappedBadges.map((badge) => [badge.badgeKey, badge]));

    return res.status(200).json({
      enrollments: enrollments.map((enrollment) => mapEnrollmentForDashboard(enrollment, badgeMap)),
      badges: mappedBadges,
      metrics: {
        totalCourses: enrollments.length,
        completedCourses,
        completionRate,
        averageProgress,
        inProgressCourses: enrollments.filter((item) => item.progress > 0 && item.progress < 100)
          .length,
      },
      certificates,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort({ paidAt: -1, createdAt: -1 });

    return res.status(200).json({
      payments: payments.map((payment) => ({
        id: String(payment._id),
        receiptNumber: payment.receiptNumber,
        transactionId: payment.transactionId,
        method: payment.method,
        status: payment.status,
        amountPaid: Number(payment.amountPaid || 0),
        subtotal: Number(payment.subtotal || 0),
        totalDiscount: Number(payment.totalDiscount || 0),
        courseIds: Array.isArray(payment.courseIds) ? payment.courseIds : [],
        paidAt: payment.paidAt,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const downloadBadge = async (req, res) => {
  try {
    const badge = await AchievementBadge.findOne({
      _id: req.params.badgeId,
      user: req.user.id,
    });

    if (!badge) {
      return res.status(404).json({ message: "Badge not found." });
    }

    const user = await User.findById(req.user.id);
    const studentName = user?.fullName || "Student";
    const earnedDate = formatDateLabel(badge.earnedAt || new Date());
    const safeBadgeKey = String(badge.badgeKey || "badge").replace(/[^a-zA-Z0-9_-]/g, "");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeBadgeKey}-badge.pdf"`
    );

    const badgeKey = String(badge.badgeKey || "");
    const theme = badgeKey.includes("high_performer")
      ? {
          primary: "#7c3aed",
          secondary: "#c4b5fd",
          accent: "#f5f3ff",
          ribbon: "ELITE PERFORMANCE",
        }
      : badgeKey.includes("multi_course")
        ? {
            primary: "#0f766e",
            secondary: "#99f6e4",
            accent: "#f0fdfa",
            ribbon: "MILESTONE ACHIEVEMENT",
          }
        : {
            primary: "#b45309",
            secondary: "#fde68a",
            accent: "#fffbeb",
            ribbon: "COURSE ACHIEVEMENT",
          };

    const creativeDoc = new PDFDocument({ size: "A4", margin: 50 });
    creativeDoc.pipe(res);

    creativeDoc.rect(0, 0, 595, 842).fill("#f8fafc");
    creativeDoc.rect(24, 24, 547, 794).lineWidth(2).stroke(theme.primary);
    creativeDoc.roundedRect(40, 40, 515, 762, 30).fillAndStroke(theme.accent, theme.secondary);

    creativeDoc.circle(297.5, 160, 78).fill(theme.secondary);
    creativeDoc.circle(297.5, 160, 62).fill("#ffffff");
    creativeDoc.circle(297.5, 160, 48).fill(theme.primary);
    creativeDoc.fillColor("#ffffff").fontSize(30).text("PP", 0, 147, { align: "center" });

    creativeDoc.roundedRect(155, 248, 285, 36, 18).fill(theme.primary);
    creativeDoc.fillColor("#ffffff").fontSize(12).text(theme.ribbon, 0, 260, { align: "center" });

    creativeDoc.fontSize(30).fillColor("#0f172a").text("PathPilo Digital Badge", 0, 318, {
      align: "center",
    });
    creativeDoc.fontSize(25).fillColor(theme.primary).text(badge.title, 92, 374, {
      align: "center",
      width: 410,
    });
    creativeDoc.fontSize(13).fillColor("#64748b").text("Awarded to", 0, 444, {
      align: "center",
    });
    creativeDoc.fontSize(24).fillColor("#111827").text(studentName, 0, 466, {
      align: "center",
    });
    creativeDoc.fontSize(14).fillColor("#475569").text(
      badge.description || "Achievement unlocked on PathPilo.",
      102,
      522,
      { align: "center", width: 392 }
    );

    creativeDoc.roundedRect(96, 618, 403, 96, 20).fillAndStroke("#ffffff", theme.secondary);
    creativeDoc.fillColor(theme.primary).fontSize(12).text(`Badge ID: ${badge.badgeKey}`, 122, 643, {
      align: "left",
    });
    creativeDoc.fillColor(theme.primary).fontSize(12).text(`Earned Date: ${earnedDate}`, 122, 669, {
      align: "left",
    });
    creativeDoc.fillColor(theme.primary).fontSize(12).text("Status: Verified Achievement", 122, 695, {
      align: "left",
    });

    creativeDoc.roundedRect(414, 636, 58, 58, 18).fill(theme.primary);
    creativeDoc.fillColor("#ffffff").fontSize(18).text("01", 0, 655, { align: "center" });

    creativeDoc.fontSize(11).fillColor("#6b7280").text("Creative digital badge issued by PathPilo.", 0, 754, {
      align: "center",
    });

    creativeDoc.end();
    return;

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    doc.rect(20, 20, 555, 802).lineWidth(2).stroke("#f59e0b");
    doc.roundedRect(45, 45, 505, 732, 24).fillAndStroke("#fffbeb", "#fde68a");

    doc
      .circle(297.5, 170, 58)
      .fillAndStroke("#fef3c7", "#f59e0b");
    doc
      .fontSize(38)
      .fillColor("#b45309")
      .text("★", 0, 148, { align: "center" });

    doc.moveDown(6);
    doc.fontSize(16).fillColor("#d97706").text("PathPilo Achievement Badge", {
      align: "center",
    });
    doc.moveDown(1);
    doc.fontSize(30).fillColor("#0f172a").text(badge.title, {
      align: "center",
    });
    doc.moveDown(1);
    doc.fontSize(15).fillColor("#475569").text("Awarded to", {
      align: "center",
    });
    doc.moveDown(0.6);
    doc.fontSize(24).fillColor("#111827").text(studentName, {
      align: "center",
    });
    doc.moveDown(0.8);
    doc.fontSize(14).fillColor("#475569").text(badge.description || "Achievement unlocked on PathPilo.", {
      align: "center",
      width: 420,
      x: 95,
    });

    doc.moveDown(2);
    doc.roundedRect(110, 470, 375, 110, 16).fillAndStroke("#ffffff", "#fcd34d");
    doc
      .fillColor("#92400e")
      .fontSize(13)
      .text(`Badge ID: ${badge.badgeKey}`, 130, 500, { align: "left" });
    doc
      .fillColor("#92400e")
      .fontSize(13)
      .text(`Earned Date: ${earnedDate}`, 130, 530, { align: "left" });
    doc
      .fillColor("#92400e")
      .fontSize(13)
      .text("Status: Verified Achievement", 130, 560, { align: "left" });

    doc
      .fontSize(12)
      .fillColor("#6b7280")
      .text("This badge is issued digitally by PathPilo.", 0, 700, {
        align: "center",
      });

    doc.end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateLearningProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.enrollmentId,
      user: req.user.id,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    const prevProgress = enrollment.progress;
    const prevCompleted = enrollment.modulesCompleted;

    if (req.body.modulesCompleted !== undefined) {
      const modulesCompleted = Number(req.body.modulesCompleted);
      if (Number.isNaN(modulesCompleted) || modulesCompleted < 0) {
        return res.status(400).json({ message: "modulesCompleted must be a valid number." });
      }
      enrollment.modulesCompleted = Math.min(modulesCompleted, enrollment.totalModules);
      enrollment.progress = round2(
        (enrollment.modulesCompleted / enrollment.totalModules) * 100
      );
    } else if (req.body.progressIncrement !== undefined) {
      const increment = Number(req.body.progressIncrement);
      if (Number.isNaN(increment) || increment <= 0) {
        return res.status(400).json({ message: "progressIncrement must be > 0." });
      }
      enrollment.progress = Math.min(100, round2(enrollment.progress + increment));
      enrollment.modulesCompleted = Math.min(
        enrollment.totalModules,
        Math.max(
          enrollment.modulesCompleted,
          Math.round((enrollment.progress / 100) * enrollment.totalModules)
        )
      );
    } else {
      return res
        .status(400)
        .json({ message: "Provide either modulesCompleted or progressIncrement." });
    }

    if (req.body.assessmentScore !== undefined) {
      const score = Number(req.body.assessmentScore);
      if (Number.isNaN(score) || score < 0 || score > 100) {
        return res.status(400).json({ message: "assessmentScore must be between 0 and 100." });
      }
      enrollment.assessmentScore = score;
    }

    enrollment.status = getCourseStatus(enrollment);
    enrollment.lastAccessedAt = new Date();

    let newBadges = [];
    if (prevProgress < 100 && enrollment.progress >= 100) {
      enrollment.certificateIssuedAt = new Date();
      enrollment.certificateId = `CERT-${enrollment.courseId}-${Date.now()}`;
      enrollment.assessmentScore = enrollment.assessmentScore ?? 0;

      const profile = await StudentProfile.findOne({ user: req.user.id });
      if (profile) {
        profile.completedCourses = Array.from(
          new Set([...(profile.completedCourses || []), enrollment.courseName])
        );
        profile.certifications = Array.from(
          new Set([
            ...(profile.certifications || []),
            `${enrollment.courseName} Certificate`,
          ])
        );
        await profile.save();
      }

      newBadges = await awardBadgesForCompletion(req.user.id, enrollment);
    }

    await enrollment.save();

    return res.status(200).json({
      message:
        prevCompleted !== enrollment.modulesCompleted
          ? "Progress updated."
          : "Progress updated in real time.",
      enrollment: mapEnrollmentForDashboard(enrollment),
      newBadges: newBadges.map((badge) => ({
        id: String(badge._id),
        title: badge.title,
        description: badge.description,
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const downloadCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.enrollmentId,
      user: req.user.id,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." });
    }

    if (enrollment.progress < 100 || !enrollment.certificateIssuedAt) {
      return res.status(400).json({ message: "Course is not yet completed." });
    }

    const user = await User.findById(req.user.id);
    const studentName = user?.fullName || "Student";
    const certificateDate = formatDateLabel(
      enrollment.certificateIssuedAt || new Date()
    );
    const certificateId = enrollment.certificateId || `CERT-${Date.now()}`;
    const safeCourseId = enrollment.courseId.replace(/[^a-zA-Z0-9_-]/g, "");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeCourseId}-certificate.pdf"`
    );

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    doc.rect(20, 20, 555, 802).stroke("#1d4ed8");
    doc.moveDown(2);
    doc.fontSize(14).fillColor("#2563eb").text("PathPilo", { align: "center" });
    doc.moveDown();
    doc.fontSize(34).fillColor("#0f172a").text("Certificate of Completion", {
      align: "center",
    });
    doc.moveDown(1.5);
    doc.fontSize(14).fillColor("#334155").text("This certifies that", {
      align: "center",
    });
    doc.moveDown(0.8);
    doc.fontSize(28).fillColor("#0f172a").text(studentName, { align: "center" });
    doc.moveDown(0.8);
    doc.fontSize(14).fillColor("#334155").text("has successfully completed", {
      align: "center",
    });
    doc.moveDown(0.8);
    doc
      .fontSize(24)
      .fillColor("#1e3a8a")
      .text(enrollment.courseName, { align: "center" });
    doc.moveDown(2);
    doc.fontSize(12).fillColor("#475569").text(`Certificate ID: ${certificateId}`, {
      align: "center",
    });
    doc.moveDown(0.4);
    doc.fontSize(12).fillColor("#475569").text(`Date Issued: ${certificateDate}`, {
      align: "center",
    });
    doc.moveDown(0.4);
    doc
      .fontSize(12)
      .fillColor("#475569")
      .text(`Assessment Score: ${enrollment.assessmentScore || 0}%`, {
        align: "center",
      });
    doc.moveDown(4);
    doc
      .fontSize(12)
      .fillColor("#334155")
      .text("Authorized by PathPilo Learning Platform", {
        align: "center",
      });

    doc.end();
    return undefined;
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
