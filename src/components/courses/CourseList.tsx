"use client";

import { useRouter } from 'next/navigation';
import { Filter, Download, Star, Edit, Trash2, ChevronLeft, ChevronRight, TrendingUp, ArrowUp, MoreVertical, UsersRound } from 'lucide-react';
import { motion } from 'motion/react';

const courses = [
  {
    id: 'ML-204',
    title: 'Advanced Machine Learning',
    provider: 'TensorFlow Institute',
    price: '$199.00',
    difficulty: 'Advanced',
    enrolled: '1,248',
    status: 'Popular',
    updated: '2 days ago',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV8xReQkX3qL9qsYVEoSDsSB4G95Vwyr472ZqUO-1uBIbW0AxkCP6eIsxKPoUH0capZjM5Gp6lUUl1MqWdSrtMcJV0mUwfgi-Pk4qyAIvPyERSWBoVK5iqaX45-_gHcfrs9xK8MHVwldGiIZbx1ZC7f20MM7VrIkKJAwT851iBhV6SAFB4jbK0tgYdIGECbdrJQ5Ltgf-nob5zJeqc-t71A6Q9YhDkGeDuC8krSk8wpzY6_ufFXdyff9HgXXx3ENef1eW_cO6OyJ8a'
  },
  {
    id: 'DS-101',
    title: 'UI/UX Strategy Foundations',
    provider: 'Design Masters Academy',
    price: '$89.00',
    difficulty: 'Beginner',
    enrolled: '3,890',
    status: 'Active',
    updated: '1 week ago',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAX7DZvy47Uez2f-9NXD5nOOAFvaix1B3TG_7Rz7jgB0WCWZIAAyxtP7-CqFMYb3Wbar42dlj6WOWVEAlKD21_FOly9m4tAHQHUmj0IV041c9SKAVUCBJ707MyzbtYX1OOvvmWdsmF3w_aYMnR0IRVF6d6nfvwaqCsBXv9UXIyUTcQowBkE95Q2yOoMmhCpIQQPoPBA95bghIgOJO55oDAlEgHtSRKLUpzwdxYmmZEOetJLPMuvsdkLrn3odUdtefRKjZ6jbAN5PkZp'
  },
  {
    id: 'FIN-01',
    title: 'Corporate Finance 101',
    provider: 'Global Biz School',
    price: '$145.00',
    difficulty: 'Intermediate',
    enrolled: '842',
    status: 'Active',
    updated: '3 days ago',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXpRG0MmQ7bHvEGh_0VowIs4g6wlCmTaM00iBE-Df0YK48xuVojvrmHQaGOm15swcXZhMGVsE5m5F5MzyPzlHWNwPr-W60SQh515C5wQLgOARYXfhHopHueaPe_nVi1U-EBjjAP_qcJ44_wpeNZqUvm8qRdztp1tVSGL5RGGZh97a8nF8HMi0C_T15iSAyL6vFb88O7z7QXtKIyWLU-QAtCzdwx3G5MCtFCtdzzkamWyUDOtbioJH1PKB15441qFn_TL_Lvb3YuDRY'
  },
  {
    id: 'CLOUD-302',
    title: 'Cloud Architecture Patterns',
    provider: 'Azure Learning Path',
    price: '$299.00',
    difficulty: 'Advanced',
    enrolled: '512',
    status: 'Popular',
    updated: '1 month ago',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdiv0mQdr6EuEIUcqsM3Pke3IcgwPnFuiwHop3XvnGgW0MIienof34mWjvN3a3MzOPMV4-zAzF3Cnh6ESAqMvdpbVKMJSYyqUqThzjmGwPoaaSur2VTT1qLzk2YwlvfHEdj5MEsjsox-JCJztO8pII9HM-OEdaRAct3dK6ybwJ3y9JUjJZtVHHEZCoa_fJc9rnUqVdL9gF3QodygVRXv20YIBpACjCrsDsk49KErFHHCH4wzRE-iXEXkhLAGj6E6fiW1-m1VJeOgrO'
  }
];

import { useEffect, useState } from 'react';

