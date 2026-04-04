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

export const deleteCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;

    const content = await CourseContent.findOneAndDelete({ courseId });

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.status(200).json({ message: "Course content deleted successfully" });

  } catch (error) {
    console.error("Delete content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { modules } = req.body;

    const content = await CourseContent.findOneAndUpdate(
      { courseId },
      { modules },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.status(200).json({
      message: "Course content updated successfully",
      content
    });

  } catch (error) {
    console.error("Update content error:", error);
    res.status(500).json({ message: "Server error" });
  }
};