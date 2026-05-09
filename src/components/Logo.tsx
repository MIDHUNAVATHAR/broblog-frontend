import React from 'react';

const Logo = ({ className = "w-8 h-8", textColor = "text-slate-900" }: { className?: string; textColor?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${textColor}`}>
      <div className={`${className} bg-slate-900 rounded-xl flex items-center justify-center p-1.5 shadow-lg shadow-slate-200`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="white" xmlns="http://www.w3.org/2000/svg">
          {/* Stylized B Shape */}
          <path d="M25 15 H55 C75 15 75 45 55 45 H25 V15 Z M25 45 H60 C80 45 80 85 60 85 H25 V45 Z" fill="white" />
          {/* Chat Bubble inside B */}
          <path d="M35 25 H55 V40 H45 L35 48 V25 Z" fill="black" />
          {/* Lines in bubble */}
          <rect x="40" y="30" width="10" height="2" fill="white" />
          <rect x="40" y="34" width="10" height="2" fill="white" />
          <rect x="40" y="38" width="6" height="2" fill="white" />
          {/* Pen Nib overlapping B */}
          <path d="M50 55 L70 85 L60 92 L40 62 Z" fill="black" stroke="white" strokeWidth="1" />
          <circle cx="55" cy="73" r="1.5" fill="white" />
          <line x1="55" y1="73" x2="60" y2="80" stroke="white" strokeWidth="1" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tighter uppercase italic">BroBlog</span>
        <span className="text-[7px] font-bold tracking-[0.2em] uppercase text-slate-400">Write • Share • Inspire</span>
      </div>
    </div>
  );
};

export default Logo;
