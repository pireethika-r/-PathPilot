import { Course } from "../models/Course.js";

/* Career Recommendation */
export const getCareerRecommendations = async (req, res) => {
  try {
    const { skills = [], interests = [] } = req.body;

    let recommendations = [];

    // Basic rule-based logic
    if (skills.includes("programming")) {
      recommendations.push("Software Engineer", "Web Developer");
    }

    if (skills.includes("design") || interests.includes("design")) {
      recommendations.push("UI/UX Designer");
    }

    if (skills.includes("data")) {
      recommendations.push("Data Analyst");
    }

    // Default fallback
    if (recommendations.length === 0) {
      recommendations.push("General IT Specialist");
    }

    res.status(200).json({
      success: true,
      recommendations
    });

  } catch (error) {
    console.error("Career recommendation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/* Course Recommendation (DB)*/
export const getCoursesByCareer = async (req, res) => {
  try {
    const { career } = req.params;

    let requiredSkills = [];

    //Career → Skills Mapping
    switch (career) {
      case "Software Engineer":
      case "Web Developer":
        requiredSkills = ["programming", "javascript"];
        break;

      case "UI/UX Designer":
        requiredSkills = ["design", "figma"];
        break;

      case "Data Analyst":
        requiredSkills = ["data", "analytics"];
        break;

      default:
        requiredSkills = [];
    }

    // Fetch courses from DB
    const courses = await Course.find({
      skills: { $in: requiredSkills },
      isActive: true
    });

    res.status(200).json({
      success: true,
      courses
    });

  } catch (error) {
    console.error("Course fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};