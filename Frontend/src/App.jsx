import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { UserProfileModal } from './components/UserProfileModal';
import { StudentProfile } from './pages/StudentProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCourseCatalog } from './pages/AdminCourseCatalog';
import { HiringDashboard } from './pages/HiringDashboard';
import { CourseCatalog } from './pages/CourseCatalog';
import { LearningDashboard } from './pages/LearningDashboard';
import { AuthPage } from './pages/AuthPage';
export function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [currentView, setCurrentView] = useState('profile');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const handleLogin = (user) => {
        const role = typeof user === 'string' ? user : user?.role || 'student';
        setUserRole(role);
        if (typeof user === 'object' && user) {
            setCurrentUser(user);
        }
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
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole('');
        setCurrentUser(null);
        setCurrentView('profile');
    };
    const getDefaultViewByRole = (role) => {
        if (role === 'admin')
            return 'admin';
        if (role === 'hiring')
            return 'hiring';
        return 'profile';
    };
    const parseJwtPayload = (token) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3)
                return null;
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const json = decodeURIComponent(atob(base64).split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''));
            return JSON.parse(json);
        }
        catch (_error) {
            return null;
        }
    };
    const loadCurrentUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthChecked(true);
            return;
        }
        const payload = parseJwtPayload(token);
        const nowInSeconds = Math.floor(Date.now() / 1000);
        if (!payload || (payload.exp && payload.exp <= nowInSeconds)) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUserRole('');
            setCurrentUser(null);
            setIsAuthChecked(true);
            return;
        }
        try {
            const response = await fetch('/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setCurrentUser(data.user);
                if (data.user?.role) {
                    setUserRole(data.user.role);
                    setCurrentView(getDefaultViewByRole(data.user.role));
                }
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                setUserRole('');
                setCurrentUser(null);
            }
        }
        catch (_error) {
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUserRole('');
            setCurrentUser(null);
        } finally {
            setIsAuthChecked(true);
        }
    };
    useEffect(() => {
        loadCurrentUser();
    }, []);
    const getPageTitle = () => {
        switch (currentView) {
            case 'profile':
                return 'Profile Creation';
            case 'admin':
                return 'Admin Dashboard';
            case 'admin-courses':
                return 'Admin Course Catalog';
            case 'hiring':
                return 'Hiring Manager Portal';
            case 'courses':
                return 'Course Catalog';
            case 'learning':
                return 'My Learning';
            default:
                return 'PathPilo';
        }
    };
    if (!isAuthChecked) {
        return <div className="min-h-screen flex items-center justify-center text-slate-600">Checking session...</div>;
    }
    // If not authenticated, show the Auth Page
    if (!isAuthenticated) {
        return <AuthPage onLogin={handleLogin}/>;
    }
    // Main App Shell
    return (<div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar userRole={userRole} user={currentUser} onLogout={handleLogout} currentView={currentView} setCurrentView={setCurrentView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}/>


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header title={getPageTitle()} user={currentUser} onProfileClick={() => setIsProfileModalOpen(true)} onMenuClick={() => setIsSidebarOpen(true)}/>


        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          {currentView === 'profile' && <StudentProfile />}
          {currentView === 'admin' && <AdminDashboard />}
          {currentView === 'admin-courses' && <AdminCourseCatalog />}
          {currentView === 'hiring' && <HiringDashboard />}
          {currentView === 'courses' && <CourseCatalog />}
          {currentView === 'learning' && <LearningDashboard />}
        </main>
      </div>
      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={currentUser} onSaved={setCurrentUser}/>
    </div>);
}
