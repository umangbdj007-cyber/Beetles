'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function MarketplacePage() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ itemName: '', description: '', price: '', type: 'Sale' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    setUser({ role, name });
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/marketplace');
      setItems(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/marketplace', { ...formData, price: formData.type === 'Sale' ? Number(formData.price) : 0 });
      fetchItems();
      setFormData({ itemName: '', description: '', price: '', type: 'Sale' });
    } catch (err) { alert('Error posting item'); }
  };

  if(!user) return null;

  const filteredItems = items.filter(item => item.itemName.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-grow p-6 md:p-10 bg-background max-w-7xl mx-auto w-full">
      
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter mb-2 bg-gradient-to-br from-on-surface to-on-surface-variant bg-clip-text text-transparent">
             Student Marketplace.
          </h1>
          <p className="text-zinc-500 font-medium tracking-tight text-lg">Exchange premium gear, textbooks, and essentials.</p>
        </div>
        <div className="flex gap-4">
          <div className="h-14 px-6 rounded-xl bg-surface-container-low flex items-center gap-3 border border-outline-variant/10 focus-within:border-primary/40 transition-all">
             <span className="material-symbols-outlined text-zinc-500">search</span>
             <input value={search} onChange={e=>setSearch(e.target.value)} className="bg-transparent border-none focus:ring-0 text-sm w-full md:w-48 text-on-surface outline-none placeholder:text-zinc-600" placeholder="Search items..." type="text" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Create Listing Section (Asymmetric Left Col) */}
        <section className="col-span-12 lg:col-span-4 sticky top-8 space-y-8">
          <div className="p-8 rounded-[2rem] bg-surface-container-low/50 backdrop-blur-3xl border border-outline-variant/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[80px] pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                 <div className="h-12 w-12 rounded-xl bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>add_circle</span>
                 </div>
                 <h2 className="text-2xl font-black font-headline text-on-surface tracking-tight">Create Listing</h2>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-5">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Item / Service Title</label>
                    <input required className="w-full bg-surface-container-high border-none rounded-xl py-4 px-5 text-sm text-on-surface placeholder:text-zinc-600 focus:ring-1 focus:ring-primary transition-all outline-none" placeholder="e.g. Sony WH-1000XM4" type="text" value={formData.itemName} onChange={e=>setFormData({...formData, itemName: e.target.value})} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Type</label>
                       <select className="w-full bg-surface-container-high border-none rounded-xl py-4 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary transition-all outline-none appearance-none" value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}>
                          <option value="Sale">For Sale</option>
                          <option value="Service">Service</option>
                       </select>
                    </div>
                    {formData.type === 'Sale' && (
                      <div className="space-y-1">
                         <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Price ($)</label>
                         <input required type="number" className="w-full bg-surface-container-high border-none rounded-xl py-4 px-5 text-sm text-on-surface focus:ring-1 focus:ring-primary transition-all outline-none" placeholder="0.00" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} />
                      </div>
                    )}
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Description</label>
                    <textarea required className="w-full bg-surface-container-high border-none rounded-xl py-4 px-5 text-sm text-on-surface placeholder:text-zinc-600 focus:ring-1 focus:ring-primary transition-all outline-none resize-none" placeholder="Briefly describe condition or service..." rows="3" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
                 </div>
                 
                 <button type="submit" className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-black tracking-tight flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(107,74,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all">
                    Post Listing <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                 </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 rounded-[2rem] bg-surface-container-low border border-outline-variant/5">
                <span className="block text-4xl font-black font-headline text-secondary mb-1">{items.filter(i=>i.type==='Sale').length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Items</span>
             </div>
             <div className="p-6 rounded-[2rem] bg-surface-container-low border border-outline-variant/5">
                <span className="block text-4xl font-black font-headline text-tertiary mb-1">{items.filter(i=>i.type==='Service').length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Services</span>
             </div>
          </div>
        </section>

        {/* Masonry Grid / Cards Area */}
        <section className="col-span-12 lg:col-span-8">
          {filteredItems.length === 0 && <p className="text-zinc-500 text-lg">No listings available.</p>}
          <div className="columns-1 md:columns-2 gap-6 space-y-6">
            
            {filteredItems.map(item => (
              <article key={item._id} className="break-inside-avoid group relative rounded-[2rem] bg-surface-container-low border border-outline-variant/10 overflow-hidden transition-all duration-500 hover:translate-y-[-4px] hover:border-primary/30">
                 
                 <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                       <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${item.type === 'Sale' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-tertiary/10 text-tertiary border-tertiary/20'}`}>
                          {item.type}
                       </div>
                       
                       {item.type === 'Sale' && (
                         <div className="bg-emerald-500/90 text-emerald-950 font-black px-4 py-1.5 rounded-xl text-sm shadow-lg">
                            ${item.price.toFixed(2)}
                         </div>
                       )}
                    </div>
                    
                    <h3 className="text-2xl font-black font-headline text-on-surface mb-3 tracking-tight">{item.itemName}</h3>
                    <p className="text-sm text-zinc-400 mb-8 leading-relaxed font-body">{item.description}</p>
                    
                    <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4 mt-auto">
                       <div className="text-[10px] uppercase font-black tracking-widest text-outline">
                          Posted by <span className="text-primary-fixed">{item.seller?.name || 'User'}</span>
                       </div>
                    </div>
                 </div>
              </article>
            ))}

          </div>
        </section>
      </div>
    </div>
  );
}
