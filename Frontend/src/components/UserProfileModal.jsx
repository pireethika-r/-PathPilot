import React, { useEffect, useState } from 'react';
import { CameraIcon, AlertCircleIcon } from 'lucide-react';
import { Modal } from './Modal';

export function UserProfileModal({ isOpen, onClose, user, onSaved }) {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        title: '',
        bio: '',
        avatarUrl: ''
    });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const displayName = form.fullName || user?.fullName || 'User';
    const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

    useEffect(() => {
        if (!isOpen)
            return;
        setForm({
            fullName: user?.fullName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            title: user?.title || '',
            bio: user?.bio || '',
            avatarUrl: user?.avatarUrl || ''
        });
        setError('');
    }, [isOpen, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('Image size must be less than 2MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setForm((prev) => ({ ...prev, avatarUrl: String(reader.result || '') }));
            setError('');
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.fullName.trim()) {
            setError('Full name is required.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError('Please enter a valid email.');
            return;
        }

        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }
            onSaved(data.user);
            onClose();
        }
        catch (err) {
            setError(err.message || 'Failed to update profile');
        }
        finally {
            setIsSaving(false);
        }
    };

    return (<Modal isOpen={isOpen} onClose={onClose} title="Profile Management">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {form.avatarUrl ?
            <img className="w-16 h-16 rounded-full object-cover border border-slate-200" src={form.avatarUrl} alt="Profile avatar"/> :
            <div className="w-16 h-16 rounded-full bg-blue-500 text-white text-lg font-bold flex items-center justify-center border border-slate-200">
                {initials}
              </div>
            }
            <label className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700">
              <CameraIcon className="w-3.5 h-3.5"/>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
            </label>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Profile Photo</p>
            <p className="text-xs text-slate-500">Upload JPG/PNG up to 2MB</p>
          </div>
        </div>

        {error &&
      <p className="text-sm text-red-500 flex items-center">
            <AlertCircleIcon className="w-4 h-4 mr-1"/>
            {error}
          </p>
        }

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input name="title" value={form.title} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="e.g. Student, Admin, Hiring Manager"/>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} maxLength={500} className="w-full px-3 py-2 border border-slate-300 rounded-lg"/>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>);
}
