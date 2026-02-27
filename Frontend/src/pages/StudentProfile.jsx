import React, { useEffect, useState, useRef } from 'react';
import { UploadCloudIcon, XIcon, PlusIcon, CheckCircleIcon, AlertCircleIcon, FileTextIcon } from 'lucide-react';
import { ProfileProgressBar } from '../components/ProfileProgressBar';
// Predefined lists
const PREDEFINED_SKILLS = [
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'SQL',
    'Java',
    'C++',
    'Figma',
    'AWS',
    'Docker'
];
const CAREER_INTERESTS = [
    'Web Development',
    'Data Science',
    'AI/ML',
    'Mobile Dev',
    'Cloud Computing',
    'Cybersecurity',
    'UI/UX Design'
];
export function StudentProfile() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        address: '',
        university: '',
        degree: '',
        yearOfStudy: '',
        gpa: '',
        graduationDate: '',
        skills: [],
        interests: [],
        cv: null
    });
    const [errors, setErrors] = useState({});
    const [progress, setProgress] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [skillInput, setSkillInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [existingCvName, setExistingCvName] = useState('');
    const [apiError, setApiError] = useState('');
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                'Content-Type': 'application/json'
            };
        }
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        };
    };
    // Calculate progress whenever formData changes
    useEffect(() => {
        const fieldsToTrack = [
            'fullName',
            'email',
            'phone',
            'dob',
            'gender',
            'address',
            'university',
            'degree',
            'yearOfStudy',
            'gpa',
            'graduationDate'
        ];
        let filledCount = 0;
        fieldsToTrack.forEach((field) => {
            if (formData[field])
                filledCount++;
        });
        if (formData.skills.length > 0)
            filledCount++;
        if (formData.interests.length > 0)
            filledCount++;
        if (formData.cv || existingCvName)
            filledCount++;
        const totalFields = fieldsToTrack.length + 3; // +3 for skills, interests, cv
        setProgress(filledCount / totalFields * 100);
    }, [formData, existingCvName]);
    useEffect(() => {
        const loadProfile = async () => {
            try {
                if (!localStorage.getItem('token')) {
                    setApiError('Please login again to access profile services.');
                    return;
                }
                const response = await fetch('/api/profile/me', {
                    headers: getAuthHeaders()
                });
                if (response.status === 404) {
                    return;
                }
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to load profile');
                }
                const data = await response.json();
                const profile = data.profile;
                setFormData((prev) => ({
                    ...prev,
                    fullName: profile.fullName || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    dob: profile.dob || '',
                    gender: profile.gender || '',
                    address: profile.address || '',
                    university: profile.university || '',
                    degree: profile.degree || '',
                    yearOfStudy: profile.yearOfStudy || '',
                    gpa: profile.gpa || '',
                    graduationDate: profile.graduationDate || '',
                    skills: profile.skills || [],
                    interests: profile.interests || [],
                    cv: null
                }));
                setExistingCvName(profile.cvName || '');
            }
            catch (error) {
                setApiError(error.message || 'Failed to load profile');
            }
            finally {
                setIsLoadingProfile(false);
            }
        };
        loadProfile();
    }, []);
    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Invalid email format';
                }
                break;
            case 'phone':
                if (value && !/^\+?[\d\s-]{10,15}$/.test(value)) {
                    error = 'Invalid phone format';
                }
                break;
            case 'gpa':
                if (value && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 4.0)) {
                    error = 'GPA must be between 0.0 and 4.0';
                }
                break;
            default:
                break;
        }
        return error;
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        // Clear error when typing, or validate immediately
        const error = validateField(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: error
        }));
    };
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        if (!value && e.target.required) {
            setErrors((prev) => ({
                ...prev,
                [name]: 'This field is required'
            }));
        }
        else if (error) {
            setErrors((prev) => ({
                ...prev,
                [name]: error
            }));
        }
    };
    // Skills handling
    const addSkill = (skill) => {
        if (skill && !PREDEFINED_SKILLS.includes(skill)) {
            setErrors((prev) => ({
                ...prev,
                skills: 'Please select skills from predefined options only.'
            }));
            return;
        }
        if (skill && !formData.skills.includes(skill)) {
            setFormData((prev) => ({
                ...prev,
                skills: [...prev.skills, skill]
            }));
            setErrors((prev) => ({
                ...prev,
                skills: ''
            }));
        }
        setSkillInput('');
    };
    const removeSkill = (skillToRemove) => {
        setFormData((prev) => ({
            ...prev,
            skills: prev.skills.filter((s) => s !== skillToRemove)
        }));
    };
    const handleSkillKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill(skillInput.trim());
        }
    };
    // Interests handling
    const toggleInterest = (interest) => {
        setFormData((prev) => {
            const current = prev.interests;
            if (current.includes(interest)) {
                return {
                    ...prev,
                    interests: current.filter((i) => i !== interest)
                };
            }
            else {
                return {
                    ...prev,
                    interests: [...current, interest]
                };
            }
        });
    };
    // File handling
    const handleFile = (file) => {
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (!validTypes.includes(file.type)) {
            setErrors((prev) => ({
                ...prev,
                cv: 'Invalid file type. Only PDF and DOC(X) allowed.'
            }));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors((prev) => ({
                ...prev,
                cv: 'File size exceeds 5MB limit.'
            }));
            return;
        }
        setErrors((prev) => {
            const newErrors = {
                ...prev
            };
            delete newErrors.cv;
            return newErrors;
        });
        setFormData((prev) => ({
            ...prev,
            cv: file
        }));
        setExistingCvName('');
    };
    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        if (!localStorage.getItem('token')) {
            setApiError('Please login again to save profile.');
            return;
        }
        // Validate all required fields
        const requiredFields = ['fullName', 'email', 'university', 'degree'];
        const newErrors = {};
        let hasErrors = false;
        requiredFields.forEach((field) => {
            if (!formData[field]) {
                newErrors[field] = 'This field is required';
                hasErrors = true;
            }
        });
        // Check existing validation errors
        Object.values(errors).forEach((err) => {
            if (err)
                hasErrors = true;
        });
        if (hasErrors) {
            setErrors((prev) => ({
                ...prev,
                ...newErrors
            }));
            // Scroll to top to show errors
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }
        try {
            setIsSaving(true);
            const payload = {
                ...formData,
                cvName: formData.cv ? formData.cv.name : existingCvName,
                cvSize: formData.cv ? formData.cv.size : 0,
                cvType: formData.cv ? formData.cv.type : ''
            };
            delete payload.cv;
            const response = await fetch('/api/profile/me', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save profile');
            }
            setExistingCvName(data.profile?.cvName || payload.cvName || '');
            setIsSubmitted(true);
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        catch (error) {
            setApiError(error.message || 'Failed to save profile');
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        finally {
            setIsSaving(false);
        }
    };
    if (isLoadingProfile) {
        return (<div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-slate-600">
          Loading profile...
        </div>
      </div>);
    }
    if (isSubmitted) {
        return (<div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600"/>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Profile Submitted!
          </h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Your profile has been successfully created and is now under review
            by the administration team.
          </p>

          <div className="bg-slate-50 rounded-xl p-6 mb-8 max-w-sm mx-auto border border-slate-100">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
              Profile Quality Score
            </h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">

                <path className="text-slate-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>

                <path className="text-blue-600 transition-all duration-1000 ease-out" strokeWidth="3" strokeDasharray={`${progress}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>

              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-slate-600">Basic Info</span>
                <span className="font-medium text-green-600">Complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Academic</span>
                <span className="font-medium text-green-600">Complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">CV Upload</span>
                <span className={`font-medium ${formData.cv || existingCvName ? 'text-green-600' : 'text-amber-500'}`}>

                  {formData.cv || existingCvName ? 'Uploaded' : 'Missing'}
                </span>
              </div>
            </div>
          </div>

          <button onClick={() => setIsSubmitted(false)} className="text-blue-600 hover:text-blue-700 font-medium transition-colors">

            Edit Profile
          </button>
        </div>
      </div>);
    }
    return (<div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-20 z-10">
        <ProfileProgressBar progress={progress}/>
        <p className="text-xs text-slate-500 mt-2">
          Complete your profile to increase your visibility to recruiters.
        </p>
      </div>
      {apiError &&
    <div className="mb-6 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm flex items-center">
          <AlertCircleIcon className="w-4 h-4 mr-2"/>
          {apiError}
        </div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">
              1. Personal Information
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} onBlur={handleBlur} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.fullName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'}`} placeholder="John Doe"/>

              {errors.fullName &&
            <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1"/>
                  {errors.fullName}
                </p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} onBlur={handleBlur} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'}`} placeholder="john.doe@example.com"/>

              {errors.email &&
            <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1"/>
                  {errors.email}
                </p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} onBlur={handleBlur} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'}`} placeholder="+1 (555) 000-0000"/>

              {errors.phone &&
            <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1"/>
                  {errors.phone}
                </p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date of Birth
              </label>
              <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-colors"/>

            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gender
              </label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-colors bg-white">

                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Address
              </label>
              <textarea name="address" rows={2} value={formData.address} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-colors" placeholder="Full residential address"/>

            </div>
          </div>
        </div>

        {/* Section 2: Academic Background */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">
              2. Academic Background
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                University / Institution <span className="text-red-500">*</span>
              </label>
              <input type="text" name="university" required value={formData.university} onChange={handleInputChange} onBlur={handleBlur} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.university ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'}`} placeholder="e.g. Stanford University"/>

              {errors.university &&
            <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1"/>
                  {errors.university}
                </p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Degree Program <span className="text-red-500">*</span>
              </label>
              <input type="text" name="degree" required value={formData.degree} onChange={handleInputChange} onBlur={handleBlur} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.degree ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'}`} placeholder="e.g. B.S. Computer Science"/>

              {errors.degree &&
            <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1"/>
                  {errors.degree}
                </p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Year of Study
              </label>
              <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-colors bg-white">

                <option value="">Select Year</option>
                <option value="1">First Year (Freshman)</option>
                <option value="2">Second Year (Sophomore)</option>
                <option value="3">Third Year (Junior)</option>
                <option value="4">Fourth Year (Senior)</option>
                <option value="5+">Graduate / 5th+ Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                GPA (0.0 - 4.0)
              </label>
              <input type="number" step="0.01" min="0" max="4" name="gpa" value={formData.gpa} onChange={handleInputChange} onBlur={handleBlur} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.gpa ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-200 focus:border-blue-500'}`} placeholder="e.g. 3.8"/>

              {errors.gpa &&
            <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1"/>
                  {errors.gpa}
                </p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expected Graduation
              </label>
              <input type="month" name="graduationDate" value={formData.graduationDate} onChange={handleInputChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-colors"/>

            </div>
          </div>
        </div>

        {/* Section 3: Skills & Expertise */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">
              3. Skills & Expertise
            </h2>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Add Skills
              </label>
              <div className="flex space-x-2">
                <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-colors" placeholder="Type a skill and press Enter"/>

                <button type="button" onClick={() => addSkill(skillInput.trim())} className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors flex items-center">

                  <PlusIcon className="w-4 h-4 mr-1"/> Add
                </button>
              </div>
              {errors.skills &&
            <p className="mt-1 text-sm text-red-500 flex items-center">
                  <AlertCircleIcon className="w-4 h-4 mr-1"/>
                  {errors.skills}
                </p>
              }
            </div>

            {/* Selected Skills Chips */}
            <div className="flex flex-wrap gap-2 mb-6 min-h-[40px] p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50">
              {formData.skills.length === 0 ?
            <span className="text-slate-400 text-sm italic">
                  No skills added yet
                </span> :
            formData.skills.map((skill, index) => <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">

                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="ml-1.5 text-blue-600 hover:text-blue-900 focus:outline-none">

                      <XIcon className="w-3.5 h-3.5"/>
                    </button>
                  </span>)}
            </div>

            {/* Suggested Skills */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Suggested Skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_SKILLS.filter((s) => !formData.skills.includes(s)).map((skill, index) => <button key={index} type="button" onClick={() => addSkill(skill)} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 transition-colors">

                    <PlusIcon className="w-3 h-3 mr-1"/> {skill}
                  </button>)}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Interests */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">
              4. Career Interests
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {CAREER_INTERESTS.map((interest, index) => {
            const isSelected = formData.interests.includes(interest);
            return (<label key={index} className={`relative flex items-center p-4 cursor-pointer rounded-lg border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200 bg-white'}`}>

                    <input type="checkbox" className="sr-only" checked={isSelected} onChange={() => toggleInterest(interest)}/>

                    <div className="flex-1">
                      <span className={`block text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>

                        {interest}
                      </span>
                    </div>
                    {isSelected &&
                    <CheckCircleIcon className="w-5 h-5 text-blue-500"/>}
                  </label>);
        })}
            </div>
          </div>
        </div>

        {/* Section 5: CV Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">
              5. CV / Resume Upload
            </h2>
          </div>
          <div className="p-6">
            <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'} ${errors.cv ? 'border-red-500 bg-red-50' : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>

              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFile(e.target.files[0])} accept=".pdf,.doc,.docx" className="hidden"/>


              {formData.cv || existingCvName ?
            <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <FileTextIcon className="w-8 h-8"/>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    {formData.cv ? formData.cv.name : existingCvName}
                  </p>
                  {formData.cv &&
                <p className="text-xs text-slate-500 mb-4">
                      {(formData.cv.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                }
                  <button type="button" onClick={() => {
                    setFormData((prev) => ({
                        ...prev,
                        cv: null
                    }));
                    setExistingCvName('');
                }} className="text-sm text-red-600 hover:text-red-700 font-medium">

                    Remove File
                  </button>
                </div> :
            <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white text-slate-400 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200">
                    <UploadCloudIcon className="w-8 h-8"/>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    Drag and drop your CV here, or{' '}
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-blue-600 hover:text-blue-700 focus:outline-none focus:underline">

                      browse
                    </button>
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Supported formats: PDF, DOC, DOCX. Max size: 5MB.
                  </p>
                </div>}
            </div>
            {errors.cv &&
            <p className="mt-2 text-sm text-red-500 flex items-center justify-center">
                <AlertCircleIcon className="w-4 h-4 mr-1"/>
                {errors.cv}
              </p>}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200">
          <button type="button" className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors">

            Save Draft
          </button>
          <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm">

            {isSaving ? 'Saving...' : 'Submit Profile'}
          </button>
        </div>
      </form>
    </div>);
}
