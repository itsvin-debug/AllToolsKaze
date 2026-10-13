import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Sun, 
  Moon,
  ChevronDown,
  Sparkles,
  Download,
  Flame,
  MessageCircle,
  FileText,
  Link2,
  Minimize2,
  QrCode,
  Music,
  Film,
  Scissors,
  Check
} from 'lucide-react';

export default function Navbar({ currentScreen, onSelectTool, onGoHome, theme = 'dark', onToggleTheme }) {
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isDark = theme === 'dark';

  const tools = [
    { id: 'downloader', label: 'Media Downloader', desc: 'TikTok, IG, YouTube & X', icon: Download },
    { id: 'jjFinder', label: 'Cari Link JJ', desc: 'Template XML & 5MB TikTok', icon: Flame },
    { id: 'channelReact', label: 'React Saluran WA', desc: 'Reaksi emoji live saluran', icon: MessageCircle },
    { id: 'linkToDoc', label: 'Link to PDF/PPT', desc: 'Bypass Scribd & Canva', icon: FileText },
    { id: 'imageToLink', label: 'File ke Link', desc: 'Foto, Video, PDF jadi URL', icon: Link2 },
    { id: 'compressor', label: 'Kompres Media HD', desc: 'MB ke KB tanpa pecah', icon: Minimize2 },
    { id: 'qrStudio', label: 'QR Code Studio', desc: 'Desain kode QR artistik', icon: QrCode },
    { id: 'audioMerger', label: 'Audio Merger', desc: 'Timeline gabung audio', icon: Music },
    { id: 'photoStudio', label: 'Photo Studio', desc: 'Pertajam foto & filter', icon: Sparkles },
    { id: 'videoStudio', label: 'Video Studio', desc: 'Editor video & slow-mo', icon: Film },
    { id: 'videoTrimmer', label: 'Video Trimmer', desc: 'Potong durasi video lossless', icon: Scissors },
    { id: 'bgRemover', label: 'Hapus Background', desc: 'Latar transparan PNG HD', icon: Scissors }
  ];

  const currentToolObj = tools.find(t => t.id === currentScreen);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setToolsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 border-b ${
      isDark 
        ? 'bg-[#090b10]/90 border-white/[0.08] text-white shadow-lg shadow-black/20' 
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
        
        {/* Brand Logo Minimalis & Elegan */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 group cursor-pointer text-left shrink-0 transition-transform active:scale-95"
          title="Kembali ke Beranda"
        >
          <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center font-mono font-black text-sm transition-all shadow-md ${
            isDark 
              ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-white group-hover:border-indigo-400 group-hover:shadow-indigo-500/20' 
              : 'bg-indigo-600 text-white group-hover:bg-indigo-700'
          }`}>
            <span>K</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`font-extrabold text-base sm:text-lg tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              kaze<span className="text-indigo-500 animate-pulse">.</span>
            </span>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border tracking-wider ${
              isDark 
                ? 'bg-white/5 border-white/10 text-slate-400' 
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              STUDIO
            </span>
          </div>
        </button>

        {/* Right Section: Status / Switcher & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          
          {/* Tampilan saat di Halaman Utama (Welcome) */}
          {currentScreen === 'welcome' ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>12 Tools Aktif</span>
              </div>
            </div>
          ) : (
            /* Tampilan saat di Dalam Tool (Navigasi Balik & Dropdown Cepat) */
            <div className="flex items-center gap-2" ref={dropdownRef}>
              <button
                onClick={onGoHome}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isDark 
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Beranda</span>
              </button>

              {/* Dropdown Ganti Alat Instan */}
              <div className="relative">
                <button
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isDark 
                      ? 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/30 text-indigo-300' 
                      : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700'
                  }`}
                >
                  <span className="max-w-[110px] truncate">
                    {currentToolObj?.label || 'Pilih Alat'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Popover Menu Alat */}
                {toolsDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-64 rounded-2xl p-1.5 shadow-2xl border backdrop-blur-2xl z-50 animate-fadeIn ${
                    isDark 
                      ? 'bg-[#101420]/95 border-white/15 text-white' 
                      : 'bg-white/95 border-slate-200 text-slate-900'
                  }`}>
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-black/5 dark:border-white/5 mb-1">
                      Beralih ke Alat Lain
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                      {tools.map((t) => {
                        const Icon = t.icon;
                        const isCurrent = t.id === currentScreen;
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              onSelectTool(t.id);
                              setToolsDropdownOpen(false);
                            }}
                            className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isCurrent
                                ? isDark 
                                  ? 'bg-indigo-600/30 text-indigo-200 font-bold' 
                                  : 'bg-indigo-50 text-indigo-700 font-bold'
                                : isDark 
                                  ? 'text-slate-300 hover:bg-white/5 hover:text-white' 
                                  : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate">{t.label}</span>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tombol Ganti Tema (Dark / Light) */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-300 shadow-sm' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-indigo-600 shadow-sm'
            }`}
            title={isDark ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-300 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
}
