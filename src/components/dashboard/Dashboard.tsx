"use client";

import { TrendingUp, TrendingDown, Users, CheckCircle, Monitor, DollarSign, Star, MoreVertical, Filter, Download, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useState, useEffect, useRef } from 'react';
import { courseService } from '@/src/services/courseService';
import { adminService } from '@/src/services/adminService';

function formatRelativeTime(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default function Dashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Date filters
  const [datePreset, setDatePreset] = useState<string>('6months');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const params: any = { preset: datePreset };
        if (datePreset === 'custom') {
          params.startDate = customStartDate;
          params.endDate = customEndDate;
        }
        const [cRes, oRes] = await Promise.all([
          courseService.findAllCourses(),
          adminService.getOverview(params)
        ]);
        setCourses(cRes || []);
        setOverviewData(oRes || null);
      } catch (err) {
        console.error("Failed to load dashboard overview data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [datePreset, customStartDate, customEndDate]);

  // Close filter dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalEnrollments = overviewData?.totalEnrollments ?? courses.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0);
  const enrollmentsChangeRate = overviewData?.enrollmentsChangeRate ?? 0;
  const enrollmentsIsUp = overviewData?.enrollmentsIsUp ?? null;

  const completionRate = overviewData?.completionRate ?? 0;
  const completionChangeRate = overviewData?.completionChangeRate ?? 0;
  const completionIsUp = overviewData?.completionIsUp ?? null;

  const activeCourses = overviewData?.activeCourses ?? courses.length;
  const coursesChangeRate = overviewData?.coursesChangeRate ?? 0;
  const coursesIsUp = overviewData?.coursesIsUp ?? null;

  const totalRevenue = overviewData?.totalRevenue ?? courses.reduce((acc, curr) => acc + ((curr.enrolledCount || 0) * (curr.price || 0)), 0);
  const revenueChangeRate = overviewData?.revenueChangeRate ?? 0;
  const revenueIsUp = overviewData?.revenueIsUp ?? null;

  const revenueStr = totalRevenue >= 1000 
    ? `${Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(totalRevenue/1000)}k`
    : Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(totalRevenue);

  const dynamicCards = [
    { 
      label: 'Total Enrollments', 
      value: loading ? '...' : totalEnrollments.toLocaleString(), 
      trend: enrollmentsChangeRate === 0 && enrollmentsIsUp === null ? 'Steady' : `${enrollmentsChangeRate >= 0 ? '+' : ''}${enrollmentsChangeRate}%`, 
      isUp: enrollmentsIsUp, 
      icon: Users 
    },
    { 
      label: 'Completion Rate', 
      value: loading ? '...' : `${completionRate}%`, 
      trend: completionChangeRate === 0 && completionIsUp === null ? 'Steady' : `${completionChangeRate >= 0 ? '+' : ''}${completionChangeRate}%`, 
      isUp: completionIsUp, 
      icon: CheckCircle 
    },
    { 
      label: 'Active Courses', 
      value: loading ? '...' : String(activeCourses), 
      trend: coursesChangeRate === 0 && coursesIsUp === null ? 'Steady' : `${coursesChangeRate >= 0 ? '+' : ''}${coursesChangeRate}%`, 
      isUp: coursesIsUp, 
      icon: Monitor 
    },
    { 
      label: 'Total Revenue', 
      value: loading ? '...' : revenueStr, 
      trend: revenueChangeRate === 0 && revenueIsUp === null ? 'Steady' : `${revenueChangeRate >= 0 ? '+' : ''}${revenueChangeRate}%`, 
      isUp: revenueIsUp, 
      icon: DollarSign 
    },
  ];

  const displayedPopular = courses.length > 0
    ? courses.slice(0, 3).map((c, i) => ({
        title: c.title,
        instructor: c.provider || 'SPK Instructor',
        rating: Number((4.8 + (i % 3) * 0.1).toFixed(1)),
        reviews: 120 + (i * 45),
        enrolled: c.enrolledCount || 0,
        image: c.thumbnail || 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_jWDeDEdrd3xR5Ew8h8WjuKB6iIafZQNcusYXODXewhDrwkD_gMYkjH9CjDg3BstMTX2mdxJkEU6g77ljTkep4VggGmcmn5YetZEGI2qca__dlwubN7LVU0YEj0uytEuiQJeclzGbrTd2oKZgfyuB8ea5UKZFaVhoZQMB-O5ih3RcH4kgFjAutrgNpuEJvjyF8K6aCfh8cUtngWTFM6TR_UjnTQZkF6XwvD8NwKFi5pLT6_vrDBNg51VLBPZ94Zr8b1dFoVCFTSS1'
      }))
    : [];

  const rawEnrollments = overviewData?.recentEnrollments || [];
  
  // Filter recent enrollments by status
  const filteredEnrollments = rawEnrollments.filter((e: any) => {
    if (statusFilter === 'All') return true;
    return e.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (rawEnrollments.length === 0) return;
    const headers = ['Student Name', 'Course Title', 'Status', 'Date', 'Progress %'];
    const rows = rawEnrollments.map((e: any) => [
      `"${e.student.replace(/"/g, '""')}"`,
      `"${e.course.replace(/"/g, '""')}"`,
      e.status,
      e.date,
      `${e.progress}%`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "student_enrollments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-grid-gutter pb-12">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-grid-gutter">
        {dynamicCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-5 rounded-xl"
          >
            <div className="flex justify-between items-start mb-3">
               <span className="label-md text-[#34405E] uppercase tracking-wider">{card.label}</span>
               <card.icon size={18} className="text-on-surface-variant opacity-40" />
            </div>
            <div className="flex items-end justify-between">
              <h1 className="h1 text-[#34405E] font-semibold text-2xl">{card.value}</h1>
              {card.isUp !== null && (
                <span className={`label-md flex items-center gap-1 font-semibold ${card.isUp ? 'text-[#34405E]' : 'text-error'}`}>
                  {card.trend}
                  {card.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </span>
              )}
              {card.isUp === null && (
                <span className="label-md text-[#34405E] opacity-60">Steady</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-grid-gutter">
        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-12 lg:col-span-8 bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-xl p-6 flex flex-col"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="h3 text-[#34405E]">Enrollment Trends</h3>
              <p className="body-sm text-on-surface-variant">
                {datePreset === '30days' && 'User growth across the last 30 days'}
                {datePreset === '6months' && 'User growth across the last 6 months'}
                {datePreset === 'ytd' && 'User growth from the start of the year'}
                {datePreset === 'custom' && `User growth from ${customStartDate} to ${customEndDate}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="bg-surface-container-low border border-outline-variant rounded-lg label-md px-3 py-1.5 focus:ring-2 focus:ring-secondary/20 cursor-pointer text-primary"
              >
                <option value="30days">Last 30 Days</option>
                <option value="6months">Last 6 Months</option>
                <option value="ytd">Year to Date (YTD)</option>
                <option value="custom">Custom Range</option>
              </select>
              
              {datePreset === 'custom' && (
                <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-200">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant rounded-lg label-md px-2 py-1 text-primary focus:ring-2 focus:ring-secondary/20 text-xs"
                  />
                  <span className="text-xs text-on-surface-variant">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant rounded-lg label-md px-2 py-1 text-primary focus:ring-2 focus:ring-secondary/20 text-xs"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="h-72 w-full mt-auto">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant body-md font-medium">
                Loading trend data...
              </div>
            ) : (overviewData?.trendData || []).length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant body-md font-medium">
                No trends to report in the selected date range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overviewData?.trendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'black', fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 11, fill: 'black' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F1F5F9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={datePreset === '30days' ? 12 : 40}>
                    {(overviewData?.trendData || []).map((entry: any, index: number) => (
                      <Cell key={index} fill={index === (overviewData?.trendData || []).length - 1 ? 'black' : '#b4c5ff'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Instructor Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-12 lg:col-span-4 bg-surface-container-lowest shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-xl p-6 flex flex-col"
        >
          <h3 className="h3 text-[#34405E] mb-6">Instructor Activity Logs</h3>
          <div className="space-y-6 flex-1 overflow-y-auto max-h-72 pr-2">
            {loading ? (
              <div className="text-center py-6 text-on-surface-variant body-sm font-medium">
                Loading activities...
              </div>
            ) : !overviewData?.instructorActivities || overviewData.instructorActivities.length === 0 ? (
              <div className="text-center py-6 text-on-surface-variant body-sm font-medium">
                No activity recorded.
              </div>
            ) : (
              overviewData.instructorActivities.map((act: any) => (
                <div key={act.id} className="flex gap-4 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    act.type === 'instructor' ? 'bg-gray-200/50 text-on-surface' : 'bg-gray-400/60 text-on-surface'
                  }`}>
                    <Users size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="body-md text-on-surface leading-tight">
                      <span className="font-bold">{act.actor}</span><span className='text-[#34405E]'> {act.action}</span>
                    </p>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button onClick={() => window.location.href = '/activity'} className="w-full mt-4 py-3.5 bg-black rounded-lg  text-sm label-md text-white hover:bg-black-70 transition-all cursor-pointer">
            View All Audit Logs
          </button>
        </motion.div>
      </div>

      {/* Popular Courses */}
      {displayedPopular.length > 0 && (
        <div className="bg-white shadow-[0px_4px_-20px_rgba(0,0,0,0.05)_0px_4px_20px_rgba(0,0,0,0.05)] rounded-xl p-6 mt-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="h3 text-primary">Popular Courses</h3>
              <p className="body-sm text-on-surface-variant">Top performing curriculum this month</p>
            </div>
            <button onClick={() => window.location.href = '/courses'} className="text-secondary label-md hover:underline font-medium text-sm transition-all cursor-pointer">Manage Catalog</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedPopular.map((course, i) => (
              <motion.div
                key={course.title}
                whileHover={{ y: -4 }}
                className="shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden hover:shadow-lg transition-all group bg-white"
              >
                <div className="h-40 bg-secondary-container relative overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-black text-on-secondary text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-widest bg-opacity-90 backdrop-blur-sm">
                    Popular
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="body-md font-bold text-primary mb-1 group-hover:text-secondary transition-colors line-clamp-1">{course.title}</h4>
                  <p className="text-[12px] text-on-surface-variant mb-4">Instructor: {course.instructor}</p>
                  <div className="flex justify-between items-center pt-3 border-t border-outline-variant">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-secondary fill-secondary" />
                      <span className="body-sm font-bold text-primary">{course.rating}</span>
                      <span className="text-[11px] text-on-surface-variant font-medium">({course.reviews})</span>
                    </div>
                    <div className="text-[12px] font-bold text-primary bg-surface-container-highest px-2 py-1 rounded">{course.enrolled} Enrolled</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Student Enrollments */}
      <div className="bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden mt-8">
        <div className="p-6 border-b border-b-gray-300/50 flex justify-between items-center bg-white">
          <div>
            <h3 className="h3 text-primary">Recent Student Enrollments</h3>
            <p className="body-sm text-on-surface-variant mt-0.5">Filter and export student catalog enrollment logs.</p>
          </div>
          <div className="flex gap-2 items-center relative">
            {/* Status Filter Trigger */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className={`p-2 hover:bg-surface-container-highest rounded-lg transition-colors border bg-surface cursor-pointer flex items-center gap-1.5 label-md font-bold ${
                  statusFilter !== 'All' ? 'border-secondary text-secondary' : 'border-outline-variant text-on-surface-variant'
                }`}
              >
                <Filter size={18} />
                {statusFilter !== 'All' && <span>{statusFilter}</span>}
              </button>

              {filterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-50">
                  {['All', 'Active', 'Completed'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setStatusFilter(opt);
                        setFilterDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      {opt === 'All' ? 'All Statuses' : opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={handleExportCSV}
              disabled={rawEnrollments.length === 0}
              className="p-2 hover:bg-surface-container-highest rounded-lg transition-colors border border-outline-variant bg-surface disabled:opacity-40 cursor-pointer"
              title="Export Enrollments CSV"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-b-gray-300/50">
                <th className="px-6 py-4 label-md text-on-surface-variant uppercase tracking-widest font-bold">Student</th>
                <th className="px-6 py-4 label-md text-on-surface-variant uppercase tracking-widest font-bold">Course</th>
                <th className="px-6 py-4 label-md text-on-surface-variant uppercase tracking-widest font-bold">Status</th>
                <th className="px-6 py-4 label-md text-on-surface-variant uppercase tracking-widest font-bold">Date</th>
                <th className="px-6 py-4 label-md text-on-surface-variant uppercase tracking-widest font-bold">Progress</th>
                <th className="px-6 py-4 h-full"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant body-md font-medium">
                    Loading database enrollments...
                  </td>
                </tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant body-md font-medium">
                    No enrollments found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enr: any, i: number) => (
                  <tr key={i} className="hover:bg-surface-container transition-all cursor-pointer group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-black text-on-secondary flex items-center justify-center font-bold text-[11px] shadow-sm`}>
                          {enr.initial}
                        </div>
                        <span className="body-md font-bold text-on-surface">{enr.student}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 body-md text-on-surface">{enr.course}</td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-sm body-sm font-bold uppercase tracking-tighter text-[10px] ${
                        enr.status === 'Active' ? 'bg-gray-200/50 text-[#34405E]' : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {enr.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 body-sm text-on-surface-variant">{enr.date}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-surface-container rounded-full overflow-hidden shrink-0 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${enr.progress}%` }}
                            transition={{ delay: 0.2 + i * 0.05, duration: 0.8 }}
                            className="h-full bg-black" 
                          />
                        </div>
                        <span className="body-sm font-bold text-primary">{enr.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <MoreVertical size={18} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
