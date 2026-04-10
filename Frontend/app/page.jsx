'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSocket } from '@/components/SocketProvider';
import api from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const { socket } = useSocket();
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnContent, setNewAnnContent] = useState('');
  const [nearestEvent, setNearestEvent] = useState(null);
  const [occupancy, setOccupancy] = useState({ Library: 0, Canteen: 0 });

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

  useEffect(() => {
    if (!socket) return;
    
    socket.on('new_announcement', (announcement) => {
      setAnnouncements(prev => [announcement, ...prev]);
    });

    socket.on('event:update', (updatedEvent) => {
      fetchNearestEvent(); // Refresh nearest event when there's an update
    });

    socket.on('occupancy:update', (data) => {
      setOccupancy(prev => ({ ...prev, [data.locationId]: data.occupancyPercentage }));
    });

    api.get('/announcements').then(res => setAnnouncements(res.data)).catch(err => console.error(err));
    fetchNearestEvent();
    fetchOccupancy('Library');
    fetchOccupancy('Canteen');

    return () => {
      socket.off('new_announcement');
      socket.off('event:update');
      socket.off('occupancy:update');
    };
  }, [socket]);

  const fetchNearestEvent = () => {
    api.get('/events/nearest').then(res => setNearestEvent(res.data)).catch(err => console.error(err));
  };

  const fetchOccupancy = (loc) => {
    api.get(`/occupancy/${loc}`).then(res => {
      setOccupancy(prev => ({ ...prev, [loc]: res.data.occupancyPercentage || 0 }));
    }).catch(err => console.error(err));
  };


  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', { title: 'Broadcast', content: newAnnContent });
      setNewAnnContent('');
    } catch (err) { alert('Failed to post announcement'); }
  };

  if (!user) return null;

  return (
    <div className="w-full flex-grow p-8 md:p-12 pb-32 max-w-[1920px] mx-auto min-h-[1024px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area: Module Cards */}
        <div className="lg:col-span-8">
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter mb-2 text-on-surface">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{user.name.split(' ')[0]}</span>
            </h1>
            <p className="text-on-surface-variant font-medium text-lg">Your academic ecosystem is active. You are logged in as {user.role}.</p>
          </header>
          
          {/* Bento Grid Layout for Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Academic Module */}
            <Link href="/academic" className="group relative overflow-hidden rounded-[2rem] bg-surface-container-low p-6 transition-all duration-300 hover:bg-surface-container-high hover:-translate-y-1 active:scale-95 border border-outline-variant/10 hover:border-primary/30 cursor-pointer">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all pointer-events-none"></div>
              <div className="mb-4 text-primary">
                <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>school</span>
              </div>
              <h3 className="text-2xl font-bold font-headline mb-2 text-on-surface">Academic</h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed font-body">Check grades, attendance, and semester schedules.</p>
              <div className="flex items-center text-xs font-bold text-primary tracking-widest uppercase mb-2">
                Open Portal <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
              </div>
            </Link>

            {/* Events Module */}
            <Link href="/events" className="group relative overflow-hidden rounded-[2rem] bg-surface-container-low p-6 transition-all duration-300 hover:bg-surface-container-high hover:-translate-y-1 active:scale-95 lg:col-span-2 border border-outline-variant/10 hover:border-secondary/30 cursor-pointer">
              <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20"></div>
              </div>
              <div className="relative z-10 h-full flex flex-col pt-2">
                <div className="mb-4 text-secondary">
                  <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>event</span>
                </div>
                <h3 className="text-3xl font-black font-headline mb-2 text-secondary">Events</h3>
                <p className="text-on-surface text-sm mb-6 max-w-xs font-body leading-relaxed">
                   {nearestEvent?.name ? `Next up: ${nearestEvent.name} at ${nearestEvent.location}.` : 'No upcoming events broadcasted.'}
                </p>
                <div className="mt-auto">
                  {nearestEvent?.name && (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-black uppercase tracking-widest shadow-lg">
                      {nearestEvent.status === 'ONGOING' && <span className="w-2 h-2 rounded-full bg-secondary mr-2 animate-pulse"></span>}
                      {nearestEvent.status === 'ONGOING' ? 'LIVE NOW' : 'UPCOMING'}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Marketplace Module */}
            <Link href="/marketplace" className="group relative overflow-hidden rounded-[2rem] bg-surface-container-low p-6 transition-all duration-300 hover:bg-surface-container-high hover:-translate-y-1 active:scale-95 border border-outline-variant/10 hover:border-tertiary/30 cursor-pointer">
              <div className="mb-4 text-tertiary">
                <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>storefront</span>
              </div>
              <h3 className="text-2xl font-bold font-headline mb-2 text-on-surface">Marketplace</h3>
              <p className="text-on-surface-variant text-sm mb-6 font-body leading-relaxed">Buy, sell, or trade textbooks and dorm essentials.</p>
              <div className="flex -space-x-2 mt-auto">
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest"></div>
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest"></div>
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] text-tertiary font-bold">+12</div>
              </div>
            </Link>

            {/* Student Core */}
            <Link href="/student-core" className="group relative overflow-hidden rounded-[2rem] bg-surface-container-low p-6 transition-all duration-300 hover:bg-surface-container-high hover:-translate-y-1 active:scale-95 border border-outline-variant/10 hover:border-primary-fixed-dim/30 cursor-pointer">
              <div className="mb-4 text-primary-fixed-dim">
                <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>person</span>
              </div>
              <h3 className="text-2xl font-bold font-headline mb-2 text-on-surface">Student Core</h3>
              <p className="text-on-surface-variant text-sm font-body leading-relaxed">Your digital ID, housing permits, and meal plan points.</p>
            </Link>

            {/* Complaints */}
            <Link href="/complaints" className="group relative overflow-hidden rounded-[2rem] bg-surface-container-low p-6 transition-all duration-300 hover:bg-surface-container-high hover:-translate-y-1 active:scale-95 border border-outline-variant/10 hover:border-error/30 cursor-pointer">
              <div className="mb-4 text-error">
                <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>report_problem</span>
              </div>
              <h3 className="text-2xl font-bold font-headline mb-2 text-on-surface">Complaints</h3>
              <p className="text-on-surface-variant text-sm font-body leading-relaxed">Raise issues securely or track the resolution of campus maintenance requirements.</p>
            </Link>

            {/* Chat */}
            <Link href="/chat" className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-container/40 to-surface-container-low p-6 transition-all duration-300 hover:shadow-[0_10px_30px_rgb(201,190,255,0.15)] hover:-translate-y-1 active:scale-95 md:col-span-2 lg:col-span-1 border border-primary/20 cursor-pointer">
              <div className="mb-4 text-on-primary-container">
                <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>forum</span>
              </div>
              <h3 className="text-2xl font-bold font-headline mb-2 text-on-surface">Global Chat</h3>
              <p className="text-on-surface-variant text-sm font-body leading-relaxed mb-6">Stay connected with your classmates and study groups in real-time.</p>
              <div className="mt-auto flex gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-primary/50"></span>
                <span className="w-2 h-2 rounded-full bg-primary/20"></span>
              </div>
            </Link>

          </div>

          {/* Custom Gauge Section */}
          <section className="mt-12 p-8 rounded-[2rem] bg-surface-container-lowest border border-outline-variant/15 hover:border-primary/20 transition-all duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-black font-headline mb-2 text-on-surface tracking-tight">Campus Occupancy</h2>
                <p className="text-on-surface-variant text-sm max-w-xs font-body leading-relaxed">Systematic load balancing for the library and fitness centers across all interactive campus sectors.</p>
              </div>
              <div className="flex gap-12">
                <div className="text-center">
                  <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-surface-container-highest" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                      <circle cx="48" cy="48" fill="transparent" r="40" stroke="url(#gradient-primary)" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (occupancy.Library / 100))} strokeLinecap="round" strokeWidth="8" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}></circle>
                      <defs>
                        <linearGradient id="gradient-primary" x1="0%" x2="100%" y1="0%" y2="100%">
                          <stop offset="0%" stopColor="#c9beff"></stop>
                          <stop offset="100%" stopColor="#ffaedd"></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="absolute text-xl font-black font-headline text-on-surface">{occupancy.Library}%</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant">Library</span>
                </div>
                <div className="text-center">
                  <div className="relative w-24 h-24 flex items-center justify-center mb-2">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-surface-container-highest" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                      <circle cx="48" cy="48" fill="transparent" r="40" stroke="#ffaedd" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (occupancy.Canteen / 100))} strokeLinecap="round" strokeWidth="8" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}></circle>
                    </svg>
                    <span className="absolute text-xl font-black font-headline text-on-surface">{occupancy.Canteen}%</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant">Canteen</span>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Sidebar: Announcements & Admin Broadcast */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Admin Broadcast Form */}
          {(user.role === 'Admin' || user.role === 'Teacher') && (
            <div className="bg-surface-container-low/40 backdrop-blur-3xl p-6 rounded-[2rem] border border-primary/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-primary-container/30 text-primary border border-primary/20">
                    <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>campaign</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black font-headline tracking-tight text-on-surface">Teacher Console</h2>
                    <p className="text-[10px] uppercase tracking-widest text-primary/70 font-bold">Broadcast to nexus</p>
                  </div>
                </div>
                <form onSubmit={handlePostAnnouncement} className="space-y-4">
                  <textarea required value={newAnnContent} onChange={e=>setNewAnnContent(e.target.value)} className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-2xl text-sm p-4 focus:ring-1 focus:ring-primary outline-none placeholder:text-on-surface-variant/40 resize-none h-24 font-body text-on-surface" placeholder="What's the update today?"></textarea>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 text-zinc-500">
                       {/* Placeholder for attachments icon aesthetics */}
                       <span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary transition-colors">attach_file</span>
                    </div>
                    <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary text-sm font-black tracking-widest uppercase active:scale-95 transition-transform shadow-[0_5px_15px_rgba(107,74,246,0.3)]">
                      Broadcast
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Announcements Feed */}
          <div className="flex-1 flex flex-col bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold font-label uppercase tracking-[0.2em] text-on-surface-variant">Live Feed</h2>
              <span className="text-[9px] font-black tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20 shadow-[0_0_10px_rgba(201,190,255,0.2)]">AUTO-REFRESHING</span>
            </div>
            
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 no-scrollbar">
              {announcements.length === 0 && <p className="text-sm text-zinc-500 italic">Listening for transmissions...</p>}
              
              {announcements.map((ann, idx) => {
                 // Alternate border colors algorithmically based on idx
                 const colors = ['border-secondary/50', 'border-primary/50', 'border-tertiary/50'];
                 const colorClass = colors[idx % 3];
                 
                 return (
                   <div key={idx} className={`p-5 rounded-2xl bg-surface-container-high border-l-4 ${colorClass} hover:bg-surface-container-highest transition-colors cursor-pointer group shadow-sm`}>
                     <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary-fixed-dim opacity-70 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_5px_rgba(201,190,255,0.3)]">
                           {ann.author?.name || 'ADMIN SYSTEM'}
                       </span>
                       <span className="text-[10px] font-bold text-zinc-500">{new Date(ann.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                     <p className="text-sm text-on-surface leading-snug font-medium line-clamp-3">{ann.content}</p>
                   </div>
                 )
              })}
            </div>
          </div>

        </aside>
      </div>

    </div>
  );
}
