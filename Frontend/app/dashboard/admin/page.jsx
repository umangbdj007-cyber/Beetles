'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  
  // Tab control: 'analytics', 'users', 'events'
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchPendingEvents();
  }, []);

  const fetchStats = () => api.get('/admin/analytics').then(res => setStats(res.data)).catch(console.error);
  const fetchUsers = () => api.get('/admin/users').then(res => setUsers(res.data)).catch(console.error);
  const fetchPendingEvents = () => api.get('/events').then(res => setEvents(res.data.filter(e => e.approvalStatus === 'Pending'))).catch(console.error);

  const handleUpdateRole = async (userId, roleType) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { roleType });
      alert(`User role updated to ${roleType}`);
      fetchUsers();
    } catch(err) { alert('Failed to update role'); }
  };

  const handleDeleteUser = async (userId) => {
    if(!confirm('Are you strictly sure you want to terminate this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
      fetchStats();
    } catch(err) { alert('Failed to delete user'); }
  };

  const handleModerateEvent = async (eventId, newStatus) => {
    try {
      await api.put(`/events/${eventId}/approve`, { status: newStatus });
      fetchPendingEvents();
      fetchStats();
    } catch(err) { alert('Failed to moderate event'); }
  };

  return (
    <div className="w-full p-6 md:p-10 max-w-[1600px] mx-auto pb-24 h-screen flex flex-col">
      <header className="mb-8 border-b border-outline-variant/10 pb-8 flex justify-between items-end">
        <div>
           <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tighter text-error">
             Overwatch Grid
           </h1>
           <p className="text-zinc-400 font-medium mt-2">Super-user analytics and structural moderation matrix.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={()=>setActiveTab('analytics')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab==='analytics' ? 'bg-error text-on-error shadow-[0_0_15px_rgba(255,180,171,0.3)]' : 'bg-surface-container hover:bg-surface-container-high'}`}>Analytics</button>
           <button onClick={()=>setActiveTab('users')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab==='users' ? 'bg-error text-on-error shadow-[0_0_15px_rgba(255,180,171,0.3)]' : 'bg-surface-container hover:bg-surface-container-high'}`}>Users</button>
           <button onClick={()=>setActiveTab('events')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${activeTab==='events' ? 'bg-error text-on-error shadow-[0_0_15px_rgba(255,180,171,0.3)]' : 'bg-surface-container hover:bg-surface-container-high'}`}>
              Events
              {events.length > 0 && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span></span>}
           </button>
        </div>
      </header>

      {/* TAB: Analytics */}
      {activeTab === 'analytics' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 flex flex-col justify-between h-48 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-all"></div>
              <h4 className="text-secondary tracking-widest uppercase font-black text-xs">Total Users</h4>
              <span className="text-6xl font-headline font-black text-on-surface">{stats.totalUsers}</span>
           </div>
           
           <div className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 flex flex-col justify-between h-48 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-error/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-error/20 transition-all"></div>
              <h4 className="text-error tracking-widest uppercase font-black text-xs">Pending Events (Queue)</h4>
              <span className="text-6xl font-headline font-black text-error">{stats.pendingEvents}</span>
           </div>

           <div className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 flex flex-col justify-between h-48 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-yellow-500/20 transition-all"></div>
              <h4 className="text-yellow-500 tracking-widest uppercase font-black text-xs">Open Complaints</h4>
              <span className="text-6xl font-headline font-black text-yellow-500">{stats.openComplaints}</span>
           </div>

           <div className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 flex flex-col justify-between h-48 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-[50px] rounded-full pointer-events-none group-hover:bg-green-500/20 transition-all"></div>
              <h4 className="text-green-500 tracking-widest uppercase font-black text-xs">Active Clubs</h4>
              <span className="text-6xl font-headline font-black text-green-500">{stats.totalClubs}</span>
           </div>
        </div>
      )}

      {/* TAB: Users */}
      {activeTab === 'users' && (
        <div className="bg-surface-container rounded-[2rem] p-6 border border-outline-variant/10 flex-1 overflow-hidden flex flex-col">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant/20">
                <th className="pb-4 text-xs tracking-widest uppercase text-zinc-500">Name</th>
                <th className="pb-4 text-xs tracking-widest uppercase text-zinc-500">Email</th>
                <th className="pb-4 text-xs tracking-widest uppercase text-zinc-500">Permission Role</th>
                <th className="pb-4 text-xs tracking-widest uppercase text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="block max-h-[500px] overflow-y-auto custom-scrollbar w-full" style={{ display: 'table-row-group' }}>
              {users.map(u => (
                <tr key={u._id} className="border-b border-outline-variant/5 hover:bg-surface-container-high transition-colors">
                  <td className="py-4 font-bold text-on-surface">{u.name} {u.societyVerified && <span className="text-xs text-primary ml-2 uppercase">Verified</span>}</td>
                  <td className="py-4 text-sm text-zinc-400">{u.email}</td>
                  <td className="py-4">
                    <select 
                      className="bg-surface-container-highest border-none rounded-lg px-3 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
                      value={u.role}
                      onChange={e => handleUpdateRole(u._id, e.target.value)}
                    >
                      <option>Student</option>
                      <option>Teacher</option>
                      <option>Admin</option>
                    </select>
                  </td>
                  <td className="py-4 text-right">
                    <button onClick={() => handleDeleteUser(u._id)} className="text-error bg-error/10 hover:bg-error hover:text-on-error px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest transition-all">Terminate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: Events */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto custom-scrollbar">
          {events.length === 0 && <p className="col-span-full text-zinc-500 p-10 text-center">No structural modification requests in queue.</p>}
          {events.map(ev => (
            <div key={ev._id} className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-sm mb-4 inline-block">PENDING APPROVAL</span>
                <h4 className="font-headline font-black text-xl mb-1">{ev.name}</h4>
                <p className="text-xs text-secondary font-bold uppercase tracking-widest mb-3">Host ID: {ev.createdBy}</p>
                <p className="text-sm text-zinc-400 line-clamp-3 mb-6">{ev.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleModerateEvent(ev._id, 'Approved')} className="flex-1 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Approve</button>
                <button onClick={() => handleModerateEvent(ev._id, 'Rejected')} className="flex-1 bg-error/10 text-error hover:bg-error hover:text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
