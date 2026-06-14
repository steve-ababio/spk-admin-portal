"use client";

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  RotateCcw,
  BookOpen, 
  User, 
  Upload, 
  AlertCircle,
  Clock,
  Download
} from 'lucide-react';
import { adminService } from '@/src/services/adminService';

interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  date: string;
  category: 'Course' | 'Faculty' | 'System' | 'Resource';
  initials: string;
  color: string;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getActivity();
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const categories = ['All', 'Course', 'Faculty', 'Resource', 'System'];

  const filteredLogs = logs.filter(log => {
    const matchesCategory = activeCategory === 'All' || log.category === activeCategory;
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.target.toLowerCase().includes(searchLower) ||
      log.category.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'Course':
        return <BookOpen size={15} />;
      case 'Faculty':
        return <User size={15} />;
      case 'Resource':
        return <Upload size={15} />;
      default:
        return <AlertCircle size={15} />;
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Category', 'Actor', 'Action', 'Target', 'Time', 'Date'];
    const rows = filteredLogs.map((log: any) => [
      log.category,
      `"${log.actor.replace(/"/g, '""')}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.target.replace(/"/g, '""')}"`,
      log.time,
      log.date
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "system_audit_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="h1 text-[#34405E]">Activity Registry</h1>
          <p className="body-md text-on-surface-variant font-medium mt-1">Audit logs of catalog modifications, user actions, database events, and publications.</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <button 
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md label-md font-bold text-black shadow-sm bg-white transition-all cursor-pointer disabled:opacity-45 select-none"
            title="Export Logs CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          
          <button 
            onClick={() => { setSearch(''); setActiveCategory('All'); }}
            className="flex items-center gap-1.5 px-4 py-2 shadow-sm rounded-md label-md font-bold text-on-surface-variant bg-white  transition-all cursor-pointer select-none"
          >
            <RotateCcw size={15} />
            <span>Reset Audit</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)] p-4 rounded-2xl flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-secondary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search audit trail by keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-surface-container-low  rounded-xl body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-all"
            />
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md label-md font-bold transition-all text-[12px] cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white shadow-[0px_-4px_20px_rgba(0,0,0,0.25)_0px_4px_20px_rgba(0,0,0,0.05)] rounded-sm overflow-hidden">
        <div className="px-6 py-4  flex justify-between items-center bg-surface-container-low">
          <h3 className="h3 text-primary">System Log History</h3>
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
            Showing {filteredLogs.length} events
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center items-center text-primary font-bold">
            Compiling audit logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant bg-white">
            No audit logs found matching the filter search criteria.
          </div>
        ) : (
          <div className="divide-y divide-gray-300/40">
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-5 flex items-start gap-4 hover:bg-zinc-50/50 transition-colors"
              >
                {/* Initials avatar badge */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[11px] shrink-0 ${log.color}`}>
                  {log.initials}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="body-md text-zinc-900 leading-tight">
                      <span className="font-bold">{log.actor}</span> {log.action}{' '}
                      <span className="font-bold text-zinc-950">"{log.target}"</span>
                    </p>
                    <span className="text-[11px] text-zinc-400 font-medium shrink-0 flex items-center gap-1">
                      <Clock size={12} />
                      {log.time}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] text-zinc-400 font-semibold">{log.date}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                    
                    {/* Category Label badge */}
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100/80 px-2 py-0.5 rounded">
                      {getIcon(log.category)}
                      <span>{log.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
