"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, FileText, FileVideo, FileAudio, Download, MoreVertical, Search, Plus, Filter, LayoutGrid, List, X, Loader, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { courseService } from '@/src/services/courseService';
import { moduleService } from '@/src/services/moduleService';
import { lessonService } from '@/src/services/lessonService';
import apiClient from '@/src/services/apiClient';

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return 'DOCUMENT';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'IMAGE';
  if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) return 'VIDEO';
  if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return 'AUDIO';
  return 'DOCUMENT';
}

function getFileIcon(type: string) {
  const t = type?.toUpperCase();
  if (t === 'VIDEO') return FileVideo;
  if (t === 'AUDIO') return FileAudio;
  return FileText;
}

function getFileColor(type: string) {
  const t = type?.toUpperCase();
  if (t === 'VIDEO') return 'text-purple-500';
  if (t === 'AUDIO') return 'text-teal-500';
  return 'text-blue-500';
}

export default function Resources() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesPage, setCoursesPage] = useState(1);
  const coursesResultsPerPage = 10;
  const [totalCourses, setTotalCourses] = useState(0);

  // Infinite Scroll Select Course state
  const [selectCourses, setSelectCourses] = useState<any[]>([]);
  const [selectPage, setSelectPage] = useState(1);
  const [loadingSelectCourses, setLoadingSelectCourses] = useState(false);
  const [hasMoreSelectCourses, setHasMoreSelectCourses] = useState(true);
  const [isSelectDropdownOpen, setIsSelectDropdownOpen] = useState(false);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const coursesList = await courseService.findAllCourses({ page: coursesPage, resultsPerPage: coursesResultsPerPage });
      setCourses(coursesList.details || []);
      setTotalCourses(coursesList.totalRecords || 0);

      const allRes: any[] = [];
      for (const c of coursesList.details || []) {
        const modulesList = await moduleService.findModulesByCourse(c.id);
        for (const m of modulesList || []) {
          if (m.lessons) {
            for (const l of m.lessons) {
              if (l.resources) {
                for (const r of l.resources) {
                  allRes.push({
                    ...r,
                    courseTitle: c.title,
                    lessonId: l.id,
                    lessonTitle: l.title,
                  });
                }
              }
            }
          }
        }
      }
      setResources(allRes);
    } catch (err) {
      console.error("Failed to load resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [coursesPage]);

  const fetchSelectCourses = async (pageToFetch: number, isReset = false) => {
    if (loadingSelectCourses) return;
    try {
      setLoadingSelectCourses(true);
      const res = await courseService.findAllCourses({ page: pageToFetch, resultsPerPage: 10 });
      const newCourses = res.details || [];
      
      setSelectCourses(prev => {
        const combined = isReset ? newCourses : [...prev, ...newCourses];
        const unique = combined.filter((val, idx, self) => 
          self.findIndex(c => c.id === val.id) === idx
        );
        return unique;
      });

      setHasMoreSelectCourses(newCourses.length === 10);
      setSelectPage(pageToFetch);
    } catch (err) {
      console.error("Failed to fetch courses for selector:", err);
    } finally {
      setLoadingSelectCourses(false);
    }
  };

  useEffect(() => {
    if (isUploadOpen) {
      fetchSelectCourses(1, true);
    } else {
      setIsSelectDropdownOpen(false);
      setSelectCourses([]);
      setSelectPage(1);
      setHasMoreSelectCourses(true);
    }
  }, [isUploadOpen]);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsSelectDropdownOpen(false);
  };

  const handleSelectScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const threshold = 10;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + threshold;
    if (isAtBottom && hasMoreSelectCourses && !loadingSelectCourses) {
      fetchSelectCourses(selectPage + 1);
    }
  };

  // Fetch lessons when selected course changes in upload form
  useEffect(() => {
    if (!selectedCourseId) {
      setCourseLessons([]);
      return;
    }

    const fetchLessonsForCourse = async () => {
      try {
        setLoadingLessons(true);
        const modulesList = await moduleService.findModulesByCourse(selectedCourseId);
        const lessons: any[] = [];
        for (const m of modulesList || []) {
          if (m.lessons) {
            lessons.push(...m.lessons);
          }
        }
        setCourseLessons(lessons);
        if (lessons.length > 0) {
          setSelectedLessonId(lessons[0].id);
        } else {
          setSelectedLessonId('');
        }
      } catch (err) {
        console.error("Failed to fetch lessons for course:", err);
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchLessonsForCourse();
  }, [selectedCourseId]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !selectedLessonId) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', uploadFile);

      // 1. Upload file
      const res = await apiClient.post('/media/upload', fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (!res || !res.data || !res.data.data || !res.data.data.url) {
        throw new Error("Invalid response from media server");
      }

      // 2. Fetch lesson details
      const lesson = await lessonService.findLessonById(selectedLessonId);
      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // 3. Link resource to lesson
      const validMimeTypes = [
        'text/plain', 'text/html', 'application/json', 'application/xml',
        'application/pdf', 'application/msword', 'application/vnd.ms-excel',
        'application/vnd.ms-powerpoint', 'image/jpeg', 'image/png', 'image/gif',
        'audio/mpeg', 'audio/wav', 'video/mp4', 'video/mpeg'
      ];
      const mimeType = validMimeTypes.includes(uploadFile.type) ? uploadFile.type : 'application/pdf';

      const newResource = {
        filename: uploadFile.name,
        type: getFileType(uploadFile.name),
        url: res.data.data.url,
        mimeType: mimeType,
        readonly: false
      };

      // Backend POST /lesson updates the lesson if id is provided
      const updatedLesson = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || 'Lesson description',
        duration: lesson.duration || 30,
        videoUrl: lesson.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        notes: lesson.notes || '',
        moduleId: lesson.moduleId,
        order: lesson.order,
        resources: [...(lesson.resources || []), newResource]
      };

      await lessonService.createLesson(updatedLesson);

      setIsUploadOpen(false);
      setUploadFile(null);
      fetchResources();
    } catch (err) {
      console.error("Failed to link resource:", err);
      alert("Failed to upload and link resource. Make sure file size is valid.");
    } finally {
      setUploading(false);
    }
  };

  const filteredResources = resources.filter(res => {
    const name = (res.filename || '').toLowerCase();
    const course = (res.courseTitle || '').toLowerCase();
    const lesson = (res.lessonTitle || '').toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || course.includes(q) || lesson.includes(q);
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="h1 text-primary">Resource Library</h1>
           <p className="body-md text-on-surface-variant font-medium mt-1">Manage course assets, media, and supporting documentation.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              if (courses.length > 0) {
                setSelectedCourseId(courses[0].id);
                setIsUploadOpen(true);
              } else {
                alert("Please create a course first.");
              }
            }}
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-md cursor-pointer label-md font-black hover:opacity-90 transition-all shadow-lg shadow-black/20 active:scale-95 animate-pulse-subtle"
          >
            <Plus size={18} /> Upload Resource
          </button>
        </div>
      </div>

      <div className="bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group ">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search resources by name, course or lesson..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low rounded-xl body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
          />
        </div>
        <div className="flex rounded-xl overflow-hidden shadow-sm">
           <button 
            onClick={() => setViewMode('grid')}
            className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-white text-black hover:bg-surface-container-high'}`}
           >
             <LayoutGrid size={20} />
           </button>
           <button 
            onClick={() => setViewMode('list')}
            className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-black hover:bg-surface-container-high'}`}
           >
             <List size={20} />
           </button>
        </div>
        <button className="px-6 py-3 shadow-md  cursor-pointer rounded-xl body-md font-bold text-on-surface-variant flex items-center gap-2 hover:bg-surface-container-high transition-all">
          <Filter size={18} /> Filter
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center items-center text-primary font-bold">
          Loading resource library...
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest border border-outline-variant rounded-2xl">
          No resources found. Click "Upload Data" to attach course materials.
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
          {filteredResources.map((res, i) => {
            const Icon = getFileIcon(res.type);
            const colorClass = getFileColor(res.type);
            const downloadUrl = res.url.startsWith('http') ? res.url : `/api-backend/${res.url.replace(/^\//, '')}`;

            return (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-2xl transition-all group hover:border-secondary/40 hover:shadow-md ${
                  viewMode === 'grid' ? 'p-6 flex flex-col items-center text-center' : 'p-4 flex items-center gap-4'
                }`}
              >
                <div className={`p-4 rounded-2xl bg-surface-container-low mb-4 transition-transform group-hover:scale-110 shrink-0 ${viewMode === 'list' ? 'mb-0' : ''}`}>
                  <Icon className={colorClass} size={viewMode === 'grid' ? 32 : 24} />
                </div>

                <div className={`min-w-0 ${viewMode === 'grid' ? 'flex flex-col items-center w-full' : 'flex-1'}`}>
                  <p className="body-md font-bold text-[#34405E] truncate max-w-full" title={res.filename}>{res.filename}</p>
                  <p className="body-sm text-on-surface-variant mt-1 font-medium truncate max-w-full">
                    {res.courseTitle} • {res.lessonTitle}
                  </p>
                </div>

                <div className={`flex gap-2 shrink-0 ${viewMode === 'grid' ? 'mt-6 w-full' : 'ml-auto'}`}>
                  <a 
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 hover:bg-black hover:text-white rounded-xl text-on-surface-variant transition-colors ${viewMode === 'grid' ? 'flex-1 border border-outline-variant flex justify-center items-center' : ''}`}
                    title="Download Resource"
                  >
                    <Download size={18} />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalCourses > coursesResultsPerPage && (
        <div className="px-6 py-4 bg-white flex justify-between items-center rounded-2xl shadow-sm border border-outline-variant/30 mt-6">
          <p className="body-sm text-on-surface-variant font-medium">
            Showing { (coursesPage - 1) * coursesResultsPerPage + 1 } to { Math.min(coursesPage * coursesResultsPerPage, totalCourses) } of { totalCourses } courses
          </p>
          <div className="flex gap-2">
            <button
              className={`p-1.5 border border-zinc-200 rounded-lg transition-colors hover:bg-zinc-50 ${coursesPage === 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => setCoursesPage(prev => Math.max(prev - 1, 1))}
              disabled={coursesPage === 1}
              type="button"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1.5 label-md bg-black text-white rounded-lg font-bold">{coursesPage}</span>
            <button
              className={`p-1.5 border border-zinc-200 rounded-lg transition-colors hover:bg-zinc-50 ${coursesPage >= Math.ceil(totalCourses / coursesResultsPerPage) ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => setCoursesPage(prev => Math.min(prev + 1, Math.ceil(totalCourses / coursesResultsPerPage)))}
              disabled={coursesPage >= Math.ceil(totalCourses / coursesResultsPerPage)}
              type="button"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-outline-variant rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 flex justify-between items-center bg-white">
                <h3 className="h3 text-primary">Upload Course Resource</h3>
                <button onClick={() => setIsUploadOpen(false)} className="p-2 hover:bg-surface-container-high rounded-lg transition-all" disabled={uploading}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                <div className="space-y-2 relative">
                  <label className="body-sm font-bold text-primary block">Select Course</label>
                  <button
                    type="button"
                    onClick={() => setIsSelectDropdownOpen(!isSelectDropdownOpen)}
                    disabled={uploading}
                    className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-3 body-md text-left flex justify-between items-center focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                  >
                    <span className="truncate">
                      {selectCourses.find(c => c.id === selectedCourseId)?.title || 
                       courses.find(c => c.id === selectedCourseId)?.title || 
                       "Choose a Course"}
                    </span>
                    <ChevronDown size={18} className={`text-zinc-500 transition-transform ${isSelectDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSelectDropdownOpen && (
                    <div 
                      onScroll={handleSelectScroll}
                      className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-zinc-200 rounded-lg shadow-lg z-50 divide-y divide-zinc-100"
                    >
                      {selectCourses.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCourse(c.id)}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-50 transition-colors flex flex-col ${selectedCourseId === c.id ? 'bg-[#FAFBFD] font-semibold text-secondary' : 'text-zinc-700'}`}
                        >
                          <span className="truncate">{c.title}</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">{c.provider || 'SPK'} • {c.difficulty || 'Beginner'}</span>
                        </button>
                      ))}

                      {loadingSelectCourses && (
                        <div className="p-3 text-center text-xs text-zinc-400 flex items-center justify-center gap-1.5">
                          <Loader className="animate-spin text-zinc-400" size={14} /> Loading more courses...
                        </div>
                      )}

                      {!loadingSelectCourses && selectCourses.length === 0 && (
                        <div className="p-4 text-center text-xs text-zinc-400">
                          No courses available.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="body-sm font-bold text-primary">Select Lesson</label>
                  {loadingLessons ? (
                    <div className="text-on-surface-variant label-md flex items-center gap-2 px-2 py-3">
                      <Loader className="animate-spin text-secondary" size={16} /> Loading lessons...
                    </div>
                  ) : courseLessons.length === 0 ? (
                    <div className="text-error label-md font-bold px-2 py-3 bg-error-container/20 rounded-xl">
                      No lessons found for this course. Please build curriculum first.
                    </div>
                  ) : (
                    <select 
                      value={selectedLessonId}
                      onChange={e => setSelectedLessonId(e.target.value)}
                      className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-3 body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                      required
                      disabled={uploading}
                    >
                      {courseLessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="body-sm font-bold text-primary">Choose File</label>
                  <input 
                    type="file"
                    onChange={e => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full bg-white border border-gray-400/40 rounded-lg px-4 py-3 body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
                    required
                    disabled={uploading}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsUploadOpen(false)}
                    className="px-6 py-2.5 bg-white border border-gray-400/40 rounded-lg body-md font-bold text-on-surface-variant hover:bg-surface-container-high transition-all"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-8 py-2.5 bg-black text-on-secondary rounded-lg body-md font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-secondary/20 disabled:opacity-50"
                    disabled={uploading || !uploadFile || !selectedLessonId}
                  >
                    {uploading ? (
                      <>
                        <Loader className="animate-spin" size={16} /> Uploading...
                      </>
                    ) : (
                      'Upload & Link'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
