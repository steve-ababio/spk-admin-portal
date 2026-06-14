"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/src/components/layout/Sidebar';
import TopNav from '@/src/components/layout/TopNav';
import authService from '@/src/services/authService';
import { UserRole } from '../common/types/types';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phoneNumber?: string;
  profilePicture?: string | null;
  role?: string;
}

interface UserContextType {
  user: UserProfile | null;
  logout: () => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  logout: async () => {},
  loading: true,
});

export const useUser = () => useContext(UserContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const data = await authService.getCurrentUser();
      if (!data || !data.email) {
        throw new Error('Not authenticated');
      }
      const isAdmin = data.role === UserRole.ADMIN;

      if (!isAdmin) {
        // Automatically logout and redirect
        await authService.logout();
        router.push('/login?error=role');
        return;
      }

      setUser(data);
    } catch (err) {

      console.error('Session validation failed:', err);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          <span className="text-[12px] text-zinc-500 font-semibold tracking-tight">Validating session...</span>
        </div>
      </div>
    );
  }

  // Render dashboard layout only if user is authorized admin
  if (!user) {
    return null;
  }

  return (
    <UserContext.Provider value={{ user, logout: handleLogout, loading }}>
      <div className="min-h-screen bg-surface antialiased">
        <Sidebar />
        <div className="ml-64">
          <TopNav />
          <main className="pt-24 px-container-padding min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </UserContext.Provider>
  );
}
