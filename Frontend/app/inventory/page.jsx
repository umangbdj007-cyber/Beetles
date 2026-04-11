'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useSocket } from '@/components/SocketProvider';

export default function InventoryDashboard() {
  const { socket } = useSocket();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('physical');
  
  // Physical State
  const [resources, setResources] = useState([]);
  const [borrowedRecords, setBorrowedRecords] = useState([]);
  const [newItem, setNewItem] = useState({ title: '', category: 'MISCELLANEOUS', description: '' });

  // Skills State
  const [profiles, setProfiles] = useState([]);
  const [mySkillProfile, setMySkillProfile] = useState({ skills: [], availabilityStatus: 'AVAILABLE' });
  const [skillSearch, setSkillSearch] = useState('');

  // Mentorship State
  const [activeMentorships, setActiveMentorships] = useState([]);
  const [reqForm, setReqForm] = useState({ skillRequired: '', duration: 30, preferredTime: '' });

  useEffect(() => {
    const id = localStorage.getItem('userId');
    const name = localStorage.getItem('name');
    setUser({ id, name });

    fetchResources();
    fetchBorrowed();
    fetchProfiles();
    fetchMyProfile();
    fetchMentorships();

    if (socket) {
       socket.on('mentorship:new_request', (req) => {
          // Dynamic matching notification
          if (req.requesterId._id !== id) {
             const mMatch = profiles.find(p => p.user?._id === id && p.availabilityStatus === 'AVAILABLE' && p.skills.some(s => s.name.toLowerCase().includes(req.skillRequired.toLowerCase())));
             if (mMatch) {
               alert(`Match Found! ${req.requesterId.name} needs a ${req.skillRequired} mentor for ${req.duration} mins!`);
             }
          }
          fetchMentorships();
       });
       socket.on('mentorship:accepted', fetchMentorships);
    }
    return () => {
       if (socket) {
          socket.off('mentorship:new_request');
          socket.off('mentorship:accepted');
       }
    };
  }, [socket, profiles]);

  // Fetches
  const fetchResources = () => api.get('/inventory/resources').then(res => setResources(res.data)).catch(console.error);
  const fetchBorrowed = () => api.get('/inventory/borrowed').then(res => setBorrowedRecords(res.data)).catch(console.error);
  
  const fetchProfiles = () => {
     const query = skillSearch ? `?search=${skillSearch}` : '';
     api.get(`/inventory/skills${query}`).then(res => setProfiles(res.data)).catch(console.error);
  };
  const fetchMyProfile = () => api.get('/inventory/skills/me').then(res => setMySkillProfile(res.data)).catch(console.error);
  const fetchMentorships = () => api.get('/inventory/mentorship/active').then(res => setActiveMentorships(res.data)).catch(console.error);

  // Handlers
  const handleCreateResource = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/resources', newItem);
      fetchResources();
      setNewItem({ title: '', category: 'MISCELLANEOUS', description: '' });
      alert('Item initialized into network');
    } catch(err) { alert('Failed to create item'); }
  };

  const handleBorrow = async (id) => {
    try {
      await api.post(`/inventory/resources/${id}/borrow`);
      fetchResources(); fetchBorrowed(); alert('Borrow requested and active!');
    } catch(err) { alert(err.response?.data?.msg || 'Error'); }
  };

  const handleReturn = async (recordId) => {
    try {
      await api.post(`/inventory/resources/return/${recordId}`);
      fetchResources(); fetchBorrowed(); alert('Item returned successfully!');
    } catch(err) { alert(err.response?.data?.msg || 'Error'); }
  };

  const handleUpdateMySkills = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/skills', mySkillProfile);
      fetchProfiles();
      alert('Skill profile optimized.');
    } catch(err) { alert('Error updating skills'); }
  };

  const handleAddSkill = () => {
     setMySkillProfile({ ...mySkillProfile, skills: [...mySkillProfile.skills, { name: '', level: 'Beginner' }]});
  };
  const handleSkillChange = (idx, field, val) => {
     const updated = [...mySkillProfile.skills];
     updated[idx][field] = val;
     setMySkillProfile({...mySkillProfile, skills: updated});
  };

  const handleRequestMentorship = async (e) => {
     e.preventDefault();
     try {
       await api.post('/inventory/mentorship/request', reqForm);
       fetchMentorships();
       setReqForm({ skillRequired: '', duration: 30, preferredTime: '' });
       alert('Broadcast transmitted across matching engines.');
     } catch(err) { alert('Request failed'); }
  };

  const handleAcceptMentorship = async (id) => {
     try {
       await api.post(`/inventory/mentorship/${id}/accept`);
       fetchMentorships();
     } catch(err) { alert(err.response?.data?.msg || 'Failed'); }
  };

  const getMatchedMentors = () => {
    if (!reqForm.skillRequired) return [];
    return profiles.filter(p => p.availabilityStatus === 'AVAILABLE' && p.skills.some(s => s.name.toLowerCase().includes(reqForm.skillRequired.toLowerCase())));
  };

  if(!user) return null;

  return (
    <div className="w-full p-6 md:p-10 max-w-[1600px] mx-auto pb-24 h-screen flex flex-col">
      <header className="mb-8 border-b border-outline-variant/10 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">
             Ecosystem Inventory
           </h1>
           <p className="text-zinc-400 font-medium mt-2">Hardware grids and human capital networking matrix.</p>
        </div>
        <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/10">
           {['physical', 'skills', 'mentorship'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab===tab ? 'bg-secondary text-on-secondary shadow-lg': 'text-zinc-500 hover:text-on-surface'}`}>
                {tab}
             </button>
           ))}
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
         
         {/* PHYSICAL INVENTORY */}
         {activeTab === 'physical' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full"> 
              <div className="lg:col-span-8 overflow-y-auto custom-scrollbar pr-4 space-y-8">
                 
                 {/* Borrow/Lent Trackers */}
                 <section>
                    <h3 className="font-headline font-bold text-xl mb-4 border-b border-outline-variant/10 pb-2">Active Exchange Audits</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {borrowedRecords.length === 0 && <p className="text-xs text-zinc-500 col-span-full">No active leases.</p>}
                       {borrowedRecords.map(br => (
                          <div key={br._id} className="bg-surface-container p-5 rounded-2xl border border-outline-variant/10 flex flex-col justify-between group hover:border-primary/30 transition-colors">
                             <div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${br.ownerId?._id === user.id ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                                   {br.ownerId?._id === user.id ? 'Lent Out' : 'Borrowed by You'}
                                </span>
                                <h4 className="font-headline font-bold text-lg mt-3">{br.itemId?.title || 'Unknown Item'}</h4>
                                <p className="text-xs text-zinc-500 mt-1">Date: {new Date(br.borrowDate).toLocaleDateString()}</p>
                             </div>
                             <button onClick={() => handleReturn(br._id)} className="w-full mt-5 py-2 rounded-xl bg-surface-container-highest border border-outline-variant/20 hover:bg-on-surface hover:text-surface font-bold text-xs uppercase tracking-widest transition-all">
                                Return Hardware
                             </button>
                          </div>
                       ))}
                    </div>
                 </section>

                 <section>
                    <h3 className="font-headline font-bold text-xl mb-4 border-b border-outline-variant/10 pb-2">Community Arsenal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                       {resources.map(item => (
                          <div key={item._id} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5 shadow-md flex flex-col justify-between h-full">
                             <div>
                                <span className="text-[9px] uppercase tracking-widest font-black text-secondary">{item.category}</span>
                                <h4 className="font-headline font-bold text-xl text-on-surface mt-1 border-l-2 border-primary/50 pl-2">{item.title}</h4>
                                <p className="text-xs text-zinc-400 mt-3 line-clamp-2">{item.description}</p>
                                <p className="text-[10px] text-zinc-500 mt-4 font-bold">Owner: {item.ownerId?.name}</p>
                             </div>
                             <div className="mt-6 pt-4 border-t border-outline-variant/10">
                                <button onClick={() => handleBorrow(item._id)} className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-on-primary py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                                   Borrow Item
                                </button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </section>
              </div>

              <div className="lg:col-span-4">
                 <section className="bg-surface-container rounded-[2rem] p-6 border border-outline-variant/10 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-[50px] rounded-full group-hover:bg-secondary/15 transition-all"></div>
                    <h3 className="font-headline font-bold text-2xl mb-6 relative z-10 flex items-center gap-2 text-on-surface">
                       <span className="material-symbols-outlined text-secondary">add_box</span> Initialize Hardware
                    </h3>
                    <form onSubmit={handleCreateResource} className="space-y-4 relative z-10">
                       <input required placeholder="Hardware Name" className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-5 py-4 text-sm focus:ring-1 focus:ring-secondary outline-none" value={newItem.title} onChange={e=>setNewItem({...newItem, title: e.target.value})} />
                       <select className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-5 py-4 text-sm focus:ring-1 focus:ring-secondary outline-none" value={newItem.category} onChange={e=>setNewItem({...newItem, category: e.target.value})}>
                          <option value="HARDWARE">Hardware Platform</option>
                          <option value="LITERATURE">Literature/Books</option>
                          <option value="ELECTRONICS">Electronics/PCB</option>
                          <option value="MISCELLANEOUS">Miscellaneous</option>
                       </select>
                       <textarea required rows="3" placeholder="Specs and conditions..." className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-5 py-4 text-sm focus:ring-1 focus:ring-secondary outline-none resize-none" value={newItem.description} onChange={e=>setNewItem({...newItem, description: e.target.value})}></textarea>
                       <button type="submit" className="w-full bg-secondary text-on-secondary font-black text-xs tracking-widest uppercase py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">Deploy Record</button>
                    </form>
                 </section>
              </div>
           </div>
         )}

         {/* SKILLS NEXUS */}
         {activeTab === 'skills' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full"> 
              <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden h-full">
                 <div className="flex gap-4">
                    <input placeholder="Filter skill tags (e.g. React, CAD, Python)..." className="flex-1 bg-surface-container border border-outline-variant/20 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-primary outline-none" value={skillSearch} onChange={e=>setSkillSearch(e.target.value)} onKeyUp={e => e.key === 'Enter' && fetchProfiles()} />
                    <button onClick={fetchProfiles} className="bg-primary text-on-primary px-8 rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg">Scan</button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 md:grid-cols-2 gap-5 content-start">
                    {profiles.map(p => (
                       <div key={p._id} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 shadow-md hover:-translate-y-1 transition-all">
                          <div className="flex justify-between items-start mb-4">
                             <h4 className="font-headline font-bold text-xl">{p.user?.name}</h4>
                             {p.availabilityStatus === 'AVAILABLE' ? <span className="bg-green-500/20 text-green-500 text-[9px] uppercase font-black px-2 py-1 rounded shadow-[0_0_10px_rgba(74,222,128,0.3)]">Available</span> : <span className="bg-zinc-500/20 text-zinc-500 text-[9px] uppercase font-black px-2 py-1 rounded">Busy</span>}
                          </div>
                          <div className="space-y-2">
                             {p.skills?.map((s, i) => (
                               <div key={i} className="flex justify-between items-center text-xs bg-surface-container p-2 rounded-lg border border-outline-variant/5">
                                 <span className="font-bold text-primary tracking-wide">{s.name}</span>
                                 <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{s.level}</span>
                               </div>
                             ))}
                          </div>
                          <button onClick={() => {setActiveTab('mentorship'); setReqForm({...reqForm, skillRequired: p.skills[0]?.name || ''})}} className="w-full mt-5 py-2 bg-surface-container-high hover:bg-primary/20 hover:text-primary rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">Request Link</button>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="lg:col-span-4">
                 <section className="bg-surface-container rounded-[2rem] p-6 border border-primary/20 shadow-[0_0_30px_rgba(107,74,246,0.1)]">
                    <h3 className="font-headline font-bold text-2xl mb-6 text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined">person_add</span> Your Talent Vector
                    </h3>
                    <form onSubmit={handleUpdateMySkills} className="space-y-6">
                       <div className="flex items-center justify-between">
                         <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Global State</label>
                         <select className="bg-surface-container-highest border border-outline-variant/10 rounded-lg px-3 py-1 text-xs outline-none" value={mySkillProfile.availabilityStatus} onChange={e=>setMySkillProfile({...mySkillProfile, availabilityStatus: e.target.value})}>
                            <option value="AVAILABLE">Actively Matching</option>
                            <option value="BUSY">Do Not Disturb</option>
                         </select>
                       </div>
                       
                       <div className="space-y-3">
                          <label className="text-xs font-black uppercase tracking-widest text-zinc-500 border-b border-outline-variant/10 pb-2 block">Defined Skills</label>
                          {mySkillProfile.skills.map((s, idx) => (
                             <div key={idx} className="flex gap-2">
                                <input placeholder="Skill Name..." className="flex-1 bg-surface-container-highest border border-outline-variant/10 rounded-lg px-3 py-2 text-sm focus:ring-1 outline-none" value={s.name} onChange={e => handleSkillChange(idx, 'name', e.target.value)} />
                                <select className="w-32 bg-surface-container-highest border border-outline-variant/10 rounded-lg px-2 py-2 text-xs outline-none" value={s.level} onChange={e => handleSkillChange(idx, 'level', e.target.value)}>
                                   <option>Beginner</option>
                                   <option>Intermediate</option>
                                   <option>Advanced</option>
                                </select>
                             </div>
                          ))}
                          <button type="button" onClick={handleAddSkill} className="text-xs text-primary font-bold uppercase tracking-widest mt-2 hover:brightness-125 transition-all">+ Inject Core Skill</button>
                       </div>

                       <button type="submit" className="w-full bg-primary text-on-primary font-black text-xs tracking-widest uppercase py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">Synchronize Block</button>
                    </form>
                 </section>
              </div>
           </div>
         )}


         {/* MENTORSHIP NEXUS */}
         {activeTab === 'mentorship' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
              <div className="lg:col-span-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                 
                 <h3 className="font-headline font-bold text-xl border-b border-outline-variant/10 pb-2">Active Link Requests</h3>
                 <div className="grid grid-cols-1 gap-4">
                    {activeMentorships.length === 0 && <p className="text-zinc-500 text-sm">No topological links currently active.</p>}
                    {activeMentorships.map(m => (
                       <div key={m._id} className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                             <div className="flex gap-2 mb-2">
                                <span className={`text-[9px] uppercase font-black px-2 py-1 rounded shadow-sm ${m.status==='PENDING'?'bg-yellow-500/20 text-yellow-500': m.status==='ACCEPTED'?'bg-primary/20 text-primary':'bg-green-500/20 text-green-500'}`}>{m.status}</span>
                                <span className="text-[9px] uppercase font-black px-2 py-1 bg-surface-container-highest text-zinc-400 rounded">{m.duration} mins</span>
                             </div>
                             <h4 className="font-headline font-bold text-lg text-on-surface">Expertise: {m.skillRequired}</h4>
                             <p className="text-xs text-zinc-500 font-bold mt-1">Requested by: {m.requesterId?._id === user.id ? 'You' : m.requesterId?.name}</p>
                             <p className="text-[10px] text-zinc-600 mt-1">Pref Time: {new Date(m.preferredTime).toLocaleString()}</p>
                          </div>
                          
                          {/* Actions */}
                          {m.status === 'PENDING' && m.requesterId?._id !== user.id && (
                             <button onClick={() => handleAcceptMentorship(m._id)} className="w-full md:w-auto px-6 py-3 bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary hover:text-on-secondary rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Accept Contract</button>
                          )}
                          {m.status === 'ACCEPTED' && (
                             <span className="px-6 py-3 bg-surface-container-highest text-zinc-400 rounded-xl font-bold text-[10px] uppercase tracking-widest">Matched with {m.mentorId?.name || 'Mentor'}</span>
                          )}
                       </div>
                    ))}
                 </div>

              </div>
              <div className="lg:col-span-4">
                 <section className="bg-surface-container rounded-[2rem] p-6 border border-outline-variant/10 shadow-lg relative h-full"> 
                    <h3 className="font-headline font-bold text-xl mb-6 relative z-10 text-on-surface border-b border-outline-variant/10 pb-4">
                       Broadcast Time-Link Request
                    </h3>
                    <form onSubmit={handleRequestMentorship} className="space-y-4">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500 pl-1">Target Capability</label>
                         <input required placeholder="E.g., Quantum Physics" className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-5 py-4 text-sm focus:ring-1 focus:ring-secondary outline-none transition-all" value={reqForm.skillRequired} onChange={e=>setReqForm({...reqForm, skillRequired: e.target.value})} />
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500 pl-1">Block (Mins)</label>
                             <input type="number" min="15" step="15" className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-5 py-4 text-sm outline-none" value={reqForm.duration} onChange={e=>setReqForm({...reqForm, duration: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500 pl-1">Target Window</label>
                             <input required type="datetime-local" className="w-full bg-surface-container-highest border border-outline-variant/10 rounded-xl px-2 py-4 text-sm outline-none text-zinc-300" value={reqForm.preferredTime} onChange={e=>setReqForm({...reqForm, preferredTime: e.target.value})} />
                          </div>
                       </div>
                       
                       {/* Match Engine Diagnostics */}
                       <div className="mt-4 p-4 bg-outline-variant/5 rounded-xl border border-outline-variant/10">
                          <p className="text-[9px] uppercase font-black text-secondary tracking-widest mb-2">Live Matching Radar</p>
                          <p className="text-xs text-zinc-400 italic">
                             {reqForm.skillRequired ? `Found ${getMatchedMentors().length} active topological nodes matching string.` : 'Enter a skill string to compute array vectors limit.'}
                          </p>
                       </div>

                       <button type="submit" className="w-full bg-gradient-to-r from-secondary to-secondary-container text-on-secondary font-black text-xs tracking-widest uppercase py-4 rounded-xl shadow-[0_0_15px_rgba(201,190,255,0.4)] hover:brightness-110 active:scale-95 transition-all mt-6">Broadcast Link</button>
                    </form>
                 </section>
              </div>
           </div>
         )}

      </div>
    </div>
  );
}
