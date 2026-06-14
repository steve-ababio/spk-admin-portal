"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  FolderOpen, 
  Settings, 
  HelpCircle, 
  Plus, 
  LogOut,
  X,
  Check,
  Globe,
  Bell
} from 'lucide-react';
import { ViewId } from '../../types';
import { useUser } from '@/src/app/(dashboard)/layout';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  // Settings mock state
  const [portalName, setPortalName] = useState('SPK Admin');
  const [notifications, setNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Support mock state
  const [supportMsg, setSupportMsg] = useState('');
  const [supportSent, setSupportSent] = useState(false);

  const currentView: ViewId = 
    pathname === '/' || pathname === '/dashboard' ? 'dashboard' :
    pathname.startsWith('/courses') ? 'courses' :
    pathname.startsWith('/curriculum') ? 'curriculum' :
    pathname.startsWith('/instructors') ? 'instructors' :
    pathname.startsWith('/resources') ? 'resources' :
    pathname.startsWith('/course-form') ? 'course-form' : 'dashboard';

  const navItems = [
    { id: 'dashboard' as ViewId, href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses' as ViewId, href: '/courses', label: 'Courses', icon: BookOpen },
    { id: 'instructors' as ViewId, href: '/instructors', label: 'Instructors', icon: GraduationCap },
    { id: 'resources' as ViewId, href: '/resources', label: 'Resources', icon: FolderOpen },
  ];

  const userFullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Admin User';
  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'AU';
  const userEmail = user?.email || 'admin@lms.enterprise';

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMsg) return;
    setSupportSent(true);
    setTimeout(() => {
      setSupportSent(false);
      setSupportMsg('');
      setSupportOpen(false);
    }, 2000);
  };

  return (
    <>
      <aside className="w-64 h-screen bg-white  flex flex-col p-container-padding fixed left-0 top-0 z-35">
        <div className="mb-10 flex items-center gap-4">
          <img src="/assets/images/logo/logo-2.svg" alt="Sentinel Prime K Logo" />
          <h2 className="h2 font-bold text-black">{portalName}</h2>
          {/* <p className="body-sm text-black">Enterprise Portal</p> */}
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full  flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === item.id
                  ? 'bg-black text-white'
                  : 'text-[#34405E] hover:text-white hover:bg-black'
              }`} 
            >
              <item.icon size={20} />
              <span className="body-md font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-300 space-y-1">
          <Link 
            href="/course-form"
            className="w-full bg-black text-white py-3 rounded-md label-md flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 mb-4 shadow-lg shadow-black/20 font-bold"
          >
            <Plus size={16} />
            New Course
          </Link>
          
          <button 
            id="sidebar-settings-btn"
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2 text-[#34405E] transition-colors text-left cursor-pointer"
          >
            <Settings size={20} />
            <span className="body-md">Portal Settings</span>
          </button>
          
          <button 
            id="sidebar-support-btn"
            onClick={() => setSupportOpen(true)}
            className="w-full flex items-center gap-3  text-[#34405E] px-4 py-2  transition-colors text-left cursor-pointer"
          >
            <HelpCircle size={20} />
            <span className="body-md">Support Desk</span>
          </button>

          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-500 transition-colors text-left cursor-pointer"
          >
            <LogOut size={20} />
            <span className="body-md font-medium">Log Out</span>
          </button>

          <div className="flex items-center gap-3 px-4 py-4 mt-2">
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-[12px] shrink-0 border border-on-secondary-container/20 overflow-hidden">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={userFullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="body-sm font-bold text-[] truncate">{userFullName}</span>
              <span className="text-[10px] text-on-primary-container truncate">{userEmail}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Slide-over Settings Drawer */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50 border-l border-zinc-200 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 mb-6">
                <h3 className="text-[16px] font-bold text-[#34405E]">Portal Settings</h3>
                <button onClick={() => setSettingsOpen(false)} className="p-1 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer">
                  <X size={18} className="text-[#34405E]" />
                </button>
              </div>

              <div className="flex-1 space-y-6">
                {/* Branding Setting */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#34405E]">Portal Branding Name</label>
                  <input
                    type="text"
                    value={portalName}
                    onChange={(e) => setPortalName(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13px] text-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-sans"
                  />
                </div>

                {/* Notifications Config */}
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#34405E]">System Preferences</label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                    />
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-zinc-800">Email Notifications</span>
                      <span className="text-[11px] text-zinc-400">Notify me on module additions</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={(e) => setMaintenanceMode(e.target.checked)}
                      className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                    />
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-zinc-800">Maintenance Mode</span>
                      <span className="text-[11px] text-zinc-400">Lock courses catalog temporarily</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={() => setSettingsOpen(false)}
                className="w-full bg-zinc-950 text-white rounded-lg py-2.5 text-[13px] font-semibold hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Support Dialog Modal */}
      <AnimatePresence>
        {supportOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSupportOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md bg-white border border-zinc-200 rounded-xl shadow-xl p-6 pointer-events-auto flex flex-col"
              >
                <div className="flex justify-between items-center pb-3 border-b border-zinc-100 mb-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="text-zinc-800" size={18} />
                    <h3 className="text-[15px] font-bold text-zinc-900">Support Help Desk</h3>
                  </div>
                  <button onClick={() => setSupportOpen(false)} className="p-1 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer">
                    <X size={18} className="text-zinc-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-[13px] text-zinc-500 leading-relaxed">
                    Have questions about course analytics or faculty registers? Send a brief message, and our Sentinel system support team will respond within 24 hours.
                  </div>

                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Describe your inquiry</label>
                      <textarea
                        rows={3}
                        value={supportMsg}
                        onChange={(e) => setSupportMsg(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[13px] text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-sans resize-none"
                        required
                        disabled={supportSent}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSupportOpen(false)}
                        className="px-4 py-2 border border-zinc-200 text-[12px] font-semibold text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer"
                        disabled={supportSent}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-zinc-950 text-white text-[12px] font-semibold hover:bg-zinc-900 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-70 cursor-pointer"
                        disabled={supportSent}
                      >
                        {supportSent ? (
                          <>
                            <Check size={14} />
                            <span>Submitted!</span>
                          </>
                        ) : (
                          'Send Request'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
