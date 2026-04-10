'use client';
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/components/SocketProvider';

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    setUser({ role, name });

    if (socket) {
      socket.emit('join_chat', 'global-campus');
      socket.on('receive_message', (data) => {
        setMessages(prev => [...prev, data]);
      });
    }

    return () => {
      if (socket) socket.off('receive_message');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const data = {
      room: 'global-campus',
      author: user?.name || 'User',
      role: user?.role || 'Student',
      message: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send_message', data);
    setInput('');
  };

  if(!user) return <div className="text-secondary animate-pulse p-8">Initializing Quantum Link...</div>;

  return (
    <div className="flex h-full w-full max-h-screen">
      {/* Left Pane: Rooms & Channels (Static for now) */}
      <section className="hidden md:flex w-80 bg-surface-container-low flex-col h-full border-r border-outline-variant/10">
        <div className="p-6">
          <h2 className="text-xl font-headline font-extrabold tracking-tight mb-6 text-on-surface">Channels</h2>
          <div className="space-y-2 mb-8">
            <div className="group cursor-pointer p-3 rounded-xl bg-surface-container-highest/40 flex items-center gap-x-3 transition-all duration-300 border-l-2 border-primary shadow-[inset_0_0_12px_rgba(107,74,246,0.15)]">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs">#</div>
              <span className="font-medium text-primary">Global Campus</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(255,174,221,0.7)] animate-pulse"></span>
            </div>
            <div className="group cursor-pointer p-3 rounded-xl hover:bg-surface-container-high flex items-center gap-x-3 transition-all duration-300">
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-zinc-500 font-bold text-xs">#</div>
              <span className="font-medium text-zinc-400 group-hover:text-zinc-200">Help Desk</span>
            </div>
          </div>
          
          <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">Direct Messages</h3>
          <div className="space-y-1">
            <div className="group cursor-pointer p-3 rounded-xl hover:bg-surface-container-high flex items-center gap-x-3 transition-all duration-300">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-900/50 border border-emerald-500 flex justify-center items-center font-bold text-emerald-400">SJ</div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-container-low rounded-full"></div>
              </div>
              <div className="flex-grow">
                <p className="text-sm font-semibold text-zinc-300 group-hover:text-white">Sarah Jenkins</p>
                <p class="text-xs text-zinc-500 truncate italic">Online</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right Pane: Thread Content */}
      <section className="flex-grow flex flex-col bg-background relative h-[calc(100vh)] max-h-screen">
        {/* Chat Header */}
        <header className="h-20 flex items-center px-8 bg-surface-container-low/60 backdrop-blur-3xl border-b border-outline-variant/10 z-10 sticky top-0 shrink-0">
          <div className="flex items-center gap-x-4">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container font-black text-xl">#</div>
            <div>
              <h2 className="text-lg font-headline font-bold text-on-surface">Global Campus</h2>
              <p className="text-xs text-secondary font-medium tracking-wide">Live Socket Connection</p>
            </div>
          </div>
        </header>

        {/* Message Thread */}
        <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
          <div className="flex items-center justify-center mb-8">
            <span className="px-4 py-1 rounded-full bg-surface-container-high text-[10px] text-zinc-500 font-bold uppercase tracking-widest border border-outline-variant/10">Today</span>
          </div>

          {messages.map((msg, idx) => {
            const isMe = msg.author === user.name;
            return (
              <div key={idx} className={`flex gap-x-4 max-w-2xl ${isMe ? 'flex-row-reverse ml-auto group' : 'group'}`}>
                <div className={`w-10 h-10 rounded-full mt-1 border border-outline-variant/30 flex items-center justify-center font-bold text-xs shrink-0 ${isMe ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-highest text-on-surface'}`}>
                   {msg.author.substring(0,2).toUpperCase()}
                </div>
                <div className={`space-y-1 ${isMe ? 'text-right' : ''}`}>
                  <div className={`flex items-baseline gap-x-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-sm font-bold ${isMe ? 'text-primary' : 'text-tertiary'}`}>{msg.author} <span className="text-[10px] font-normal opacity-50">({msg.role})</span></span>
                    <span className="text-[10px] text-zinc-600 font-medium">{msg.time}</span>
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe 
                    ? 'bg-gradient-to-br from-primary-container to-[#4b31c1] rounded-tr-none text-white shadow-lg shadow-primary-container/20' 
                    : 'bg-surface-container-high border border-outline-variant/10 rounded-tl-none text-zinc-200'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Area */}
        <footer className="px-4 md:px-8 pb-8 pt-4 bg-background shrink-0">
          <form onSubmit={sendMessage} className="relative max-w-5xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative bg-surface-container-high/90 backdrop-blur-md rounded-2xl flex items-center p-2 pl-6 gap-x-4 border border-outline-variant/20 shadow-2xl">
              <span className="material-symbols-outlined text-zinc-500" style={{fontVariationSettings: "'FILL' 1"}}>dataset</span>
              <input 
                className="flex-grow bg-transparent border-none focus:ring-0 text-sm font-medium placeholder-zinc-600 text-on-surface py-3 outline-none" 
                placeholder="Type a message in #global-campus..." 
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <div className="flex items-center gap-x-2 pr-2">
                <button type="submit" className="bg-gradient-to-r from-primary to-primary-container p-3 rounded-xl shadow-[0_5px_15px_rgba(107,74,246,0.3)] text-on-primary hover:scale-105 active:scale-95 transition-all">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </form>
        </footer>
      </section>
    </div>
  );
}
