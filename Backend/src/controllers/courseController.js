import { Course } from "../models/Course.js";

// Create new course
export const createCourse = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      duration,
      skills,
      price
    } = req.body;

    const course = new Course({
      code,
      title,
      description,
      duration,
      skills,
      price
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating course"
    });
  }
};