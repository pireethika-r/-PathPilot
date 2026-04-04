import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: String,
  content: String, // text or video link
});

const moduleSchema = new mongoose.Schema({
  title: String,
  lessons: [lessonSchema],
});

const courseContentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  modules: [moduleSchema],
});

export const CourseContent = mongoose.model("CourseContent", courseContentSchema);