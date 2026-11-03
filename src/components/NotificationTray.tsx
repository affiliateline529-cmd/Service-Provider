import React, { useState, useEffect } from 'react';
import { 
  X, Bell, CheckCircle2, AlertCircle, MessageSquare, 
  CreditCard, Calendar, Shield, Clock, ChevronRight
} from 'lucide-react';
import { AppNotification } from '../types';
import { useAuth } from '../context/AuthContext';

interface NotificationTrayProps {
  onClose: () => void;
}

export const NotificationTray: React.FC<NotificationTrayProps> = ({ onClose }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/notifications/${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    try {
      await fetch(`/api/notifications/user/${currentUser.id}/read-all`, { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-[#D4AF37]" />;
      case 'chat': return <MessageSquare className="w-4 h-4 text-[#087F5B]" />;
      default: return <Shield className="w-4 h-4 text-[#101C2C]" />;
    }
  };

  return (
    <div className="absolute top-20 right-4 z-50 w-full max-w-[340px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-in slide-in-from-top-4 duration-300">
      <div className="bg-[#101C2C] p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
        <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-white font-black uppercase tracking-widest text-[10px]">Intelligence Alerts</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white transition">
            <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
        {loading ? (
            <div className="p-10 flex flex-col items-center justify-center space-y-4">
                <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Polling Karachi Node...</p>
            </div>
        ) : notifications.length === 0 ? (
            <div className="p-10 text-center space-y-4">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-200">
                    <Bell className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">No critical updates at this time. <br/> System operating normally.</p>
            </div>
        ) : (
            <div className="divide-y divide-gray-50">
                {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      onClick={() => markAsRead(notification.id)}
                      className={`p-4 flex items-start space-x-4 hover:bg-gray-50 transition-colors cursor-pointer group ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${!notification.isRead ? 'bg-white' : 'bg-gray-50'}`}>
                            {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h4 className={`text-[11px] font-black uppercase tracking-tight truncate ${!notification.isRead ? 'text-[#101C2C]' : 'text-gray-500'}`}>{notification.title}</h4>
                                <span className="text-[8px] font-bold text-gray-400 uppercase shrink-0 ml-2">{new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className={`text-[10px] mt-0.5 leading-relaxed line-clamp-2 ${!notification.isRead ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>{notification.message}</p>
                            {!notification.isRead && <div className="mt-2 w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37]" />}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button onClick={markAllAsRead} className="text-[9px] font-black text-[#101C2C] uppercase tracking-widest hover:text-[#087F5B] transition">Clear All Channels</button>
            <ChevronRight className="w-3 h-3 text-gray-300" />
        </div>
      )}
    </div>
  );
};
