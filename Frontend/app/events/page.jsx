'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function EventsPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', startTime: '', endTime: '', location: '' });

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const id = localStorage.getItem('userId');
    setUser({ role, name, id });
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', formData);
      fetchEvents();
      setFormData({ name: '', description: '', startTime: '', endTime: '', location: '' });
    } catch (err) { alert(err.response?.data?.msg || 'Error creating event'); }
  };

  const registerEvent = async (id) => {
    try {
      await api.post(`/events/${id}/register`);
      fetchEvents();
    } catch (err) { alert(err.response?.data?.msg || 'Error registering'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/events/${id}/status`, { status });
      fetchEvents();
    } catch (err) {}
  };

  if(!user) return null;

  return (
    <div className="w-full p-6 md:p-10 pb-20 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-5xl md:text-6xl font-extrabold font-headline tracking-tighter text-on-surface mb-2">
             Campus <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Nexus</span>
          </h2>
          <p className="text-zinc-500 font-medium">Curated immersive experiences for the modern academic.</p>
        </div>
        <div className="px-6 py-2 rounded-full bg-surface-container-high border border-outline-variant/15 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_rgba(255,174,221,0.5)]"></span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface">{events.length} Live Events</span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Left: Timeline/Scrolling List */}
        <section className="col-span-12 lg:col-span-8 space-y-8">
          <div className="flex items-center gap-6">
             <h3 className="text-xl font-black font-headline uppercase tracking-[0.15em] text-primary">Timeline</h3>
             <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.length === 0 && <p className="text-zinc-500">No events propagating on the timeline...</p>}
            
            {events.filter(e => user.role === 'Admin' || e.approvalStatus === 'Approved' || user.role === 'Teacher' || e.createdBy === user.id).map(ev => {
               const isRegistered = ev.participants.includes(user.id);
               const start = new Date(ev.startTime);
               
               return (
                 <div key={ev._id} className="bg-surface-container-low/60 backdrop-blur-xl p-6 rounded-3xl border border-outline-variant/10 hover:bg-surface-container-high transition-all duration-300 relative overflow-hidden group">
                   
                   {ev.approvalStatus !== 'Approved' && (
                     <div className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        {ev.approvalStatus}
                     </div>
                   )}

                   <div className="flex justify-between items-start mb-6 w-full">
                     <div className="bg-surface-container-highest px-3 py-2 rounded-2xl text-center border border-outline-variant/10 shadow-inner">
                       <span className="block text-primary text-xl font-black font-headline leading-none">{start.getDate()}</span>
                       <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{start.toLocaleString('default', { month: 'short' })}</span>
                     </div>
                   </div>

                   <h5 className="text-xl font-black font-headline mb-2 pr-4">{ev.name}</h5>
                   <p className="text-zinc-400 text-sm mb-6 line-clamp-2 leading-relaxed">{ev.description}</p>
                   
                   <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-outline">
                         <span className="material-symbols-outlined text-[16px]">schedule</span>
                         {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-outline">
                         <span className="material-symbols-outlined text-[16px]">location_on</span>
                         {ev.location}
                      </div>
                   </div>

                   {/* Actions based on role */}
                   <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Attending: {ev.participants.length}</span>
                      </div>

                      {ev.approvalStatus === 'Approved' && user.role === 'Student' && (
                        <button 
                           onClick={() => registerEvent(ev._id)} 
                           disabled={isRegistered}
                           className={`text-sm font-black font-headline px-4 py-2 rounded-xl transition-all border ${
                             isRegistered 
                             ? 'bg-surface-container-highest text-zinc-500 border-none cursor-not-allowed' 
                             : 'text-primary border-primary/30 bg-primary/10 hover:bg-primary hover:text-on-primary'
                           }`}
                        >
                           {isRegistered ? 'Joined' : 'Register'}
                        </button>
                      )}

                      {user.role === 'Admin' && ev.approvalStatus === 'Pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateStatus(ev._id, 'Approved')} className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black transition-colors"><span className="material-symbols-outlined text-[18px]">check</span></button>
                          <button onClick={() => updateStatus(ev._id, 'Rejected')} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-black transition-colors"><span className="material-symbols-outlined text-[18px]">close</span></button>
                        </div>
                      )}
                   </div>
                 </div>
               )
            })}
          </div>
        </section>

        {/* Right: Event Submission Form */}
        <aside className="col-span-12 lg:col-span-4 sticky top-10">
          {(user.role === 'Admin' || user.role === 'Teacher' || user.role === 'Student') && (
            <div className="bg-surface-container rounded-[2rem] p-8 border border-outline-variant/10 shadow-2xl relative overflow-hidden">
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
               <div className="relative z-10">
                 <div className="mb-8">
                   <h3 className="text-2xl font-black font-headline tracking-tight text-on-surface">Schedule Event</h3>
                   <p className="text-zinc-500 text-sm font-medium">Broadcast your vision to the campus nexus.</p>
                 </div>
                 <form onSubmit={handleCreateEvent} className="space-y-5">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Event Name</label>
                       <input required className="w-full bg-surface-container-high border-none rounded-xl px-5 py-3 text-sm text-on-surface placeholder:text-zinc-600 focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Title" type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Start Time</label>
                          <input required type="datetime-local" className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.startTime} onChange={e=>setFormData({...formData, startTime: e.target.value})} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">End Time</label>
                          <input required type="datetime-local" className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none transition-all" value={formData.endTime} onChange={e=>setFormData({...formData, endTime: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Location</label>
                       <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-[18px]">map</span>
                          <input required className="w-full bg-surface-container-high border-none rounded-xl pl-11 pr-5 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Room / Venue" type="text" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Description</label>
                       <textarea required className="w-full bg-surface-container-high border-none rounded-xl px-5 py-3 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder="Describe the vibe..." rows="3" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-extrabold py-4 rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_5px_20px_rgba(107,74,246,0.3)]">
                       <span className="material-symbols-outlined">add_circle</span> Launch Event
                    </button>
                 </form>
               </div>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
}
