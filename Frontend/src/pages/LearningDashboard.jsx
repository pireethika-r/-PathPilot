import React from 'react';
import { PlayCircleIcon, AwardIcon, DownloadIcon, CheckCircleIcon, BookOpenIcon, TrophyIcon } from 'lucide-react';
import { Badge } from '../components/Badge';
// Mock Data
const ENROLLED_COURSES = [
    {
        id: 'E-01',
        title: 'Advanced React Patterns',
        progress: 100,
        status: 'Completed',
        lastAccessed: '2 days ago',
        image: 'bg-blue-500'
    },
    {
        id: 'E-02',
        title: 'Full-Stack Next.js',
        progress: 45,
        status: 'In Progress',
        lastAccessed: 'Today',
        image: 'bg-slate-800'
    },
    {
        id: 'E-03',
        title: 'UI/UX Design Fundamentals',
        progress: 10,
        status: 'In Progress',
        lastAccessed: '1 week ago',
        image: 'bg-purple-500'
    }
];
const EARNED_BADGES = [
    {
        id: 'B-01',
        title: 'React Master',
        date: 'Oct 2023',
        icon: AwardIcon,
        color: 'text-blue-500 bg-blue-100'
    },
    {
        id: 'B-02',
        title: 'Fast Learner',
        date: 'Sep 2023',
        icon: TrophyIcon,
        color: 'text-amber-500 bg-amber-100'
    },
    {
        id: 'B-03',
        title: 'Profile All-Star',
        date: 'Aug 2023',
        icon: StarIcon,
        color: 'text-purple-500 bg-purple-100'
    }
];
function StarIcon(props) {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>

      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>);
}
export function LearningDashboard() {
    return (<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          My Learning Dashboard
        </h2>
        <p className="text-slate-600">
          Track your progress, resume courses, and download your certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Courses */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <BookOpenIcon className="w-5 h-5 mr-2 text-blue-600"/> Enrolled
            Courses
          </h3>

          <div className="space-y-4">
            {ENROLLED_COURSES.map((course) => <div key={course.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-all hover:shadow-md">

                <div className={`w-full sm:w-32 h-24 rounded-lg ${course.image} flex-shrink-0 flex items-center justify-center`}>

                  <PlayCircleIcon className="w-10 h-10 text-white opacity-80"/>
                </div>

                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-slate-900 leading-tight">
                      {course.title}
                    </h4>
                    <Badge variant={course.status === 'Completed' ? 'success' : 'info'}>

                      {course.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 mb-4">
                    Last accessed: {course.lastAccessed}
                  </p>

                  <div className="w-full">
                    <div className="flex justify-between text-xs font-medium mb-1">
                      <span className="text-slate-700">Progress</span>
                      <span className="text-slate-900">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${course.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{
                width: `${course.progress}%`
            }}>
                    </div>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex sm:flex-col gap-2 mt-4 sm:mt-0">
                  {course.status === 'Completed' ?
                <button className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                      <DownloadIcon className="w-4 h-4 mr-1.5"/> Certificate
                    </button> :
                <button className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                      <PlayCircleIcon className="w-4 h-4 mr-1.5"/> Resume
                    </button>}
                </div>
              </div>)}
          </div>
        </div>

        {/* Sidebar - Achievements */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center mb-6">
              <TrophyIcon className="w-5 h-5 mr-2 text-amber-500"/>{' '}
              Achievements
            </h3>

            <div className="space-y-4">
              {EARNED_BADGES.map((badge) => {
            const Icon = badge.icon;
            return (<div key={badge.id} className="flex items-center p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">

                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${badge.color}`}>

                      <Icon className="w-6 h-6"/>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {badge.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Earned {badge.date}
                      </p>
                    </div>
                    <CheckCircleIcon className="w-5 h-5 text-green-500 ml-auto opacity-50"/>
                  </div>);
        })}
            </div>

            <button className="w-full mt-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              View All Badges
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Keep Learning!</h3>
            <p className="text-indigo-100 text-sm mb-4">
              You're in the top 15% of active learners this week. Complete your
              Next.js course to earn a new badge.
            </p>
            <div className="w-full bg-indigo-900/50 rounded-full h-1.5 mb-2">
              <div className="bg-white h-1.5 rounded-full" style={{
            width: '85%'
        }}>
              </div>
            </div>
            <p className="text-xs text-indigo-200 text-right">
              85% to next milestone
            </p>
          </div>
        </div>
      </div>
    </div>);
}
