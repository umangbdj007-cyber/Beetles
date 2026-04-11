'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AssignmentsPage() {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Teacher Form State
  const [formData, setFormData] = useState({ title: '', subject: '', description: '', deadline: '', difficultyLevel: 'Medium', assignedTo: [] });

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUser({ role });
    fetchAssignments();
    if (role === 'Teacher' || role === 'Admin') {
      api.get('/assignments/students').then(res => setStudents(res.data)).catch(console.error);
    }
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data);
    } catch(err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, assignedTo: formData.assignedTo.length ? formData.assignedTo : students.map(s => s._id) };
      await api.post('/assignments', payload);
      alert('Assignment deployed to computational workload matrices.');
      fetchAssignments();
      setFormData({ title: '', subject: '', description: '', deadline: '', difficultyLevel: 'Medium', assignedTo: [] });
    } catch(err) { alert('Deployment failed'); }
  };

  const handleSubmitAssignment = async (id) => {
    const content = prompt("Paste your submission URI / Content:");
    if (!content) return;
    try {
      await api.post(`/assignments/${id}/submit`, { content });
      alert('Submission successful.');
      fetchAssignments();
    } catch(err) { alert(err.response?.data?.msg || 'Error'); }
  };

  if(!user) return null;

  return (
    <div className="w-full p-6 md:p-10 max-w-[1400px] mx-auto pb-24">
      <header className="mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-on-surface">Workload Center</h2>
        <p className="text-zinc-500 font-medium mt-2">Distributed assessment computation engine.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Assingment List */}
        <section className={`col-span-12 ${user.role === 'Teacher' ? 'lg:col-span-8' : ''}`}>
           <div className="space-y-6">
             {assignments.map(a => {
               const submitted = a.submissions?.some(s => s.student === localStorage.getItem('userId')) || false;
               return (
                 <div key={a._id} className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 shadow-lg relative overflow-hidden group">
                   <div className="flex justify-between items-start mb-2">
                     <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-sm
                        ${a.difficultyLevel === 'High' ? 'bg-red-500/20 text-red-400' : a.difficultyLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-400'}`}>
                        {a.difficultyLevel} LOAD
                     </span>
                     <span className="text-xs font-bold text-outline">Due: {new Date(a.deadline).toLocaleString()}</span>
                   </div>
                   <h4 className="text-2xl font-black font-headline text-on-surface mt-4">{a.title}</h4>
                   <p className="text-primary text-xs font-bold uppercase tracking-widest mb-4">{a.subject}</p>
                   <p className="text-zinc-400 text-sm">{a.description}</p>
                   
                   {user.role === 'Student' && (
                     <div className="mt-6 border-t border-outline-variant/10 pt-4 flex justify-between items-center">
                       <span className="text-xs text-zinc-500 font-medium">Assigned by {a.assignedBy?.name}</span>
                       <button onClick={() => handleSubmitAssignment(a._id)} disabled={submitted} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${submitted ? 'bg-surface-container-highest text-zinc-500' : 'bg-primary text-on-primary hover:brightness-110 shadow-lg'}`}>
                         {submitted ? 'Submitted' : 'Turn In'}
                       </button>
                     </div>
                   )}
                   {user.role === 'Teacher' && (
                     <div className="mt-6 border-t border-outline-variant/10 pt-4">
                       <span className="text-xs text-zinc-500 font-medium uppercase tracking-widest">{a.submissions.length} / {a.assignedTo.length} Submitted</span>
                     </div>
                   )}
                 </div>
               )
             })}
           </div>
        </section>

        {/* Right: Teacher Auth Form */}
        {user.role === 'Teacher' && (
          <aside className="col-span-12 lg:col-span-4 bg-surface-container p-6 rounded-3xl border border-outline-variant/15 shadow-2xl sticky top-10">
            <h3 className="text-xl font-black text-on-surface mb-6">Deploy Workload</h3>
            <form onSubmit={handleCreate} className="space-y-4">
               <div>
                  <input required placeholder="Title" className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} />
               </div>
               <div>
                  <input required placeholder="Subject (e.g. Computing IV)" className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none" value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} />
               </div>
               <div>
                  <textarea placeholder="Directives" rows="3" className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none resize-none" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
               </div>
               <div className="flex gap-4">
                  <input required type="datetime-local" className="flex-1 bg-surface-container-highest border-none rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-primary outline-none" value={formData.deadline} onChange={e=>setFormData({...formData, deadline: e.target.value})} />
                  <select className="w-1/3 bg-surface-container-highest border-none rounded-xl px-2 py-3 text-xs focus:ring-1 focus:ring-primary outline-none" value={formData.difficultyLevel} onChange={e=>setFormData({...formData, difficultyLevel: e.target.value})}>
                     <option>Low</option>
                     <option>Medium</option>
                     <option>High</option>
                  </select>
               </div>
               <details className="text-xs text-zinc-400">
                  <summary className="cursor-pointer mb-2">Target Student Cohort (Default: All)</summary>
                  <select multiple className="w-full h-32 bg-surface-container-highest rounded-lg p-2 custom-scrollbar" onChange={e => setFormData({...formData, assignedTo: Array.from(e.target.selectedOptions, option => option.value)})}>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                  </select>
               </details>
               <button type="submit" className="w-full bg-secondary text-on-secondary font-black py-4 rounded-xl shadow-[0_0_15px_rgba(255,174,221,0.3)] hover:brightness-110 active:scale-95 transition-all">
                 Execute Deployment
               </button>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}
