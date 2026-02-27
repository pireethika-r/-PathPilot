import React, { useEffect, useState } from 'react';
import {
  AwardIcon,
  BookOpenIcon,
  CheckCircleIcon,
  DownloadIcon,
  PlayCircleIcon,
  TrophyIcon
} from 'lucide-react';
import { Badge } from '../components/Badge';

const getBadgeIcon = (iconKey) => {
  if (iconKey === 'high_performer') return TrophyIcon;
  if (iconKey === 'multi_course') return AwardIcon;
  return CheckCircleIcon;
};

export function LearningDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [metrics, setMetrics] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    completionRate: 0,
    averageProgress: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [activeEnrollmentId, setActiveEnrollmentId] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) return { 'Content-Type': 'application/json' };
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const loadDashboard = async () => {
    if (!localStorage.getItem('token')) {
      setApiError('Please login again to view your learning dashboard.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/learning/dashboard', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load learning dashboard');
      setEnrollments(data.enrollments || []);
      setBadges(data.badges || []);
      setCertificates(data.certificates || []);
      setMetrics(
        data.metrics || {
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          completionRate: 0,
          averageProgress: 0
        }
      );
    } catch (error) {
      setApiError(error.message || 'Failed to load learning dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(loadDashboard, 12000);
    return () => clearInterval(timer);
  }, []);

  const handleProgressUpdate = async (enrollment) => {
    setActiveEnrollmentId(enrollment.enrollmentId);
    setApiError('');
    try {
      const response = await fetch(`/api/learning/enrollments/${enrollment.enrollmentId}/progress`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          modulesCompleted: Math.min(enrollment.totalModules, enrollment.modulesCompleted + 1)
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update progress');

      setEnrollments((prev) =>
        prev.map((item) => (item.enrollmentId === enrollment.enrollmentId ? data.enrollment : item))
      );

      if (Array.isArray(data.newBadges) && data.newBadges.length > 0) {
        await loadDashboard();
      }
    } catch (error) {
      setApiError(error.message || 'Failed to update progress');
    } finally {
      setActiveEnrollmentId('');
    }
  };

  const handleDownloadCertificate = async (enrollment) => {
    setActiveEnrollmentId(enrollment.enrollmentId);
    setApiError('');
    try {
      const response = await fetch(`/api/learning/enrollments/${enrollment.enrollmentId}/certificate`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        let errorMessage = 'Failed to download certificate';
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch (_error) {
          // ignored
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${enrollment.courseId}-certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setApiError(error.message || 'Failed to download certificate');
    } finally {
      setActiveEnrollmentId('');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-slate-600">
          Loading learning dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">My Learning Dashboard</h2>
        <p className="text-slate-600">Track your progress, complete modules, and download certificates.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Total Courses</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.totalCourses}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{metrics.completedCourses}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs text-slate-500">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{metrics.inProgressCourses}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Completion Rate</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.completionRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Average Progress</p>
          <p className="text-2xl font-bold text-slate-900">{metrics.averageProgress}%</p>
        </div>
      </div>

      {apiError && (
        <div className="mb-6 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <BookOpenIcon className="w-5 h-5 mr-2 text-blue-600" /> Enrolled Courses
          </h3>

          <div className="space-y-4">
            {enrollments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-slate-600">
                No enrolled courses yet. Go to Course Catalog to start learning.
              </div>
            ) : (
              enrollments.map((course) => (
                <div
                  key={course.enrollmentId}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-all hover:shadow-md"
                >
                  <div className={`w-full sm:w-32 h-24 rounded-lg ${course.image} flex-shrink-0 flex items-center justify-center`}>
                    <PlayCircleIcon className="w-10 h-10 text-white opacity-80" />
                  </div>

                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-slate-900 leading-tight">{course.title}</h4>
                      <Badge variant={course.status === 'Completed' ? 'success' : 'info'}>{course.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Last accessed: {course.lastAccessed}</p>
                    {course.status === 'Completed' && (
                      <p className="text-xs text-green-700 mb-3">
                        Certificate: {course.certificateId || 'Issued'} {course.completedAt ? `- ${course.completedAt}` : ''}
                      </p>
                    )}

                    <div className="w-full">
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-700">
                          Progress ({course.modulesCompleted}/{course.totalModules} modules)
                        </span>
                        <span className="text-slate-900">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex sm:flex-col gap-2 mt-4 sm:mt-0">
                    {course.status === 'Completed' ? (
                      <button
                        onClick={() => handleDownloadCertificate(course)}
                        disabled={activeEnrollmentId === course.enrollmentId || !course.canDownloadCertificate}
                        className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-60"
                      >
                        <DownloadIcon className="w-4 h-4 mr-1.5" /> Download Certificate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleProgressUpdate(course)}
                        disabled={activeEnrollmentId === course.enrollmentId}
                        className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <PlayCircleIcon className="w-4 h-4 mr-1.5" />
                        {activeEnrollmentId === course.enrollmentId ? 'Updating...' : 'Resume (+1 Module)'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center mb-6">
              <TrophyIcon className="w-5 h-5 mr-2 text-amber-500" /> Achievements
            </h3>

            <div className="space-y-4">
              {badges.length === 0 ? (
                <div className="text-sm text-slate-600">No badges earned yet. Complete a course to unlock your first badge.</div>
              ) : (
                badges.map((badge) => {
                  const Icon = getBadgeIcon(badge.iconKey);
                  return (
                    <div
                      key={badge.id}
                      className="flex items-center p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${badge.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{badge.title}</h4>
                        <p className="text-xs text-slate-500">Earned {badge.earnedDate}</p>
                      </div>
                      <CheckCircleIcon className="w-5 h-5 text-green-500 ml-auto opacity-50" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center mb-4">
              <DownloadIcon className="w-5 h-5 mr-2 text-green-600" /> Certificates
            </h3>
            <div className="space-y-3">
              {certificates.length === 0 ? (
                <div className="text-sm text-slate-600">No certificates yet.</div>
              ) : (
                certificates.map((certificate) => (
                  <div
                    key={certificate.enrollmentId}
                    className="p-3 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <p className="text-sm font-semibold text-slate-900">{certificate.title}</p>
                    <p className="text-xs text-slate-500">
                      {certificate.certificateId || 'Certificate issued'} - {certificate.issuedAt}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