import { courseService } from '@/src/services/courseService';
import { reviewService } from '@/src/services/reviewService';

export default function CourseList() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filterPopular, setFilterPopular] = useState<string>('All');
  const [page, setPage] = useState(1);
  const resultsPerPage = 10;

  // Review states
  const [selectedCourseReviews, setSelectedCourseReviews] = useState<any[] | null>(null);
  const [selectedCourseForReviews, setSelectedCourseForReviews] = useState<any | null>(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const handleOpenReviews = async (course: any) => {
    setSelectedCourseForReviews(course);
    setIsReviewsModalOpen(true);
    setLoadingReviews(true);
    try {
      const data = await reviewService.findReviewsByCourse(course.id);
      console.log("data: ",data);
      setSelectedCourseReviews(data);
    } catch (err) {
      console.error("Failed to fetch course reviews:", err);
      setSelectedCourseReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleExportCSV = () => {
    if (courses.length === 0) return;
    const headers = ['Course ID', 'Title', 'Provider', 'Price ($)', 'Difficulty', 'Enrolled Count', 'Popular Status'];
    const rows = courses.map((c: any) => [
      `"${c.id.replace(/"/g, '""')}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${(c.provider || 'SPK').replace(/"/g, '""')}"`,
      c.price,
      c.difficulty || 'Beginner',
      c.enrolledCount || 0,
      c.isPopular ? 'Popular' : 'Active'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "course_catalog.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const filteredCourses = courses.filter(c => {
    if (filterPopular === 'Popular') return c.isPopular;
    if (filterPopular === 'Standard') return !c.isPopular;
    return true;
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await courseService.findAllCourses({page,resultsPerPage});
      const courseList = res.details || [];
      const coursesWithStats = await Promise.all(courseList.map(async (course: any) => {
        try {
          const stats = await reviewService.getCourseReviewStats(course.id);
          return {
            ...course,
            averageRating: stats.averageRating || 0,
            totalReviews: stats.totalReviews || 0
          };
        } catch (err) {
          console.error(`Failed to fetch stats for course ${course.id}:`, err);
          return {
            ...course,
            averageRating: 0,
            totalReviews: 0
          };
        }
      }));
      setCourses(coursesWithStats);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await courseService.deleteCourse(id);
        fetchCourses();
      } catch (err) {
        alert("Failed to delete course.");
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
           <nav className="flex items-center gap-2 label-md text-on-surface-variant mb-2">
             <span onClick={() => router.push('/')} className="hover:text-primary cursor-pointer">Dashboard</span>
             <ChevronRight size={14} />
             <span className="text-black font-bold">Courses</span>
           </nav>
           <h1 className="h1 mt-8 text-[#34405E]">Course Management</h1>
        </div>
        <div className="flex gap-3 items-center relative">
          <div className="relative">
            <button 
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 text-[#34405E] rounded-md bg-surface-container-lowest label-md transition-all hover:bg-surface-container shadow-sm cursor-pointer"
            >
              <Filter size={16} /> 
              <span>{filterPopular === 'All' ? 'Filter' : filterPopular}</span>
            </button>
            {filterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-[#34405E] rounded-lg shadow-lg py-1 z-50">
                {['All', 'Popular', 'Standard'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setFilterPopular(opt);
                      setFilterDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    {opt === 'All' ? 'All Courses' : opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleExportCSV}
            disabled={courses.length === 0}
            className="flex items-center gap-2 px-4 py-2  rounded-md bg-surface-container-lowest label-md transition-all hover:bg-surface-container shadow-sm cursor-pointer disabled:opacity-45"
          >
            <Download size={16} /> Export CSV
          </button>
          <button 
            onClick={() => router.push('/course-form')}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md label-md transition-all hover:opacity-90 shadow-md shadow-secondary/15 font-bold animate-pulse-subtle cursor-pointer"
          >
            + New Course
          </button>
        </div>
      </div>

      {/* Course Table */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-lowest  rounded-md shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center items-center text-primary font-bold">
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              No courses found. Click "New Course" to create one.
            </div>
          ) : (
            <table className="w-full text-left border-collapse shadow-[0px_4px_20px_rgba(0,0,0,0.1)]">
              <thead>
                <tr className="bg-gray-200/30 border-y border-gray-300/20">
                  <th className="px-6 py-4 label-md text-[#34405E] uppercase tracking-widest font-medium">Course</th>
                  <th className="px-6 py-4 label-md text-[#34405E] uppercase tracking-widest font-medium">Provider</th>
                  <th className="px-6 py-4 label-md text-[#34405E] uppercase tracking-widest font-medium">Price</th>
                  <th className="px-6 py-4 label-md text-[#34405E] uppercase tracking-widest font-medium">Difficulty</th>
                  <th className="px-6 py-4 label-md text-[#34405E] uppercase tracking-widest font-medium">Enrolled</th>
                  <th className="px-6 py-4 label-md text-[#34405E] uppercase tracking-widest font-medium">Rating</th>
                  <th className="px-6 py-4 label-md text-[#34405E] uppercase tracking-widest font-medium">Status</th>
                  <th className="px-6 py-4 label-md text-[#34405E] uppercase tracking-widest font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300/30">
                {filteredCourses.slice((page - 1) * resultsPerPage, page * resultsPerPage).map((course) => ( 
                  <tr 
                    key={course.id} 
                    onClick={() => router.push(`/curriculum?courseId=${course.id}`)}
                    className="hover:bg-gray-200/20 transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant shadow-sm group-hover:scale-105 transition-transform">
                          <img src={course.image || course.thumbnail || '/assets/images/certificate-card.svg'} className="w-full h-full object-cover" alt={course.title} />
                        </div>
                        <div className="min-w-0">
                          <p className="body-md font-medium text-[#34405E] group-hover:text-[#34408E] transition-colors truncate">{course.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 body-md text-[#34405E] font-medium">{course.provider || 'SPK'}</td>
                    <td className="px-6 py-5 body-md font-medium text-[#34405E]">GHS{course.price}</td>
                    <td className="px-6 py-5">
                      <span className="px-2.5 py-1 flex items-center gap-2 rounded-full text-[#34405E] text-[11px] font-medium uppercase tracking-wider">
                        <span className={`h-2.5 w-2.5 block rounded-full ${
                        course.difficulty.toLowerCase() === 'advanced' ? 'bg-red-500' :
                        course.difficulty.toLowerCase() === 'intermediate' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }` }></span>
                      <span>{course.difficulty || 'Beginner'} </span>
                      </span>
                    </td>
                    <td className="px-6 py-5 body-md font-medium">{course.enrolledCount || 0}</td>
                    <td className="px-6 py-5" onClick={(e) => { e.stopPropagation(); handleOpenReviews(course); }}>
                      <div className="flex items-center gap-1.5 hover:text-black underline hover:opacity-70 transition-colors">
                        <Star size={16} className={course.averageRating > 0 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                        <span className="body-md font-semibold text-[#34405E]">
                          {course.averageRating > 0 ? `${course.averageRating.toFixed(1)}` : '0.0'}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({course.totalReviews || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {course.isPopular ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black text-on-secondary-container shadow-sm">
                          <Star size={12} className="fill-on-secondary-container" /> Popular
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-container-high text-on-surface-variant">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => router.push(`/course-form?id=${course.id}`)} className="p-2 hover:bg-surface-container-highest rounded-lg text-black transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(course.id)} className="p-2 hover:bg-error-container/50 rounded-lg text-error transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-white flex justify-between items-center">
          <p className="body-sm text-on-surface-variant">
            Showing { (page - 1) * resultsPerPage + 1 } to { Math.min(page * resultsPerPage, filteredCourses.length) } of { filteredCourses.length } courses
          </p>
          <div className="flex gap-2">
            <button
              className={`p-1.5 border rounded-lg ${page === 1 ? "bg-surface-container-lowest opacity-40 cursor-not-allowed" : "bg-surface-container-lowest"}`}
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1.5 label-md bg-black text-on-secondary rounded-lg">{page}</span>
            <button
              className={`p-1.5 border rounded-lg ${page >= Math.ceil(filteredCourses.length / resultsPerPage) ? "bg-surface-container-lowest opacity-40 cursor-not-allowed" : "bg-surface-container-lowest"}`}
              onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(filteredCourses.length / resultsPerPage)))}
              disabled={page >= Math.ceil(filteredCourses.length / resultsPerPage)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-12 gap-grid-gutter mt-8">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="col-span-12 md:col-span-4 bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between"
        >
          <div>
            <UsersRound className="text-[#34405E] mb-4" size={24}/>
            <p className="label-md text-[#34405E] uppercase font-semibold tracking-widest mb-1">Total Enrollment</p>
            <p className="h1">{courses.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0)}</p>
          </div>
          {/* <p className="body-sm text-secondary font-bold mt-4 flex items-center gap-1 bg-secondary/5 self-start px-2 py-1 rounded">
             <ArrowUp size={14} /> +12.5% this month
          </p> */}
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="col-span-12 md:col-span-4 bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)] flex flex-col justify-between"
        >
          <div>
            <TrendingUp className="text-[#34405E] mb-4" size={24} />
            <p className="label-md text-[#34405E] uppercase font-semibold tracking-widest mb-1">Revenue Q{Math.floor(new Date().getMonth() / 3) + 1}</p>
            <p className="h1 text-[#34405E]">${courses.reduce((acc, curr) => acc + ((curr.enrolledCount || 0) * (curr.price || 0)), 0).toLocaleString()}</p>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full mt-6 shadow-inner overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              className="bg-black h-full rounded-full shadow-lg" 
            />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="col-span-12 md:col-span-4 bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
        >
          <div className="flex items-center justify-between mb-6">
            <p className="label-md text-on-surface-variant uppercase font-bold tracking-widest">Course Status</p>
            <MoreVertical size={18} className="text-on-surface-variant cursor-pointer hover:text-primary transition-colors" />
          </div>
          <div className="space-y-4">
            {[
              { label: 'Published', count: courses.length, color: 'bg-blue-500' },
              { label: 'Draft', count: 0, color: 'bg-on-surface-variant' },
              { label: 'Archived', count: 0, color: 'bg-error' },
            ].map((st) => (
              <div key={st.label} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${st.color} shadow-sm group-hover:scale-125 transition-transform`} />
                  <span className="body-md font-medium text-on-surface">{st.label}</span>
                </div>
                <span className="body-md font-bold text-primary bg-surface-container px-2 py-0.5 rounded transition-all group-hover:bg-primary group-hover:text-on-primary">{st.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {isReviewsModalOpen && selectedCourseForReviews && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-9999 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-[600px] p-6 relative shadow-2xl transition-all duration-300 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-b-gray-300/50 pb-4 mb-4">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Course Feedback</span>
                <h2 className="text-xl font-semibold text-[#34405E] mt-1">{selectedCourseForReviews.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5 ">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={16} 
                        className={s <= Math.round(selectedCourseForReviews.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedCourseForReviews.averageRating.toFixed(1)} / 5.0
                  </span>
                  <span className="text-xs text-gray-400">
                    ({selectedCourseForReviews.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsReviewsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer text-gray-500 hover:text-black"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Content reviews list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {loadingReviews ? (
                <div className="py-12 flex justify-center items-center text-zinc-500 font-medium">
                  Loading review comments...
                </div>
              ) : !selectedCourseReviews || selectedCourseReviews.length === 0 ? (
                <div className="py-12 text-center text-gray-400 italic">
                  No review comments or ratings submitted for this course yet.
                </div>
              ) : (
                selectedCourseReviews.map((rev: any) => (
                  <div key={rev.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center uppercase shrink-0 overflow-hidden">
                          {rev.reviewerAvatar ? (
                            <img src={rev.reviewerAvatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <span>{rev.reviewerName?.[0] || 'S'}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{rev.reviewerName || 'Anonymous Student'}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            size={12} 
                            className={s <= rev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 pl-10 leading-relaxed italic">
                      &ldquo;{rev.comment || 'No comment text provided.'}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-t-gray-300/50 flex justify-end">
              <button 
                onClick={() => setIsReviewsModalOpen(false)}
                className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
