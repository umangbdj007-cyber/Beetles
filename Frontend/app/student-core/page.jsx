'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useSocket } from '@/components/SocketProvider';
import Link from 'next/link';

export default function StudentCorePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const id = localStorage.getItem('userId');
    setUser({ role, name, id });
  }, []);

  return (
    <div className="w-full pt-6 md:pt-10 pb-24 px-4 md:px-8">
        <header className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-5xl font-black font-headline tracking-tighter text-on-surface mb-2">Student Core</h1>
                    <p className="text-secondary font-medium tracking-wide">Syncing your academic pulse in real-time.</p>
                </div>
            </div>
        </header>

        <div className="asymmetric-grid">
            <WorkloadPredictor />
            <CanteenCrowd user={user} />
            <ContributionTracker userId={user?.id} />
            <SkillSwapBounties />
            <AttendanceSafetyNet />
        </div>
        
        {/* FAB */}
        <button className="fixed bottom-24 md:bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-full shadow-[0_8px_32px_rgba(107,74,246,0.4)] flex items-center justify-center text-on-primary active:scale-90 transition-transform z-40">
            <span className="material-symbols-outlined text-3xl">add_task</span>
        </button>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function WorkloadPredictor() {
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/assignments/workload/heatmap').then(res => {
      setHeatmap(res.data);
      setLoading(false);
    }).catch(err => console.error(err));
  }, []);

  const getColor = (colorCode) => {
    if (colorCode === 'Green') return 'bg-tertiary-container/30 border-transparent';
    if (colorCode === 'Yellow') return 'bg-yellow-500/40 border-yellow-500/20';
    if (colorCode === 'Red') return 'pulse-red shadow-[0_0_15px_rgba(255,180,171,0.4)] border-error/50';
    return 'bg-tertiary-container/10';
  };

  const highLoadDays = heatmap.filter(d => d.colorCode === 'Red').length;

  return (
    <section className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 flex flex-col justify-between border border-outline-variant/10 relative overflow-hidden group hover:border-primary/30 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
        <div>
            <div className="flex justify-between items-start mb-6">
                <h3 className="font-headline font-bold text-2xl tracking-tight">Workload Predictor</h3>
                <span className="px-3 py-1 bg-secondary-container text-secondary-fixed text-[10px] font-black uppercase tracking-widest rounded-full">Automated Aggregation</span>
            </div>
            
            {loading ? <div className="text-center py-10 opacity-50 text-sm">Mapping neural paths...</div> : (
              <div className="grid grid-cols-7 gap-2 md:gap-3 mb-8">
                  {heatmap.length === 0 && <div className="col-span-7 py-4 text-xs text-zinc-500">No upcoming workloads targeted.</div>}
                  {heatmap.map(day => (
                      <div key={day.date} className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold opacity-90 border ${getColor(day.colorCode)} cursor-help relative group`} title={day.items.join(', ')}>
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                          {new Date(day.date).getDate()}
                      </div>
                  ))}
              </div>
            )}
        </div>
        
        {highLoadDays > 0 ? (
          <div className="bg-error-container/20 border border-error/30 rounded-2xl p-4 flex gap-4 items-center">
              <span className="material-symbols-outlined text-error text-3xl">warning</span>
              <div>
                  <p className="font-headline font-bold text-lg leading-tight text-error">Critical Window Detected</p>
                  <p className="text-xs text-on-surface-variant">High task concentration on {highLoadDays} upcoming days.</p>
              </div>
          </div>
        ) : (
          <div className="bg-surface-container-high rounded-2xl p-4 flex gap-4 items-center border border-outline-variant/10">
              <span className="material-symbols-outlined text-secondary text-3xl">check_circle</span>
              <div>
                  <p className="font-headline font-bold text-lg leading-tight">Stable Workload</p>
                  <p className="text-xs text-on-surface-variant">No critical burnout windows detected.</p>
              </div>
          </div>
        )}
    </section>
  );
}

function CanteenCrowd({ user }) {
  const { socket } = useSocket();
  const [status, setStatus] = useState({ aggregate: 'Empty', latest: [] });
  const [wait, setWait] = useState(0);

  useEffect(() => {
    api.get('/core/canteen/status').then(res => setStatus(res.data)).catch(console.error);
    if (socket) {
      socket.on('canteen_update', () => {
         api.get('/core/canteen/status').then(res => setStatus(res.data)).catch(console.error);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (status.aggregate === 'Empty') setWait(0);
    else if (status.aggregate === 'Moderate') setWait(15);
    else setWait(35);
  }, [status.aggregate]);

  const reportStatus = async (s) => {
    try {
      await api.post('/occupancy/update', { locationId: 'Canteen', status: s });
    } catch (e) { alert(e.response?.data?.msg || 'Failed to report'); }
  };

  const getMeterColor = () => {
    if(status.aggregate === 'Empty') return { stop1: '#4ade80', stop2: '#22c55e', pct: '20%' };
    if(status.aggregate === 'Moderate') return { stop1: '#facc15', stop2: '#eab308', pct: '60%' };
    return { stop1: '#f87171', stop2: '#ef4444', pct: '95%' };
  };

  const colors = getMeterColor();

  return (
    <section className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 relative overflow-hidden flex flex-col justify-between border border-outline-variant/10">
        <div className="relative z-10">
            <h3 className="font-headline font-bold text-2xl tracking-tight mb-2">Canteen Live Meter</h3>
            <p className="text-sm text-on-surface-variant mb-6">Central Hub - Real-time Socket</p>
            <div className="flex flex-col items-center py-4">
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
                        <circle cx="96" cy="96" fill="transparent" r="88" stroke="url(#canteen-gradient)" strokeDasharray="552.92" strokeDashoffset={status.aggregate === 'Empty' ? 440 : status.aggregate === 'Moderate' ? 220 : 50} strokeLinecap="round" strokeWidth="12" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}></circle>
                        <defs>
                            <linearGradient id="canteen-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                                <stop offset="0%" stopColor={colors.stop1}></stop>
                                <stop offset="100%" stopColor={colors.stop2}></stop>
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black font-headline">{colors.pct}</span>
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${status.aggregate==='Empty'?'text-green-400':status.aggregate==='Moderate'?'text-yellow-400':'text-error'}`}>{status.aggregate}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-bold">
                <span>Est. Wait Time</span>
                <span className={wait === 0 ? 'text-green-400' : wait === 15 ? 'text-yellow-400' : 'text-error'}>~{wait} Minutes</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
                <div className="text-[10px] font-bold text-outline text-center mb-1">BROADCAST STATUS</div>
                <div className="flex gap-2">
                  <button onClick={() => reportStatus('Empty')} className="flex-1 py-2 bg-surface-container-highest hover:bg-green-500/20 rounded-lg text-xs font-bold transition-colors">Empty</button>
                  <button onClick={() => reportStatus('Moderate')} className="flex-1 py-2 bg-surface-container-highest hover:bg-yellow-500/20 rounded-lg text-xs font-bold transition-colors">Mod</button>
                  <button onClick={() => reportStatus('Crowded')} className="flex-1 py-2 bg-surface-container-highest hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors">Packed</button>
                </div>
            </div>
        </div>
    </section>
  );
}

function ContributionTracker({ userId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gh, setGh] = useState('');
  const [lc, setLc] = useState('');

  useEffect(() => {
    if(!userId) return;
    api.get(`/core/contributions/${userId}`).then(res => {
       setStats(res.data);
       setLoading(false);
    }).catch(console.error);
  }, [userId]);

  const saveUsernames = async () => {
    try {
      await api.post('/core/profile/usernames', { githubUsername: gh, leetcodeUsername: lc });
      window.location.reload();
    } catch(e) {}
  };

  return (
    <section className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 flex flex-col border border-outline-variant/10">
        <h3 className="font-headline font-bold text-2xl tracking-tight mb-8">Contribution Tracker</h3>
        
        {(!stats?.github && !stats?.leetcode) ? (
          <div className="flex-1 space-y-4">
            <p className="text-xs text-on-surface-variant font-medium">Link your profiles to activate tracker modules.</p>
            <input placeholder="GitHub Username" className="w-full bg-surface-container-high border-0 py-3 px-4 rounded-xl text-sm" value={gh} onChange={e=>setGh(e.target.value)} />
            <input placeholder="LeetCode Username" className="w-full bg-surface-container-high border-0 py-3 px-4 rounded-xl text-sm" value={lc} onChange={e=>setLc(e.target.value)} />
            <button onClick={saveUsernames} className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-sm">Sync Modules</button>
          </div>
        ) : (
          <div className="flex-1 space-y-8">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center bg-gradient-to-br from-gray-800 to-black border border-gray-700 shadow-lg">
                      <span className="material-symbols-outlined text-white">code</span>
                  </div>
                  <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                          <span className="font-bold">GitHub Rep</span>
                          <span className="text-xs text-primary font-black">{stats.github ? stats.github.repos : 0} Repos</span>
                      </div>
                      <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{width: `${Math.min((stats?.github?.followers || 0) * 5, 100)}%`}}></div>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mt-1">{stats?.github?.followers || 0} Followers</p>
                  </div>
              </div>

              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center bg-gradient-to-br from-yellow-600 to-orange-500 border border-yellow-300 shadow-lg">
                      <span className="material-symbols-outlined text-white">emoji_events</span>
                  </div>
                  <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                          <span className="font-bold">LeetCode Elo</span>
                          <span className="text-xs text-secondary font-black">{stats.leetcode ? stats.leetcode.medium : 0} Meds</span>
                      </div>
                      <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden flex">
                          <div className="h-full bg-green-500" style={{flex: stats?.leetcode?.easy || 1}}></div>
                          <div className="h-full bg-yellow-500" style={{flex: stats?.leetcode?.medium || 1}}></div>
                          <div className="h-full bg-red-500" style={{flex: stats?.leetcode?.hard || 1}}></div>
                      </div>
                  </div>
              </div>
          </div>
        )}

        <div className="mt-auto pt-8 border-t border-outline-variant/15 flex justify-between items-center">
            <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Rep Score</p>
                <p className="text-3xl font-black font-headline">{stats?.reputation || 0}</p>
            </div>
            <div className="p-4 bg-primary-container/20 rounded-2xl border border-primary-container/20 shadow-[0_0_20px_rgba(107,74,246,0.2)]">
                <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>workspace_premium</span>
            </div>
        </div>
    </section>
  );
}

function SkillSwapBounties() {
  const [bounties, setBounties] = useState([]);
  const [matches, setMatches] = useState([]);
  
  const [newTopic, setNewTopic] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newReward, setNewReward] = useState(50);
  const [teachSkills, setTeachSkills] = useState('');
  const [learnSkills, setLearnSkills] = useState('');

  useEffect(() => {
     api.get('/core/bounties').then(res => setBounties(res.data)).catch(console.error);
     api.get('/core/skills/match').then(res => setMatches(res.data)).catch(console.error);
  }, []);

  const handleUpdateSkills = async () => {
    try {
      await api.post('/core/skills/profile', { teachSkills: teachSkills.split(',').map(s=>s.trim()), learnSkills: learnSkills.split(',').map(s=>s.trim()) });
      api.get('/core/skills/match').then(res => setMatches(res.data));
    } catch(err) {}
  };

  const handlePostBounty = async () => {
    try {
      const d = new Date(); d.setDate(d.getDate() + 7);
      await api.post('/core/bounties', { topic: newTopic, description: newDesc, reward: newReward, deadline: d });
      setNewTopic(''); setNewDesc('');
      api.get('/core/bounties').then(res => setBounties(res.data));
    } catch(err) {}
  };

  return (
    <section className="lg:col-span-2 bg-surface-container-low rounded-[2rem] p-6 md:p-8 border border-outline-variant/10">
        <div className="flex justify-between items-center mb-8 border-b border-outline-variant/10 pb-4">
            <h3 className="font-headline font-bold text-2xl tracking-tight">Skill Swap & Bounties</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Form Column */}
            <div className="space-y-8">
                <div className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/5 shadow-inner">
                    <h4 className="font-bold text-sm text-outline uppercase tracking-widest mb-4">Post a Bounty</h4>
                    <div className="space-y-3">
                        <input className="w-full bg-surface-container-low border-0 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary outline-none" placeholder="Topic (e.g. FastAPI auth)" value={newTopic} onChange={e=>setNewTopic(e.target.value)} />
                        <textarea className="w-full bg-surface-container-low border-0 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-primary outline-none resize-none h-16" placeholder="Describe the task..." value={newDesc} onChange={e=>setNewDesc(e.target.value)}></textarea>
                        <button onClick={handlePostBounty} className="w-full py-3 bg-gradient-to-r from-primary-container to-primary text-on-primary font-bold rounded-xl text-sm active:scale-95 transition-transform">Post Request (50 pts)</button>
                    </div>
                </div>

                <div className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/5 shadow-inner">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-sm text-outline uppercase tracking-widest">Skill Matrix</h4>
                      <span className="material-symbols-outlined text-secondary text-sm">auto_awesome</span>
                    </div>
                    <div className="space-y-3">
                        <input className="w-full bg-surface-container-low border-0 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-secondary outline-none" placeholder="I know... (comma sep)" value={teachSkills} onChange={e=>setTeachSkills(e.target.value)}/>
                        <input className="w-full bg-surface-container-low border-0 rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-secondary outline-none" placeholder="I want to learn..." value={learnSkills} onChange={e=>setLearnSkills(e.target.value)}/>
                        <button onClick={handleUpdateSkills} className="w-full py-3 bg-secondary-container text-on-secondary-container font-bold rounded-xl text-sm hover:bg-secondary/20 transition-colors border border-secondary/20">Sync Profile</button>
                    </div>
                </div>
            </div>

            {/* List Column */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                <h4 className="font-bold text-sm text-outline text-right uppercase tracking-widest mb-4">Open Feed</h4>
                {bounties.map(b => (
                    <div key={b._id} className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/10 shadow-lg hover:border-primary/40 transition-colors group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 bg-primary/10 rounded-bl-xl border-b border-l border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">{b.reward} CC</div>
                        
                        <h4 className="font-headline font-bold text-xl mb-2 mt-4 text-primary-fixed-dim">{b.topic}</h4>
                        <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">{b.description}</p>
                        <div className="flex items-center justify-between">
                            <div className="text-[10px] text-outline font-bold">POSTED BY {b.poster.name}</div>
                            <button onClick={() => { api.post(`/core/bounties/${b._id}/accept`).then(() => api.get('/core/bounties').then(res=>setBounties(res.data))) }} className="px-5 py-2 bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-on-primary rounded-xl font-bold text-xs transition-colors">Accept</button>
                        </div>
                    </div>
                ))}
                
                {matches.length > 0 && <h4 className="font-bold text-sm text-outline text-right uppercase tracking-widest mt-8 mb-4 border-t border-outline-variant/10 pt-4">Tutor Matches</h4>}
                {matches.map(m => (
                    <div key={m._id} className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/10 flex justify-between items-center hover:border-secondary/40 transition-colors">
                        <div>
                            <h4 className="font-bold text-lg text-secondary-fixed-dim">{m.user.name}</h4>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Can Teach: {m.teachSkills.join(', ')}</p>
                        </div>
                        <button className="w-10 h-10 bg-secondary/10 text-secondary border border-secondary/20 rounded-full flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-colors">
                           <span className="material-symbols-outlined text-sm">chat</span>
                        </button>
                    </div>
                ))}
            </div>

        </div>
    </section>
  );
}

function AttendanceSafetyNet() {
  const [attendance, setAttendance] = useState([]);
  const [subject, setSubject] = useState('');
  const [total, setTotal] = useState('');
  const [attended, setAttended] = useState('');

  useEffect(() => {
    api.get('/core/attendance').then(res => setAttendance(res.data)).catch(console.error);
  }, []);

  const handleUpdate = async (e) => {
    if(e) e.preventDefault();
    try {
      await api.post('/core/attendance', { subject, totalClasses: parseInt(total), attendedClasses: parseInt(attended) });
      api.get('/core/attendance').then(res => setAttendance(res.data));
      setSubject(''); setTotal(''); setAttended('');
    } catch(err) {}
  };

  const getStatusVisuals = (tot, att) => {
    if (tot === 0) return { pct: 0, color: 'bg-surface-variant', textCol: 'text-outline', msg: 'No Data' };
    const pct = (att / tot) * 100;
    if (pct >= 85) return { pct, color: 'bg-green-500', textCol: 'text-green-400', msg: `Safe: Can miss ${Math.floor(att - 0.75 * tot)} more classes` };
    if (pct >= 75) return { pct, color: 'bg-yellow-500', textCol: 'text-yellow-400', msg: `Borderline: Do not skip` };
    const needed = Math.ceil((0.75 * tot - att) / 0.25);
    return { pct, color: 'bg-error', textCol: 'text-error', msg: `Danger: Must attend next ${needed} classes` };
  };

  return (
    <section className="bg-surface-container-low rounded-[2rem] p-6 md:p-8 border border-outline-variant/10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/10">
            <h3 className="font-headline font-bold text-2xl tracking-tight">Attendance Safety Net</h3>
            <span className="material-symbols-outlined text-gray-500">security</span>
        </div>
        
        <div className="space-y-6 mb-8 max-h-[220px] overflow-y-auto pr-2 no-scrollbar">
            {attendance.length === 0 && <div className="text-center text-on-surface-variant text-sm py-4">No subjects logged.</div>}
            {attendance.map(a => {
                const s = getStatusVisuals(a.totalClasses, a.attendedClasses);
                return (
                  <div key={a._id}>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-on-surface-variant">{a.subject}</span>
                          <span className={`font-black ${s.textCol}`}>{s.pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className={`h-full ${s.color}`} style={{width: `${Math.min(s.pct, 100)}%`, transition: 'width 1s ease-in-out'}}></div>
                      </div>
                      <p className={`text-[10px] ${s.textCol} mt-2 uppercase font-black tracking-widest`}>{s.msg}</p>
                  </div>
                )
            })}
        </div>

        <form onSubmit={handleUpdate} className="bg-surface-container-high rounded-2xl p-4 flex gap-2 items-center border border-outline-variant/10">
            <div className="flex-1 space-y-2">
               <input required placeholder="Subject" className="w-full bg-surface-container-low border-0 px-3 py-2 text-xs rounded-lg outline-none focus:ring-1 focus:ring-primary" value={subject} onChange={e=>setSubject(e.target.value)} />
               <div className="flex gap-2">
                  <input required type="number" placeholder="Total" className="w-full bg-surface-container-low border-0 px-3 py-2 text-xs rounded-lg outline-none focus:ring-1 focus:ring-primary" value={total} onChange={e=>setTotal(e.target.value)} />
                  <input required type="number" placeholder="Attended" className="w-full bg-surface-container-low border-0 px-3 py-2 text-xs rounded-lg outline-none focus:ring-1 focus:ring-primary" value={attended} onChange={e=>setAttended(e.target.value)} />
               </div>
            </div>
            <button type="submit" className="h-full px-4 rounded-xl bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined">add</span>
            </button>
        </form>
    </section>
  );
}
