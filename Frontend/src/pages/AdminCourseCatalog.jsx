import React, { useEffect, useState } from 'react';
import { AlertCircleIcon, CheckCircleIcon, PlusIcon } from 'lucide-react';

export function AdminCourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    code: '',
    title: '',
    description: '',
    duration: '',
    skills: '',
    totalModules: '1',
    price: '0',
    image: 'bg-slate-500',
    isActive: true
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const loadCourses = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const response = await fetch('/api/admin/courses', { headers: getAuthHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load courses');
      setCourses(data.courses || []);
    } catch (error) {
      setApiError(error.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        totalModules: Number(form.totalModules),
        price: Number(form.price)
      };

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create course');

      setSuccessMessage('Course created successfully.');
      setForm({
        code: '',
        title: '',
        description: '',
        duration: '',
        skills: '',
        totalModules: '1',
        price: '0',
        image: 'bg-slate-500',
        isActive: true
      });
      await loadCourses();
    } catch (error) {
      setApiError(error.message || 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCourseActive = async (course) => {
    setApiError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive: !course.isActive })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update course');

      setCourses((prev) =>
        prev.map((item) => (item.id === course.id ? data.course : item))
      );
      setSuccessMessage('Course updated successfully.');
    } catch (error) {
      setApiError(error.message || 'Failed to update course');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Admin Course Catalog</h2>
        <p className="text-slate-600">Create and manage course availability for students.</p>
      </div>

      {apiError && (
        <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm flex items-center">
          <AlertCircleIcon className="w-4 h-4 mr-2" />
          {apiError}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm flex items-center">
          <CheckCircleIcon className="w-4 h-4 mr-2" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-5 h-fit">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <PlusIcon className="w-5 h-5 mr-2 text-blue-600" />
            Create Course
          </h3>
          <form onSubmit={handleCreateCourse} className="space-y-3">
            <input name="code" value={form.code} onChange={handleChange} required placeholder="Course Code (e.g. CRS-10)" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <input name="title" value={form.title} onChange={handleChange} required placeholder="Course Title" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Description" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration (e.g. 6 Weeks)" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <input name="skills" value={form.skills} onChange={handleChange} placeholder="Skills (comma-separated)" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <div className="grid grid-cols-2 gap-2">
              <input name="totalModules" type="number" min={1} value={form.totalModules} onChange={handleChange} required placeholder="Modules" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              <input name="price" type="number" min={0} step="0.01" value={form.price} onChange={handleChange} required placeholder="Price" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <input name="image" value={form.image} onChange={handleChange} placeholder="Image class (Tailwind bg-*)" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <label className="flex items-center text-sm text-slate-700">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className="mr-2" />
              Active
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70"
            >
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Course List</h3>
          </div>
          {isLoading ? (
            <div className="p-5 text-slate-600">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="p-5 text-slate-600">No courses found.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {courses.map((course) => (
                <div key={course.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{course.title} <span className="text-xs text-slate-500">({course.code})</span></p>
                    <p className="text-sm text-slate-600">${course.price} • {course.totalModules} modules • {course.duration || 'No duration'}</p>
                    <p className="text-xs text-slate-500 mt-1">{course.skills?.join(', ') || 'No skills'}</p>
                  </div>
                  <button
                    onClick={() => toggleCourseActive(course)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${course.isActive ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}
                  >
                    {course.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
