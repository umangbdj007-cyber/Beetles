'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    
    if (!token) {
      router.push('/login');
    } else {
      setUser({ role, name });
    }
  }, [router]);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 flex gap-4">
        <DashboardLayout user={user} />
      </div>
    </div>
  );
}
