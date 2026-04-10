'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function Marketplace() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ itemName: '', description: '', price: '', type: 'Sale' });

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
      await api.post('/marketplace', { ...formData, price: Number(formData.price) });
      fetchItems();
      setFormData({ itemName: '', description: '', price: '', type: 'Sale' });
    } catch (err) { alert('Error posting item'); }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 w-full max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Campus Marketplace</h1>
        <p className="text-slate-500 mb-8">Buy, sell, or request services among campus peers. Negotiate through chat.</p>

        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Post a Listing</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex gap-4">
              <select className="p-2 border rounded bg-slate-50 focus:outline-primary-500" value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}>
                <option value="Sale">For Sale</option>
                <option value="Service">Service</option>
              </select>
              <input type="text" placeholder="Item / Service Name" required className="w-full p-2 border rounded" value={formData.itemName} onChange={e=>setFormData({...formData, itemName: e.target.value})} />
            </div>
            <textarea placeholder="Description" required className="w-full p-2 border rounded" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
            {formData.type === 'Sale' && (
              <input type="number" placeholder="Price (₹ or $)" required className="w-full p-2 border rounded" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} />
            )}
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow transition">Post Listing</button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map(item => (
            <div key={item._id} className="bg-white p-5 rounded-xl shadow-sm border relative overflow-hidden group hover:shadow-md transition">
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white rounded-bl-lg ${item.type === 'Sale' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                {item.type}
              </div>
              <h3 className="font-bold text-lg mt-2 pr-12">{item.itemName}</h3>
              <p className="text-2xl font-black text-green-600 my-2">{item.price ? `$${item.price}` : 'Negotiable'}</p>
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">{item.description}</p>
              <div className="text-xs text-slate-400 border-t pt-3 mt-auto">
                Posted by {item.seller?.name || 'User'}
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-slate-500 md:col-span-3">No active listings.</p>}
        </div>
      </div>
    </div>
  );
}
