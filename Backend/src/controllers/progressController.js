import { Progress } from "../models/progressModel.js";

// SAVE PROGRESS
export const saveProgress = async (req, res) => {
  try {
    const { courseId, moduleIndex, lessonIndex } = req.body;
    const userId = req.user.id;

    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      progress = await Progress.create({
        userId,
        courseId,
        completedLessons: []
      });
    }

    const alreadyDone = progress.completedLessons.find(
      (l) =>
        l.moduleIndex === moduleIndex &&
        l.lessonIndex === lessonIndex
    );

    if (!alreadyDone) {
      progress.completedLessons.push({
        moduleIndex,
        lessonIndex
      });
    }

    await progress.save();

    res.json({ success: true, progress });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to save progress" });
  }
};


// GET PROGRESS
export const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const progress = await Progress.findOne({ userId, courseId });

    res.json({ success: true, progress });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch progress" });
  }
};