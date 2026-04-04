import React, { useState } from "react";

const CareerForm = ({ setCurrentView }) => {
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [results, setResults] = useState([]);

  // ✅ NEW STATES
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!skills.trim()) {
      newErrors.skills = "Skills are required";
    } else if (skills.split(",").length < 1) {
      newErrors.skills = "Enter at least one skill";
    }

    if (!interests.trim()) {
      newErrors.interests = "Interests are required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/careers/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          skills: skills.split(",").map((s) => s.trim()),
          interests: interests.split(",").map((i) => i.trim())
        })
      });

      const data = await res.json();
      setResults(data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-2xl">

        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Career Recommendation
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* SKILLS */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Skills *
            </label>
            <input
              className={`w-full px-3 py-2 border rounded-lg outline-none ${
                errors.skills
                  ? "border-red-500"
                  : "border-slate-200 focus:ring-2 focus:ring-blue-500"
              }`}
              placeholder="e.g. programming, data"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            {errors.skills && (
              <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
            )}
          </div>

          {/* INTERESTS */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Interests *
            </label>
            <input
              className={`w-full px-3 py-2 border rounded-lg outline-none ${
                errors.interests
                  ? "border-red-500"
                  : "border-slate-200 focus:ring-2 focus:ring-blue-500"
              }`}
              placeholder="e.g. AI, UI"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
            {errors.interests && (
              <p className="text-red-500 text-sm mt-1">
                {errors.interests}
              </p>
            )}
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Loading..." : "Get Recommendations"}
          </button>

        </form>
      </div>

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="mt-6 space-y-3 max-w-2xl">
          {results.map((career, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex justify-between items-center"
            >
              <span className="text-slate-800 font-medium">
                {career}
              </span>

              <button
                onClick={() => {
                  localStorage.setItem("selectedCareer", career);
                  setCurrentView("career-courses");
                }}
                className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg"
              >
                View Courses
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CareerForm;