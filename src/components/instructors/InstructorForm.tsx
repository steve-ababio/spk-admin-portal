"use client";

import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, User, Camera, Loader } from 'lucide-react';
import apiClient from '@/src/services/apiClient';
import { mediaService } from '@/src/services/mediaService';

interface InstructorFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function InstructorForm({ onCancel, onSave, initialData }: InstructorFormProps) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    role: '',
    specialty: '',
    email: '',
    phone: '',
    bio: '',
    avatar: ''
  });

  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await mediaService.uploadMedia(file, 'instructor-avatars');
      if (res && res.data && res.data.data && res.data.data.url) {
        setFormData({ ...formData, avatar: res.data.data.url });
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 px-4">
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onCancel}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-950 transition-colors text-[13px] font-medium"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
          {initialData ? 'Edit Faculty Profile' : 'Register Instructor'}
        </h1>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Main Card Container */}
        <div className="bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)]  rounded-xl p-6  space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-2">
            <div className="relative group shrink-0">
              <input 
                type="file"
                id="avatar-upload-input"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
              <div className="w-24 h-24 rounded-2xl bg-zinc-50 border border-zinc-200 overflow-hidden relative flex items-center justify-center shadow-inner group-hover:border-zinc-300 transition-colors">
                {uploading ? (
                  <Loader className="animate-spin text-zinc-400" size={24} />
                ) : formData.avatar ? (
                  <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <User size={36} strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <label 
                htmlFor="avatar-upload-input"
                className="absolute -bottom-1.5 -right-1.5 bg-zinc-900 text-white p-1.5 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer border border-zinc-800"
              >
                <Camera size={14} />
              </label>
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  placeholder="e.g. Dr. Jane Smith"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Current Role</label>
                <input 
                  type="text" 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
                  placeholder="e.g. Senior Researcher"
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Academic Focus */}
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
              Academic Focus
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Specialization</label>
                <input 
                  type="text" 
                  value={formData.specialty}
                  onChange={e => setFormData({...formData, specialty: e.target.value})}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  placeholder="e.g. Distributed Systems & Rust"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Biography</label>
                <textarea 
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  rows={4}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all resize-none"
                  placeholder="Describe your professional and academic background..."
                />
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
              Contact Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Work Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  placeholder="jane.smith@enterprise.lms"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button"
            onClick={onCancel}
            className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="bg-zinc-950 hover:bg-zinc-900 text-zinc-50 rounded-lg px-4 py-2 text-[13px] font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Save size={16} />
            {initialData ? 'Update Profile' : 'Register Instructor'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
