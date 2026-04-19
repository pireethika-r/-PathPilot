import { Course } from "../models/Course.js";

export const createCourse = async (req, res) => {
  try {
    const { title, career, price, duration } = req.body;

    const course = await Course.create({
      title,
      career,
      price,
      duration,
      code: "COURSE-" + Date.now()   // ✅ FIX HERE
    });

    res.status(201).json({
      success: true,
      course
    });

  } catch (error) {
    console.error("CREATE COURSE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error creating course"
    });
  }
};

export const getCoursesByCareer = async (req, res) => {
  try {
    const { career } = req.params;

    console.log("Requested Career:", career); // 🔍 debug

    const courses = await Course.find({
      career: { $in: [career, "Web Developer"] }
    });

    res.status(200).json({
      success: true,
      courses
    });

  } catch (error) {
    console.error("GET COURSES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching courses"
    });
  }
};