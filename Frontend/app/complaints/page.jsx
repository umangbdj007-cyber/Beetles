'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ComplaintsPage() {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState('My Complaints');

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    setUser({ role, name });
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaints', { title, description });
      fetchComplaints();
      setTitle(''); setDescription('');
      setActiveTab('My Complaints');
    } catch (err) { alert('Error posting complaint'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/complaints/${id}/status`, { status });
      fetchComplaints();
    } catch (err) { alert('Failed to update status'); }
  };

  if(!user) return null;
  const isLodgeMode = activeTab === 'Lodge New' && user.role === 'Student';
  const displayComplaints = complaints;

  return (
    <div className="w-full p-6 md:p-12 relative pb-32">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <header className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-label uppercase tracking-widest mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Encrypted Gateway Active
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter font-headline text-on-surface leading-none mb-4">
              Secure <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Complaints</span>
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed font-body max-w-xl">
              Your feedback is handled with military-grade encryption. Submit concerns or track ongoing resolutions in total privacy.
            </p>
          </div>
        </header>

        {/* Tabs Navigation */}
        <div className="flex gap-1 p-1 bg-surface-container-low border border-outline-variant/10 rounded-2xl w-fit mb-12">
          <button 
            onClick={() => setActiveTab('My Complaints')} 
            className={`px-8 py-3 rounded-xl font-headline font-bold text-sm transition-all ${!isLodgeMode ? 'bg-surface-container-highest text-primary shadow-xl border border-primary/20' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}
          >
            {user.role === 'Admin' ? 'All Complaints' : 'My Complaints'}
          </button>
          
          {user.role === 'Student' && (
            <button 
              onClick={() => setActiveTab('Lodge New')} 
              className={`px-8 py-3 rounded-xl font-headline font-bold text-sm transition-all ${isLodgeMode ? 'bg-surface-container-highest text-primary shadow-xl border border-primary/20' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}
            >
              Lodge New
            </button>
          )}
        </div>

        {/* Layout Content */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {isLodgeMode ? (
            <section className="col-span-12 lg:col-span-8">
              <div className="bg-surface-container-low backdrop-blur-xl rounded-[2rem] p-8 border border-outline-variant/10 relative overflow-hidden">
                 <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full"></div>
                 <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center border border-primary/20">
                      <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>add_moderator</span>
                    </div>
                    <h3 className="text-2xl font-black font-headline tracking-tight text-on-surface">Lodge New Report</h3>
                 </div>
                 <form onSubmit={handleCreate} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-label font-bold text-zinc-500 ml-1">Incident Title</label>
                       <input required className="w-full bg-surface-container p-4 rounded-xl border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body" placeholder="Brief subject of your concern..." type="text" value={title} onChange={e=>setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-widest font-label font-bold text-zinc-500 ml-1">Detailed Description</label>
                       <textarea required className="w-full bg-surface-container p-4 rounded-xl border border-outline-variant/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-body resize-none" placeholder="Describe the situation in detail..." rows="6" value={description} onChange={e=>setDescription(e.target.value)}></textarea>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                       <div className="flex items-center gap-2 text-zinc-500 font-bold">
                          <span className="material-symbols-outlined text-sm">lock</span>
                          <span className="text-xs font-label uppercase tracking-widest">Anonymous mode active</span>
                       </div>
                       <button type="submit" className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-extrabold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_-10px_rgba(107,74,246,0.5)]">
                          Submit Ticket
                       </button>
                    </div>
                 </form>
              </div>
            </section>
          ) : (
            <section className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black font-headline tracking-tight text-on-surface">Active Tickets</h3>
                  <span className="text-[10px] font-label font-black text-primary bg-primary/10 px-2 py-1 rounded-md">{displayComplaints.length} TOTAL</span>
                </div>
                
                {displayComplaints.length === 0 && <p className="text-zinc-500 text-sm">No encrypted tickets found in the ledger.</p>}

                <div className="space-y-4">
                  {displayComplaints.map(c => {
                     const isResolved = c.status === 'Resolved';
                     const isPending = c.status === 'Pending';
                     return (
                      <div key={c._id} className="group p-5 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-all duration-300 border border-outline-variant/5">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                             isPending ? 'bg-secondary-container/20 text-secondary border-secondary/20' :
                             isResolved ? 'bg-tertiary-container/20 text-tertiary border-tertiary/20' :
                             'bg-primary-container/20 text-primary border-primary/20'
                          }`}>
                            {c.status}
                          </span>
                          <span className="text-[10px] font-label text-zinc-600 font-bold">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-headline font-bold text-on-surface mb-2 group-hover:text-primary transition-colors pr-8">{c.title}</h4>
                        <p className="text-sm text-on-surface-variant font-body leading-relaxed mb-4">
                          {c.description}
                        </p>
                        
                        {user.role === 'Admin' && (
                          <div className="mt-4 pt-4 border-t border-outline-variant/10 flex flex-col gap-2">
                             <p className="text-[10px] uppercase font-bold tracking-widest text-outline">Author: {c.student?.name} ({c.student?.email})</p>
                             <select className="bg-surface-container-high border border-outline-variant/20 rounded-lg p-2 text-xs font-bold w-fit outline-none focus:border-primary" value={c.status} onChange={(e) => updateStatus(c._id, e.target.value)}>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                             </select>
                          </div>
                        )}
                      </div>
                     )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Right Column: Informational block */}
          <section className="col-span-12 lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-surface-container-highest to-surface-container border border-outline-variant/10">
              <p className="text-[10px] font-black text-zinc-400 mb-4 uppercase tracking-[0.2em]">Resolution Efficacy</p>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-low stroke-current" cx="32" cy="32" r="28" fill="transparent" strokeWidth="6"></circle>
                    <circle className="text-primary stroke-current" cx="32" cy="32" r="28" fill="transparent" strokeDasharray="175.9" strokeDashoffset="26.3" strokeLinecap="round" strokeWidth="6"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-on-surface">85%</div>
                </div>
                <p className="text-xs text-on-surface-variant font-body">Complaints are typically resolved within <span className="text-primary font-bold">48 hours</span> on average.</p>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
                <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center border border-primary/30 mb-4">
                  <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>shield_with_heart</span>
                </div>
                <h3 className="text-lg font-black font-headline text-on-surface mb-2">Campus Protection</h3>
                <p className="text-xs text-on-surface-variant font-body leading-relaxed mb-4">
                    UniGrid implements a strict Zero-Retaliation policy. Logs are heavily encrypted.
                </p>
            </div>
          </section>

        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex items-center gap-4 bg-zinc-900/90 backdrop-blur-xl px-5 py-3 rounded-full border border-primary/20 shadow-2xl z-40 cursor-default">
         <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_rgba(255,174,221,0.5)]"></div>
         <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Quantum Encryption Live</span>
      </div>
    </div>
  );
}
