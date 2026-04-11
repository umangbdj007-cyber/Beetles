'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'Student' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.post('/login', { email: formData.email, password: formData.password });
      
      // Enforce role selection match (optional frontend restriction)
      if (res.data.role !== formData.role && res.data.role !== 'Admin') {
         setError(`Account exists but is not registered as a ${formData.role}.`);
         return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('userId', res.data.id || '');
      
      const roleTarget = res.data.role.toLowerCase();
      router.push(`/dashboard/${roleTarget}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="font-body text-on-surface min-h-screen flex flex-col items-center justify-center p-4">
      {/* Hero Background Element (Asymmetric Depth) */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-container/10 blur-[120px] rounded-full z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary-container/10 blur-[100px] rounded-full z-0 pointer-events-none"></div>
      
      <main className="relative z-10 w-full max-w-[1100px] flex flex-col md:flex-row gap-0 overflow-hidden glass-panel rounded-xl shadow-2xl border border-outline-variant/20">
        
        {/* Branding & Context Side */}
        <div className="hidden md:flex w-5/12 p-12 flex-col justify-between bg-surface-container-low border-r border-outline-variant/15">
          <div>
            <h1 className="text-3xl font-headline font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                UniGrid
            </h1>
            <p className="mt-4 text-on-surface-variant font-medium leading-relaxed">
                The Neon Academic. Empowering student collaboration through a refined digital ecosystem.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-2xl">school</span>
              <div>
                <h3 className="text-sm font-headline font-bold text-on-surface tracking-tight">ACADEMIC HUB</h3>
                <p className="text-xs text-on-surface-variant mt-1">Real-time grade tracking and course management.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-secondary text-2xl">forum</span>
              <div>
                <h3 className="text-sm font-headline font-bold text-on-surface tracking-tight">SECURE CHAT</h3>
                <p className="text-xs text-on-surface-variant mt-1">End-to-end encrypted faculty communication.</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>shield</span>
            </div>
            <span className="text-[10px] font-label uppercase tracking-widest text-outline">Verified Campus Access</span>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center bg-surface/80">
          <div className="mb-10">
            <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">Welcome Back</h2>
            <p className="text-on-surface-variant mt-2">Enter your credentials to access the hub.</p>
            {error && <div className="mt-4 p-3 bg-error-container/30 border border-error text-error rounded-lg text-sm font-bold">{error}</div>}
          </div>

          {/* Role Selector (The Neon Academic Style) */}
          <div className="mb-8">
            <label className="text-[10px] font-label uppercase tracking-[0.2em] text-outline mb-3 block">Access Role</label>
            <div className="flex gap-2 p-1 bg-surface-container-highest rounded-xl">
                {['Student', 'Teacher', 'Admin'].map(roleOption => (
                    <button 
                        key={roleOption}
                        type="button"
                        onClick={() => setFormData({...formData, role: roleOption})}
                        className={`flex-1 py-2 px-4 rounded-lg font-headline font-bold text-sm transition-all focus:outline-none 
                            ${formData.role === roleOption ? 'bg-primary text-on-primary shadow shadow-primary/20 scale-100' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                    >
                        {roleOption === 'Teacher' ? 'Faculty' : roleOption}
                    </button>
                ))}
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="group">
                <label className="text-[10px] font-label uppercase tracking-[0.2em] text-outline mb-1 block group-focus-within:text-primary transition-colors">University Email</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">alternate_email</span>
                    <input 
                        className="w-full bg-surface-container-low border-0 rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/50 transition-all outline-none" 
                        placeholder="name@campus.edu" 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>
            </div>
            
            <div className="group">
                <label className="text-[10px] font-label uppercase tracking-[0.2em] text-outline mb-1 block group-focus-within:text-primary transition-colors">Security Key</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">lock</span>
                    <input 
                        className="w-full bg-surface-container-low border-0 rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/50 transition-all outline-none" 
                        placeholder="••••••••" 
                        type="password" 
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                </div>
            </div>
            
            <div className="flex items-center justify-between py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input class="w-4 h-4 rounded bg-surface-container-highest border-0 text-primary focus:ring-offset-background focus:ring-primary" type="checkbox"/>
                    <span className="text-xs text-on-surface-variant font-medium">Remember Device</span>
                </label>
                <a className="text-xs text-primary font-bold hover:text-secondary transition-colors" href="#">Lost Access?</a>
            </div>
            
            <button className="w-full bg-gradient-to-r from-primary to-primary-container py-4 rounded-xl font-headline font-extrabold text-on-primary tracking-tight text-lg shadow-lg shadow-primary-container/20 active:scale-[0.98] transition-transform" type="submit">
                Authorize Access
            </button>
          </form>
          
          <div className="mt-12 pt-8 border-t border-outline-variant/15 text-center">
            <p className="text-sm text-on-surface-variant">
                New to the network? 
                <Link className="text-primary font-bold hover:underline ml-1" href="/register">Create an Identity</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Decorative Label */}
      <div className="mt-8 flex items-center gap-6 opacity-30 select-none">
        <span className="text-[10px] font-label uppercase tracking-[0.3em]">Institutional Grade Security</span>
        <div className="w-1 h-1 rounded-full bg-on-surface"></div>
        <span className="text-[10px] font-label uppercase tracking-[0.3em]">v2.4.0 NEON</span>
        <div className="w-1 h-1 rounded-full bg-on-surface"></div>
        <span className="text-[10px] font-label uppercase tracking-[0.3em]">Encrypted Handshake</span>
      </div>
    </div>
  );
}
