import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  title: String,
  content: String,

  quiz: [
    {
      question: String,
      options: [String],
      answer: String
    }
  ]
});

const moduleSchema = new mongoose.Schema({
  title: String,
  lessons: [lessonSchema]
});

const courseContentSchema = new mongoose.Schema({
  courseId: String,
  modules: [moduleSchema]
});

export const CourseContent = mongoose.model(
  "CourseContent",
  courseContentSchema
);