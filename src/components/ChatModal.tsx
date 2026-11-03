import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Send, User, Briefcase, Clock, Check, 
  CheckCheck, Shield, Sparkles, Phone, MessageSquare
} from 'lucide-react';
import { Booking, ChatMessage, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface ChatModalProps {
  booking: Booking;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ booking, onClose }) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling for real-time feel
    return () => clearInterval(interval);
  }, [booking.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${booking.id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    setSending(true);
    const payload = {
      bookingId: booking.id,
      senderId: currentUser.id,
      senderRole: currentUser.role,
      content: newMessage.trim()
    };

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const isCustomer = currentUser?.role === 'customer';
  const partnerName = isCustomer ? booking.providerName || 'Service Provider' : booking.customerName;

  return (
    <div className="fixed inset-0 z-70 bg-[#101C2C]/80 backdrop-blur-md flex items-center justify-center animate-fade-in p-0 sm:p-4">
      <div className="w-full max-w-lg h-full sm:h-[85vh] bg-[#F3F4F6] sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative border border-white/5">
        
        {/* Chat Header (Premium Navy) */}
        <div className="bg-[#101C2C] p-6 flex items-center justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          
          <div className="flex items-center space-x-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 p-[1px] flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#f1d37a] rounded-[14px] flex items-center justify-center">
                {isCustomer ? <Briefcase className="w-6 h-6 text-[#101C2C]" /> : <User className="w-6 h-6 text-[#101C2C]" />}
              </div>
            </div>
            <div>
              <h3 className="text-white font-black uppercase tracking-tighter italic text-sm">{partnerName}</h3>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-[#087F5B] rounded-full animate-pulse shadow-[0_0_8px_#087F5B]" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Channel</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 relative z-10">
            <button className="p-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white transition">
              <Phone className="w-4.5 h-4.5" />
            </button>
            <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 text-white/60 hover:text-white transition">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Booking Info Strip */}
        <div className="bg-white px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[10px] font-black text-[#101C2C] uppercase tracking-widest italic">Order #{booking.id.split('-')[1]}</span>
          </div>
          <span className="text-[10px] font-black text-[#087F5B] uppercase tracking-widest">{booking.status.replace('_', ' ')}</span>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-[#F3F4F6]"
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center shadow-sm">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Encrypted Secure Line Established</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === currentUser?.id;
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} space-y-1.5 animate-slide-up`}
                >
                  <div 
                    className={`max-w-[80%] px-5 py-3.5 rounded-[24px] text-sm font-medium shadow-sm transition-all ${
                      isMine 
                        ? 'bg-[#101C2C] text-white rounded-tr-none' 
                        : 'bg-white text-[#101C2C] rounded-tl-none border border-slate-100'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center space-x-2 px-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMine && (
                      <div className="text-[#087F5B]">
                        {msg.status === 'read' ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3 text-slate-400" />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Input */}
        <div className="p-6 bg-white border-t border-slate-100 safe-area-bottom">
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center space-x-3 bg-[#F3F4F6] rounded-[28px] p-2 pr-2 border border-slate-100 focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37]/20 transition-all"
          >
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Express your requirements..."
              className="flex-1 bg-transparent px-4 py-3 text-sm font-bold text-[#101C2C] focus:outline-hidden placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-11 h-11 rounded-full bg-[#101C2C] flex items-center justify-center text-white hover:bg-black transition-all active:scale-90 disabled:opacity-50 shadow-xl shadow-[#101C2C]/20"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
        </div>

        {/* Security Badge */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-[#101C2C] text-[#D4AF37] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-2xl flex items-center space-x-1">
            <Shield className="w-2.5 h-2.5" />
            <span>P2P_ENCRYPTED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
