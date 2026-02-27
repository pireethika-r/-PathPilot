import React, { useEffect, useMemo, useState } from 'react';
import { SearchIcon, FilterIcon, EyeIcon, UsersIcon, CheckCircleIcon, ClockIcon, AwardIcon, AlertCircleIcon } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    completeProfiles: 0,
    pendingReviews: 0,
    avgScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { 'Content-Type': 'application/json' };
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const loadStudents = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const response = await fetch('/api/admin/students', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load student profiles');
      }
      setStudents(data.students || []);
      setStats(data.stats || {
        totalStudents: 0,
        completeProfiles: 0,
        pendingReviews: 0,
        avgScore: 0
      });
    } catch (error) {
      setApiError(error.message || 'Failed to load student profiles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;

      let matchesScore = true;
      if (scoreFilter === 'High (>80)') matchesScore = student.score > 80;
      if (scoreFilter === 'Medium (50-80)') matchesScore = student.score >= 50 && student.score <= 80;
      if (scoreFilter === 'Low (<50)') matchesScore = student.score < 50;

      return matchesSearch && matchesStatus && matchesScore;
    });
  }, [students, searchTerm, statusFilter, scoreFilter]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const handleStatusUpdate = async (status, reason = '') => {
    if (!selectedStudent) return;
    setIsUpdatingStatus(true);
    setApiError('');

    try {
      const endpoint =
        status === 'Complete'
          ? `/api/admin/students/${selectedStudent.profileId}/approve`
          : `/api/admin/students/${selectedStudent.profileId}/request-update`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(status === 'Complete' ? {} : { reason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile status');
      }

      setStudents((prev) =>
        prev.map((student) =>
          student.profileId === selectedStudent.profileId ? data.student : student
        )
      );
      setSelectedStudent(data.student);
      loadStudents();
    } catch (error) {
      setApiError(error.message || 'Failed to update profile status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-slate-600">
          Loading student profiles...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {apiError && (
        <div className="mb-6 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm flex items-center">
          <AlertCircleIcon className="w-4 h-4 mr-2" />
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Students</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalStudents}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Complete Profiles</p>
            <p className="text-2xl font-bold text-slate-900">{stats.completeProfiles}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
            <AwardIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Average Score</p>
            <p className="text-2xl font-bold text-slate-900">{stats.avgScore}%</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-4">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending / Incomplete</p>
            <p className="text-2xl font-bold text-slate-900">{stats.pendingReviews}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="Search by name or ID..."
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FilterIcon className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="All">All Status</option>
                <option value="Complete">Complete</option>
                <option value="Incomplete">Incomplete</option>
              </select>
            </div>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="block w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="All">All Scores</option>
              <option value="High (>80)">High (&gt;80)</option>
              <option value="Medium (50-80)">Medium (50-80)</option>
              <option value="Low (<50)">Low (&lt;50)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Program
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.profileId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{student.name}</div>
                          <div className="text-sm text-slate-500">{student.id} � {student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{student.program || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getScoreColor(student.score)}>{student.score}%</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={student.status === 'Complete' ? 'success' : 'neutral'}>{student.status}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 mr-1.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No students found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 border-t border-slate-200 flex items-center justify-between sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">{filteredStudents.length}</span> of{' '}
                <span className="font-medium">{stats.totalStudents}</span> results
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title="Student Profile Details">
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl mr-4">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">{selectedStudent.name}</h4>
                  <p className="text-slate-500">{selectedStudent.id} � {selectedStudent.email}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500 mb-1">Profile Score</div>
                <Badge variant={getScoreColor(selectedStudent.score)} className="text-lg px-3 py-1">
                  {selectedStudent.score}%
                </Badge>
              </div>
            </div>

            <hr className="border-slate-200" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Academic Info</h5>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Program:</dt>
                    <dd className="font-medium text-slate-900">{selectedStudent.program || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">University:</dt>
                    <dd className="font-medium text-slate-900">{selectedStudent.university || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Status:</dt>
                    <dd className="font-medium text-slate-900">{selectedStudent.status}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Last Updated:</dt>
                    <dd className="font-medium text-slate-900">{new Date(selectedStudent.date).toLocaleDateString()}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h5 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Documents</h5>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded shadow-sm flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-red-500">CV</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{selectedStudent.cvName || 'No CV uploaded'}</p>
                      <p className="text-xs text-slate-500">
                        {selectedStudent.cvSize ? `${(selectedStudent.cvSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Skills</h5>
              <div className="flex flex-wrap gap-2">
                {(selectedStudent.skills || []).length > 0 ? (
                  selectedStudent.skills.map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-700 font-medium">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No skills added</span>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => { const reason = window.prompt('Enter reason for update request (optional):', '') || ''; handleStatusUpdate('Incomplete', reason); }}
                disabled={isUpdatingStatus}
                className="flex-1 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Request Update
              </button>
              <button
                onClick={() => handleStatusUpdate('Complete')}
                disabled={isUpdatingStatus}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Approve Profile
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
