import { useEffect, useState } from 'react';
import { useSocket } from './SocketProvider';
import api from '@/lib/api';

export default function DashboardLayout({ user }) {
  const { socket } = useSocket();
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');

  useEffect(() => {
    if (!socket) return;
    
    socket.on('new_announcement', (announcement) => {
      setAnnouncements(prev => [announcement, ...prev]);
    });

    api.get('/announcements').then(res => setAnnouncements(res.data)).catch(err => console.error(err));

    return () => {
      socket.off('new_announcement');
    };
  }, [socket]);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', { title: newAnnTitle, content: newAnnContent });
      setNewAnnTitle(''); setNewAnnContent('');
    } catch (err) { alert('Failed to post announcement'); }
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 mt-6">
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Welcome back, {user?.name}!</h2>
          <p className="text-slate-500">You are logged in as a <strong>{user?.role}</strong>.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Quick Links Cards */}
          <ModuleCard title="Academic" desc="View timetables and assignments" icon="📚" href="/academic" color="bg-blue-50 text-blue-600" />
          <ModuleCard title="Student Core" desc="Smart AI features, skill swap, canteen & tracking" icon="🧠" href="/student-core" color="bg-amber-50 text-amber-600 border-amber-200 shadow shadow-amber-100" />
          <ModuleCard title="Class Timetable" desc="Track and view class schedules" icon="⏰" href="/academic/classes" color="bg-sky-50 text-sky-600" />
          <ModuleCard title="Events" desc="Discover and register for campus events" icon="🎉" href="/events" color="bg-purple-50 text-purple-600" />
          <ModuleCard title="Marketplace" desc="Buy, sell, or request services" icon="🛒" href="/marketplace" color="bg-green-50 text-green-600" />
          {user?.role === 'Student' && <ModuleCard title="Complaints" desc="Lodge and track complaints" icon="📝" href="/complaints" color="bg-red-50 text-red-600" />}
          {user?.role === 'Admin' && <ModuleCard title="Manage Complaints" desc="View and update complaints" icon="⚙️" href="/complaints" color="bg-orange-50 text-orange-600" />}
          {user?.role === 'Admin' && <ModuleCard title="Manage Users" desc="Admin panel for users" icon="👥" href="/admin/users" color="bg-teal-50 text-teal-600" />}
          <ModuleCard title="Campus Chat" desc="Real-time global and private chat" icon="💬" href="/chat" color="bg-indigo-50 text-indigo-600" />
        </div>
      </div>
      
      {/* Sidebar right: Live Announcements */}
      <div className="w-full md:w-80 space-y-4">
        {(user?.role === 'Admin' || user?.role === 'Teacher') && (
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase px-1">Post Announcement</h3>
            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <input type="text" placeholder="Title" required className="w-full text-sm p-2 border rounded focus:outline-primary-500" value={newAnnTitle} onChange={(e) => setNewAnnTitle(e.target.value)} />
              <textarea placeholder="Message content..." required className="w-full text-sm p-2 border rounded resize-none h-20 focus:outline-primary-500" value={newAnnContent} onChange={(e) => setNewAnnContent(e.target.value)}></textarea>
              <button className="w-full bg-primary-600 text-white font-medium text-sm py-2 rounded drop-shadow hover:bg-primary-700 transition">Broadcast</button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h3 className="font-bold text-slate-800">Live Announcements</h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {announcements.length === 0 ? (
              <p className="text-sm text-slate-400">No new announcements.</p>
            ) : (
              announcements.map((ann, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-sm animate-fade-in">
                  <h4 className="font-semibold text-sm mb-1">{ann.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{ann.content}</p>
                  <p className="text-[10px] text-slate-400 text-right">By {ann.author?.name || 'Admin'} • Just now</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ title, desc, icon, href, color }) {
  return (
    <a href={href} className="group block bg-white rounded-xl border p-5 shadow-sm hover:shadow-md hover:border-primary-200 transition">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${color}`}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 group-hover:text-primary-600 transition">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{desc}</p>
    </a>
  );
}
