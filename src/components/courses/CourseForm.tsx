"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, X, Image as ImageIcon, Loader } from 'lucide-react';
import apiClient from '@/src/services/apiClient';
import { instructorService } from '@/src/services/instructorService';

interface CourseFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function CourseForm({ onCancel, onSave, initialData }: CourseFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    id: initialData?.id || '',
    provider: initialData?.provider || '',
    price: initialData?.price || 0,
    difficulty: initialData?.difficulty || 'Beginner',
    description: initialData?.description || '',
    thumbnail: initialData?.thumbnail || '',
    isPopular: !!initialData?.isPopular,
    pricingModel: initialData?.pricingModel || 'Fixed',
    specialization: initialData?.specialization || '',
    languages: initialData?.languages || ['English'],
    expectedExperience: initialData?.expectedExperience || [],
    skillsGained: initialData?.skillsGained || [],
    instructorId: initialData?.instructor?.id || ''
  });

  const [langInput, setLangInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [experienceInput, setExperienceInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [instructors, setInstructors] = useState<any[]>([]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const data = await instructorService.listInstructors();
        if (Array.isArray(data)) {
          setInstructors(data);
        } else if (data && Array.isArray(data.details)) {
          setInstructors(data.details);
        } else if (data && Array.isArray(data.instructors)) {
          setInstructors(data.instructors);
        }
      } catch (err) {
        console.error("Failed to load instructors:", err);
      }
    };
    fetchInstructors();
  }, []);

  const addLanguage = () => {
    if (langInput.trim() && !formData.languages.includes(langInput.trim())) {
      setFormData({ ...formData, languages: [...formData.languages, langInput.trim()] });
      setLangInput('');
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData({ ...formData, languages: formData.languages.filter((l: string) => l !== lang) });
  };

  const addSkill = () => {
    if (skillsInput.trim() && !formData.skillsGained.includes(skillsInput.trim())) {
      setFormData({ ...formData, skillsGained: [...formData.skillsGained, skillsInput.trim()] });
      setSkillsInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skillsGained: formData.skillsGained.filter((s: string) => s !== skill) });
  };

  const addExperience = () => {
    if (experienceInput.trim() && !formData.expectedExperience.includes(experienceInput.trim())) {
      setFormData({ ...formData, expectedExperience: [...formData.expectedExperience, experienceInput.trim()] });
      setExperienceInput('');
    }
  };

  const removeExperience = (exp: string) => {
    setFormData({ ...formData, expectedExperience: formData.expectedExperience.filter((e: string) => e !== exp) });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiClient.post('/media/upload', fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res && res.data && res.data.data && res.data.data.url) {
        setFormData({ ...formData, thumbnail: res.data.data.url });
      }
      console.log("course response:",res.data);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 px-6">
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
          {initialData ? 'Edit Course Details' : 'Create New Course'}
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
        <div className="bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-xl p-6 space-y-6">
          {/* Section: Course Information */}
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
              Course Details
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Course Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  placeholder="e.g. Advanced System Architecture"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-zinc-700">Specialization</label>
                  <input 
                    type="text" 
                    value={formData.specialization || ''}
                    onChange={e => setFormData({...formData, specialization: e.target.value})}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                    placeholder="e.g. Software Engineering"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-zinc-700">Course ID</label>
                  <input 
                    type="text" 
                    value={initialData ? formData.id : 'Generated automatically'}
                    disabled
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-400 cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={!!formData.isPopular}
                    onChange={e => setFormData({...formData, isPopular: e.target.checked})}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-secondary focus:ring-secondary"
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-zinc-800">Mark as Popular</p>
                    <p className="text-[12px] text-zinc-500">Feature this course prominently in the catalog</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Section: Pricing & Settings */}
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
              Logistics & Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Provider</label>
                <input 
                  type="text" 
                  value={formData.provider || ''}
                  onChange={e => setFormData({...formData, provider: e.target.value})}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  placeholder="e.g. Google Cloud"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Difficulty Level</label>
                <select 
                  value={formData.difficulty}
                  onChange={e => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Pricing Model</label>
                <select 
                  value={formData.pricingModel}
                  onChange={e => setFormData({...formData, pricingModel: e.target.value})}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                >
                  <option>Fixed</option>
                  <option>Free</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Price (GHS)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  placeholder="199.00"
                  disabled={formData.pricingModel === 'Free'}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-zinc-700">Instructor</label>
                <select 
                  value={formData.instructorId}
                  onChange={e => setFormData({...formData, instructorId: e.target.value})}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                >
                  <option value="">No Instructor Assigned</option>
                  {instructors.map(ins => (
                    <option key={ins.id} value={ins.id}>
                      {ins.firstName} {ins.lastName} ({ins.specialization || ins.role || 'Instructor'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Section: Languages */}
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
              Languages
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={langInput}
                  onChange={e => setLangInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  placeholder="Add language..."
                />
                <button 
                  type="button"
                  onClick={addLanguage}
                  className=" bg-black text-white rounded-md px-4 py-2 text-[13px] font-semibold hover:bg-black/70 cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {formData.languages.map((lang: string) => (
                  <span 
                    key={lang} 
                    className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 text-zinc-700 px-2 py-1 rounded-md text-[12px] font-medium"
                  >
                    {lang}
                    <button 
                      type="button" 
                      onClick={() => removeLanguage(lang)} 
                      className="text-zinc-400 hover:text-red-500 transition-colors ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Section: Skills Gained */}
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
              Skills Gained
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={skillsInput}
                  onChange={e => setSkillsInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  placeholder="Add skill (e.g. Data Analysis, Web Security)..."
                />
                <button 
                  type="button"
                  onClick={addSkill}
                  className="bg-black text-white rounded-md px-4 py-2 text-[13px] cursor-pointer font-semibold hover:bg-black/70 transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {formData.skillsGained.map((skill: string) => (
                  <span 
                    key={skill} 
                    className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 text-zinc-700 px-2 py-1 rounded-md text-[12px] font-medium"
                  >
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => removeSkill(skill)} 
                      className="text-zinc-400 hover:text-red-500 transition-colors ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Section: Expected Experience */}
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold text-zinc-400 uppercase tracking-wider">
              Expected Experience
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={experienceInput}
                  onChange={e => setExperienceInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addExperience())}
                  className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all"
                  placeholder="Add expected experience (e.g. Basic SQL, 2 years dev)..."
                />
                <button 
                  type="button"
                  onClick={addExperience}
                  className="bg-black text-white rounded-md px-4 py-2 text-[13px] cursor-pointer font-semibold hover:bg-black/70 transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {formData.expectedExperience.map((exp: string) => (
                  <span 
                    key={exp} 
                    className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 text-zinc-700 px-2 py-1 rounded-md text-[12px] font-medium"
                  >
                    {exp}
                    <button 
                      type="button" 
                      onClick={() => removeExperience(exp)} 
                      className="text-zinc-400 hover:text-red-500 transition-colors ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Section: Description */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-zinc-700">Course Description</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all resize-none"
              placeholder="Provide a brief overview of the course curriculum and objectives..."
            />
          </div>

          <div className="border-t border-zinc-100" />

          {/* Section: Image Upload */}
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-zinc-700">Course Hero Image</label>
            <input 
              type="file"
              id="hero-image-upload"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />

            {uploading ? (
              <div className="border border-dashed border-zinc-200 rounded-lg p-6 flex flex-col items-center justify-center bg-zinc-50/50">
                <Loader className="animate-spin text-zinc-400 mb-2" size={20} />
                <span className="text-[13px] font-medium text-zinc-600">Uploading...</span>
              </div>
            ) : formData.thumbnail && typeof formData.thumbnail === 'string' ? (
              <div className="relative border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50 group">
                <img 
                  src={formData.thumbnail} 
                  alt="Course Hero" 
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <label 
                    htmlFor="hero-image-upload" 
                    className="px-3 py-1.5 bg-white text-zinc-900 rounded-md text-[12px] font-semibold shadow-sm cursor-pointer hover:bg-zinc-50 transition-all"
                  >
                    Change
                  </label>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, thumbnail: '' })}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md text-[12px] font-semibold shadow-sm hover:bg-red-700 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label 
                htmlFor="hero-image-upload"
                className="border border-dashed border-zinc-200 rounded-lg p-6 flex flex-col items-center justify-center bg-zinc-50/30 hover:bg-zinc-50 hover:border-zinc-300 transition-all cursor-pointer text-center group"
              >
                <ImageIcon size={20} className="text-zinc-400 group-hover:text-zinc-500 mb-2 transition-colors" />
                <span className="text-[13px] font-medium text-zinc-800">Upload course hero image</span>
                <span className="text-[11px] text-zinc-400 mt-0.5">SVG, PNG, JPG (max. 800x400px)</span>
              </label>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button"
            onClick={onCancel}
            className="bg-transparent hover:bg-black hover:text-white cursor-pointer border border-zinc-200 text-zinc-800 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors"
          >
            Discard
          </button>
          <button 
            type="submit"
            className="bg-zinc-950 hover:bg-zinc-900 text-zinc-50 cursor-pointer rounded-lg px-4 py-2 text-[13px] font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Save size={16} />
            {initialData ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
