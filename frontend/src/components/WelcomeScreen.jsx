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
  CheckCircle2,
  Flame,
  MessageCircle,
  Minimize2,
  QrCode,
  Music,
  Compass,
  Zap,
  Filter
} from 'lucide-react';
import KazeIdentityCard from './KazeIdentityCard';

export default function WelcomeScreen({ onSelectPlatform, onOpenTool, theme = 'dark' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showPlatformModal, setShowPlatformModal] = useState(false);

  // 4 Pilihan Platform Sosmed untuk Media Downloader
  const platforms = [
    {
      id: 'tiktok',
      name: 'TikTok',
      desc: 'Video HD & Slide Foto/Video',
      badge: 'MP4 / MP3',
      icon: Music2,
      accent: 'text-[#00f2fe]',
      bgAccent: 'bg-[#00f2fe]/10 border-[#00f2fe]/20'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      desc: 'Reels, Carousel & Foto HD',
      badge: 'Reels / Post',
      icon: Camera,
      accent: 'text-[#ec4899]',
      bgAccent: 'bg-[#ec4899]/10 border-[#ec4899]/20'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      desc: 'Shorts & Video Reguler MP3',
      badge: 'Shorts / Video',
      icon: Play,
      accent: 'text-[#ef4444]',
      bgAccent: 'bg-[#ef4444]/10 border-[#ef4444]/20'
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      desc: 'Video Tweet Master HD',
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

  // Kategori Menu Alat
  const categories = [
    { id: 'all', label: 'Semua Alat', count: 12 },
    { id: 'downloader', label: 'Downloader', count: 2 },
    { id: 'file', label: 'Konversi & File', count: 3 },
    { id: 'creative', label: 'Studio & Kreatif', count: 5 },
    { id: 'utility', label: 'Utilitas & WA', count: 2 }
  ];

  // 11 Alat Lengkap Kaze Suite (Dipindahkan dari Navbar Atas ke Area Foto Kedua dengan Desain Super Menarik)
  const tools = [
    {
      id: 'downloader',
      category: 'downloader',
      name: 'Media Downloader',
      desc: 'TikTok (Video & Slide), IG, YouTube & X',
      tag: '4 SOSMED',
      accentColor: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      borderColor: 'group-hover:border-cyan-500/50',
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      icon: Download,
      onClick: () => setShowPlatformModal(true)
    },
    {
      id: 'jjFinder',
      category: 'downloader',
      name: 'Cari Link JJ',
      desc: 'Template XML & Preset 5MB TikTok Jedag Jedug',
      tag: 'JEDAG JEDUG',
      accentColor: 'from-rose-500/20 via-pink-500/10 to-transparent',
      borderColor: 'group-hover:border-rose-500/50',
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      icon: Flame,
      onClick: () => onOpenTool('jjFinder')
    },
    {
      id: 'channelReact',
      category: 'utility',
      name: 'React Saluran WA',
      desc: 'Kirim reaksi emoji saluran WhatsApp real-time',
      tag: 'WA REACT',
      accentColor: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'group-hover:border-emerald-500/50',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      icon: MessageCircle,
      onClick: () => onOpenTool('channelReact')
    },
    {
      id: 'linkToDoc',
      category: 'file',
      name: 'Link to PDF & PPT',
      desc: 'Scribd, Canva & Web jadi dokumen asli',
      tag: 'DOC & PPTX',
      accentColor: 'from-amber-500/20 via-orange-500/10 to-transparent',
      borderColor: 'group-hover:border-amber-500/50',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      icon: FileText,
      onClick: () => onOpenTool('linkToDoc')
    },
    {
      id: 'imageToLink',
      category: 'file',
      name: 'File ke Link',
      desc: 'Foto, Video, dan PDF jadi URL web publik',
      tag: 'UNIVERSAL',
      accentColor: 'from-sky-500/20 via-blue-500/10 to-transparent',
      borderColor: 'group-hover:border-sky-500/50',
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      icon: Link2,
      onClick: () => onOpenTool('imageToLink')
    },
    {
      id: 'compressor',
      category: 'file',
      name: 'Kompres Media HD',
      desc: 'Kecilkan MB ke KB tanpa merusak kualitas HD',
      tag: 'MB ➔ KB',
      accentColor: 'from-violet-500/20 via-indigo-500/10 to-transparent',
      borderColor: 'group-hover:border-violet-500/50',
      iconColor: 'text-violet-400',
      iconBg: 'bg-violet-500/10 border-violet-500/20',
      icon: Minimize2,
      onClick: () => onOpenTool('compressor')
    },
    {
      id: 'qrStudio',
      category: 'creative',
      name: 'QR Code Studio',
      desc: 'Desain kode QR artistik, frame CTA & logo',
      tag: 'CUSTOM QR',
      accentColor: 'from-indigo-500/20 via-blue-500/10 to-transparent',
      borderColor: 'group-hover:border-indigo-500/50',
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      icon: QrCode,
      onClick: () => onOpenTool('qrStudio')
    },
    {
      id: 'audioMerger',
      category: 'creative',
      name: 'Audio Merger',
      desc: 'Satukan & potong menit/detik musik lagu',
      tag: 'TIMELINE',
      accentColor: 'from-fuchsia-500/20 via-pink-500/10 to-transparent',
      borderColor: 'group-hover:border-fuchsia-500/50',
      iconColor: 'text-fuchsia-400',
      iconBg: 'bg-fuchsia-500/10 border-fuchsia-500/20',
      icon: Music,
      onClick: () => onOpenTool('audioMerger')
    },
    {
      id: 'photoStudio',
      category: 'creative',
      name: 'Photo Studio',
      desc: 'Pertajam foto, filter HD & tingkatkan resolusi',
      tag: 'STUDIO HD',
      accentColor: 'from-purple-500/20 via-pink-500/10 to-transparent',
      borderColor: 'group-hover:border-purple-500/50',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      icon: Sparkles,
      onClick: () => onOpenTool('photoStudio')
    },
    {
      id: 'videoStudio',
      category: 'creative',
      name: 'Video Studio',
      desc: 'Editor filter visual video & slow-mo FX',
      tag: 'FX STUDIO',
      accentColor: 'from-red-500/20 via-orange-500/10 to-transparent',
      borderColor: 'group-hover:border-red-500/50',
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10 border-red-500/20',
      icon: Film,
      onClick: () => onOpenTool('videoStudio')
    },
    {
      id: 'videoTrimmer',
      category: 'creative',
      name: 'Video Trimmer',
      desc: 'Potong durasi video lossless tanpa merender ulang',
      tag: 'LOSSLESS CUT',
      accentColor: 'from-amber-500/20 via-rose-500/10 to-transparent',
      borderColor: 'group-hover:border-amber-500/50',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      icon: Scissors,
      onClick: () => onOpenTool('videoTrimmer')
    },
    {
      id: 'bgRemover',
      category: 'utility',
      name: 'Hapus Background',
      desc: 'Latar transparan & pembuat pas foto PNG HD',
      tag: 'PNG HD',
      accentColor: 'from-teal-500/20 via-cyan-500/10 to-transparent',
      borderColor: 'group-hover:border-teal-500/50',
      iconColor: 'text-teal-400',
      iconBg: 'bg-teal-500/10 border-teal-500/20',
      icon: Scissors,
      onClick: () => onOpenTool('bgRemover')
    }
  ];

  // Filter pencarian & kategori realtime
  const filteredTools = tools.filter((tool) => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    if (!matchesCategory) return false;

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
      
      {/* ─── 1. KOMPONEN IDENTITAS, BANNER VIDEO GERAK, & PENCARIAN (FOTO 1) ─── */}
      <KazeIdentityCard 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        theme={theme}
      />

      {/* ─── 2. SECTION NAVIGASI SEMUA ALAT KAZE (FOTO 2 - REVAMPED & ANIMATED) ─── */}
      <section className="w-full mt-4 flex flex-col gap-4 animate-fadeIn">
        
        {/* Header Section dengan Badge Dinamis */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight font-mono flex items-center gap-2 text-slate-900 dark:text-white">
                <span>Eksplorasi Semua Alat</span>
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  {filteredTools.length} Alat
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih alat yang ingin kamu gunakan dengan 1 kali klik instan
              </p>
            </div>
          </div>

          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-xs text-rose-500 hover:text-rose-400 font-mono flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset filter pencarian</span>
            </button>
          )}
        </div>

        {/* Filter Kategori Interaktif (Pills dengan Animasi Halus) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar w-full">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25 scale-[1.02]'
                    : isDark 
                      ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : isDark 
                      ? 'bg-white/10 text-slate-400' 
                      : 'bg-slate-200 text-slate-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid Card Alat (Foto Kedua): Desain Elegan, Animated Hover, & Non-Stiff */}
        {filteredTools.length === 0 ? (
          <div className={`w-full py-12 rounded-3xl border text-center flex flex-col items-center justify-center p-6 ${
            isDark ? 'bg-[#12151f] border-white/10 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <Filter className="w-10 h-10 text-indigo-400/50 mb-3" />
            <p className="font-bold text-sm text-slate-900 dark:text-white">Alat tidak ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain pada pencarian di atas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={tool.onClick}
                  className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between text-left cursor-pointer group transition-all duration-300 border min-h-[165px] sm:min-h-[185px] select-none overflow-hidden hover:-translate-y-1 hover:shadow-xl ${
                    isDark 
                      ? `bg-[#12151f] hover:bg-[#161a29] border-white/10 ${tool.borderColor}` 
                      : `bg-white hover:bg-slate-50 border-slate-200 ${tool.borderColor}`
                  }`}
                >
                  {/* Glowing Ambient Gradient on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                  {/* Header Card: Icon & Tag Badge */}
                  <div className="relative z-10 flex items-center justify-between w-full mb-3">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-sm ${tool.iconBg} ${tool.iconColor} group-hover:scale-110 group-hover:rotate-2`}>
                      <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                    </div>

                    <span className={`text-[9px] sm:text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-slate-300 group-hover:border-white/20' 
                        : 'bg-slate-100 border-slate-200 text-slate-600 group-hover:border-slate-300'
                    }`}>
                      {tool.tag}
                    </span>
                  </div>

                  {/* Body Card: Judul & Deskripsi Lengkap */}
                  <div className="relative z-10 my-1 flex flex-col">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>

                  {/* Footer Card: Panah Aksi Halus */}
                  <div className="relative z-10 mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
                    <span className="font-mono text-[10px] opacity-75 group-hover:opacity-100">Buka Alat</span>
                    <div className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* ─── FOOTER INFO ─── */}
      <footer className="w-full mt-10 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Multi-Tool Suite</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Tanpa Watermark</span>
          </span>
        </div>

        <div>
          <span>AllToolsKaze • 2026</span>
        </div>
      </footer>

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
                aria-label="Tutup Modal"
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
                <span>Mendukung Video HD & Slide Foto / Video</span>
              </span>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
