import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: String,
  courseId: String,

  completedLessons: [
    {
      moduleIndex: Number,
      lessonIndex: Number
    }
  ]
});

export const Progress = mongoose.model("Progress", progressSchema);