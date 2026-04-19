import React, { useState } from "react";

const CreateCourseContent = () => {
  const [courseId, setCourseId] = useState("");

  const [modules, setModules] = useState([
    {
      title: "",
      lessons: [
        {
          title: "",
          content: "",
          quiz: []
        }
      ]
    }
  ]);

  const token = localStorage.getItem("token");

  // 🔹 LESSON CHANGE
  const handleLessonChange = (mi, li, field, value) => {
    const updated = [...modules];
    updated[mi].lessons[li][field] = value;
    setModules(updated);
  };

  // 🔹 MODULE TITLE CHANGE
  const handleModuleTitle = (mi, value) => {
    const updated = [...modules];
    updated[mi].title = value;
    setModules(updated);
  };

  // 🔹 QUIZ CHANGE
  const handleQuizChange = (mi, li, qi, field, value) => {
    const updated = [...modules];
    updated[mi].lessons[li].quiz[qi][field] = value;
    setModules(updated);
  };

  // 🔹 OPTION CHANGE
  const handleOptionChange = (mi, li, qi, oi, value) => {
    const updated = [...modules];
    updated[mi].lessons[li].quiz[qi].options[oi] = value;
    setModules(updated);
  };

  // ➕ ADD MODULE
  const addModule = () => {
    setModules([
      ...modules,
      {
        title: "",
        lessons: [
          {
            title: "",
            content: "",
            quiz: []
          }
        ]
      }
    ]);
  };

  // ➕ ADD LESSON (FIXED)
  const addLesson = (mi) => {
    const updated = [...modules];

    updated[mi].lessons = [
      ...updated[mi].lessons,
      {
        title: "",
        content: "",
        quiz: []
      }
    ];

    setModules(updated);
  };

  // ➕ ADD QUIZ (FIXED)
  const addQuiz = (mi, li) => {
    const updated = [...modules];

    updated[mi].lessons[li].quiz = [
      ...updated[mi].lessons[li].quiz,
      {
        question: "",
        options: ["", "", "", ""],
        answer: ""
      }
    ];

    setModules(updated);
  };

  // 🚀 SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("FINAL DATA:", modules);

    const res = await fetch("/api/course-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        courseId,
        modules
      })
    });

    const data = await res.json();
    console.log(data);
    alert("Content Created 🚀");
  };

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow max-w-4xl">
        <h2 className="text-xl font-bold mb-4">
          Advanced Course Content Builder
        </h2>

        {/* COURSE ID */}
        <input
          placeholder="Course ID"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        {/* MODULES */}
        {modules.map((module, mi) => (
          <div key={mi} className="border p-4 mb-4 rounded">

            <input
              placeholder="Module Title"
              value={module.title}
              onChange={(e) => handleModuleTitle(mi, e.target.value)}
              className="w-full p-2 border rounded mb-3"
            />

            {/* LESSONS */}
            {module.lessons.map((lesson, li) => (
              <div key={li} className="border p-3 mb-3 rounded bg-gray-50">

                <input
                  placeholder="Lesson Title"
                  value={lesson.title}
                  onChange={(e) =>
                    handleLessonChange(mi, li, "title", e.target.value)
                  }
                  className="w-full p-2 border rounded mb-2"
                />

                <input
                  placeholder="Video URL"
                  value={lesson.content}
                  onChange={(e) =>
                    handleLessonChange(mi, li, "content", e.target.value)
                  }
                  className="w-full p-2 border rounded mb-2"
                />

                {/* QUIZ */}
                {lesson.quiz.map((q, qi) => (
                  <div key={qi} className="bg-white p-3 mt-2 rounded border">

                    <input
                      placeholder="Question"
                      value={q.question}
                      onChange={(e) =>
                        handleQuizChange(mi, li, qi, "question", e.target.value)
                      }
                      className="w-full p-2 border rounded mb-2"
                    />

                    {q.options.map((opt, oi) => (
                      <input
                        key={oi}
                        placeholder={`Option ${oi + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(mi, li, qi, oi, e.target.value)
                        }
                        className="w-full p-2 border rounded mb-1"
                      />
                    ))}

                    <input
                      placeholder="Correct Answer"
                      value={q.answer}
                      onChange={(e) =>
                        handleQuizChange(mi, li, qi, "answer", e.target.value)
                      }
                      className="w-full p-2 border rounded mt-2"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addQuiz(mi, li)}
                  className="mt-2 text-sm bg-purple-500 text-white px-3 py-1 rounded"
                >
                  + Add Quiz
                </button>

              </div>
            ))}

            <button
              type="button"
              onClick={() => addLesson(mi)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              + Add Lesson
            </button>

          </div>
        ))}

        {/* ADD MODULE */}
        <button
          type="button"
          onClick={addModule}
          className="bg-indigo-600 text-white px-4 py-2 rounded mb-4"
        >
          + Add Module
        </button>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-5 py-2 rounded"
        >
          Submit Course Content
        </button>
      </div>
    </div>
  );
};

export default CreateCourseContent;