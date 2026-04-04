import React, { useEffect, useState } from "react";
import { BookOpen, PlayCircle } from "lucide-react";

const LearningPlayer = ({ courseId }) => {
  const [content, setContent] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/course-content/${courseId}`);
        const data = await res.json();

        setContent(data.content);

        // ✅ set first lesson automatically
        if (data.content?.modules?.length > 0) {
          setActiveLesson(data.content.modules[0].lessons[0]);
        }

      } catch (err) {
        console.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [courseId]);

  if (loading) {
    return <div className="p-6">Loading course...</div>;
  }

  if (!content) {
    return <div className="p-6">No content available</div>;
  }

  return (
    <div className="flex h-screen">

      {/* LEFT SIDE (Modules) */}
      <div className="w-1/3 bg-white border-r p-4 overflow-y-auto">

        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BookOpen /> Course Content
        </h2>

        {content.modules.map((module, i) => (
          <div key={i} className="mb-4">

            <h3 className="font-semibold text-blue-600 mb-2">
              {module.title}
            </h3>

            <div className="space-y-2">
              {module.lessons.map((lesson, j) => (
                <button
                  key={j}
                  onClick={() => setActiveLesson(lesson)}
                  className="w-full text-left p-2 rounded hover:bg-blue-50 flex items-center gap-2"
                >
                  <PlayCircle size={16} />
                  {lesson.title}
                </button>
              ))}
            </div>

          </div>
        ))}
      </div>

      {/* RIGHT SIDE (Content Viewer) */}
      <div className="flex-1 p-6 bg-slate-50">

        {activeLesson ? (
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-bold mb-4">
              {activeLesson.title}
            </h2>

            {/* VIDEO OR TEXT */}
            {activeLesson.content.includes("http") ? (
              <iframe
                src={activeLesson.content}
                title="lesson"
                className="w-full h-[400px] rounded"
                allowFullScreen
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">
                {activeLesson.content}
              </p>
            )}

          </div>
        ) : (
          <p>Select a lesson</p>
        )}

      </div>

    </div>
  );
};

export default LearningPlayer;