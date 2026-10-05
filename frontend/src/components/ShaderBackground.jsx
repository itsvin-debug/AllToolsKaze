import React from 'react';

// Background Ambience Studio yang tenang, bersih, dan berkelas (support Dark & Light Mode)
export default function ShaderBackground({ theme = 'dark' }) {
  const isDark = theme === 'dark';

  return (
    <div 
      className={`fixed inset-0 z-0 pointer-events-none overflow-hidden bg-dot-grid transition-colors duration-500 ${
        isDark ? 'bg-[#08090c]' : 'bg-[#f8fafc]'
      }`}
    >
      {/* Subtle radial ambient light top center */}
      <div 
        className={`absolute -top-[15%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-500 ${
          isDark ? 'opacity-25' : 'opacity-40'
        }`}
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.4) 0%, rgba(56, 189, 248, 0.2) 40%, transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.25) 0%, rgba(56, 189, 248, 0.15) 40%, transparent 70%)'
        }}
      />

      {/* Soft warm ambient corner */}
      <div 
        className={`absolute -bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-all duration-500 ${
          isDark ? 'opacity-15' : 'opacity-25'
        }`}
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(244, 63, 94, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, transparent 70%)'
        }}
      />

      {/* Vignette mask */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${
          isDark 
            ? 'bg-gradient-to-b from-transparent via-[#08090c]/40 to-[#08090c]' 
            : 'bg-gradient-to-b from-transparent via-slate-100/40 to-[#f8fafc]'
        }`} 
      />
    </div>
  );
}
