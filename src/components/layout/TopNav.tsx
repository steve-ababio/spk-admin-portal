"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, User, Plus, LogOut, Settings, HelpCircle, ChevronDown, CreditCard, UserPlus, Clock } from 'lucide-react';
import { useUser } from '@/src/app/(dashboard)/layout';
import { adminService } from '@/src/services/adminService';

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const [addNewOpen, setAddNewOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'enrollments' | 'payments'>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ courses: any[]; instructors: any[]; activities: any[] }>({
    courses: [],
    instructors: [],
    activities: []
  });
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const addNewRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (addNewRef.current && !addNewRef.current.contains(event.target as Node)) {
        setAddNewOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ courses: [], instructors: [], activities: [] });
      setSearchOpen(false);
      setSearching(false);
      return;
    }

    setSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await adminService.search(searchQuery);
        setSearchResults(results || { courses: [], instructors: [], activities: [] });
        setSearchOpen(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchNotificationLogs() {
      try {
        setLoadingLogs(true);
        const activityLogs = await adminService.getActivity();
        const filtered = (activityLogs || []).filter((log: any) => {
          return (
            log.id.startsWith("enroll-") || 
            log.action.includes("enrolled") ||
            log.id.startsWith("tx-") || 
            log.action.includes("payment")
          );
        });
        setLogs(filtered);
        // Initially set a mockup count of new events
        setUnreadCount((prev) => (prev === 0 && filtered.length > 0 ? Math.min(filtered.length, 4) : prev));
      } catch (err) {
        console.error("Failed to fetch notification logs:", err);
      } finally {
        setLoadingLogs(false);
      }
    }
    fetchNotificationLogs();
    const interval = setInterval(fetchNotificationLogs, 45000);
    return () => clearInterval(interval);
  }, []);

  const userFullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Admin User';
  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'AU';
  const userEmail = user?.email || 'admin@lms.enterprise';

  const navItems = [
    { label: 'Overview', href: '/' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Activity', href: '/activity' },
  ];

  return (
    <header className="h-16 bg-white fixed top-0 right-0 w-[calc(100%-16rem)] z-40">
      <div className="flex justify-between items-center px-container-padding h-full">
        <div className="flex items-center gap-8">
          <div className="relative group" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-black transition-colors" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim()) setSearchOpen(true);
              }}
              placeholder="Search courses, instructors, and logs..."
              className="bg-surface-container-low rounded-full pl-10 pr-4 py-2.5 body-md focus:outline-none focus:ring-2 focus:ring-black w-80 transition-all text-[13px] text-zinc-900 placeholder-zinc-400"
            />

            {searchOpen && (
              <div className="absolute left-0 mt-2 w-[480px] bg-white shadow-[0px_8px_30px_rgba(0,0,0,0.12)] border border-zinc-100 rounded-xl py-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[480px] overflow-y-auto">
                {searching ? (
                  <div className="py-8 text-center text-[12px] text-zinc-400 font-medium flex items-center justify-center gap-2">
                    <span className="animate-spin text-lg">🌀</span>
                    <span>Searching...</span>
                  </div>
                ) : (searchResults.courses.length === 0 && 
                     searchResults.instructors.length === 0 && 
                     searchResults.activities.length === 0) ? (
                  <div className="py-8 text-center text-[12px] text-zinc-400 font-medium">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100">
                    {/* Courses */}
                    {searchResults.courses.length > 0 && (
                      <div className="p-3">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-1.5 block">Courses</span>
                        <div className="space-y-1">
                          {searchResults.courses.map((course) => (
                            <div key={course.id} className="flex justify-between items-center p-2 hover:bg-zinc-50 rounded-lg transition-colors group">
                              <div className="min-w-0 flex-1 pr-4">
                                <p className="text-[12px] font-semibold text-zinc-900 truncate">{course.title}</p>
                                <p className="text-[10px] text-zinc-400 truncate">{course.specialization || 'General'}</p>
                              </div>
                              <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                  href={`/course-form?id=${course.id}`}
                                  onClick={() => setSearchOpen(false)}
                                  className="px-2 py-1 bg-zinc-100 text-zinc-700 rounded text-[10px] font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  ✏️ Edit
                                </Link>
                                <Link
                                  href={`/curriculum?courseId=${course.id}`}
                                  onClick={() => setSearchOpen(false)}
                                  className="px-2 py-1 bg-zinc-950 text-white rounded text-[10px] font-bold hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  📚 Curriculum
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instructors */}
                    {searchResults.instructors.length > 0 && (
                      <div className="p-3">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-1.5 block">Instructors</span>
                        <div className="space-y-1">
                          {searchResults.instructors.map((ins) => (
                            <Link
                              key={ins.id}
                              href="/instructors"
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors group cursor-pointer"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-[12px] font-semibold text-zinc-900 group-hover:text-black transition-colors">{ins.name}</p>
                                <p className="text-[10px] text-zinc-400 truncate">{ins.specialization || ins.email}</p>
                              </div>
                              <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 font-medium">View Catalog &rarr;</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Curriculum Activities */}
                    {searchResults.activities.length > 0 && (
                      <div className="p-3">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-1.5 block">Curriculum Activities</span>
                        <div className="space-y-1">
                          {searchResults.activities.map((act) => (
                            <Link
                              key={act.id}
                              href={`/curriculum?courseId=${act.courseId}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg transition-colors group cursor-pointer"
                            >
                              <div className="min-w-0 flex-1 pr-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded-[4px] text-[8px] font-bold uppercase tracking-wider">{act.type}</span>
                                  <p className="text-[12px] font-semibold text-zinc-900 truncate">{act.title}</p>
                                </div>
                                <p className="text-[10px] text-zinc-400 truncate mt-0.5">Course: {act.course}</p>
                              </div>
                              <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 font-medium shrink-0">Go to Builder &rarr;</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <nav className="flex gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`body-md font-semibold transition-colors h-16 flex items-center border-b-2 ${
                    isActive
                      ? 'text-zinc-950 border-zinc-950'
                      : 'text-[#34405E] border-transparent hover:text-zinc-950'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Add New Dropdown */}
          <div className="relative" ref={addNewRef}>
            <button
              onClick={() => setAddNewOpen(!addNewOpen)}
              className="bg-zinc-950 text-white px-4 py-2.5 rounded-md label-md flex items-center gap-1.5 hover:bg-zinc-900 transition-all hover:translate-y-px cursor-pointer"
            >
              <Plus size={16} />
              <span>Add New</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${addNewOpen ? 'rotate-180' : ''}`} />
            </button>

            {addNewOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.09)]  rounded-lg  py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="/course-form"
                  onClick={() => setAddNewOpen(false)}
                  className="flex items-center px-4 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  New Course
                </Link>
                <Link
                  href="/instructors?add=true"
                  onClick={() => setAddNewOpen(false)}
                  className="flex items-center px-4 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  New Instructor
                </Link>
              </div>
            )}
          </div>
          
          <div className="w-px h-6 bg-outline-variant mx-2" />

          <div className="flex gap-2 items-center">
            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUnreadCount(0); // clear count on open
                }}
                className="p-2 hover:bg-zinc-100 rounded-full transition-all relative cursor-pointer flex items-center justify-center"
              >
                <Bell size={20} className="text-zinc-700 hover:text-zinc-950 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white shadow-[0px_8px_30px_rgba(0,0,0,0.12)] border border-zinc-100 rounded-xl py-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 flex flex-col">
                  {/* Header */}
                  <div className="px-4 pb-2 flex justify-between items-center border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-zinc-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-bold uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-1 bg-zinc-50/50 p-1.5 m-2.5 rounded-lg border border-zinc-100">
                    {(['all', 'enrollments', 'payments'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          filter === tab
                            ? 'bg-white text-zinc-950 shadow-sm border border-zinc-200/50 font-extrabold'
                            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50'
                        }`}
                      >
                        {tab === 'all' ? 'All Logs' : tab}
                      </button>
                    ))}
                  </div>

                  {/* Scrollable List */}
                  <div className="max-h-[320px] overflow-y-auto divide-y divide-zinc-50">
                    {loadingLogs ? (
                      <div className="py-12 text-center text-[12px] text-zinc-400 font-medium">
                        Loading updates...
                      </div>
                    ) : (() => {
                      const filteredLogs = logs.filter((log) => {
                        if (filter === 'enrollments') {
                          return log.id.startsWith("enroll-") || log.action.includes("enrolled");
                        }
                        if (filter === 'payments') {
                          return log.id.startsWith("tx-") || log.action.includes("payment");
                        }
                        return true;
                      });

                      if (filteredLogs.length === 0) {
                        return (
                          <div className="py-12 text-center text-[12px] text-zinc-400 flex flex-col items-center justify-center gap-2">
                            <span className="text-xl">📭</span>
                            <span>No recent {filter === 'all' ? '' : filter} logs found</span>
                          </div>
                        );
                      }

                      return filteredLogs.map((log) => {
                        const isEnroll = log.id.startsWith("enroll-") || log.action.includes("enrolled");
                        return (
                          <div key={log.id} className="p-3.5 flex items-start gap-3 hover:bg-zinc-50/50 transition-colors duration-150">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                              isEnroll 
                                ? 'bg-indigo-50/50 text-indigo-600 border-indigo-100' 
                                : 'bg-emerald-50/50 text-emerald-600 border-emerald-100'
                            }`}>
                              {isEnroll ? <UserPlus size={14} /> : <CreditCard size={14} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] text-zinc-600 leading-snug">
                                <span className="font-semibold text-zinc-900">{log.actor}</span> {log.action}{' '}
                                <span className="font-semibold text-zinc-900">"{log.target}"</span>
                              </p>
                              <div className="flex items-center gap-1 text-[10px] text-zinc-400 mt-1.5">
                                <Clock size={10} />
                                <span>{log.time} · {log.date}</span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-zinc-100 pt-2.5 mt-1 text-center px-4">
                    <Link
                      href="/activity"
                      onClick={() => setNotificationsOpen(false)}
                      className="inline-flex items-center justify-center text-[11px] font-bold text-zinc-900 hover:underline cursor-pointer gap-1"
                    >
                      View All Registry Logs
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 hover:bg-surface-container rounded-full transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05)] bg-zinc-100 flex items-center justify-center text-[11px] font-bold text-zinc-700 transition-transform group-hover:scale-105">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Admin Avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{userInitials}</span>
                  )}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.15)] rounded-xl  py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* User Profile Summary */}
                  <div className="px-4 py-2 border-b border-zinc-100">
                    <p className="text-[13px] font-bold text-zinc-900 leading-tight">{userFullName}</p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">{userEmail}</p>
                    <span className="inline-block px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[9px] font-bold uppercase tracking-wider mt-2">
                      Administrator
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        // Trigger setting drawer by selecting the settings button in sidebar
                        const settingsBtn = document.getElementById('sidebar-settings-btn');
                        if (settingsBtn) settingsBtn.click();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors text-left"
                    >
                      <Settings size={15} />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        const supportBtn = document.getElementById('sidebar-support-btn');
                        if (supportBtn) supportBtn.click();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors text-left"
                    >
                      <HelpCircle size={15} />
                      <span>Support Help</span>
                    </button>
                  </div>

                  <div className="border-t border-zinc-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
