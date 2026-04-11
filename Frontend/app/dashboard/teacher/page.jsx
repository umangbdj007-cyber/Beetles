'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function TeacherDashboard() {
  const [user, setUser] = useState(null);
  
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ title: '', subject: '', description: '', deadline: '', difficultyLevel: 'Medium', assignedTo: [] });
  const [announcementMsg, setAnnouncementMsg] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    setUser({ role, name });

    if (role === 'Teacher' || role === 'Admin') {
       fetchAssignments();
       api.get('/assignments/students').then(res => setStudents(res.data)).catch(console.error);
    }
  }, []);

  const fetchAssignments = () => api.get('/assignments').then(res => setAssignments(res.data)).catch(console.error);

  const handleDeployAssignment = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, assignedTo: formData.assignedTo.length ? formData.assignedTo : students.map(s => s._id) };
      await api.post('/assignments', payload);
      alert('Deployment executed successfully across student clusters.');
      fetchAssignments();
      setFormData({ title: '', subject: '', description: '', deadline: '', difficultyLevel: 'Medium', assignedTo: [] });
    } catch(err) { alert('Deployment failed: ' + (err.response?.data?.msg || err.message)); }
  };

  const handleBroadcastAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementMsg) return;
    try {
      await api.post('/announcements', { title: `Update from ${user.name}`, content: announcementMsg });
      setAnnouncementMsg('');
      alert('Broadcast transmitted across the network.');
    } catch(err) { alert('Transmission failed'); }
  };

  if (!user) return null;

  return (
    <div className="w-full p-6 md:p-10 max-w-[1600px] mx-auto pb-24">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          Instructor Center
        </h1>
        <p className="text-zinc-400 font-medium mt-2">Manage workloads, analyze class matrices, and broadcast parameters.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* LEFT PRIMARY AREA: Assignment Creation */}
         <div className="lg:col-span-8 flex flex-col gap-8">
            <section className="bg-surface-container rounded-[2rem] p-6 lg:p-8 border border-outline-variant/20 shadow-2xl relative overflow-hidden group">
               {/* Neon Header */}
               <div className="flex justify-between items-center mb-8 border-b border-outline-variant/10 pb-6">
                 <div>
                    <h2 className="text-3xl font-black font-headline text-on-surface tracking-tight mb-1 flex items-center gap-3">
                       <span className="material-symbols-outlined text-primary text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>assignment_add</span>
                       Assignment Engine
                    </h2>
                    <p className="text-secondary font-bold text-sm tracking-widest uppercase">Targeted Workload Deployment</p>
                 </div>
               </div>

               <form onSubmit={handleDeployAssignment} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Title</label>
                        <input required placeholder="E.g., Quantum Algorithm Analysis" className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Subject Mapping</label>
                        <input required placeholder="E.g., CS-401" className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Task Parameters</label>
                     <textarea placeholder="Outline the computational or logical requirements..." rows="3" className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary outline-none resize-none transition-all" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Deadline Frame</label>
                        <input required type="datetime-local" className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-zinc-300" value={formData.deadline} onChange={e=>setFormData({...formData, deadline: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Difficulty Load</label>
                        <select className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all" value={formData.difficultyLevel} onChange={e=>setFormData({...formData, difficultyLevel: e.target.value})}>
                           <option>Low</option>
                           <option>Medium</option>
                           <option>High</option>
                        </select>
                     </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-outline-variant/10">
                     <label className="text-xs font-black uppercase text-zinc-500 tracking-widest block mb-2 mt-4">Target Sub-clusters (Optional)</label>
                     <select multiple className="w-full h-32 bg-surface-container-highest border border-outline-variant/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary outline-none custom-scrollbar" onChange={e => setFormData({...formData, assignedTo: Array.from(e.target.selectedOptions, option => option.value)})}>
                       {students.map(s => <option key={s._id} value={s._id} className="p-2 mb-1 hover:bg-primary/20 rounded-lg">{s.name} ({s.email})</option>)}
                     </select>
                     <p className="text-[10px] text-zinc-500 mt-2">Leave unselected to automatically deploy to the entire active computing grid.</p>
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(107,74,246,0.4)] hover:brightness-110 active:scale-95 transition-all mt-4">
                     Execute Global Deployment
                  </button>
               </form>
            </section>
         </div>

         {/* RIGHT SECONDARY AREA: Stats & Broadcasts */}
         <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Global Broadcast */}
            <section className="bg-surface-container rounded-[2rem] p-6 border border-outline-variant/10">
               <h3 className="font-headline font-bold text-xl mb-4 flex items-center gap-2">
                 <span className="material-symbols-outlined text-secondary">campaign</span>
                 System Broadcast
               </h3>
               <form onSubmit={handleBroadcastAnnouncement}>
                 <textarea required rows="4" placeholder="Transmit a network-wide ping to all active terminals..." className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl p-4 text-sm focus:ring-1 focus:ring-secondary outline-none resize-none" value={announcementMsg} onChange={e=>setAnnouncementMsg(e.target.value)}></textarea>
                 <button type="submit" className="w-full py-3 mt-3 bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary hover:text-on-secondary font-bold text-xs uppercase tracking-widest rounded-xl transition-all">
                   Ping Network
                 </button>
               </form>
            </section>

            {/* Matrix Tracker (Recent Deployments) */}
            <section className="bg-surface-container rounded-[2rem] p-6 border border-outline-variant/10 flex-1 flex flex-col">
               <h3 className="font-headline font-bold text-xl mb-4 text-on-surface">Matrix Tracking</h3>
               <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar max-h-[500px] pr-2">
                 {assignments.map(a => {
                    const totalTargeted = a.assignedTo?.length || 1;
                    const totalSubmitted = a.submissions?.length || 0;
                    const completionPct = Math.round((totalSubmitted / totalTargeted) * 100) || 0;

                    return (
                      <div key={a._id} className="bg-surface-container-highest p-4 rounded-xl border border-outline-variant/5">
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="font-headline font-bold text-sm truncate pr-2">{a.title}</h4>
                           <span className="text-[9px] uppercase tracking-widest font-black text-primary bg-primary/10 px-2 py-1 rounded-sm">{a.subject}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3">
                           <div className="flex-1 h-2 bg-surface-container-low border border-outline-variant/10 rounded-full overflow-hidden">
                              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${completionPct}%` }}></div>
                           </div>
                           <span className="text-xs font-bold text-zinc-400 w-8">{completionPct}%</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">{totalSubmitted} of {totalTargeted} Terminals Completed</p>
                      </div>
                    )
                 })}
               </div>
            </section>

         </div>
      </div>
    </div>
  );
}
