import { CourseContent } from "../models/courseContentModel.js";

export const createCourseContent = async (req, res) => {
  try {
    const { courseId, modules } = req.body;

    const content = await CourseContent.create({
      courseId,
      modules,
    });

    res.status(201).json({ success: true, content });

  } catch (err) {
    res.status(500).json({ message: "Failed to create content" });
  }
};

export const getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;

    const content = await CourseContent.findOne({ courseId });

    res.json({ success: true, content });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch content" });
  }
};