import React from 'react';

export const AuroraBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
      
      {/* Aurora Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 mix-blend-multiply filter blur-[100px] opacity-70 animate-aurora-1" />
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-400/20 mix-blend-multiply filter blur-[120px] opacity-60 animate-aurora-2" />
      <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-sky-300/20 mix-blend-multiply filter blur-[100px] opacity-70 animate-aurora-3" />
      
      {/* Noise Texture Overlay for Premium Feel */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{ backgroundImage: 'url("/noise.svg")' }}
      />
    </div>
  );
};
