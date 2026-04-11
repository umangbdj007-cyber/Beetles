'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useSocket } from '@/components/SocketProvider';
import Link from 'next/link';

export default function StudentDashboard() {
  const { socket } = useSocket();
  const [user, setUser] = useState(null);
  
  // Widgets Data
  const [nearestEvent, setNearestEvent] = useState(null);
  const [occupancy, setOccupancy] = useState({ Library: 0, Canteen: 0 });
  const [heatmap, setHeatmap] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const id = localStorage.getItem('userId');
    setUser({ role, name, id });

    fetchData();

    if (socket) {
      socket.on('event:update', fetchNearestEvent);
      socket.on('occupancy:update', (data) => {
        setOccupancy(prev => ({ ...prev, [data.locationId]: data.occupancyPercentage }));
      });
      socket.on('assignment:new', () => { fetchAssignments(); fetchHeatmap(); });
      socket.on('new_announcement', (ann) => {
        setAnnouncements(prev => [ann, ...prev]);
      });
    }

    return () => {
      if (socket) {
        socket.off('event:update');
        socket.off('occupancy:update');
        socket.off('assignment:new');
        socket.off('new_announcement');
      }
    };
  }, [socket]);

  const fetchData = async () => {
    fetchNearestEvent();
    fetchAssignments();
    fetchHeatmap();
    api.get('/announcements').then(res => setAnnouncements(res.data)).catch(console.error);
    api.get('/occupancy/Library').then(res => setOccupancy(p => ({...p, Library: res.data.occupancyPercentage||0}))).catch(console.error);
    api.get('/occupancy/Canteen').then(res => setOccupancy(p => ({...p, Canteen: res.data.occupancyPercentage||0}))).catch(console.error);
  };

  const fetchNearestEvent = () => api.get('/events/nearest').then(res => setNearestEvent(res.data)).catch(console.error);
  const fetchAssignments = () => api.get('/assignments').then(res => setAssignments(res.data)).catch(console.error);
  const fetchHeatmap = () => api.get('/assignments/workload/heatmap').then(res => setHeatmap(res.data)).catch(console.error);

  const handleSubmitAssignment = async (id) => {
    const content = prompt("Paste your submission URI / Content:");
    if (!content) return;
    try {
      await api.post(`/assignments/${id}/submit`, { content });
      alert('Submission successful.');
      fetchAssignments();
      fetchHeatmap();
    } catch(err) { alert(err.response?.data?.msg || 'Error'); }
  };

  const getHeatmapColor = (colorCode) => {
    if (colorCode === 'Green') return 'bg-tertiary-container/30 border-transparent';
    if (colorCode === 'Yellow') return 'bg-yellow-500/40 border-yellow-500/20';
    if (colorCode === 'Red') return 'pulse-red shadow-[0_0_15px_rgba(255,180,171,0.4)] border-error/50';
    return 'bg-tertiary-container/10';
  };

  if(!user) return null;

  return (
    <div className="w-full p-6 md:p-10 max-w-[1600px] mx-auto pb-24">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Student Nexus
        </h1>
        <p className="text-zinc-400 font-medium mt-2">Welcome back, {user.name}. Your ecosystem is mapped.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Heatmap & Inbox */}
        <div className="md:col-span-8 flex flex-col gap-8">
           
           {/* Workload Heatmap */}
           <section className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 flex flex-col justify-between border border-outline-variant/10 relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
              <div className="flex justify-between items-start mb-6">
                 <h3 className="font-headline font-bold text-2xl tracking-tight text-on-surface">Workload Predictor</h3>
                 <span className="px-3 py-1 bg-secondary-container text-secondary-fixed text-[10px] font-black uppercase tracking-widest rounded-full">Aggregated Load</span>
              </div>
              
              <div className="flex flex-wrap gap-2 md:gap-3 mb-8 min-h-[60px]">
                 {heatmap.length === 0 && <div className="py-4 text-xs text-zinc-500">No active workloads. You are free.</div>}
                 {heatmap.map(day => (
                     <div key={day.date} className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold opacity-90 border ${getHeatmapColor(day.colorCode)} cursor-help relative group`} title={day.items.join(', ')}>
                         {day.colorCode === 'Red' && (
                           <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                           </span>
                         )}
                         {new Date(day.date).getDate()}
                     </div>
                 ))}
              </div>
           </section>

           {/* Assignments Inbox */}
           <section className="bg-surface-container rounded-[2rem] p-6 border border-outline-variant/10">
              <h3 className="font-headline font-bold text-2xl tracking-tight mb-6">Active Deployments</h3>
              <div className="space-y-4">
                 {assignments.length === 0 && <p className="text-zinc-500 text-sm">Inbox empty.</p>}
                 {assignments.map(a => {
                    const submitted = a.submissions?.some(s => s.student === user.id);
                    return (
                      <div key={a._id} className="bg-surface-container-high p-5 rounded-2xl border border-outline-variant/10 flex justify-between items-center group hover:bg-surface-container-highest transition-colors">
                         <div>
                            <div className="flex gap-2 items-center mb-1">
                               <span className="text-[10px] font-black uppercase tracking-widest text-primary">{a.subject}</span>
                               <span className={`text-[9px] uppercase tracking-widest px-2 py-[2px] rounded-sm ${a.difficultyLevel==='High'?'bg-red-500/20 text-red-500':a.difficultyLevel==='Medium'?'bg-yellow-500/20 text-yellow-500':'bg-green-500/20 text-green-500'}`}>{a.difficultyLevel}</span>
                            </div>
                            <h4 className="font-headline font-bold text-lg text-on-surface">{a.title}</h4>
                            <p className="text-xs text-zinc-500 mt-1">Due: {new Date(a.deadline).toLocaleString()}</p>
                         </div>
                         <button onClick={() => handleSubmitAssignment(a._id)} disabled={submitted} className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${submitted ? 'bg-surface-container-highest text-zinc-600 cursor-not-allowed' : 'bg-primary text-on-primary hover:brightness-110 shadow-lg'}`}>
                            {submitted ? 'Verified' : 'Turn In'}
                         </button>
                      </div>
                    )
                 })}
              </div>
           </section>

        </div>

        {/* RIGHT COLUMN: Feed, Elements */}
        <div className="md:col-span-4 flex flex-col gap-8">
           
           {/* Nearest Event */}
           <Link href="/events" className="group relative overflow-hidden rounded-[2rem] bg-surface-container-low p-6 transition-all duration-300 hover:bg-surface-container-high hover:-translate-y-1 active:scale-95 border border-outline-variant/10 hover:border-secondary/30 block">
              <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20"></div>
              </div>
              <div className="relative z-10">
                <span className="material-symbols-outlined text-4xl text-secondary mb-4" style={{fontVariationSettings: "'FILL' 1"}}>event</span>
                <h3 className="text-2xl font-black font-headline mb-2 text-secondary">Events</h3>
                <p className="text-on-surface text-sm mb-6 max-w-xs font-body leading-relaxed">
                   {nearestEvent?.name ? `Next up: ${nearestEvent.name} at ${nearestEvent.location}.` : 'No upcoming events broadcasted.'}
                </p>
                <div className="mt-auto">
                  {nearestEvent?.name && (
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-black uppercase tracking-widest shadow-lg">
                      {nearestEvent.status === 'ONGOING' && <span className="w-2 h-2 rounded-full bg-secondary mr-2 animate-pulse"></span>}
                      {nearestEvent.status === 'ONGOING' ? 'LIVE NOW' : 'NEXT'}
                    </span>
                  )}
                </div>
              </div>
           </Link>

           {/* Occupancy */}
           <section className="bg-surface-container rounded-[2rem] p-6 border border-outline-variant/10 flex flex-col gap-4">
              <h3 className="font-headline font-bold text-xl">Campus Density</h3>
              <div className="flex gap-4 items-center justify-around">
                 <div className="text-center group">
                    <div className="relative w-20 h-20 flex items-center justify-center mb-2 mx-auto">
                      <svg className="w-full h-full -rotate-90">
                        <circle className="text-surface-container-highest" cx="40" cy="40" fill="transparent" r="32" stroke="currentColor" strokeWidth="6"></circle>
                        <circle cx="40" cy="40" fill="transparent" r="32" stroke="#c9beff" strokeDasharray="201" strokeDashoffset={201 - (201 * (occupancy.Library / 100))} strokeLinecap="round" strokeWidth="6" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}></circle>
                      </svg>
                      <span className="absolute text-lg font-black font-headline text-on-surface">{occupancy.Library}%</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 group-hover:text-primary transition-colors">Library</span>
                 </div>
                 <div className="w-px h-16 bg-outline-variant/20"></div>
                 <div className="text-center group">
                    <div className="relative w-20 h-20 flex items-center justify-center mb-2 mx-auto">
                      <svg className="w-full h-full -rotate-90">
                        <circle className="text-surface-container-highest" cx="40" cy="40" fill="transparent" r="32" stroke="currentColor" strokeWidth="6"></circle>
                        <circle cx="40" cy="40" fill="transparent" r="32" stroke="#ffaedd" strokeDasharray="201" strokeDashoffset={201 - (201 * (occupancy.Canteen / 100))} strokeLinecap="round" strokeWidth="6" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}></circle>
                      </svg>
                      <span className="absolute text-lg font-black font-headline text-on-surface">{occupancy.Canteen}%</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 group-hover:text-secondary transition-colors">Canteen</span>
                 </div>
              </div>
           </section>

           {/* Announcement Stream */}
           <section className="bg-surface-container rounded-[2rem] p-6 border border-outline-variant/10 max-h-[300px] flex flex-col">
              <h3 className="font-headline font-bold text-xl mb-4">Feed</h3>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                 {announcements.map(ann => (
                    <div key={ann._id} className="border-l-2 border-primary/50 pl-4 py-1">
                       <h5 className="text-sm font-bold text-on-surface">{ann.title}</h5>
                       <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{ann.content}</p>
                    </div>
                 ))}
              </div>
           </section>

        </div>
      </div>
    </div>
  );
}
