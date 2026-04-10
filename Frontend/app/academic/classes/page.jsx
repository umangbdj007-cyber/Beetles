'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function ClassLogs() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({ topic: '', date: '', duration: '', attendanceCount: '', notes: '' });

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    setUser({ role, name });
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/classes', formData);
      fetchClasses();
      setFormData({ topic: '', date: '', duration: '', attendanceCount: '', notes: '' });
      alert('Class Logged!');
    } catch (err) { alert('Failed to log class'); }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 w-full max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">Class Logs / Timetable</h1>

        {user.role === 'Teacher' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
            <h2 className="text-xl font-bold mb-4">Log a new Class</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Topic Covered" required className="w-full p-2 border rounded md:col-span-2" value={formData.topic} onChange={e=>setFormData({...formData, topic: e.target.value})} />
              <div>
                <label className="text-xs text-slate-500">Date</label>
                <input type="datetime-local" required className="w-full p-2 border rounded" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-500">Duration (Minutes)</label>
                <input type="number" placeholder="60" required className="w-full p-2 border rounded" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} />
              </div>
              <input type="number" placeholder="Attendance Count" className="w-full p-2 border rounded md:col-span-2" value={formData.attendanceCount} onChange={e=>setFormData({...formData, attendanceCount: e.target.value})} />
              <textarea placeholder="Notes / Homework" className="w-full p-2 border rounded md:col-span-2" value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})}></textarea>
              <button className="bg-primary-600 text-white px-4 py-2 rounded md:col-span-2 shadow">Save Log</button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 text-sm uppercase">
              <tr>
                <th className="p-4 border-b">Date</th>
                <th className="p-4 border-b">Topic</th>
                <th className="p-4 border-b">Teacher</th>
                <th className="p-4 border-b">Duration</th>
                <th className="p-4 border-b">Notes</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? <tr><td colSpan="5" className="p-4 text-center text-slate-500">No classes logged yet.</td></tr> : classes.map(c => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="p-4 border-b font-medium">{new Date(c.date).toLocaleString()}</td>
                  <td className="p-4 border-b text-primary-700 font-semibold">{c.topic}</td>
                  <td className="p-4 border-b">{c.teacher?.name}</td>
                  <td className="p-4 border-b">{c.duration} mins</td>
                  <td className="p-4 border-b text-sm text-slate-600 max-w-xs truncate" title={c.notes}>{c.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
