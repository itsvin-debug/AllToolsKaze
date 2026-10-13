import React from 'react';
import { ArrowLeft, Compass } from 'lucide-react';

export default function CosmicBackButton({ onClick, label = "Kembali ke Beranda Tools" }) {
  return (
    <button
      onClick={onClick}
      className="group relative inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#090c17]/90 hover:bg-[#121629] border border-indigo-500/30 hover:border-cyan-400/60 text-slate-300 hover:text-white transition-all duration-300 shadow-lg shadow-black/50 hover:shadow-cyan-500/20 active:scale-95 cursor-pointer backdrop-blur-xl overflow-hidden"
      title={label}
    >
      {/* Efek Cahaya Nebula Kosmik saat Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Border Glow Animated Sweep */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-500 pointer-events-none" />

      {/* Kapsul Navigasi Orbit dengan ArrowLeft */}
      <div className="relative w-6 h-6 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:text-cyan-300 group-hover:border-cyan-400/50 group-hover:-translate-x-0.5 transition-all duration-300 shadow-sm shrink-0">
        <ArrowLeft className="w-3.5 h-3.5" />
      </div>

      {/* Teks & Badge Luar Angkasa */}
      <div className="relative flex items-center gap-2 text-xs font-semibold tracking-wide">
        <span className="group-hover:text-cyan-100 transition-colors">{label}</span>
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/25 border border-indigo-400/30 text-indigo-300 group-hover:text-cyan-300 group-hover:border-cyan-400/40 tracking-wider">
          ORBIT
        </span>
      </div>

      {/* Bintang Berdenyut (Cosmic Pulsing Star) */}
      <span className="relative w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse hidden sm:inline-block shadow-[0_0_8px_#22d3ee]" />
    </button>
  );
}
