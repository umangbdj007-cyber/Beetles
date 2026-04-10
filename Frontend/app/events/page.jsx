'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function Events() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', startTime: '', endTime: '', location: '' });

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const id = localStorage.getItem('id'); // needed for checking participants
    setUser({ role, name, id });
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', formData);
      fetchEvents();
      setFormData({ name: '', description: '', startTime: '', endTime: '', location: '' });
      alert('Event Created!');
    } catch (err) { alert(err.response?.data?.msg || 'Error creating event'); }
  };

  const registerEvent = async (id) => {
    try {
      await api.post(`/events/${id}/register`);
      alert('Successfully registered!');
      fetchEvents();
    } catch (err) { alert(err.response?.data?.msg || 'Error registering'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/events/${id}/status`, { status });
      fetchEvents();
      alert(`Event ${status}`);
    } catch (err) { alert('Error updating status'); }
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 w-full max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">Campus Events</h1>

        {(user.role === 'Admin' || user.role === 'Teacher' || user.role === 'Student') && (
          <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
            <h2 className="text-xl font-bold mb-4">{user.role === 'Admin' ? 'Host New Event' : 'Request Event Approval'}</h2>
            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Event Name" required className="w-full p-2 border rounded md:col-span-2" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
              <textarea placeholder="Description" required className="w-full p-2 border rounded md:col-span-2" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
              <div>
                <label className="text-xs text-slate-500">Start Time</label>
                <input type="datetime-local" required className="w-full p-2 border rounded" value={formData.startTime} onChange={e=>setFormData({...formData, startTime: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-500">End Time</label>
                <input type="datetime-local" required className="w-full p-2 border rounded" value={formData.endTime} onChange={e=>setFormData({...formData, endTime: e.target.value})} />
              </div>
              <input type="text" placeholder="Location / Venue" required className="w-full p-2 border rounded md:col-span-2" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} />
              <button className="bg-primary-600 text-white px-4 py-2 rounded md:col-span-2 shadow">Create Event</button>
            </form>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {events.length === 0 ? <p className="text-slate-500">No upcoming events.</p> : events.filter(e => user.role === 'Admin' || e.status === 'Approved' || user.role === 'Teacher').map(ev => {
            const isRegistered = ev.participants.includes(user.id);
            return (
              <div key={ev._id} className="bg-white p-5 rounded-xl shadow-sm border relative">
                {ev.status !== 'Approved' && (
                  <span className={`absolute top-0 right-0 px-2 py-1 text-xs font-bold text-white rounded-bl border-b border-l ${ev.status === 'Pending' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                    {ev.status}
                  </span>
                )}
                <h3 className="font-bold text-lg text-primary-700 pr-16">{ev.name}</h3>
                <p className="text-sm text-slate-600 my-2">{ev.description}</p>
                <div className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded">
                  <p><strong>🕒 Time:</strong> {new Date(ev.startTime).toLocaleString()} - {new Date(ev.endTime).toLocaleTimeString()}</p>
                  <p><strong>📍 Venue:</strong> {ev.location}</p>
                  <p><strong>👥 Participants:</strong> {ev.participants.length}</p>
                </div>
                
                {ev.status === 'Approved' && user.role === 'Student' && (
                  <button 
                    onClick={() => registerEvent(ev._id)} 
                    disabled={isRegistered}
                    className={`w-full py-2 rounded text-sm font-medium transition ${isRegistered ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white'}`}
                  >
                    {isRegistered ? 'Already Registered' : 'Register for Event'}
                  </button>
                )}

                {user.role === 'Admin' && ev.status === 'Pending' && (
                  <div className="flex gap-2 mt-4 border-t pt-4">
                    <button onClick={() => updateStatus(ev._id, 'Approved')} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 rounded text-sm font-medium">Approve</button>
                    <button onClick={() => updateStatus(ev._id, 'Rejected')} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded text-sm font-medium">Reject</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
