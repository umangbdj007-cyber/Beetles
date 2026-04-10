'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function AdminUsers() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    setUser({ role, name });
    if (role === 'Admin') fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleRoleChange = async (id, newRole, name, email) => {
    try {
      await api.put(`/users/${id}`, { role: newRole, name, email });
      fetchUsers();
    } catch (err) { alert('Failed to update role'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) { alert('Failed to delete user'); }
  };

  if (!user || user.role !== 'Admin') return <div className="p-8">Access Denied / Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 w-full max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-6">User Management</h1>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 text-sm uppercase">
              <tr>
                <th className="p-4 border-b">Name</th>
                <th className="p-4 border-b">Email</th>
                <th className="p-4 border-b">Role</th>
                <th className="p-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="p-4 border-b font-medium">{u.name}</td>
                  <td className="p-4 border-b text-slate-500">{u.email}</td>
                  <td className="p-4 border-b">
                    <select 
                      className="p-1 border rounded bg-white text-sm"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value, u.name, u.email)}
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 border-b">
                    <button onClick={() => handleDelete(u._id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
