'use client';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function PageWrapper({ children }) {
  const pathname = usePathname();
  const isAuth = pathname === '/login' || pathname === '/register';

  return (
    <div className="flex min-h-screen bg-background font-body text-on-surface selection:bg-primary selection:text-on-primary">
      {!isAuth && <Sidebar />}
      
      {/* If auth page, take full width. If dashboard page, push content to the right of the LG sidebar (256px = ml-64) */}
      <main className={`flex-1 w-full flex flex-col transition-all duration-300 ${!isAuth ? 'lg:ml-64 pb-20 lg:pb-0' : ''}`}>
        {children}
      </main>
    </div>
  );
}
