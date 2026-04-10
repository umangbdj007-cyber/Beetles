'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function Academic() {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    setUser({ role, name });
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments', { title: newTitle, description: newDesc, dueDate: newDate });
      fetchAssignments();
      setNewTitle(''); setNewDesc(''); setNewDate('');
    } catch (err) { console.error(err); }
  };

  const submitAssignment = async (id, content) => {
    try {
      await api.post(`/assignments/${id}/submit`, { content });
      alert('Submitted successfully!');
      fetchAssignments();
    } catch (err) { alert('Failed to submit'); }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 w-full max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Academic Module</h1>
        </div>

        {user.role === 'Teacher' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
            <h2 className="text-xl font-bold mb-4">Post Assignment</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <input type="text" placeholder="Assignment Title" required className="w-full p-2 border rounded" value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
              <textarea placeholder="Description" required className="w-full p-2 border rounded" value={newDesc} onChange={e=>setNewDesc(e.target.value)}></textarea>
              <input type="date" required className="w-full p-2 border rounded" value={newDate} onChange={e=>setNewDate(e.target.value)} />
              <button className="bg-primary-600 text-white px-4 py-2 rounded">Post Assignment</button>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          <h2 className="text-xl font-bold mt-4">Current Assignments</h2>
          {assignments.length === 0 ? <p className="text-slate-500">No assignments posted.</p> : assignments.map(a => (
            <div key={a._id} className="bg-white p-5 rounded-xl shadow-sm border">
              <h3 className="font-bold text-lg">{a.title}</h3>
              <p className="text-sm text-slate-600 my-2">{a.description}</p>
              <p className="text-xs text-red-500 mb-4">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
              
              {user.role === 'Student' && (
                <div className="mt-4 pt-4 border-t">
                  <textarea id={`submit-${a._id}`} placeholder="Write your submission here..." className="w-full p-2 border rounded mb-2 text-sm"></textarea>
                  <button onClick={() => submitAssignment(a._id, document.getElementById(`submit-${a._id}`).value)} className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium">Submit Work</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
