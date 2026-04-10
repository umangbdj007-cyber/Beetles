'use client';
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useSocket } from '@/components/SocketProvider';

export default function Chat() {
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
      author: user.name,
      role: user.role,
      message: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send_message', data);
    setInput('');
  };

  if (!user) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 w-full max-w-4xl mx-auto p-4 flex flex-col h-[calc(100vh-80px)]">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Global Campus Chat</h1>
        
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 space-y-4">
            {messages.map((msg, idx) => {
              const isMe = msg.author === user.name;
              return (
                <div key={idx} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none shadow-sm'}`}>
                    {!isMe && <div className="text-xs font-bold border-b pb-1 mb-1" style={{ color: msg.role === 'Admin' ? 'red' : msg.role === 'Teacher' ? 'orange' : 'teal' }}>{msg.author} ({msg.role})</div>}
                    <p className="text-sm">{msg.message}</p>
                    <span className={`text-[10px] mt-1 block ${isMe ? 'text-primary-100 text-right' : 'text-slate-400'}`}>{msg.time}</span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50"
                placeholder="Type your message here..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white rounded-full px-6 py-2 transition shadow"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
