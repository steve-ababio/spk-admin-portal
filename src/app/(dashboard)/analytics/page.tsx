"use client"

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star, 
  Calendar, 
  Download, 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip
} from 'recharts';
import { adminService } from '@/src/services/adminService';

const COLORS = ['black', '#bebebe', '#3b82f6', '#93c5fd', '#1e3a8a'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [areaChartType,setAreaChartType] = useState<"tution"|"enrollment">("tution");
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('Last 6 Months');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchAnalytics = async (period: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      const params: Record<string, any> = { period };
      if (period === 'Custom Range' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const data = await adminService.getAnalytics(params);
      setAnalyticsData(data || null);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timePeriod === 'Custom Range') {
      if (customStartDate && customEndDate) {
        fetchAnalytics(timePeriod, customStartDate, customEndDate);
      }
    } else {
      fetchAnalytics(timePeriod);
    }
  }, [timePeriod, customStartDate, customEndDate]);

  // Calculations & Fallbacks
  const totalRevenue = analyticsData?.totalRevenue ?? 0;
  const totalEnrollments = analyticsData?.totalEnrollments ?? 0;
  const averageFacultyRating = analyticsData?.averageFacultyRating?.toFixed(2) ?? '0';
  const revenueChange = analyticsData?.revenueChangeRate ?? '+0%';
  const enrollmentsChange = analyticsData?.enrollmentsChangeRate ?? '+0%';
  const facultyRatingChange = analyticsData?.facultyRatingChangeRate ?? '+0%';
  const salesData = analyticsData?.salesData || [];
  const quarterlyRevenue = analyticsData?.quarterlyRevenue || [];
  const quarterlyEnrollments = analyticsData?.quarterlyEnrollments || [];
  const enrollmentBarData = analyticsData?.enrollmentBarData || [];
   

  console.log("analytics daata: ",analyticsData);
  const totalRevenueStr = totalRevenue >= 1000 
    ? Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(totalRevenue / 1000) + 'k'
    : Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
    }).format(totalRevenue);

  const getReportingPeriodText = () => {
    if (timePeriod === 'Custom Range') {
      if (customStartDate && customEndDate) {
        const startStr = new Date(customStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const endStr = new Date(customEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startStr} - ${endStr}`;
      }
      return 'Custom Range';
    }
    return timePeriod;
  };

  const kpis = [
    { label: 'Cumulative Revenue', value: loading ? '...' : totalRevenueStr, trend: revenueChange, isUp: analyticsData?.revenueIsUp, icon: DollarSign, subText: 'Gross tuition earnings' },
    { label: 'Total Enrollments', value: loading ? '...' : totalEnrollments.toLocaleString(), trend: enrollmentsChange, isUp: analyticsData?.enrollmentsIsUp, icon: Users, subText: 'Registered student seats' },
    { label: 'Average Course Rating', value: loading ? '...' : `${averageFacultyRating} / 5.0`, trend: facultyRatingChange, isUp: analyticsData?.facultyRatingIsUp, icon: Star, subText: 'Aggregate user satisfaction' },
    { label: 'Reporting Period', value: loading ? '...' : getReportingPeriodText(), trend: 'Active', isUp: null, icon: Calendar, subText: 'Time window constraint' },
  ];

  // Export tuition data to CSV
  const handleExportCSV = () => {
    if (enrollmentBarData.length === 0) return;
    const headers = ['Course Title', 'Students Enrolled', 'Revenue Gross ($)'];
    const rows = enrollmentBarData.map((c: any) => [
      `"${c.title.replace(/"/g, '""')}"`,
      c.enrolled,
      c.revenue
    ]);
    const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileNameSuffix = getReportingPeriodText().toLowerCase().replace(/[^a-z0-9]+/g, '_');
    link.setAttribute("download", `tuition_performance_${fileNameSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="h1 text-[#34405E]">Analytics & Intelligence</h1>
          <p className="body-md text-on-surface-variant font-medium mt-1">Cross-course performance metrics, revenue growth, and enrollment intelligence.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center shrink-0">
          <select 
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="bg-white rounded-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] label-md px-4 py-2.5 focus:ring-2 focus:ring-secondary/20 focus:outline-none cursor-pointer font-semibold"
          >
            <option>Last 30 Days</option>
            <option>Last 6 Months</option>
            <option>Year to Date</option>
            <option>Custom Range</option>
          </select>

          {timePeriod === 'Custom Range' && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 bg-white rounded-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] px-3 py-1.5"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Start</span>
                <input 
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-800 font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
              <span className="text-zinc-300 font-medium text-xs">to</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">End</span>
                <input 
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-800 font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>
            </motion.div>
          )}
          
          <button 
            onClick={handleExportCSV}
            disabled={enrollmentBarData.length === 0}
            className="p-2.5 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] bg-white rounded-md transition-all cursor-pointer disabled:opacity-45"
            title="Export Leaderboard CSV"
          >
            <Download size={18} className="text-on-surface-variant" />
          </button>
        </div>
      </div>

      {/* Stats KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-grid-gutter">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-5 rounded-2xl flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="label-md text-[#34405E] uppercase tracking-wider font-bold">{kpi.label}</span>
              <kpi.icon size={18} className="text-on-surface-variant opacity-40" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <h1 className="h1 font-semibold text-[#34405E] text-2xl">{kpi.value}</h1>
              {kpi.isUp !== null && (
                <span className={`label-md flex items-center gap-1 font-bold ${kpi.isUp ? 'text-[#34405E]' : 'text-error'}`}>
                  {kpi.trend}
                  {kpi.isUp ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180 text-error" />}
                </span>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant opacity-75 mt-3 pt-3 border-t border-outline-variant font-medium">
              {kpi.subText}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Block */}
      <div className="grid grid-cols-12 gap-grid-gutter">
        {/* Revenue Performance Area Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-12 lg:col-span-8 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-2xl p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="h3 text-[#34405E]">Revenue & Enrollment Growth</h3>
              <p className="body-sm text-on-surface-variant">Monthly breakdown of gross tuition revenues and active user enrollments.</p>
            </div>
            <div className="flex gap-2 text-[11px] font-bold">
              <button onClick={()=>setAreaChartType("tution")} className={`flex items-center gap-1.5 ${areaChartType === "tution" ? "text-[#34405E]" : "text-zinc-400"}`}><span className={`w-2.5 h-2.5 rounded-full ${areaChartType === "tution" ? "bg-black" : "bg-zinc-300"}`} /> Revenue (GHS)</button>
              <button onClick={()=>setAreaChartType("enrollment")} className={`flex items-center gap-1.5 ${areaChartType === "enrollment" ? "text-[#34405E]" : "text-zinc-400"}`}><span className={`w-2.5 h-2.5 rounded-full ${areaChartType === "enrollment" ? "bg-black" : "bg-zinc-300"}`} /> Enrollment</button>
            </div>
          </div>
          
          <div className="h-72 w-full mt-4">
            {loading ? (
              <div className="h-full flex items-center justify-center text-zinc-400 font-medium text-[13px]">
                Loading charts...
              </div>
            ) : salesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-400 font-medium text-[13px]">
                No transaction sales history found.
              </div>
            ) : (
              areaChartType === "tution"? 
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="black" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="black" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748B' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="black" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Tuition Revenue (GHS)" />
                </AreaChart>
              </ResponsiveContainer>:
              //enrollment
              (<ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="black" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="black" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748B' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area type="monotone" dataKey="enrollments" stroke="black" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Enrollment" />
                </AreaChart>
              </ResponsiveContainer>)
            )}
          </div>
        </motion.div>

        {/* Quarterly Revenue Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 flex flex-col justify-between shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
        >
          <div>
            <h3 className="h3 text-[#34405E] mb-1">Quarterly Revenue</h3>
            <p className="body-sm text-on-surface-variant mb-6">Distribution of gross tuition revenue by calendar quarter.</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            {loading ? (
              <div className="text-zinc-400 font-medium text-[13px]">Loading quarters...</div>
            ) : quarterlyRevenue.length === 0 ? (
              <div className="text-zinc-400 font-medium text-[13px]">No quarterly revenue data.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={quarterlyRevenue}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {quarterlyRevenue.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`GHS ${Number(value).toLocaleString()}`, "Revenue"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center text-center px-4">
                  <span className="text-[14px] font-semibold text-[#34405E] leading-none">
                    GHS {totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}k` : totalRevenue.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[#34405E] tracking-wider mt-1">
                    Total Revenue
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
            {quarterlyRevenue.map((item: any, idx: number) => (
              <div key={item.name} className="flex justify-between items-center text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-semibold text-[#34405E]">{item.name}</span>
                </div>
                <span className="font-semibold text-[#34405E]">GHS {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2: Leaderboard & Quarterly Enrollments */}
      <div className="grid grid-cols-12 gap-grid-gutter">
        {/* Top Performing Courses */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          <h3 className="h3 text-[#34405E] mb-1">Top Performing Courses</h3>
          <p className="body-sm text-on-surface-variant mb-8">Course modules ranked by gross seat enrollments.</p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Horizontal Bar Chart */}
            <div className="lg:col-span-7 h-64 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-zinc-400 font-medium">
                  Loading leaderboard chart...
                </div>
              ) : enrollmentBarData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-400 font-medium">
                  No leaderboard data.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={enrollmentBarData}
                    layout="vertical"
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis 
                      dataKey="title" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#34405E', fontWeight: 600 }}
                      width={160}
                    />
                    <Tooltip />
                    <Bar dataKey="enrolled" fill="black" radius={[0, 4, 4, 0]} barSize={20} name="Enrolled Seats" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Metrics breakdown */}
            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-outline-variant pt-6 lg:pt-0 lg:pl-8 space-y-5">
              <h4 className="body-md font-bold text-[#34405E]">Tuition Leaderboard</h4>
              <div className="divide-y divide-gray-400/40 text-[13px] max-h-56 overflow-y-auto pr-1">
                {enrollmentBarData.map((course: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-[#34405E] truncate">{course.title}</span>
                    </div>
                    <span className="font-semibold text-[#34405E] shrink-0 ml-4">
                      {Intl.NumberFormat('en-GH', {
                        style: 'currency',
                        currency: 'GHS',
                      }).format(course.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quarterly Enrollments Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 flex flex-col justify-between shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
        >
          <div>
            <h3 className="h3 text-[#34405E] mb-1">Quarterly Enrollments</h3>
            <p className="body-sm text-on-surface-variant mb-6">Distribution of enrolled seats by calendar quarter.</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            {loading ? (
              <div className="text-[#34405E] font-medium text-[13px]">Loading quarters...</div>
            ) : quarterlyEnrollments.length === 0 ? (
              <div className="text-[#34405E] font-medium text-[13px]">No quarterly enrollment data.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={quarterlyEnrollments}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      color="#34405E"
                    >
                      {quarterlyEnrollments.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value} seats`, "Enrollments"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center text-center px-4">
                  <span className="text-[20px] font-[#34405E] text-primary leading-none">
                    {totalEnrollments.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[#34405E] tracking-wider mt-1">
                    Total Enrolled
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
            {quarterlyEnrollments.map((item: any, idx: number) => (
              <div key={item.name} className="flex justify-between items-center text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-semibold text-[#34405E]">{item.name}</span>
                </div>
                <span className="font-semibold text-[#34405E]">{item.value.toLocaleString()} seats</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}


//   // Export tuition data to CSV
//   const handleExportCSV = () => {
//     if (enrollmentBarData.length === 0) return;
//     const headers = ['Course Title', 'Students Enrolled', 'Revenue Gross ($)'];
//     const rows = enrollmentBarData.map((c: any) => [
//       `"${c.title.replace(/"/g, '""')}"`,
//       c.enrolled,
//       c.revenue
//     ]);
//     const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.setAttribute("href", url);
//     link.setAttribute("download", `tuition_performance_${timePeriod.toLowerCase().replace(/\s+/g, '_')}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="space-y-8 pb-16">
//       {/* Title & Filter Bar */}
//       <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
//         <div>
//           <h1 className="h1 text-primary">Analytics & Intelligence</h1>
//           <p className="body-md text-on-surface-variant font-medium mt-1">Cross-course performance metrics, revenue growth, and enrollment intelligence.</p>
//         </div>

//         <div className="flex gap-2 items-center shrink-0">
//           <select 
//             value={timePeriod}
//             onChange={(e) => setTimePeriod(e.target.value)}
//             className="bg-white rounded-md shadow-[0px_4px_20px_rgba(0,0,0,0.05)] label-md px-4 py-2.5 focus:ring-2 focus:ring-secondary/20 focus:outline-none cursor-pointer font-semibold"
//           >
//             <option>Last 30 Days</option>
//             <option>Last 6 Months</option>
//             <option>Year to Date</option>
//           </select>
          
//           <button 
//             onClick={handleExportCSV}
//             disabled={enrollmentBarData.length === 0}
//             className="p-2.5 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] bg-white rounded-md transition-all cursor-pointer disabled:opacity-45"
//             title="Export Leaderboard CSV"
//           >
//             <Download size={18} className="text-on-surface-variant" />
//           </button>
//         </div>
//       </div>

//       {/* Stats KPI Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-grid-gutter">
//         {kpis.map((kpi: { label: boolean | Key | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode>>; icon: JSX.IntrinsicAttributes; value: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode>>; isUp: null; trend: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode>>; subText: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode>>; }, idx: number) => (
//           <motion.div
//             key={kpi.label}
//             initial={{ opacity: 0, y: 15 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: idx * 0.08 }}
//             className="bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-5 rounded-2xl flex flex-col justify-between"
//           >
//             <div className="flex justify-between items-start mb-3">
//               <span className="label-md text-on-surface-variant uppercase tracking-wider font-bold">{kpi.label}</span>
//               <kpi.icon size={18} className="text-on-surface-variant opacity-40" />
//             </div>
//             <div className="flex items-baseline justify-between mt-2">
//               <h1 className="h1 font-black text-primary">{kpi.value}</h1>
//               {kpi.isUp !== null && (
//                 <span className={`label-md flex items-center gap-1 font-bold ${kpi.isUp ? 'text-secondary' : 'text-error'}`}>
//                   {kpi.trend}
//                   {kpi.isUp ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180 text-error" />}
//                 </span>
//               )}
//             </div>
//             <p className="text-[11px] text-on-surface-variant opacity-75 mt-3 pt-3 border-t border-outline-variant font-medium">
//               {kpi.subText}
//             </p>
//           </motion.div>
//         ))}
//       </div>

//       {/* Main Charts Block */}
//       <div className="grid grid-cols-12 gap-grid-gutter">
//         {/* Revenue Performance Area Chart */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.98 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="col-span-12 lg:col-span-8 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)] rounded-2xl p-6 flex flex-col"
//         >
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h3 className="h3 text-primary">Revenue & Enrollment Growth</h3>
//               <p className="body-sm text-on-surface-variant">Monthly breakdown of gross tuition revenues and active user enrollments.</p>
//             </div>
//             <div className="flex gap-2 text-[11px] font-bold">
//               <span className="flex items-center gap-1.5 text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Tuition ($)</span>
//               <span className="flex items-center gap-1.5 text-zinc-400"><span className="w-2.5 h-2.5 rounded-full bg-zinc-300" /> Seats Filled</span>
//             </div>
//           </div>
          
//           <div className="h-72 w-full mt-4">
//             {loading ? (
//               <div className="h-full flex items-center justify-center text-zinc-400 font-medium text-[13px]">
//                 Loading charts...
//               </div>
//             ) : salesData.length === 0 ? (
//               <div className="h-full flex items-center justify-center text-zinc-400 font-medium text-[13px]">
//                 No transaction sales history found.
//               </div>
//             ) : (
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
//                   <defs>
//                     <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#0051d5" stopOpacity={0.15}/>
//                       <stop offset="95%" stopColor="#0051d5" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
//                   <XAxis 
//                     dataKey="month" 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }}
//                     dy={10}
//                   />
//                   <YAxis 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{ fontSize: 12, fill: '#64748B' }}
//                   />
//                   <Tooltip 
//                     contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
//                   />
//                   <Area type="monotone" dataKey="revenue" stroke="#0051d5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Tuition Revenue ($)" />
//                 </AreaChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//         </motion.div>

//         {/* Categories Distribution Pie Chart */}
//         <motion.div
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 flex flex-col justify-between shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
//         >
//           <div>
//             <h3 className="h3 text-primary mb-1">Tuition by Sector</h3>
//             <p className="body-sm text-on-surface-variant mb-6">Distribution of enrolled seats across academic subjects.</p>
//           </div>

//           <div className="h-48 w-full relative flex items-center justify-center">
//             {loading ? (
//               <div className="text-zinc-400 font-medium text-[13px]">Loading sectors...</div>
//             ) : pieChartData.length === 0 ? (
//               <div className="text-zinc-400 font-medium text-[13px]">No sector data.</div>
//             ) : (
//               <>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={pieChartData}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={60}
//                       outerRadius={80}
//                       paddingAngle={5}
//                       dataKey="value"
//                     >
//                       {pieChartData.map((entry: any, index: number) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <div className="absolute flex flex-col items-center justify-center">
//                   <span className="text-[20px] font-black text-primary leading-none">
//                     {totalEnrollments}
//                   </span>
//                   <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mt-1">Total Enrolled</span>
//                 </div>
//               </>
//             )}
//           </div>

//           <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
//             {pieChartData.map((item: any, idx: number) => (
//               <div key={item.name} className="flex justify-between items-center text-[12px]">
//                 <div className="flex items-center gap-2">
//                   <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
//                   <span className="font-medium text-zinc-700">{item.name}</span>
//                 </div>
//                 <span className="font-bold text-zinc-950">{item.value.toLocaleString()} seats</span>
//               </div>
//             ))}
//           </div>
//         </motion.div>
//       </div>

//       {/* Courses Comparison Table / Chart */}
//       <div className="bg-white  rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
//         <h3 className="h3 text-primary mb-1">Top Performing Courses</h3>
//         <p className="body-sm text-on-surface-variant mb-8">Course modules ranked by gross seat enrollments.</p>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
//           {/* Horizontal Bar Chart */}
//           <div className="lg:col-span-7 h-64 w-full">
//             {loading ? (
//               <div className="h-full flex items-center justify-center text-zinc-400 font-medium">Loading leaderboard chart...</div>
//             ) : enrollmentBarData.length === 0 ? (
//               <div className="h-full flex items-center justify-center text-zinc-400 font-medium">No leaderboard data.</div>
//             ) : (
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart
//                   data={enrollmentBarData}
//                   layout="vertical"
//                   margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
//                   <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
//                   <YAxis 
//                     dataKey="title" 
//                     type="category" 
//                     axisLine={false} 
//                     tickLine={false} 
//                     tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }}
//                     width={110}
//                   />
//                   <Tooltip />
//                   <Bar dataKey="enrolled" fill="#0051d5" radius={[0, 4, 4, 0]} barSize={20} name="Enrolled Seats" />
//                 </BarChart>
//               </ResponsiveContainer>
//             )}
//           </div>

//           {/* Metrics breakdown */}
//           <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-outline-variant pt-6 lg:pt-0 lg:pl-8 space-y-5">
//             <h4 className="body-md font-black text-primary">Tuition Leaderboard</h4>
//             <div className="divide-y divide-outline-variant text-[13px] max-h-56 overflow-y-auto pr-1">
//               {enrollmentBarData.map((course: any, idx: number) => (
//                 <div key={idx} className="flex justify-between items-center py-2.5">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">
//                       {idx + 1}
//                     </span>
//                     <span className="font-medium text-zinc-700 truncate">{course.title}</span>
//                   </div>
//                   <span className="font-bold text-zinc-950 shrink-0 ml-4">
//                     ${course.revenue.toLocaleString()}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
