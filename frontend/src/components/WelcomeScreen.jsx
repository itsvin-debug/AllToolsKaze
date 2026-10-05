import React, { useState } from 'react';
import { 
  Download,
  Music2, 
  Camera, 
  Play, 
  FileText, 
  Link2, 
  Sparkles, 
  Film, 
  Scissors, 
  ArrowRight, 
  LayoutGrid,
  X,
  CheckCircle2
} from 'lucide-react';
import KazeIdentityCard from './KazeIdentityCard';

export default function WelcomeScreen({ onSelectPlatform, onOpenTool, theme = 'dark', onToggleTheme }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlatformModal, setShowPlatformModal] = useState(false);

  // 4 Pilihan Platform Sosmed untuk Media Downloader
  const platforms = [
    {
      id: 'tiktok',
      name: 'TikTok',
      desc: 'No watermark & audio MP3',
      badge: 'MP4 / MP3',
      icon: Music2,
      accent: 'text-[#00f2fe]',
      bgAccent: 'bg-[#00f2fe]/10 border-[#00f2fe]/20'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      desc: 'Reels & Carousel HD',
      badge: 'Reels / Post',
      icon: Camera,
      accent: 'text-[#ec4899]',
      bgAccent: 'bg-[#ec4899]/10 border-[#ec4899]/20'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      desc: 'Shorts & video HD MP3',
      badge: 'Shorts / Video',
      icon: Play,
      accent: 'text-[#ef4444]',
      bgAccent: 'bg-[#ef4444]/10 border-[#ef4444]/20'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      desc: 'Video tweet master HD',
      badge: 'Tweet Video',
      icon: () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </svg>
      ),
      accent: 'text-white',
      bgAccent: 'bg-white/10 border-white/20'
    }
  ];

  // 6 Card Utama Sesuai Desain Foto Kedua (Media Downloader digabung jadi 1 Card)
  const tools = [
    {
      id: 'downloader',
      name: 'Media Downloader',
      desc: 'TikTok, IG, YouTube & X',
      tag: '4 SOSMED',
      icon: Download,
      onClick: () => setShowPlatformModal(true)
    },
    {
      id: 'imageToLink',
      name: 'Foto ke Link',
      desc: 'Ubah gambar jadi URL publik',
      tag: 'INSTANT',
      icon: Link2,
      onClick: () => onOpenTool('imageToLink')
    },
    {
      id: 'linkToDoc',
      name: 'Link ke PDF & PPT',
      desc: 'Scribd & Canva bypass dokumen',
      tag: 'DOC/PPT',
      icon: FileText,
      onClick: () => onOpenTool('linkToDoc')
    },
    {
      id: 'bgRemover',
      name: 'Hapus Background',
      desc: 'Latar transparan & pas foto',
      tag: 'PNG HD',
      icon: Scissors,
      onClick: () => onOpenTool('bgRemover')
    },
    {
      id: 'photoStudio',
      name: 'Photo Studio',
      desc: 'Pertajam foto & filter HD',
      tag: 'STUDIO',
      icon: Sparkles,
      onClick: () => onOpenTool('photoStudio')
    },
    {
      id: 'videoStudio',
      name: 'Video Studio',
      desc: 'Editor filter & slow-mo FX',
      tag: 'FX STUDIO',
      icon: Film,
      onClick: () => onOpenTool('videoStudio')
    }
  ];

  // Filter pencarian realtime
  const filteredTools = tools.filter((tool) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.desc.toLowerCase().includes(q) ||
      tool.tag.toLowerCase().includes(q)
    );
  });

  const isDark = theme === 'dark';

  return (
    <main className="flex-grow relative z-10 flex flex-col items-center justify-start px-4 sm:px-6 md:px-margin-desktop py-6 sm:py-8 w-full max-w-4xl mx-auto">
      
      {/* ─── KOMPONEN IDENTITAS, BANNER GIF, & PENCARIAN ALL TOOLS KAZE ─── */}
      <KazeIdentityCard 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* ─── SECTION TOOLS POPULER (PERSIS SESUAI FOTO KEDUA) ─── */}
      <div className="w-full flex items-center justify-between gap-3 mb-4 mt-2">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm sm:text-base font-bold font-mono tracking-tight text-slate-800 dark:text-slate-100">
            Tools Populer
          </h2>
        </div>

        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="text-xs text-rose-500 hover:underline font-mono cursor-pointer"
          >
            Hapus filter ✕
          </button>
        )}
      </div>

      {/* Grid Card Bersih & Smooth ala Foto Kedua (3 Kolom x 2 Baris) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
        {filteredTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              onClick={tool.onClick}
              className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-between text-center cursor-pointer group transition-all duration-200 border min-h-[170px] sm:min-h-[190px] select-none ${
                isDark 
                  ? 'bg-[#12151f] hover:bg-[#181c2b] border-white/10 hover:border-white/20 hover:scale-[1.02] shadow-md' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:scale-[1.02] shadow-sm'
              }`}
            >
              {/* Icon di tengah atas */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-slate-200 dark:text-slate-100 group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-indigo-400" />
              </div>

              {/* Judul & Keterangan Singkat */}
              <div className="my-1.5 flex flex-col items-center">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {tool.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {tool.desc}
                </p>
              </div>

              {/* Tag / Badge Minimalis */}
              <div className="mt-1">
                <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-slate-300' 
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  {tool.tag}
                </span>
              </div>

              {/* Panah di bawah (otomatis langsung kebuka saat card diklik) */}
              <div className="mt-2 text-slate-400 group-hover:text-indigo-400 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="w-full mt-10 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Fast Processing</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Tanpa Watermark</span>
          </span>
        </div>

        <div>
          <span>website download by kaze • 2026</span>
        </div>
      </div>

      {/* ─── MODAL PILIHAN PLATFORM MEDIA DOWNLOADER (TIKTOK, IG, YT, X) ─── */}
      {showPlatformModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all ${
            isDark ? 'bg-[#151926] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">Pilih Platform Medsos</h3>
                  <p className="text-[11px] text-slate-400">Pilih platform sebelum menempel link</p>
                </div>
              </div>
              <button
                onClick={() => setShowPlatformModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid 4 Opsi Platform */}
            <div className="grid grid-cols-2 gap-2.5">
              {platforms.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setShowPlatformModal(false);
                      onSelectPlatform(p.id);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between gap-3 cursor-pointer group ${
                      isDark 
                        ? 'bg-[#1a1e2d] hover:bg-[#202538] border-white/10 hover:border-indigo-400/40' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${p.bgAccent} ${p.accent}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-slate-400">
                        {p.badge}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                        <span>{p.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-indigo-400" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {p.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Info Validasi Ketat */}
            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Validasi link otomatis & anti salah medsos</span>
              </span>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
