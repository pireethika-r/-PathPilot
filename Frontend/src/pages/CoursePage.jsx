import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Loader2,
  AlertCircle,
  Clock,
  Tag
} from "lucide-react";

const CoursePage = ({ setCurrentView, setSelectedCourseId }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const career = localStorage.getItem("selectedCareer");

  useEffect(() => {
    if (!career) {
      setError("No career selected. Please go back and choose a career.");
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/careers/courses/${career}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to load courses");

        setCourses(data.courses || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [career]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* 🔷 HEADER */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen />
          Courses for {career || "Career"}
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          Explore curated learning paths tailored for your career
        </p>
      </div>

      {/* ❌ ERROR */}
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle />
          {error}
        </div>
      )}

      {/* ⏳ LOADING */}
      {loading && (
        <div className="flex justify-center items-center py-10 text-gray-500">
          <Loader2 className="animate-spin mr-2" />
          Loading courses...
        </div>
      )}

      {/* 📭 EMPTY */}
      {!loading && courses.length === 0 && !error && (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
          No courses found for this career.
        </div>
      )}

      {/* 🎯 COURSES GRID */}
      {!loading && courses.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {courses.map((c) => (
            <div
              key={c._id || c.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition border overflow-hidden flex flex-col"
            >
              {/* 🖼 IMAGE / BANNER */}
              <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-lg font-semibold">
                {c.title?.charAt(0)}
              </div>

              {/* 📦 CONTENT */}
              <div className="p-5 flex flex-col flex-1">

                <h4 className="text-lg font-semibold text-slate-800">
                  {c.title}
                </h4>

                <p className="text-sm text-gray-500 mt-1">
                  {c.provider || "Internal Course"}
                </p>

                {/* 🔖 DETAILS */}
                <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-600">

                  {c.duration && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {c.duration}
                    </span>
                  )}

                  {c.price !== undefined && (
                    <span className="flex items-center gap-1">
                      <Tag size={14} /> Rs. {c.price}
                    </span>
                  )}
                </div>

                {/* BADGE */}
                <span className="inline-block mt-3 text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded w-fit">
                  Recommended
                </span>

                {/* 🚀 ACTION */}
                <button
                  onClick={() => {
                    console.log("COURSE OBJECT:", c);
                    console.log("COURSE ID:", c._id || c.id);

                    setSelectedCourseId(c._id || c.id);
                    setCurrentView("learning-player");
                  }}
                  className="mt-auto bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Start Learning
                </button>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default CoursePage;