import React, { useState } from "react";

const CreateCourseContent = () => {
  const [courseId, setCourseId] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/course-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        courseId,
        modules: [
          {
            title: moduleTitle,
            lessons: [
              {
                title: lessonTitle,
                content: lessonContent
              }
            ]
          }
        ]
      })
    });

    const data = await res.json();
    alert("Content Created ✅");
    console.log(data);
  };

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl border shadow max-w-xl">
        <h2 className="text-xl font-bold mb-4">
          Create Course Content
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            placeholder="Course ID"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            placeholder="Module Title"
            value={moduleTitle}
            onChange={(e) => setModuleTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            placeholder="Lesson Title"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <textarea
            placeholder="Lesson Content / Video URL"
            value={lessonContent}
            onChange={(e) => setLessonContent(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Content
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateCourseContent;