import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { UserProfileModal } from './components/UserProfileModal';

import Home from './pages/Home';
import { StudentProfile } from './pages/StudentProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCourseCatalog } from './pages/AdminCourseCatalog';
import { HiringDashboard } from './pages/HiringDashboard';
import { CourseCatalog } from './pages/CourseCatalog';
import { LearningDashboard } from './pages/LearningDashboard';
import { PaymentHistory } from './pages/PaymentHistory';
import { AuthPage } from './pages/AuthPage';

import CreateCourse from './pages/CreateCourse';
import CareerForm from './pages/CareerForm';
import CoursePage from './pages/CoursePage';
import LearningPlayer from "./pages/LearningPlayer";
import CreateCourseContent from "./pages/CreateCourseContent";

export function App() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    const [currentView, setCurrentView] = useState('home');

    const [selectedCourseId, setSelectedCourseId] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleLogin = (user) => {
        const role = typeof user === 'string' ? user : user?.role || 'student';
        setUserRole(role);

        if (typeof user === 'object' && user) {
            setCurrentUser(user);
        }

        setIsAuthenticated(true);

        if (role === 'admin') setCurrentView('admin');
        else if (role === 'hiring') setCurrentView('hiring');
        else setCurrentView('home');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole('');
        setCurrentUser(null);
        setCurrentView('home');
    };

    const loadCurrentUser = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setIsAuthChecked(true);
            return;
        }

        try {
            const res = await fetch('/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (res.ok) {
                setCurrentUser(data.user);
                setUserRole(data.user?.role);
                setIsAuthenticated(true);
            }
        } catch {
            localStorage.removeItem('token');
        } finally {
            setIsAuthChecked(true);
        }
    };

    useEffect(() => {
        loadCurrentUser();
    }, []);

    if (!isAuthChecked) {
        return <div className="p-6">Loading...</div>;
    }

    // 🔐 AUTH FLOW
    if (!isAuthenticated && currentView === 'login') {
        return <AuthPage onLogin={handleLogin} />;
    }

    if (!isAuthenticated) {
        return <Home setCurrentView={setCurrentView} />;
    }

    return (
        <div className="flex h-screen bg-slate-50">

            {/* SIDEBAR */}
            <Sidebar
                userRole={userRole}
                user={currentUser}
                onLogout={handleLogout}
                currentView={currentView}
                setCurrentView={setCurrentView}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* MAIN */}
            <div className="flex-1 flex flex-col">

                {/* HEADER */}
                <Header
                    title={currentView}
                    user={currentUser}
                    onProfileClick={() => setIsProfileModalOpen(true)}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                {/* CONTENT */}
                <main className="flex-1 overflow-y-auto p-6">

                    {currentView === 'home' && <Home setCurrentView={setCurrentView} />}
                    {currentView === 'profile' && <StudentProfile />}
                    {currentView === 'admin' && <AdminDashboard />}
                    {currentView === 'admin-courses' && <AdminCourseCatalog />}
                    {currentView === 'create-course' && <CreateCourse />}
                    {currentView === 'hiring' && <HiringDashboard />}
                    {currentView === 'courses' && <CourseCatalog />}
                    {currentView === 'learning' && <LearningDashboard />}
                    {currentView === 'payments' && <PaymentHistory />}
                    {currentView === 'create-content' && <CreateCourseContent />}

                    {/* ✅ YOUR MODULE */}
                    {currentView === 'career' && (
                        <CareerForm setCurrentView={setCurrentView} />
                    )}

                    {currentView === 'career-courses' && (
                        <CoursePage
                            setCurrentView={setCurrentView}
                            setSelectedCourseId={setSelectedCourseId}
                        />
                    )}

                    {/* 🎬 LEARNING PLAYER */}
                    {currentView === 'learning-player' && (
                        <LearningPlayer selectedCourseId={selectedCourseId} />
                    )}

                </main>
            </div>

            {/* MODAL */}
            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                user={currentUser}
                onSaved={setCurrentUser}
            />
        </div>
    );
}