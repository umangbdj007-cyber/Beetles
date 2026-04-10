'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar({ user }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 w-full z-50 bg-[#131313]/90 backdrop-blur-xl bg-gradient-to-b from-[#2a2a2a]/40 to-transparent border-b border-outline-variant/10">
      <div className="flex justify-between items-center px-8 h-20 w-full max-w-[1920px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container font-headline border-r border-outline-variant/20 pr-8">
             UniGrid
          </Link>
          
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/" className="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300">Dashboard</Link>
            
            <div className="relative group">
               <Link href="/academic" className="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300">Academic</Link>
               <div className="absolute hidden group-hover:flex flex-col bg-surface-container-high border border-outline-variant/20 shadow-xl shadow-black/50 mt-1 rounded-xl text-sm w-32 py-2 z-50">
                   <Link href="/academic" className="px-4 py-2 hover:bg-surface-container-highest text-on-surface">Assignments</Link>
                   <Link href="/academic/classes" className="px-4 py-2 hover:bg-surface-container-highest text-on-surface">Timetable</Link>
               </div>
            </div>

            <Link href="/events" className="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300">Events</Link>
            <Link href="/marketplace" className="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300">Marketplace</Link>
            <Link href="/student-core" className="text-primary border-b-2 border-primary pb-1 font-bold font-headline tracking-tight">Student Core</Link>
            <Link href="/complaints" className="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300">Complaints</Link>
            <Link href="/chat" className="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-300">Chat</Link>
            {user?.role === 'Admin' && <Link href="/admin/users" className="text-error font-bold tracking-widest uppercase text-[10px]">Admin Users</Link>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant/15">
            <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
            <span className="font-bold text-sm text-on-surface pr-2">{user?.name} <span className="opacity-50 text-xs">({user?.role})</span></span>
          </div>

          <button onClick={handleLogout} className="p-2 rounded-full surface-container-high hover:bg-error-container text-on-surface-variant hover:text-error transition-colors" title="Logout">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>

      {/* Basic Mobile bottom bar matching Stitch layout, but kept hidden natively until fully developed */}
      <div className="md:hidden flex justify-around items-center h-16 bg-surface-container-lowest border-t border-outline-variant/10">
        <Link href="/academic" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined">school</span></Link>
        <Link href="/events" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined">event</span></Link>
        <Link href="/student-core" className="flex flex-col items-center gap-1 text-primary"><span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>person</span></Link>
        <Link href="/chat" className="flex flex-col items-center gap-1 text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined">forum</span></Link>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-error hover:text-error-container"><span className="material-symbols-outlined">logout</span></button>
      </div>
    </nav>
  );
}
