'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await api.get('/clubs');
      setClubs(res.data);
      setLoading(false);
    } catch(err) { console.error(err); setLoading(false); }
  };

  const handleApply = async (clubId, roleAppliedFor) => {
    try {
      await api.post('/recruitment', { club: clubId, roleAppliedFor });
      alert('Application sent successfully to the recruitment channel.');
    } catch(err) {
      alert(err.response?.data?.msg || 'Error applying to club');
    }
  };

  if(loading) return <div className="p-10 text-white">Loading Ecosystem...</div>;

  const technical = clubs.filter(c => c.category === 'Technical');
  const cultural = clubs.filter(c => c.category === 'Cultural');
  const lifestyle = clubs.filter(c => c.category === 'Lifestyle');

  const Section = ({ title, data }) => (
    <div className="mb-12">
      <h3 className="text-2xl font-black font-headline text-primary mb-6 uppercase tracking-widest">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(club => (
          <div key={club._id} className="bg-surface-container-low/60 backdrop-blur-xl p-8 rounded-3xl border border-outline-variant/10 hover:bg-surface-container-high transition-all flex flex-col group relative overflow-hidden">
             
             {/* Neon Glow on hover */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] group-hover:bg-primary/20 transition-all pointer-events-none"></div>

             <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-black font-headline text-on-surface">{club.name}</h4>
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shadow-inner">
                   <span className="text-[10px] uppercase font-black text-outline">{title.substring(0,3)}</span>
                </div>
             </div>
             
             <p className="text-zinc-400 text-sm mb-8 flex-1 leading-relaxed">{club.description}</p>
             
             <div className="mt-auto border-t border-outline-variant/10 pt-6 flex justify-between items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{club.members?.length || 0} Members</span>
                <button 
                  onClick={() => handleApply(club._id, 'Junior Executive')} 
                  className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-on-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Apply
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full p-6 md:p-10 max-w-[1400px] mx-auto pb-24">
      <header className="mb-16">
        <h2 className="text-5xl md:text-7xl font-extrabold font-headline tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
           Ecosystem
        </h2>
        <p className="text-zinc-400 font-medium text-lg max-w-xl">Join elite societies, scale your network, and shape the campus vanguard.</p>
      </header>

      <Section title="Technical Core" data={technical} />
      <Section title="Cultural Sphere" data={cultural} />
      <Section title="Lifestyle Index" data={lifestyle} />
    </div>
  );
}
