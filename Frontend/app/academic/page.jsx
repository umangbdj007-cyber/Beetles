'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AcademicPage() {
  const [activeTab, setActiveTab] = useState('tree');

  return (
    <div className="w-full">
      <header className="mb-8 pt-4">
        <h1 className="text-5xl font-black font-headline tracking-tighter text-on-surface mb-2">Academic Core</h1>
        <p className="text-secondary font-medium tracking-wide">Visualize your curriculum, schedules, and resources.</p>
      </header>

      {/* Neon Tab Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'tree', icon: 'account_tree', label: 'Skill Tree' },
          { id: 'timetable', icon: 'calendar_view_week', label: 'Timetable' },
          { id: 'results', icon: 'monitoring', label: 'Results & SGPA' },
          { id: 'archive', icon: 'library_books', label: 'Resource Archive' },
          { id: 'calendar', icon: 'event', label: 'Calendar' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 border ${
              activeTab === tab.id 
              ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(107,74,246,0.3)] text-primary' 
              : 'bg-surface-container-low border-outline-variant/10 text-on-surface-variant hover:border-primary/50'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'tree' && <SkillTreeModule />}
        {activeTab === 'timetable' && <TimetableModule />}
        {activeTab === 'results' && <ResultsModule />}
        {activeTab === 'archive' && <ArchiveModule />}
        {activeTab === 'calendar' && <CalendarModule />}
      </div>
    </div>
  );
}

// === MODULES ===

function SkillTreeModule() {
  const [curriculum, setCurriculum] = useState(null);

  useEffect(() => {
    api.get('/academic/curriculum').then(res => setCurriculum(res.data)).catch(console.error);
  }, []);

  const handleUnlock = async (id) => {
    try {
       await api.post(`/academic/curriculum/unlock/${id}`);
       api.get('/academic/curriculum').then(res => setCurriculum(res.data));
    } catch(e) {}
  };

  if(!curriculum) return <div className="text-secondary animate-pulse">Mapping skill nodes...</div>;

  return (
    <div className="p-8 bg-surface-container-low border border-outline-variant/10 rounded-[2rem] min-h-[500px]">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-2xl font-black font-headline text-primary-fixed-dim">{curriculum.subject}</h2>
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Curriculum Progression Graph</p>
        </div>
        <div className="flex gap-4 text-xs font-bold uppercase">
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div> Completed</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_#eab308]"></div> In Progress</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-surface-variant"></div> Locked</div>
        </div>
      </div>

      <div className="flex flex-col gap-6 items-start relative max-w-2xl mx-auto">
        <div className="absolute left-8 top-10 bottom-10 w-1 bg-surface-container-highest z-0 rounded-full"></div>
        {curriculum.topics.map((t, i) => {
           let color = 'bg-surface-variant border-surface-container-highest text-on-surface-variant';
           let shadow = '';
           if(t.status === 'Completed') {
              color = 'bg-green-500/10 border-green-500/50 text-green-400';
              shadow = 'shadow-[0_0_20px_rgba(34,197,94,0.2)]';
           } else if(t.status === 'In Progress') {
              color = 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400';
              shadow = 'shadow-[0_0_20px_rgba(234,179,8,0.2)]';
           }

           const canUnlock = t.status === 'Locked' && t.prerequisites.every(pre => curriculum.topics.find(c=>c.id===pre)?.status === 'Completed');

           return (
             <div key={t.id} className="relative z-10 flex items-center gap-6 group w-full">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 bg-background ${color} ${shadow} transition-all`}>
                 <span className="material-symbols-outlined text-3xl font-black">
                   {t.status === 'Completed' ? 'check' : t.status === 'In Progress' ? 'bolt' : 'lock'}
                 </span>
               </div>
               <div className="flex-1 bg-surface-container-high p-5 rounded-2xl border border-outline-variant/5">
                 <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-on-surface">{t.title}</h3>
                    {canUnlock && <button onClick={() => handleUnlock(t.id)} className="px-3 py-1 bg-primary/20 text-primary hover:bg-primary hover:text-on-primary text-xs font-bold rounded-lg transition-colors border border-primary/30">Unlock Node</button>}
                    {t.status === 'In Progress' && <button onClick={() => handleUnlock(t.id)} className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-black text-xs font-bold rounded-lg transition-colors border border-green-500/30">Complete</button>}
                 </div>
                 {t.prerequisites.length > 0 && <p className="text-[10px] uppercase font-bold text-outline mt-2 tracking-widest">Requires: {t.prerequisites.join(', ')}</p>}
               </div>
             </div>
           )
        })}
      </div>
    </div>
  );
}

function TimetableModule() {
  const [tt, setTt] = useState([]);
  useEffect(() => { api.get('/academic/timetable').then(res => setTt(res.data)).catch(console.error); }, []);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  return (
    <div className="bg-surface-container-low border border-outline-variant/10 rounded-[2rem] p-6 overflow-hidden">
       <div className="overflow-x-auto">
         <table className="w-full text-left border-collapse min-w-[800px]">
           <thead>
             <tr>
               <th className="p-4 border-b border-outline-variant/10 text-outline uppercase text-[10px] font-black tracking-widest bg-surface-container-high rounded-tl-xl">Time \ Day</th>
               {days.map(d => <th key={d} className="p-4 border-b border-outline-variant/10 text-primary uppercase text-xs font-black tracking-widest bg-surface-container-high text-center">{d}</th>)}
             </tr>
           </thead>
           <tbody>
             {times.map((t, idx) => (
               <tr key={t} className="group hover:bg-surface-container-highest/50 transition-colors">
                 <td className="p-4 border-b border-outline-variant/5 text-xs font-bold whitespace-nowrap text-on-surface-variant w-24">
                   {t}
                 </td>
                 {days.map(d => {
                   const slot = tt.find(x => x.day === d && x.time === t);
                   return (
                     <td key={d+t} className={`p-2 border-b border-outline-variant/5 ${idx === times.length-1 ? 'rounded-b-none' : ''}`}>
                       {slot ? (
                         <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl hover:border-primary/50 transition-colors">
                           <p className="font-bold text-sm text-primary-fixed">{slot.subject}</p>
                           <p className="text-[10px] text-outline mt-1 font-bold tracking-widest">{slot.room} • {slot.teacher}</p>
                         </div>
                       ) : (
                         <div className="h-full w-full min-h-[4rem] border border-dashed border-outline-variant/10 rounded-xl bg-surface-container-low/50 hidden group-hover:block"></div>
                       )}
                     </td>
                   )
                 })}
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );
}

function ResultsModule() {
  const [res, setRes] = useState([]);
  const [subject, setSubject] = useState('');
  const [marks, setMarks] = useState('');
  const [credits, setCredits] = useState('');

  useEffect(() => { api.get('/academic/results').then(r => setRes(r.data)).catch(console.error); }, []);
  
  const getGradePoint = (marks) => {
    if(marks>=90) return { pt: 10, g: 'S', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' };
    if(marks>=80) return { pt: 9, g: 'A', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' };
    if(marks>=70) return { pt: 8, g: 'B', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' };
    if(marks>=60) return { pt: 7, g: 'C', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' };
    if(marks>=50) return { pt: 6, g: 'D', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' };
    return { pt: 0, g: 'F', color: 'text-error', bg: 'bg-error-container border-error/50 pulse-red' };
  };

  let totalCredit = 0, earnedPts = 0;
  res.forEach(r => { totalCredit += r.credits; earnedPts += (getGradePoint(r.marks).pt * r.credits); });
  const sgpa = totalCredit === 0 ? 0 : (earnedPts / totalCredit).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const gObj = getGradePoint(parseInt(marks));
    await api.post('/academic/results', { subject, marks: parseInt(marks), credits: parseInt(credits), grade: gObj.g });
    api.get('/academic/results').then(r => setRes(r.data));
    setSubject(''); setMarks(''); setCredits('');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10 text-center flex flex-col justify-center items-center">
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90">
             <circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeWidth="12"></circle>
             <circle className="text-primary drop-shadow-[0_0_15px_rgba(107,74,246,0.6)] transition-all duration-1000" cx="96" cy="96" fill="transparent" r="88" stroke="currentColor" strokeDasharray="552.92" strokeDashoffset={552.92 - (552.92 * (sgpa / 10))} strokeLinecap="round" strokeWidth="12"></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
             <span className="text-5xl font-black font-headline text-on-surface">{sgpa}</span>
             <span className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Overall SGPA</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full bg-surface-container-high p-5 rounded-2xl mt-4 border border-outline-variant/5">
           <h4 className="text-xs uppercase font-bold text-outline text-left mb-4 tracking-widest">Log Result</h4>
           <div className="space-y-3">
             <input required placeholder="Subject" className="w-full bg-surface-container-low border-0 px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary" value={subject} onChange={e=>setSubject(e.target.value)} />
             <div className="flex gap-3">
                <input required type="number" placeholder="Marks" className="w-full bg-surface-container-low border-0 px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary" value={marks} onChange={e=>setMarks(e.target.value)} />
                <input required type="number" placeholder="Credits" className="w-full bg-surface-container-low border-0 px-4 py-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary" value={credits} onChange={e=>setCredits(e.target.value)} />
             </div>
             <button type="submit" className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-sm">Save Grade</button>
           </div>
        </form>
      </div>

      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
        {res.map(r => {
           const ui = getGradePoint(r.marks);
           return (
             <div key={r._id} className={`p-6 rounded-3xl border flex justify-between items-center ${ui.bg}`}>
                <div>
                   <h4 className="font-bold text-lg">{r.subject}</h4>
                   <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mt-1">{r.credits} Credits • {r.marks} Marks</p>
                </div>
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-background border border-outline-variant/10 font-black text-2xl font-headline ${ui.color}`}>
                   {r.grade}
                </div>
             </div>
           )
        })}
      </div>
    </div>
  )
}

function ArchiveModule() {
  const [resources, setResources] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  useEffect(() => { api.get('/academic/resources').then(r => setResources(r.data)).catch(console.error); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    await api.post('/academic/resources', { title: newTitle, url: newUrl });
    api.get('/academic/resources').then(r => setResources(r.data));
    setNewTitle(''); setNewUrl('');
  };

  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 border border-outline-variant/10 rounded-[2rem] p-6 bg-surface-container-low h-fit sticky top-24">
         <h3 className="font-bold tracking-tight mb-4">Post Resource</h3>
         <form onSubmit={handleUpload} className="space-y-4">
           <input required placeholder="Resource Title" className="w-full bg-surface-container-high border-0 px-4 py-3 rounded-xl text-sm focus:ring-1 focus:ring-secondary outline-none" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
           <input required type="url" placeholder="Public Link (Drive, Github)" className="w-full bg-surface-container-high border-0 px-4 py-3 rounded-xl text-sm focus:ring-1 focus:ring-secondary outline-none" value={newUrl} onChange={e=>setNewUrl(e.target.value)} />
           <button type="submit" className="w-full py-3 bg-secondary-container hover:bg-secondary border border-secondary/20 hover:text-on-secondary rounded-xl text-sm font-bold text-on-secondary-container transition-colors">Publish</button>
         </form>
      </div>

      <div className="lg:col-span-3 space-y-4">
        {resources.sort((a,b)=>b.upvotes.length - a.upvotes.length).map(r => (
           <div key={r._id} className="flex bg-surface-container-low border border-outline-variant/10 rounded-3xl overflow-hidden group hover:border-secondary/30 transition-colors">
              <div className="bg-surface-container-highest p-4 flex flex-col items-center justify-center min-w-[80px]">
                <button onClick={() => { api.post(`/academic/resources/${r._id}/upvote`).then(()=> api.get('/academic/resources').then(rs=>setResources(rs.data))) }} className={`mb-1 p-2 rounded-lg hover:bg-white/5 transition-colors ${r.upvotes.includes(currentUserId)?'text-secondary':'text-outline'}`}>
                  <span className="material-symbols-outlined text-3xl font-black" style={{fontVariationSettings: "'FILL' 1"}}>keyboard_arrow_up</span>
                </button>
                <span className={`font-black font-headline text-lg ${r.upvotes.includes(currentUserId)?'text-secondary':''}`}>{r.upvotes.length}</span>
              </div>
              <div className="p-6 flex-1 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-xl text-secondary-fixed-dim">{r.title}</h4>
                  <div className="flex gap-4 items-center mt-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-outline">By {r.uploader?.name}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span> 
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <a href={r.url} target="_blank" className="w-12 h-12 rounded-full bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-all hover:scale-110 shadow-[0_0_15px_rgba(204,250,117,0.1)]">
                   <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                </a>
              </div>
           </div>
        ))}
      </div>
    </div>
  )
}

function CalendarModule() {
  const [events, setEvents] = useState([]);
  useEffect(() => { api.get('/academic/calendar').then(r => setEvents(r.data)).catch(console.error); }, []);

  const getColor = (type) => {
    if(type==='Exam') return 'bg-error/10 border-error/30 text-error';
    if(type==='Assignment') return 'bg-primary/10 border-primary/30 text-primary';
    return 'bg-green-500/10 border-green-500/30 text-green-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {events.map(e => (
         <div key={e._id} className={`p-6 rounded-[2rem] border relative overflow-hidden group ${getColor(e.type)}`}>
            <div className="opacity-10 absolute -right-4 -bottom-4 transform group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-[120px]">{e.type==='Exam'?'quiz':e.type==='Assignment'?'assignment':'celebration'}</span>
            </div>
            <div className="relative z-10">
               <span className="px-3 py-1 rounded-full bg-background/50 text-[10px] font-black uppercase tracking-widest border border-current/20 backdrop-blur-sm">{e.type}</span>
               <h3 className="font-bold text-2xl mt-4 mb-1 font-headline">{e.title}</h3>
               <p className="text-sm opacity-80 mb-6">{e.description}</p>
               <p className="text-xl tracking-tighter font-bold">{new Date(e.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</p>
            </div>
         </div>
       ))}
    </div>
  )
}
