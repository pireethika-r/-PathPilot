import React, { useEffect, useState } from 'react';
import {
  AwardIcon,
  BookOpenIcon,
  CheckCircleIcon,
  DownloadIcon,
  PlayCircleIcon,
  Share2Icon,
  TrophyIcon
} from 'lucide-react';
import { Badge } from '../components/Badge';

const getBadgeIcon = (iconKey) => {
  if (iconKey === 'high_performer') return TrophyIcon;
  if (iconKey === 'multi_course') return AwardIcon;
  return CheckCircleIcon;
};

const getBadgeCardTheme = (badge) => {
  if (badge.iconKey === 'high_performer') {
    return {
      shell: 'bg-[radial-gradient(circle_at_top,_#faf5ff,_#ede9fe_55%,_#ddd6fe)] border-violet-200',
      orb: 'bg-violet-600 text-white',
      ribbon: 'bg-violet-600 text-white',
      accent: 'text-violet-700'
    };
  }
  if (badge.iconKey === 'multi_course') {
    return {
      shell: 'bg-[radial-gradient(circle_at_top,_#f0fdfa,_#ccfbf1_55%,_#99f6e4)] border-teal-200',
      orb: 'bg-teal-600 text-white',
      ribbon: 'bg-teal-600 text-white',
      accent: 'text-teal-700'
    };
  }
  return {
    shell: 'bg-[radial-gradient(circle_at_top,_#fffbeb,_#fef3c7_55%,_#fde68a)] border-amber-200',
    orb: 'bg-amber-600 text-white',
    ribbon: 'bg-amber-600 text-white',
    accent: 'text-amber-700'
  };
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
  const [activeBadgeId, setActiveBadgeId] = useState('');
  const [badgeNotice, setBadgeNotice] = useState('');

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

  useEffect(() => {
    if (!badgeNotice) return;
    const timer = setTimeout(() => setBadgeNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [badgeNotice]);

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
        setBadgeNotice(`Badge collected: ${data.newBadges[0].title}`);
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

  const fetchBadgeFile = async (badge) => {
    const response = await fetch(`/api/learning/badges/${badge.id}/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      let errorMessage = 'Failed to download badge';
      try {
        const data = await response.json();
        errorMessage = data.message || errorMessage;
      } catch (_error) {
        // ignored
      }
      throw new Error(errorMessage);
    }

    return response.blob();
  };

  const handleDownloadBadge = async (badge) => {
    setActiveBadgeId(badge.id);
    setApiError('');
    try {
      const blob = await fetchBadgeFile(badge);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${badge.badgeKey || 'badge'}-badge.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setApiError(error.message || 'Failed to download badge');
    } finally {
      setActiveBadgeId('');
    }
  };

  const handleShareBadge = async (badge) => {
    setActiveBadgeId(badge.id);
    setApiError('');
    try {
      const shareText = `${badge.title} - ${badge.description}. Earned ${badge.earnedDate} on PathPilo.`;
      const blob = await fetchBadgeFile(badge);
      const file = new File([blob], `${badge.badgeKey || 'badge'}-badge.pdf`, {
        type: 'application/pdf'
      });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: badge.title,
          text: shareText,
          files: [file]
        });
        setBadgeNotice(`Badge shared: ${badge.title}`);
      } else if (navigator.share) {
        await navigator.share({
          title: badge.title,
          text: shareText
        });
        setBadgeNotice(`Badge shared: ${badge.title}`);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setBadgeNotice(`Badge text copied: ${badge.title}`);
      } else {
        throw new Error('Sharing is not supported on this device.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setApiError(error.message || 'Failed to share badge');
      }
    } finally {
      setActiveBadgeId('');
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

      {badgeNotice && (
        <div className="mb-6 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          {badgeNotice}
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
                      <div className="mb-3 space-y-2">
                        <p className="text-xs text-green-700">
                          Certificate: {course.certificateId || 'Issued'} {course.completedAt ? `- ${course.completedAt}` : ''}
                        </p>
                        {course.earnedBadge && (
                          <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                            <TrophyIcon className="w-3.5 h-3.5 mr-1.5" />
                            Badge Collected: {course.earnedBadge.title}
                          </div>
                        )}
                      </div>
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
            <p className="text-sm text-slate-600 mb-4">
              Complete enrolled courses to collect your badges here.
            </p>

            <div className="space-y-4">
              {badges.length === 0 ? (
                <div className="text-sm text-slate-600">No badges earned yet. Complete a course to unlock your first badge.</div>
              ) : (
                badges.map((badge) => {
                  const Icon = getBadgeIcon(badge.iconKey);
                  const theme = getBadgeCardTheme(badge);
                  return (
                    <div
                      key={badge.id}
                      className={`relative overflow-hidden p-4 rounded-2xl border shadow-sm transition-transform hover:-translate-y-0.5 ${theme.shell}`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/30 rounded-full blur-2xl" />
                      <div className="relative flex items-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 shadow-lg ${theme.orb}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] ${theme.ribbon}`}>
                            VERIFIED BADGE
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-2">{badge.title}</h4>
                          <p className="text-xs text-slate-600">Earned {badge.earnedDate}</p>
                        </div>
                        <CheckCircleIcon className="w-5 h-5 text-green-500 ml-auto opacity-50" />
                      </div>
                      <p className={`text-xs mt-4 ${theme.accent}`}>{badge.description}</p>
                      <div className="mt-4 rounded-xl border border-white/60 bg-white/60 px-3 py-2">
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>Badge Asset</span>
                          <span className="font-semibold text-slate-900">Creative PDF</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => handleDownloadBadge(badge)}
                          disabled={activeBadgeId === badge.id}
                          className="inline-flex items-center px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-70"
                        >
                          <DownloadIcon className="w-3.5 h-3.5 mr-1.5" />
                          {activeBadgeId === badge.id ? 'Working...' : 'Download'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleShareBadge(badge)}
                          disabled={activeBadgeId === badge.id}
                          className="inline-flex items-center px-3 py-2 rounded-xl bg-white/80 text-slate-900 text-xs font-medium border border-white hover:bg-white disabled:opacity-70"
                        >
                          <Share2Icon className="w-3.5 h-3.5 mr-1.5" />
                          Share
                        </button>
                      </div>
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

