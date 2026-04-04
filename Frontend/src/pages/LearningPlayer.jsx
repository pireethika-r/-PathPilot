import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

const LearningPlayer = ({ selectedCourseId }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);

  const [completedLessons, setCompletedLessons] = useState([]);

  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  // 🔥 FETCH COURSE CONTENT
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/course-content/${selectedCourseId}`);
        const data = await res.json();

        setContent(data.content);
      } catch {
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [selectedCourseId]);

  // 🔥 LOAD PROGRESS FROM DB
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`/api/progress/${selectedCourseId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.progress) {
          setCompletedLessons(data.progress.completedLessons);
        }
      });
  }, [selectedCourseId]);

  if (loading) return <p className="p-6">Loading...</p>;

  if (!content || !content.modules?.length) {
    return <p className="p-6 text-gray-500">No content available</p>;
  }

  const module = content.modules[currentModule];
  const lesson = module.lessons[currentLesson];

  // 📊 PROGRESS CALCULATION
  const totalLessons = content.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  const currentIndex =
    content.modules
      .slice(0, currentModule)
      .reduce((acc, m) => acc + m.lessons.length, 0) +
    currentLesson +
    1;

  const progress = Math.round((currentIndex / totalLessons) * 100);

  // ▶️ YOUTUBE FIX
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtu.be")) {
      return url.replace("youtu.be/", "www.youtube.com/embed/");
    }
    return url;
  };

  return (
    <div className="p-6 grid grid-cols-12 gap-6">

      {/* 📚 SIDEBAR */}
      <div className="col-span-3 bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BookOpen size={18} />
          Course Content
        </h3>

        {content.modules.map((m, mi) => (
          <div key={mi}>
            <p className="text-sm font-medium text-gray-700 mt-2">
              {m.title}
            </p>

            {m.lessons.map((l, li) => {
              const isCompleted = completedLessons.some(
                (x) =>
                  x.moduleIndex === mi &&
                  x.lessonIndex === li
              );

              return (
                <div
                  key={li}
                  onClick={() => {
                    setCurrentModule(mi);
                    setCurrentLesson(li);
                    setShowQuiz(false);
                    setScore(null);
                  }}
                  className={`cursor-pointer p-2 rounded text-sm mt-1 ${
                    mi === currentModule && li === currentLesson
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {isCompleted ? "✔ " : ""} {l.title}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 🎬 PLAYER */}
      <div className="col-span-9 space-y-4">

        {/* VIDEO */}
        <div className="bg-black rounded-xl overflow-hidden">
          <iframe
            className="w-full h-[350px]"
            src={getEmbedUrl(lesson.content)}
            allowFullScreen
            title="video"
          />
        </div>

        <h2 className="text-xl font-semibold">{lesson.title}</h2>

        {/* BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={() =>
              setCurrentLesson((prev) => Math.max(prev - 1, 0))
            }
            className="bg-gray-200 px-3 py-1 rounded"
          >
            Prev
          </button>

          <button
            onClick={() =>
              setCurrentLesson((prev) =>
                Math.min(prev + 1, module.lessons.length - 1)
              )
            }
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Next
          </button>

          {/* ✅ SAVE PROGRESS */}
          <button
            onClick={async () => {
              const token = localStorage.getItem("token");

              await fetch("/api/progress", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  courseId: selectedCourseId,
                  moduleIndex: currentModule,
                  lessonIndex: currentLesson
                })
              });

              setCompletedLessons((prev) => [
                ...prev,
                { moduleIndex: currentModule, lessonIndex: currentLesson }
              ]);
            }}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Mark Complete
          </button>

          <button
            onClick={() => setShowQuiz(true)}
            className="bg-purple-600 text-white px-3 py-1 rounded"
          >
            Take Quiz
          </button>
        </div>

        {/* 📊 PROGRESS BAR */}
        <div>
          <div className="w-full bg-gray-200 h-2 rounded">
            <div
              className="bg-blue-500 h-2 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Progress: {progress}%
          </p>
        </div>

        {/* 🧠 QUIZ */}
        {showQuiz && lesson.quiz && (
          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="font-semibold mb-3">Quiz</h3>

            {lesson.quiz.map((q, i) => (
              <div key={i} className="mb-4">
                <p className="font-medium">{q.question}</p>

                {q.options.map((opt, j) => (
                  <label key={j} className="block text-sm">
                    <input
                      type="radio"
                      name={`q-${i}`}
                      value={opt}
                      onChange={() =>
                        setAnswers({
                          ...answers,
                          [i]: opt
                        })
                      }
                    />{" "}
                    {opt}
                  </label>
                ))}
              </div>
            ))}

            <button
              onClick={() => {
                let correct = 0;

                lesson.quiz.forEach((q, i) => {
                  if (answers[i] === q.answer) correct++;
                });

                setScore(correct);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Submit Quiz
            </button>
          </div>
        )}

        {/* 🎉 SCORE */}
        {score !== null && (
          <div className="bg-blue-100 p-4 rounded">
            🎉 Score: {score} / {lesson.quiz.length}
          </div>
        )}

      </div>
    </div>
  );
};

export default LearningPlayer;