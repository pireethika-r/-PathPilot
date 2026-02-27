import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StudentProfile } from './pages/StudentProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { HiringDashboard } from './pages/HiringDashboard';
import { CourseCatalog } from './pages/CourseCatalog';
import { LearningDashboard } from './pages/LearningDashboard';
import { AuthPage } from './pages/AuthPage';
export function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [currentView, setCurrentView] = useState('profile');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const handleLogin = (role) => {
        setUserRole(role);
        setIsAuthenticated(true);
        // Route based on role
        if (role === 'admin') {
            setCurrentView('admin');
        }
        else if (role === 'hiring') {
            setCurrentView('hiring');
        }
        else {
            setCurrentView('profile'); // Default for students
        }
    };
    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole('');
    };
    const getPageTitle = () => {
        switch (currentView) {
            case 'profile':
                return 'Profile Creation';
            case 'admin':
                return 'Admin Dashboard';
            case 'hiring':
                return 'Hiring Manager Portal';
            case 'courses':
                return 'Course Catalog';
            case 'learning':
                return 'My Learning';
            default:
                return 'StudentHub';
        }
    };
    // If not authenticated, show the Auth Page
    if (!isAuthenticated) {
        return <AuthPage onLogin={handleLogin}/>;
    }
    // Main App Shell
    return (<div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}/>


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header title={getPageTitle()} onMenuClick={() => setIsSidebarOpen(true)}/>


        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {currentView === 'profile' && <StudentProfile />}
          {currentView === 'admin' && <AdminDashboard />}
          {currentView === 'hiring' && <HiringDashboard />}
          {currentView === 'courses' && <CourseCatalog />}
          {currentView === 'learning' && <LearningDashboard />}
        </main>
      </div>
    </div>);
}
