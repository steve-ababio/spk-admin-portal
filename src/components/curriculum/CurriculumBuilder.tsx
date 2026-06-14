"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight, Link as LinkIcon, Plus, PlusCircle, Edit, Trash2, Clock, GripVertical, ListPlus, X, BarChart, Save } from 'lucide-react';
import { motion } from 'motion/react';
import LessonModal from './LessonModal';
import ModuleModal from './ModuleModal';
import TestModal from './TestModal';
import { courseService } from '@/src/services/courseService';
import { moduleService } from '@/src/services/moduleService';
import { lessonService } from '@/src/services/lessonService';

function parseDuration(duration: string | number): number {
  if (typeof duration === 'number') return duration;
  const match = duration.toLowerCase().match(/(?:(\d+)\s*h)?\s*(?:(\d+)\s*m?)?/);
  if (!match) return 30;
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  if (!hours && !minutes) {
    const raw = parseInt(duration);
    return isNaN(raw) ? 30 : raw;
  }
  return (hours * 60) + minutes;
}

function formatDuration(minutes: number): string {
  if (!minutes) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function CurriculumBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [selectedModuleForTest, setSelectedModuleForTest] = useState<any>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const fetchCurriculum = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const courseData = await courseService.findCourseById(courseId);
      setCourse(courseData);

      const modulesData = await moduleService.findModulesByCourse(courseId);
      // Map modules to frontend state structure
      const mappedModules = (modulesData || []).map((m: any) => ({
        id: m.id,
        title: m.title,
        order: m.order,
        estimatedTime: m.estimatedTime || '0h 00m',
        moduleDetails: m.moduleDetails || '',
        test: m.test || null,
        lessons: (m.lessons || []).map((l: any) => ({
          id: l.id,
          title: l.title,
          duration: formatDuration(l.duration),
          type: 'Video', // default label
          description: l.description || '',
          videoUrl: l.videoUrl || '',
          notes: l.notes || '',
          order: l.order,
        })).sort((a: any, b: any) => a.order - b.order)
      })).sort((a: any, b: any) => a.order - b.order);

      setModules(mappedModules);
    } catch (err) {
      console.error("Failed to fetch curriculum data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCurriculum();
    } else {
      router.push('/courses');
    }
  }, [courseId]);

  const handleAddModule = () => {
    setEditingModule(null);
    setIsModuleModalOpen(true);
  };

  const handleEditModule = (mod: any) => {
    setEditingModule(mod);
    setIsModuleModalOpen(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm("Are you sure you want to delete this module and all its lessons?")) {
      try {
        await moduleService.deleteModule(moduleId);
        fetchCurriculum();
      } catch (err) {
        console.error("Failed to delete module:", err);
        alert("Failed to delete module.");
      }
    }
  };

  const handleAddLesson = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const handleEditLesson = (moduleId: string, lesson: any) => {
    setActiveModuleId(moduleId);
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm("Are you sure you want to delete this lesson?")) {
      try {
        await lessonService.deleteLesson(lessonId);
        fetchCurriculum();
      } catch (err) {
        console.error("Failed to delete lesson:", err);
        alert("Failed to delete lesson.");
      }
    }
  };

  const handleSaveModule = async (data: any) => {
    try {
      const moduleData: any = {
        title: data.title,
        order: Number(data.order) || modules.length + 1,
        estimatedTime: data.estimatedTime || '1h 00m',
        moduleDetails: data.moduleDetails || '',
        courseId: courseId
      };

      if (editingModule) {
        moduleData.id = editingModule.id;
      }

      await moduleService.saveModule(moduleData);
      setIsModuleModalOpen(false);
      setEditingModule(null);
      fetchCurriculum();
    } catch (err) {
      console.error("Failed to save module:", err);
      alert("Failed to save module.");
    }
  };

  const handleSaveLesson = async (data: any) => {
    try {
      const activeMod = modules.find(m => m.id === activeModuleId);
      const lessonCount = activeMod?.lessons?.length || 0;

      const lessonData: any = {
        title: data.title,
        description: data.description || 'Lesson description',
        duration: parseDuration(data.duration),
        videoUrl: data.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        notes: data.notes || '',
        moduleId: activeModuleId,
        order: editingLesson ? editingLesson.order : lessonCount + 1
      };

      if (editingLesson) {
        lessonData.id = editingLesson.id;
      }

      await lessonService.createLesson(lessonData);
      setIsLessonModalOpen(false);
      setEditingLesson(null);
      setActiveModuleId(null);
      fetchCurriculum();
    } catch (err) {
      console.error("Failed to save lesson:", err);
      alert("Failed to save lesson. Make sure all fields are valid.");
    }
  };

  if (loading && !course) {
    return (
      <div className="p-12 flex justify-center items-center text-primary font-bold">
        Loading curriculum...
      </div>
    );
  }

  // Calculate total course duration dynamically in hours and minutes
  const totalMinutes = modules.reduce((acc, mod) => {
    return acc + mod.lessons.reduce((lAcc: number, les: any) => lAcc + parseDuration(les.duration), 0);
  }, 0);
  const totalDurationStr = formatDuration(totalMinutes);
  const totalLessonsCount = modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

  return (
    <div className="pb-24">
      {/* Modals */}
      <ModuleModal 
        isOpen={isModuleModalOpen} 
        onClose={() => setIsModuleModalOpen(false)} 
        onSave={handleSaveModule}
        initialData={editingModule}
      />
      <LessonModal 
        isOpen={isLessonModalOpen} 
        onClose={() => setIsLessonModalOpen(false)} 
        onSave={handleSaveLesson}
        initialData={editingLesson}
      />
      {selectedModuleForTest && (
        <TestModal 
          isOpen={isTestModalOpen} 
          onClose={() => {
            setIsTestModalOpen(false);
            setSelectedModuleForTest(null);
          }} 
          moduleId={selectedModuleForTest.id}
          moduleTitle={selectedModuleForTest.title}
          onSaveSuccess={fetchCurriculum}
        />
      )}

      {/* Page Header */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <nav className="flex items-center mb-4 gap-2 text-on-surface-variant label-md">
            <span onClick={() => router.push('/courses')} className="hover:text-primary cursor-pointer">Courses</span>
            <ChevronRight size={14} />
            <span className="text-[#34405E] font-bold">Curriculum Builder</span>
          </nav>
          <h1 className="h1 text-primary mb-1">{course?.title}</h1>
          <p className="body-md text-on-surface-variant flex items-center gap-2">
            <span className="font-bold text-primary">Course ID:</span> {course?.id} 
            <span className="w-1 h-3 bg-outline-variant mx-1" />
            <span className="font-bold text-primary">Total Duration:</span> {totalDurationStr}
            <span className="w-1 h-3 bg-outline-variant mx-1" />
            <span className="font-bold text-primary">Lessons:</span> {totalLessonsCount}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => router.push('/resources')}
            className="px-5 py-2.5 border-2 border-gray-500 text-black label-md rounded-md flex items-center gap-2 hover:bg-secondary/5 transition-all font-bold"
          >
            <LinkIcon size={18} color='black' /> Resource Library
          </button>
          <button 
            onClick={handleAddModule}
            className="px-5 py-2.5 bg-primary text-white label-md rounded-md flex items-center gap-2 hover:opacity-90 transition-all font-bold shadow-lg shadow-primary/10 active:scale-95"
          >
            <Plus size={18} /> Add Module
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {modules.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-2xl">
            No modules created yet. Click "Add Module" to start building your curriculum.
          </div>
        ) : (
          modules.map((mod, idx) => (
            <motion.div 
              key={mod.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl overflow-hidden shadow-soft-md hover:border-secondary/40 transition-colors"
            >
              <div className="p-5 flex items-center justify-between border-b border-[#e2e8f0a8] bg-white">
                <div className="flex items-center gap-5">
                  <div className="bg-primary-container text-[white] px-3 py-1.5 rounded-lg text-[13px] font-black shadow-inner">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="h3 text-primary leading-tight">{mod.title}</h3>
                      {mod.test && (
                        <span className="px-3 py-0.5 rounded-full text-[10px] uppercase font-black bg-[#E0F2FE] text-[#0369A1] shadow-sm">
                          Quiz
                        </span>
                      )}
                    </div>
                    <p className="body-sm text-on-surface-variant font-medium mt-0.5">{mod.lessons.length} Lessons • {mod.estimatedTime} total</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setSelectedModuleForTest(mod);
                      setIsTestModalOpen(true);
                    }}
                    className="body-sm font-bold text-[#0369A1] hover:bg-sky-50 px-4 py-1.5 rounded-xl bg-white transition-all shadow-sm border border-sky-100 mr-2"
                  >
                    {mod.test ? "Manage Quiz" : "Add Quiz"}
                  </button>
                  <button 
                    onClick={() => handleEditModule(mod)}
                    className="p-2 text-on-surface-variant hover:text-secondary hover:bg-white rounded-lg transition-all"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteModule(mod.id)}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-white rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="w-px h-6 bg-outline-variant mx-1" />
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-all"><ChevronDown size={20} /></button>
                </div>
              </div>

              <div className="divide-y divide-[#e2e8f0]">
                {mod.lessons.map((lesson, lIdx) => (
                  <div key={lesson.id} className="p-5 flex items-center bg-white justify-between  transition-all group cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="text-outline-variant opacity-30 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={20} />
                      </div>
                      <div className="w-10 text-center text-[#34405E] font-mono body-sm font-black italic">{idx + 1}.{lIdx + 1}</div>
                      <div>
                        <h4 className="body-md font-bold text-[#34405E]">{lesson.title}</h4>
                        <div className="flex items-center gap-4 mt-1.5">
                          <span className="flex items-center gap-1.5 text-on-surface-variant label-md">
                            <Clock size={14} /> {lesson.duration}
                          </span>
                          <span className="px-3 py-0.5 rounded-full label-md text-[10px] uppercase font-black bg-gray-200 text-[#34405E]">
                            Video
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-3 translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleEditLesson(mod.id, lesson)}
                        className="body-sm font-bold text-on-surface-variant hover:text-secondary px-4 py-1.5 rounded-xl bg-white transition-all shadow-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="body-sm font-bold text-error hover:bg-error-container/20 px-4 py-1.5 rounded-xl bg-white transition-all shadow-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-surface-container-lowest">
                <button 
                  onClick={() => handleAddLesson(mod.id)}
                  className="w-full py-4 border-2 border-dashed border-[#e2e8f0] rounded-2xl text-[#62748e] text-sm label-md flex items-center justify-center gap-3 hover:border-secondary hover:text-secondary hover:bg-secondary/5 transition-all font-bold"
                >
                  <PlusCircle size={20} /> Add Lesson to Module
                </button>
              </div>
            </motion.div>
          ))
        )}

        {/* Append Module Button */}
        <button 
          onClick={handleAddModule}
          className="w-full py-12 bg-transparent border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-4 text-on-surface-variant hover:bg-white hover:text-primary hover:border-primary transition-all group"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <ListPlus size={32} className="text-secondary" />
          </div>
          <div className="text-center">
            <p className="h3 font-black text-primary mb-1">Append New Module</p>
            <p className="body-sm font-medium opacity-70">Start a new chapter in the curriculum hierarchy</p>
          </div>
        </button>
      </div>

      {/* Footer Section */}
      <div className="grid grid-cols-12 gap-grid-gutter mt-12">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft-md">
            <h3 className="h3 text-primary mb-6">Course Prerequisites</h3>
            <div className="flex flex-wrap gap-3">
              {[
                'Cloud Computing Basics',
                'Docker Fundamentals'
              ].map(tag => (
                <span key={tag} className="px-4 py-2 bg-gray-200/50 rounded-xl body-md font-bold text-primary flex items-center gap-3 group">
                  {tag}
                  <X size={14} className="text-on-surface-variant cursor-pointer hover:text-error transition-colors" />
                </span>
              ))}
              <button className="px-4 py-2 border-2 border-dashed border-secondary/40 rounded-xl text-secondary body-md font-black hover:bg-secondary/5 transition-all">
                + Add Prerequisite
              </button>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-black/90 rounded-2xl p-6 relative overflow-hidden h-full shadow-lg">
            <div className="relative z-10">
              <h3 className="h3 text-on-secondary-container mb-2 font-black">Curriculum Health</h3>
              <p className="text-on-secondary-container/70 body-sm mb-6 leading-tight">Assessment completion coverage is performing better than average.</p>
              <div className="w-full bg-on-secondary-container/20 h-2.5 rounded-full mb-8 shadow-inner overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="bg-white h-full rounded-full shadow-lg" 
                />
              </div>
              <button className="text-on-secondary-container label-md font-black underline underline-offset-4 hover:text-white transition-colors">View recommendations</button>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10 transform rotate-12 scale-150">
              <BarChart size={200} strokeWidth={1} />
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <motion.button 
        onClick={() => router.push('/courses')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-10 right-10 w-16 h-16 bg-secondary text-on-secondary rounded-full shadow-2xl flex items-center justify-center hover:bg-on-secondary-fixed-variant transition-all z-50 group"
      >
        <Save size={24} className="group-hover:rotate-12 transition-transform" />
      </motion.button>
    </div>
  );
}
