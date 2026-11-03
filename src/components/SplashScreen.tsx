import React from 'react';
import { Shield } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#101C2C] flex flex-col items-center justify-center animate-fade-in">
      <div className="relative">
        {/* Luxury Gold Glow */}
        <div className="absolute inset-0 bg-[#D4AF37] blur-3xl opacity-20 rounded-full animate-pulse" />
        
        <div className="relative flex flex-col items-center space-y-6">
          <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-[#D4AF37] to-[#f1d37a] p-[2px] shadow-2xl">
            <div className="w-full h-full bg-[#101C2C] rounded-[30px] flex items-center justify-center">
              <Shield className="w-12 h-12 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
              Service <span className="text-[#D4AF37]">Provider</span>
            </h1>
            <p className="text-[10px] font-bold tracking-[0.4em] text-slate-400 uppercase">
              Karachi Edition
            </p>
          </div>
        </div>
      </div>
      
      {/* Loading Indicator */}
      <div className="absolute bottom-16 w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent w-24 animate-[loading_1.5s_infinite_linear]" />
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};
