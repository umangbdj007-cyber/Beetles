'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootRouter() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      router.push('/login');
    } else if (role) {
      router.push(`/dashboard/${role.toLowerCase()}`);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
      <div className="flex flex-col items-center gap-4">
         <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
         <p className="font-headline font-bold text-sm tracking-widest uppercase opacity-50">Mapping neural pathways...</p>
      </div>
    </div>
  );
}
