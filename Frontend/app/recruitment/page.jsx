'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function RecruitmentDashboard() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Note: Only teachers/admins should structurally use this, but for testing we assume the current user is Authorized
  useEffect(() => {
    api.get('/clubs').then(res => {
      setClubs(res.data);
      if(res.data.length > 0) setSelectedClub(res.data[0]._id);
      setLoading(false);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedClub) {
      api.get(`/recruitment/${selectedClub}`).then(res => setApplications(res.data)).catch(console.error);
    }
  }, [selectedClub]);

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('applId');
    // Local Optimistic update
    setApplications(prev => prev.map(a => a._id === id ? { ...a, status: targetStatus } : a));
    // Backend API
    try {
      await api.put(`/recruitment/${id}/status`, { status: targetStatus });
    } catch(err) {
      alert('Error updating recruitment status! Admin role required to shift pipelines.');
    }
  };

  const allowDrop = (e) => e.preventDefault();

  if(loading) return <div className="p-10 text-white">Loading Pipelines...</div>;

  const STATUSES = ['Candidate', 'Interview Scheduled', 'Selected', 'Rejected'];

  return (
    <div className="w-full p-6 md:p-10 max-w-[1600px] mx-auto h-[100vh] flex flex-col">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-extrabold font-headline text-on-surface">Recruitment Kanban</h2>
          <p className="text-zinc-500 font-medium">Pipeline infrastructure for society tracking.</p>
        </div>
        <select 
          className="bg-surface-container-high border-none outline-none rounded-xl px-6 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary shadow-lg"
          value={selectedClub} onChange={e => setSelectedClub(e.target.value)}
        >
          {clubs.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </header>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {STATUSES.map(status => (
          <div 
            key={status} 
            className="flex-shrink-0 w-80 bg-surface-container-low rounded-[2rem] border border-outline-variant/10 p-5 flex flex-col pt-6 relative"
            onDrop={(e) => handleDrop(e, status)}
            onDragOver={allowDrop}
          >
             <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6 flex justify-between px-2">
               {status}
               <span className="text-on-surface-variant font-bold bg-surface-container px-2 rounded-full">
                  {applications.filter(a => a.status === status).length}
               </span>
             </h3>
             
             <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {applications.filter(a => a.status === status).map(appl => (
                   <div 
                     key={appl._id} 
                     draggable
                     onDragStart={e => e.dataTransfer.setData('applId', appl._id)}
                     className="bg-surface-container-high p-5 rounded-2xl shadow-xl border border-outline-variant/10 cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-all group"
                   >
                     <div className="flex items-center justify-between mb-3">
                       <span className="text-[9px] uppercase tracking-widest font-black text-secondary bg-secondary/10 px-2 py-1 rounded-sm">{appl.roleAppliedFor}</span>
                       {appl.student?.societyVerified && <span className="material-symbols-outlined text-green-400 text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>}
                     </div>
                     <h4 className="text-on-surface font-headline font-bold">{appl.student?.name || 'Unknown Student'}</h4>
                     <p className="text-xs text-zinc-500 mt-1">{appl.student?.email || 'N/A'}</p>
                   </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
