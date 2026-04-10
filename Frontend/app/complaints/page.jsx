'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function Complaints() {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

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
    } catch (err) { alert('Error posting complaint'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/complaints/${id}/status`, { status });
      fetchComplaints();
    } catch (err) { alert('Failed to update status'); }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 w-full max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">Campus Complaints</h1>

        {user.role === 'Student' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Lodge a New Complaint</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Complaint Subject" required className="w-full p-2 border rounded focus:outline-primary-500" value={title} onChange={e=>setTitle(e.target.value)} />
              <textarea placeholder="Detailed description..." required className="w-full p-2 border rounded focus:outline-primary-500 min-h-[100px]" value={description} onChange={e=>setDescription(e.target.value)}></textarea>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded shadow transition">Submit Complaint</button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold mt-4">{user.role === 'Admin' ? 'All Received Complaints' : 'Your Complaints'}</h2>
          {complaints.length === 0 ? <p className="text-slate-500">No complaints found.</p> : complaints.map(c => (
            <div key={c._id} className="bg-white p-5 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{c.title}</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${
                    c.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    c.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>{c.status}</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{c.description}</p>
                {user.role === 'Admin' && <p className="text-xs text-slate-400">By: {c.student?.name} ({c.student?.email})</p>}
                <p className="text-xs text-slate-400 mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>

              {user.role === 'Admin' && (
                <div className="flex gap-2">
                  <select 
                    className="p-2 border rounded text-sm bg-slate-50"
                    value={c.status}
                    onChange={(e) => updateStatus(c._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
