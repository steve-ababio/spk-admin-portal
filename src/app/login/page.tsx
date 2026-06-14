"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { Loader, Lock, Mail } from 'lucide-react';
import authService from '@/src/services/authService';
import { UserRole } from '../common/types/types';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if redirect was due to role failure
    if (searchParams.get('error') === 'role') {
      setError('Access denied. Regular user accounts are not permitted to access the admin portal.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Perform login
      const res = await authService.login({ email, password });
      if (res && res.sessionId) {
        // 2. Fetch user profile to verify role
        const profile = await authService.getCurrentUser();
        if (!profile || !profile.email) {
          throw new Error('Could not fetch user profile.');
        }
        const isAdmin = profile.role === UserRole.ADMIN;
        if (!isAdmin) {
          // Deny access: Log user out and display error
          console.log("is admin: ",isAdmin)
          await authService.logout();
          setError('Access denied. Regular user accounts are not permitted to access the admin portal.');
          setLoading(false);
          return;
        }

        // Redirect to dashboard on success
        router.push('/');
      } else {
        setError('Invalid response from server.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Brand Header */}
      <div className="text-center mb-10">
        <h2 className="text-[28px] font-bold tracking-tight text-zinc-900 font-sans">Sentinel Admin</h2>
        <p className="text-[13px] text-zinc-400 mt-2 font-medium">Sign in to manage courses, curriculum, and faculty</p>
      </div>

      {/* Login Card - Clean flat style with white background */}
      <div className="bg-white p-2">
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-lg text-red-600 text-[12px] font-medium leading-relaxed">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2.5 text-[14px] text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-sans"
                placeholder="name@company.com"
                required
                disabled={loading}
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-400">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-white border border-zinc-200 rounded-lg pl-10 pr-4 py-2.5 text-[14px] text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-sans"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg py-3 text-[13px] font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={15} />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-[11px] text-zinc-400 font-medium">© 2026 Sentinel Prime K. All rights reserved.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex justify-center"
      >
        <Suspense fallback={
          <div className="flex flex-col items-center gap-3">
            <Loader className="animate-spin text-zinc-400" size={24} />
          </div>
        }>
          <LoginFormContent />
        </Suspense>
      </motion.div>
    </div>
  );
}
