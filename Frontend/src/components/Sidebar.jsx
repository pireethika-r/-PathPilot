import React from 'react';
import { UserIcon, LayoutDashboardIcon, GraduationCapIcon, XIcon, BriefcaseIcon, BookOpenIcon, BookMarkedIcon } from 'lucide-react';
export function Sidebar({ currentView, setCurrentView, isOpen, setIsOpen }) {
    const navItems = [
        {
            id: 'profile',
            label: 'My Profile',
            icon: UserIcon,
            group: 'Student'
        },
        {
            id: 'courses',
            label: 'Course Catalog',
            icon: BookOpenIcon,
            group: 'Student'
        },
        {
            id: 'learning',
            label: 'My Learning',
            icon: BookMarkedIcon,
            group: 'Student'
        },
        {
            id: 'admin',
            label: 'Admin Dashboard',
            icon: LayoutDashboardIcon,
            group: 'Staff'
        },
        {
            id: 'hiring',
            label: 'Hiring Dashboard',
            icon: BriefcaseIcon,
            group: 'Staff'
        }
    ];
    return (<>
      {/* Mobile overlay */}
      {isOpen &&
            <div className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden" onClick={() => setIsOpen(false)}/>}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-30 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className="h-full flex flex-col">
          {/* Logo area */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <GraduationCapIcon className="w-8 h-8 text-blue-400 mr-3"/>
            <span className="text-xl font-bold tracking-tight">StudentHub</span>
            <button className="ml-auto lg:hidden text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>

              <XIcon className="w-5 h-5"/>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {/* Student Group */}
            <div>
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Student Portal
              </p>
              <div className="space-y-1">
                {navItems.
            filter((item) => item.group === 'Student').
            map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (<button key={item.id} onClick={() => {
                    setCurrentView(item.id);
                    setIsOpen(false);
                }} className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>

                        <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}/>

                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                      </button>);
        })}
              </div>
            </div>

            {/* Staff Group */}
            <div>
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Staff & Partners
              </p>
              <div className="space-y-1">
                {navItems.
            filter((item) => item.group === 'Staff').
            map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (<button key={item.id} onClick={() => {
                    setCurrentView(item.id);
                    setIsOpen(false);
                }} className={`w-full flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>

                        <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}/>

                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                      </button>);
        })}
              </div>
            </div>
          </nav>

          {/* Bottom user area (static for demo) */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center px-4 py-3 rounded-lg bg-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold mr-3">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  John Doe
                </p>
                <p className="text-xs text-slate-400 truncate">Student</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>);
}
