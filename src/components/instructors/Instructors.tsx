"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Search, Plus, Filter, Book, Users, Star, Edit, Trash2 } from 'lucide-react';
import InstructorForm from './InstructorForm';
import { instructorService } from '@/src/services/instructorService';

const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi6xqaRz4_cjUuhoTMCMwV9zVXDEXS6KlHCTKC7KyNOpdpFjOpJUu6_cWPQKLWngnINrnNJcKjoLXMuJYeLH4T41qEUIB9gYkPXS5cr6LpM-2Ny1nkqHk2h0DnNX4qVvZYuxdIVTxsqhkKjGvRgPAM4YSbrfXwPHJRK0pqETk5gWKbK9ngxlF6ywECZj2Dxtd0NH4PnygToITMOQdvAftAwLKsEKHDi-N7e1Ndmj4mfQ6D2SO-DTJ2-hS4AsrTZjxD39l1adp9NUYw';

export default function Instructors() {
  const searchParams = useSearchParams();
  const [isAdding, setIsAdding] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams && searchParams.get('add') === 'true') {
      setIsAdding(true);
    }
  }, [searchParams]);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const data = await instructorService.listInstructors();
      setInstructors(data || []);
    } catch (err) {
      console.error("Failed to load instructors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this instructor?")) {
      try {
        await instructorService.deleteInstructor(id);
        fetchInstructors();
      } catch (err) {
        console.error("Failed to delete instructor:", err);
        alert("Failed to delete instructor.");
      }
    }
  };

  const handleSave = async (data: any) => {
    try {
      // Split full name into firstName and lastName
      const nameParts = (data.name || '').trim().split(/\s+/);
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Instructor';

      const payload = {
        email: data.email,
        firstName,
        lastName,
        profilePicture: data.avatar || defaultAvatar,
        role: data.role,
        specialization: data.specialty,
        phoneNumber: data.phone,
        bio: data.bio
      };

      if (data.id) {
        await instructorService.updateInstructor(data.id, payload);
      } else {
        await instructorService.createInstructor(payload);
      }

      setIsAdding(false);
      setEditingInstructor(null);
      fetchInstructors();
    } catch (err) {
      console.error("Failed to save instructor:", err);
      alert("Failed to save instructor. Make sure email is unique and valid.");
    }
  };

  if (isAdding || editingInstructor) {
    // Map backend details back to frontend form format
    const initialData = editingInstructor ? {
      id: editingInstructor.id,
      name: `${editingInstructor.firstName} ${editingInstructor.lastName}`.trim(),
      role: editingInstructor.role || '',
      specialty: editingInstructor.specialization || '',
      email: editingInstructor.email || '',
      phone: editingInstructor.phoneNumber || '',
      bio: editingInstructor.bio || '',
      avatar: editingInstructor.profilePicture || ''
    } : null;

    return (
      <InstructorForm 
        onCancel={() => { setIsAdding(false); setEditingInstructor(null); }}
        onSave={handleSave}
        initialData={initialData}
      />
    );
  }

  const filteredInstructors = instructors.filter(ins => {
    const fullName = `${ins.firstName} ${ins.lastName}`.toLowerCase();
    const role = (ins.role || '').toLowerCase();
    const specialty = (ins.specialization || '').toLowerCase();
    const q = search.toLowerCase();
    return fullName.includes(q) || role.includes(q) || specialty.includes(q);
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="h1 text-primary">Faculty Registry</h1>
           <p className="body-md text-on-surface-variant font-medium mt-1">Manage and monitor academic staff performance.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl label-md font-black hover:opacity-90 transition-all shadow-lg active:scale-95"
        >
          <Plus size={18} /> Add Instructor
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, role or specialty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low rounded-xl body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
          />
        </div>
        <button className="px-6 py-3 shadow-md cursor-pointer rounded-xl body-md font-bold text-on-surface-variant flex items-center gap-2 hover:bg-surface-container-high transition-all">
          <Filter size={18} /> Refine List
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center text-primary font-bold">
          Loading instructors...
        </div>
      ) : filteredInstructors.length === 0 ? (
        <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-2xl">
          No instructors found. Click "Add Instructor" to register one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((ins, i) => (
            <motion.div
              key={ins.id || ins.email}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-2xl p-6 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden transition-transform shrink-0">
                    <img src={ins.profilePicture || defaultAvatar} alt={`${ins.firstName} ${ins.lastName}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="body-md font-black text-primary leading-tight truncate">{ins.firstName} {ins.lastName}</h3>
                    <p className="body-sm text-on-surface-variant font-medium truncate">{ins.role || 'Instructor'}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button 
                    onClick={() => setEditingInstructor(ins)}
                    className="p-1.5 hover:bg-surface-container rounded-lg text-[#34405E] transition-colors"
                    title="Edit Profile"
                  >
                    <Edit size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(ins.id)}
                    className="p-1.5 hover:bg-error-container/60 rounded-lg text-[#34405E] transition-colors"
                    title="Delete Instructor"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                 <div className="flex items-center gap-1.5 text-on-surface-variant body-sm">
                   {/* <Award size={16} className="text-secondary" /> */}
                   <span className="font-bold shrink-0 text-[#34405E]">Specialty:</span>
                   <span className="truncate">{ins.specialization || 'General Focus'}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                   <div className="bg-gray-200/30 p-3 rounded-lg flex flex-col items-center">
                     <Book size={18} className="text-on-surface-variant mb-1" />
                     <span className="label-md text-sm font-medium text-[#34405E]">{ins.coursesCount || 0}</span>
                     <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">Courses</span>
                   </div>
                   <div className="bg-gray-200/30 p-3 rounded-lg flex flex-col items-center">
                     <Users size={18} className="text-on-surface-variant mb-1" />
                     <span className="label-md text-sm font-medium text-[#34405E]">{ins.reviewCount || 0}</span>
                     <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">Reviews</span>
                   </div>
                   <div className="bg-gray-200/30 p-3 rounded-lg flex flex-col items-center">
                     <Star size={18} className="text-[#34405E] fill-[#34405E] mb-1" />
                     <span className="label-md text-sm font-medium text-[#34405E]">{ins.averageRating || 0.0}</span>
                     <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">Rating</span>
                   </div>
                 </div>
              </div>

              <div className="flex gap-2">
                 <a href={`mailto:${ins.email}`} className="flex-1 py-3 bg-black rounded-md body-sm font-bold text-white transition-all text-center">Email</a>
                 <a href={`tel:${ins.phoneNumber || ''}`} className="px-4 py-2.5 bg-gray-300/30 text-[#34405E] rounded-md body-sm font-bold hover:bg-gray-400 hover:text-on-secondary transition-all text-center">Call</a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
