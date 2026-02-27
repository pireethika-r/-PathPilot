import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCapIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, UserIcon, ShieldIcon, BriefcaseIcon, AlertCircleIcon } from 'lucide-react';
export function AuthPage({ onLogin }) {
    const [mode, setMode] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [apiError, setApiError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [selectedRole, setSelectedRole] = useState('student');
    const [agreeTerms, setAgreeTerms] = useState(false);
    // Validation State
    const [errors, setErrors] = useState({});
    const submitAuth = async (endpoint, payload) => {
        setIsSubmitting(true);
        setApiError('');
        try {
            const response = await fetch(`/api/auth/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed');
            }
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            onLogin(data.user || { role: 'student' });
        }
        catch (error) {
            setApiError(error.message || 'Something went wrong. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!email)
            newErrors.email = 'Email is required';
        else if (!validateEmail(email))
            newErrors.email = 'Invalid email format';
        if (!password)
            newErrors.password = 'Password is required';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        await submitAuth('login', { email, password });
    };
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!fullName)
            newErrors.fullName = 'Full name is required';
        if (!email)
            newErrors.email = 'Email is required';
        else if (!validateEmail(email))
            newErrors.email = 'Invalid email format';
        if (!password)
            newErrors.password = 'Password is required';
        else if (password.length < 8)
            newErrors.password = 'Password must be at least 8 characters';
        if (password !== confirmPassword)
            newErrors.confirmPassword = 'Passwords do not match';
        if (!agreeTerms)
            newErrors.terms = 'You must agree to the terms';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        await submitAuth('register', {
            fullName,
            email,
            password,
            role: selectedRole
        });
    };
    // Clear errors when switching modes
    const toggleMode = (newMode) => {
        setMode(newMode);
        setErrors({});
        setApiError('');
    };
    return (<div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      {/* LEFT PANEL - Decorative (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative flex-col justify-between p-12 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1]
        }} transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
        }} className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"/>

          <motion.div animate={{
            y: [0, 30, 0],
            x: [0, 20, 0],
            opacity: [0.1, 0.2, 0.1]
        }} transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
        }} className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"/>

        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center">
          <GraduationCapIcon className="w-10 h-10 text-indigo-400 mr-3"/>
          <span className="text-2xl font-bold text-white tracking-tight">
            PathPilo
          </span>
        </div>

        {/* Main Copy */}
        <div className="relative z-10 max-w-lg mt-20">
          <motion.h1 initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.6
        }} className="text-5xl font-extrabold text-white leading-tight mb-6">

            Launch Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              Career Journey
            </span>
          </motion.h1>
          <motion.p initial={{
            opacity: 0,
            y: 20
        }} animate={{
            opacity: 1,
            y: 0
        }} transition={{
            duration: 0.6,
            delay: 0.2
        }} className="text-lg text-slate-300 leading-relaxed">

            Connect with top employers, build your skills, and track your growth
            in one unified platform designed for student success.
          </motion.p>
        </div>

        {/* Floating Stats Cards */}
        <div className="relative z-10 mt-20 flex flex-col gap-4">
          <motion.div initial={{
            opacity: 0,
            x: -20
        }} animate={{
            opacity: 1,
            x: 0
        }} transition={{
            duration: 0.6,
            delay: 0.4
        }} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center max-w-xs transform -rotate-2 hover:rotate-0 transition-transform">

            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mr-4">
              <UserIcon className="w-6 h-6 text-indigo-400"/>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">5,000+</p>
              <p className="text-sm text-slate-300">Active Students</p>
            </div>
          </motion.div>

          <motion.div initial={{
            opacity: 0,
            x: -20
        }} animate={{
            opacity: 1,
            x: 0
        }} transition={{
            duration: 0.6,
            delay: 0.6
        }} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center max-w-xs ml-12 transform rotate-1 hover:rotate-0 transition-transform">

            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mr-4">
              <BriefcaseIcon className="w-6 h-6 text-blue-400"/>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="text-sm text-slate-300">Top Employers</p>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-slate-500 mt-auto pt-12">
          &copy; {new Date().getFullYear()} PathPilo Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        {/* Mobile Logo (Hidden on Desktop) */}
        <div className="lg:hidden flex items-center mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
            <GraduationCapIcon className="w-6 h-6 text-white"/>
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            PathPilo
          </span>
        </div>

        <div className="w-full max-w-md">
          {/* Tab Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8 relative">
            <button onClick={() => toggleMode('login')} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors ${mode === 'login' ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>

              Sign In
            </button>
            <button onClick={() => toggleMode('register')} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors ${mode === 'register' ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>

              Create Account
            </button>

            {/* Animated Pill Background */}
            <motion.div layoutId="activeTab" className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm" initial={false} animate={{
            left: mode === 'login' ? '4px' : 'calc(50%)'
        }} transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
        }}/>

          </div>

          {/* Form Content */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {mode === 'login' ?
            <motion.div key="login" initial={{
                    opacity: 0,
                    x: -20
                }} animate={{
                    opacity: 1,
                    x: 0
                }} exit={{
                    opacity: 0,
                    x: 20
                }} transition={{
                    duration: 0.2
                }}>

                  <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Welcome back
                    </h2>
                    <p className="text-slate-500">
                      Enter your details to access your account.
                    </p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    {apiError && <p className="text-sm text-red-500 flex items-center">
                        <AlertCircleIcon className="w-4 h-4 mr-1"/>
                        {apiError}
                      </p>}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MailIcon className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-slate-400'}`}/>

                        </div>
                        <input type="email" value={email} onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                        setErrors({
                            ...errors,
                            email: ''
                        });
                }} className={`block w-full pl-11 pr-4 py-3 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'}`} placeholder="you@example.com"/>

                      </div>
                      {errors.email &&
                    <p className="mt-1.5 text-sm text-red-500 flex items-center">
                          <AlertCircleIcon className="w-4 h-4 mr-1"/>
                          {errors.email}
                        </p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LockIcon className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-slate-400'}`}/>

                        </div>
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                        setErrors({
                            ...errors,
                            password: ''
                        });
                }} className={`block w-full pl-11 pr-12 py-3 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'}`} placeholder="••••••••"/>

                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none">

                          {showPassword ?
                    <EyeOffIcon className="h-5 w-5"/> :
                    <EyeIcon className="h-5 w-5"/>}
                        </button>
                      </div>
                      {errors.password &&
                    <p className="mt-1.5 text-sm text-red-500 flex items-center">
                          <AlertCircleIcon className="w-4 h-4 mr-1"/>
                          {errors.password}
                        </p>}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"/>

                        <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">

                          Remember me
                        </label>
                      </div>
                      <div className="text-sm">
                        <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">

                          Forgot password?
                        </a>
                      </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-6">

                      {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>

                </motion.div> :
            <motion.div key="register" initial={{
                    opacity: 0,
                    x: 20
                }} animate={{
                    opacity: 1,
                    x: 0
                }} exit={{
                    opacity: 0,
                    x: -20
                }} transition={{
                    duration: 0.2
                }}>

                  <div className="mb-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      Create an account
                    </h2>
                    <p className="text-slate-500">
                      Join PathPilo to launch your career.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {apiError && <p className="text-sm text-red-500 flex items-center">
                        <AlertCircleIcon className="w-4 h-4 mr-1"/>
                        {apiError}
                      </p>}
                    {/* Role Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        I am a...
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button type="button" onClick={() => setSelectedRole('student')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${selectedRole === 'student' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>

                          <GraduationCapIcon className={`w-6 h-6 mb-1.5 ${selectedRole === 'student' ? 'text-indigo-600' : 'text-slate-400'}`}/>

                          <span className="text-xs font-bold">Student</span>
                        </button>
                        <button type="button" onClick={() => setSelectedRole('hiring')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${selectedRole === 'hiring' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>

                          <BriefcaseIcon className={`w-6 h-6 mb-1.5 ${selectedRole === 'hiring' ? 'text-indigo-600' : 'text-slate-400'}`}/>

                          <span className="text-xs font-bold text-center leading-tight">
                            Employer
                          </span>
                        </button>
                        <button type="button" onClick={() => setSelectedRole('admin')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${selectedRole === 'admin' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>

                          <ShieldIcon className={`w-6 h-6 mb-1.5 ${selectedRole === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`}/>

                          <span className="text-xs font-bold">Admin</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <UserIcon className={`h-5 w-5 ${errors.fullName ? 'text-red-400' : 'text-slate-400'}`}/>

                        </div>
                        <input type="text" value={fullName} onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName)
                        setErrors({
                            ...errors,
                            fullName: ''
                        });
                }} className={`block w-full pl-11 pr-4 py-2.5 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${errors.fullName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'}`} placeholder="John Doe"/>

                      </div>
                      {errors.fullName &&
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                          <AlertCircleIcon className="w-3 h-3 mr-1"/>
                          {errors.fullName}
                        </p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MailIcon className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-slate-400'}`}/>

                        </div>
                        <input type="email" value={email} onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email)
                        setErrors({
                            ...errors,
                            email: ''
                        });
                }} className={`block w-full pl-11 pr-4 py-2.5 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'}`} placeholder="you@example.com"/>

                      </div>
                      {errors.email &&
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                          <AlertCircleIcon className="w-3 h-3 mr-1"/>
                          {errors.email}
                        </p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <LockIcon className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-slate-400'}`}/>

                          </div>
                          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                        setErrors({
                            ...errors,
                            password: ''
                        });
                }} className={`block w-full pl-11 pr-10 py-2.5 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'}`} placeholder="••••••••"/>

                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none">

                            {showPassword ?
                    <EyeOffIcon className="h-4 w-4"/> :
                    <EyeIcon className="h-4 w-4"/>}
                          </button>
                        </div>
                        {errors.password &&
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                            <AlertCircleIcon className="w-3 h-3 mr-1"/>
                            {errors.password}
                          </p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <LockIcon className={`h-5 w-5 ${errors.confirmPassword ? 'text-red-400' : 'text-slate-400'}`}/>

                          </div>
                          <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                        setErrors({
                            ...errors,
                            confirmPassword: ''
                        });
                }} className={`block w-full pl-11 pr-10 py-2.5 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-indigo-500 focus:border-indigo-500'}`} placeholder="••••••••"/>

                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none">

                            {showConfirmPassword ?
                    <EyeOffIcon className="h-4 w-4"/> :
                    <EyeIcon className="h-4 w-4"/>}
                          </button>
                        </div>
                        {errors.confirmPassword &&
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                            <AlertCircleIcon className="w-3 h-3 mr-1"/>
                            {errors.confirmPassword}
                          </p>}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input id="terms" name="terms" type="checkbox" checked={agreeTerms} onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errors.terms)
                        setErrors({
                            ...errors,
                            terms: ''
                        });
                }} className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded cursor-pointer ${errors.terms ? 'border-red-300' : 'border-slate-300'}`}/>

                        </div>
                        <div className="ml-2 text-sm">
                          <label htmlFor="terms" className={`cursor-pointer ${errors.terms ? 'text-red-500' : 'text-slate-600'}`}>

                            I agree to the{' '}
                            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">

                              Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">

                              Privacy Policy
                            </a>
                          </label>
                        </div>
                      </div>
                      {errors.terms &&
                    <p className="mt-1 text-xs text-red-500 flex items-center ml-6">
                          <AlertCircleIcon className="w-3 h-3 mr-1"/>
                          {errors.terms}
                        </p>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-4">

                      {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </form>
                </motion.div>}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>);
}
