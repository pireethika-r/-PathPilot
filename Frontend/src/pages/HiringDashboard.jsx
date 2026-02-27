import React, { useEffect, useMemo, useState } from 'react';
import {
  SearchIcon,
  FilterIcon,
  BriefcaseIcon,
  MailIcon,
  CheckCircleIcon,
  StarIcon,
  EyeIcon,
  UsersIcon,
  TrendingUpIcon,
  LayoutGridIcon,
  ListIcon,
  AlertCircleIcon,
  SparklesIcon
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export function HiringDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [matchFilter, setMatchFilter] = useState('All');
  const [certFilter, setCertFilter] = useState('All');

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewStep, setInterviewStep] = useState('view');
  const [isProcessing, setIsProcessing] = useState(false);
  const [inviteNotice, setInviteNotice] = useState(null);

  const [insightSkills, setInsightSkills] = useState('');
  const [insightDemand, setInsightDemand] = useState('High');
  const [insightField, setInsightField] = useState('');
  const [insightNotes, setInsightNotes] = useState('');
  const [isSubmittingInsight, setIsSubmittingInsight] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) return { 'Content-Type': 'application/json' };
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const getScoreMin = () => {
    if (scoreFilter === '60+') return 60;
    if (scoreFilter === '70+') return 70;
    if (scoreFilter === '80+') return 80;
    if (scoreFilter === '90+') return 90;
    return '';
  };

  const getMatchMin = () => {
    if (matchFilter === '50%+') return 50;
    if (matchFilter === '70%+') return 70;
    if (matchFilter === '80%+') return 80;
    if (matchFilter === '90%+') return 90;
    return '';
  };

  const getCertFilter = () => {
    if (certFilter === 'Has Certifications') return 'has';
    if (certFilter === 'No Certifications') return 'none';
    return '';
  };

  const loadCandidates = async () => {
    setIsLoading(true);
    setApiError('');

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (skillFilter !== 'All') params.set('skill', skillFilter);
      if (getScoreMin()) params.set('scoreMin', String(getScoreMin()));
      if (getMatchMin()) params.set('matchMin', String(getMatchMin()));
      if (getCertFilter()) params.set('certifications', getCertFilter());

      const response = await fetch(`/api/hiring/candidates?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load candidates');
      }

      setCandidates(data.candidates || []);
      setAllSkills(data.allSkills || []);
    } catch (error) {
      setApiError(error.message || 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [searchTerm, skillFilter, scoreFilter, matchFilter, certFilter]);

  useEffect(() => {
    if (!inviteNotice) return;
    const timer = setTimeout(() => setInviteNotice(null), 4500);
    return () => clearTimeout(timer);
  }, [inviteNotice]);

  const stats = useMemo(() => {
    const totalCandidates = candidates.length;
    const shortlistedCount = candidates.filter((c) => c.status === 'Shortlisted').length;
    const interviewsSentCount = candidates.filter((c) => c.status === 'Interview Sent').length;
    const avgMatchScore = totalCandidates
      ? Math.round(candidates.reduce((sum, c) => sum + c.match, 0) / totalCandidates)
      : 0;

    return {
      totalCandidates,
      shortlistedCount,
      interviewsSentCount,
      avgMatchScore
    };
  }, [candidates]);

  const getStatusBadgeVariant = (status) => {
    if (status === 'Shortlisted') return 'warning';
    if (status === 'Interview Sent') return 'success';
    return 'neutral';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const handleShortlistToggle = async (candidate) => {
    setIsProcessing(true);
    setApiError('');

    try {
      const response = await fetch(`/api/hiring/candidates/${candidate.profileId}/shortlist`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update shortlist');

      await loadCandidates();
      if (selectedCandidate?.profileId === candidate.profileId) {
        setSelectedCandidate((prev) => prev ? { ...prev, status: data.shortlisted ? 'Shortlisted' : 'Available' } : null);
      }
    } catch (error) {
      setApiError(error.message || 'Failed to update shortlist');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmInterview = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    const formData = new FormData(e.target);
    const date = formData.get('date');
    const time = formData.get('time');
    const message = formData.get('message');

    setIsProcessing(true);
    setApiError('');

    try {
      const response = await fetch(`/api/hiring/candidates/${selectedCandidate.profileId}/interview`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ date, time, message })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send interview invite');

      await loadCandidates();
      setSelectedCandidate((prev) => prev ? { ...prev, status: 'Interview Sent' } : null);
      setInterviewStep('view');
      setInviteNotice({
        candidateName: selectedCandidate.name,
        date,
        time,
        emailSent: data.emailSent !== false
      });
    } catch (error) {
      setApiError(error.message || 'Failed to send interview invite');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitInsight = async (e) => {
    e.preventDefault();
    setApiError('');
    setIsSubmittingInsight(true);

    try {
      const skills = insightSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const response = await fetch('/api/hiring/insights', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          skills,
          demandLevel: insightDemand,
          careerField: insightField,
          notes: insightNotes
        })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to submit insight');

      setInsightSkills('');
      setInsightField('');
      setInsightNotes('');
    } catch (error) {
      setApiError(error.message || 'Failed to submit insight');
    } finally {
      setIsSubmittingInsight(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
      {inviteNotice && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-[380px] rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-2xl shadow-emerald-200/50 overflow-hidden animate-[pulse_2.5s_ease-in-out_1]">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-300/25 rounded-full blur-xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-cyan-300/25 rounded-full blur-xl" />
          <div className="relative p-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-300/50 mr-3">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black tracking-wide text-emerald-900 uppercase">Invitation Sent</p>
                <p className="text-sm text-slate-700 mt-1">
                  {inviteNotice.candidateName} • {inviteNotice.date} at {inviteNotice.time}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {inviteNotice.emailSent ? 'Email + in-app notification delivered.' : 'In-app notification delivered. Email not sent.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {apiError && (
        <div className="mb-6 flex items-center px-4 py-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
          <AlertCircleIcon className="w-5 h-5 mr-2" />
          <span className="font-medium text-sm">{apiError}</span>
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Candidate Discovery</h2>
          <p className="text-slate-600 mt-1">Find and connect with top student talent matching your requirements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4"><UsersIcon className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Total Candidates</p><p className="text-2xl font-bold text-slate-900">{stats.totalCandidates}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-4"><StarIcon className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Shortlisted</p><p className="text-2xl font-bold text-slate-900">{stats.shortlistedCount}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4"><MailIcon className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Interviews Sent</p><p className="text-2xl font-bold text-slate-900">{stats.interviewsSentCount}</p></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4"><TrendingUpIcon className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Avg Match Score</p><p className="text-2xl font-bold text-slate-900">{stats.avgMatchScore}%</p></div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-slate-400" /></div>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors" placeholder="Search candidates by name, skill, or program..." />
          </div>
          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`} aria-label="Grid view"><LayoutGridIcon className="w-5 h-5" /></button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`} aria-label="Table view"><ListIcon className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <FilterIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <select value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="block w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50">
              <option value="All">All Skills</option>
              {allSkills.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
            </select>
          </div>
          <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} className="block w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50">
            <option value="All">All Profile Scores</option>
            <option value="60+">60+ Score</option>
            <option value="70+">70+ Score</option>
            <option value="80+">80+ Score</option>
            <option value="90+">90+ Score</option>
          </select>
          <select value={matchFilter} onChange={(e) => setMatchFilter(e.target.value)} className="block w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50">
            <option value="All">All Career Matches</option>
            <option value="50%+">50%+ Match</option>
            <option value="70%+">70%+ Match</option>
            <option value="80%+">80%+ Match</option>
            <option value="90%+">90%+ Match</option>
          </select>
          <select value={certFilter} onChange={(e) => setCertFilter(e.target.value)} className="block w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50">
            <option value="All">All Certifications</option>
            <option value="Has Certifications">Has Certifications</option>
            <option value="No Certifications">No Certifications</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500">Loading candidates...</div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No candidates found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your search or filters to find more students.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div key={candidate.profileId} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">{candidate.name.charAt(0)}</div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">{candidate.name}</h3>
                      <p className="text-sm text-slate-500 truncate">{candidate.program}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(candidate.status)}>{candidate.status}</Badge>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-500 font-medium">Career Match</span>
                    <span className="font-bold text-indigo-600">{candidate.match}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${candidate.match}%` }} />
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {candidate.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="neutral" className="text-[10px]">{skill}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <Badge variant={getScoreColor(candidate.score)}>{candidate.score}% score</Badge>
                  <button onClick={() => { setSelectedCandidate(candidate); setInterviewStep('view'); }} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold inline-flex items-center"><EyeIcon className="w-4 h-4 mr-1" /> View</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Skills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Match</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {candidates.map((candidate) => (
                  <tr key={candidate.profileId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-slate-900">{candidate.name}</div><div className="text-xs text-slate-500">{candidate.university}</div></td>
                    <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{candidate.skills.slice(0, 3).map((skill) => <Badge key={skill} variant="neutral" className="text-[10px]">{skill}</Badge>)}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge variant={getScoreColor(candidate.score)}>{candidate.score}</Badge></td>
                    <td className="px-6 py-4 whitespace-nowrap">{candidate.match}%</td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge variant={getStatusBadgeVariant(candidate.status)}>{candidate.status}</Badge></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"><button onClick={() => { setSelectedCandidate(candidate); setInterviewStep('view'); }} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"><EyeIcon className="w-4 h-4 mr-1.5" />View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Employer Market Insights</h3>
        <form onSubmit={handleSubmitInsight} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Career Field</label>
            <input value={insightField} onChange={(e) => setInsightField(e.target.value)} required className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g. Cloud Engineering" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Demand Level</label>
            <select value={insightDemand} onChange={(e) => setInsightDemand(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Important Skills (comma-separated)</label>
            <input value={insightSkills} onChange={(e) => setInsightSkills(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="React, Node.js, AWS" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={insightNotes} onChange={(e) => setInsightNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Industry updates and hiring context" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={isSubmittingInsight} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmittingInsight ? 'Submitting...' : 'Submit Insight'}
            </button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={!!selectedCandidate}
        onClose={() => {
          setSelectedCandidate(null);
          setInterviewStep('view');
        }}
        title={interviewStep === 'confirm' ? 'Send Interview Invitation' : 'Candidate Profile'}
      >
        {selectedCandidate && interviewStep === 'view' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedCandidate.name}</h3>
                <p className="text-slate-600">{selectedCandidate.program} • {selectedCandidate.university}</p>
                <p className="text-sm text-slate-500 mt-1">{selectedCandidate.email}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(selectedCandidate.status)}>{selectedCandidate.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase">Profile Score</p>
                <p className="text-lg font-bold text-slate-900">{selectedCandidate.score}%</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase">Career Match</p>
                <p className="text-lg font-bold text-indigo-600">{selectedCandidate.match}%</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.skills.length > 0 ? selectedCandidate.skills.map((skill) => <Badge key={skill} variant="neutral">{skill}</Badge>) : <span className="text-sm text-slate-500">No skills listed</span>}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Completed Courses</h4>
              <div className="text-sm text-slate-700">
                {selectedCandidate.completedCourses?.length > 0 ? selectedCandidate.completedCourses.join(', ') : 'No completed courses'}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Certifications</h4>
              <div className="text-sm text-slate-700">
                {selectedCandidate.certifications?.length > 0 ? selectedCandidate.certifications.join(', ') : 'No certifications'}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">CV</h4>
              <div className="text-sm text-slate-700">{selectedCandidate.cvName || 'No CV uploaded'}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => handleShortlistToggle(selectedCandidate)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-bold border bg-white border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <StarIcon className="w-5 h-5 mr-2" />
                {selectedCandidate.status === 'Shortlisted' ? 'Remove Shortlist' : 'Shortlist Candidate'}
              </button>
              <button
                onClick={() => setInterviewStep('confirm')}
                disabled={isProcessing || selectedCandidate.status === 'Interview Sent'}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-bold transition-colors ${selectedCandidate.status === 'Interview Sent' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'} disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                <MailIcon className="w-5 h-5 mr-2" />
                {selectedCandidate.status === 'Interview Sent' ? 'Invitation Sent' : 'Send Interview Invite'}
              </button>
            </div>
          </div>
        )}

        {selectedCandidate && interviewStep === 'confirm' && (
          <form onSubmit={handleConfirmInterview} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Date</label>
                <input name="date" type="date" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Time</label>
                <input name="time" type="time" required className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Message</label>
              <textarea
                name="message"
                rows={5}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm"
                defaultValue={`Hi ${selectedCandidate.name.split(' ')[0]},\n\nWe would like to invite you for an interview. Please confirm your availability.\n\nBest regards,\nHiring Team`}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button type="button" onClick={() => setInterviewStep('view')} className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={isProcessing} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed inline-flex justify-center items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                {isProcessing ? 'Sending...' : 'Confirm & Send'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

