'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  // Don't render sidebar on auth pages
  if (pathname === '/login' || pathname === '/register') return null;

  const isActive = (path) => pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: 'dashboard', disabled: false },
    { name: 'Academic', path: '/academic', icon: 'school', disabled: false },
    { name: 'Events', path: '/events', icon: 'event', disabled: false },
    { name: 'Marketplace', path: '/marketplace', icon: 'storefront', disabled: false },
    { name: 'Student Core', path: '/student-core', icon: 'person', disabled: false, fill: 1 },
    { name: 'Complaints', path: '/complaints', icon: 'report_problem', disabled: false },
    { name: 'Chat', path: '/chat', icon: 'forum', disabled: false }
  ];

  return (
    <>
      <aside className="h-full w-64 fixed left-0 top-0 hidden lg:flex flex-col bg-[#131313] py-6 px-4 z-40 border-r border-outline-variant/10">
        <div className="mb-10 px-4 mt-6">
          <Link href="/" className="text-xl font-black text-[#c9beff] font-headline tracking-tighter hover:text-primary transition-colors">UniGrid</Link>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">The Neon Academic</p>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              href={link.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out cursor-pointer ${
                isActive(link.path) 
                ? 'bg-gradient-to-r from-[#6b4af6]/20 to-transparent text-[#c9beff] border-l-4 border-[#c9beff] rounded-l-none' 
                : 'text-gray-500 hover:bg-[#2a2a2a] hover:text-[#ffaedd]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: `'FILL' ${link.fill || (isActive(link.path) ? 1 : 0)}`}}>{link.icon}</span>
              <span className="font-medium text-sm">{link.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto border-t border-outline-variant/15 pt-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-[#2a2a2a] hover:text-[#ffaedd] rounded-xl transition-all cursor-pointer" onClick={() => { localStorage.clear(); window.location.href='/login'; }}>
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-medium text-sm">Logout</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-[#131313]/90 backdrop-blur-xl border-t border-outline-variant/10 z-50">
        <div className="flex justify-around items-center h-16">
          {navLinks.filter(l => ['/', '/academic', '/student-core', '/chat'].includes(l.path)).map(link => (
            <Link key={link.path} href={link.path} className={`flex flex-col items-center gap-1 ${isActive(link.path) ? 'text-primary' : 'text-gray-500 hover:text-secondary'}`}>
              <span className="material-symbols-outlined" style={{fontVariationSettings: `'FILL' ${link.fill || (isActive(link.path) ? 1 : 0)}`}}>{link.icon}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
