import React, { useState } from "react";
import { BookOpen, DollarSign, Clock, Tag } from "lucide-react";

const CreateCourse = () => {
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    duration: "",
    skills: "",
    price: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //  VALIDATION FUNCTION
  const validate = () => {
    const newErrors = {};

    if (!form.code.trim()) newErrors.code = "Course code is required";
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";

    if (!form.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    if (!form.price) {
      newErrors.price = "Price is required";
    } else if (form.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    if (!form.skills.trim()) {
      newErrors.skills = "At least one skill is required";
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
    setSuccess("");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          skills: form.skills.split(",").map((s) => s.trim())
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to create");

      setSuccess("✅ Course created successfully!");

      // Reset form
      setForm({
        code: "",
        title: "",
        description: "",
        duration: "",
        skills: "",
        price: ""
      });

    } catch (err) {
      setErrors({ api: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border p-8 space-y-6">

        {/* HEADER */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-blue-500" />
            Create New Course
          </h2>
          <p className="text-sm text-slate-500">
            Add a new course to your platform
          </p>
        </div>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {errors.api && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm">
            {errors.api}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* CODE */}
          <div>
            <input
              name="code"
              placeholder="Course Code (e.g. CS101)"
              value={form.code}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.code ? "border-red-500" : ""
              }`}
            />
            {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
          </div>

          {/* TITLE */}
          <div>
            <input
              name="title"
              placeholder="Course Title"
              value={form.title}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.title ? "border-red-500" : ""
              }`}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          {/* DESCRIPTION */}
          <div>
            <textarea
              name="description"
              placeholder="Course Description"
              value={form.description}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
          </div>

          {/* DURATION */}
          <div className="flex items-center gap-2">
            <Clock className="text-gray-400" />
            <input
              name="duration"
              placeholder="Duration (e.g. 6 weeks)"
              value={form.duration}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.duration ? "border-red-500" : ""
              }`}
            />
          </div>
          {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}

          {/* PRICE */}
          <div className="flex items-center gap-2">
            <DollarSign className="text-gray-400" />
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.price ? "border-red-500" : ""
              }`}
            />
          </div>
          {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}

          {/* SKILLS */}
          <div className="flex items-center gap-2">
            <Tag className="text-gray-400" />
            <input
              name="skills"
              placeholder="Skills (comma separated)"
              value={form.skills}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                errors.skills ? "border-red-500" : ""
              }`}
            />
          </div>
          {errors.skills && <p className="text-red-500 text-sm">{errors.skills}</p>}

          {/* BUTTON */}
          <button
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating..." : "Create Course"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateCourse;