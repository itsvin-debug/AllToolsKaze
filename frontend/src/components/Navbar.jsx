import React, { useState } from 'react';
import { 
  Download, 
  Menu, 
  X, 
  FileText, 
  Link2, 
  Sparkles, 
  Film, 
  Scissors, 
  Home, 
  Sun, 
  Moon,
  Zap
} from 'lucide-react';

export default function Navbar({ currentScreen, onSelectTool, onGoHome, theme = 'dark', onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === 'dark';

  const tools = [
    { id: 'downloader', label: 'Media Downloader', icon: Download },
    { id: 'linkToDoc', label: 'Link to PDF/PPT', icon: FileText },
    { id: 'imageToLink', label: 'Foto ke Link', icon: Link2 },
    { id: 'photoStudio', label: 'Photo Studio HD', icon: Sparkles },
    { id: 'videoStudio', label: 'Video Studio HD', icon: Film },
    { id: 'bgRemover', label: 'Remove BG', icon: Scissors },
    { id: 'waReact', label: 'WA Auto-React', icon: Zap }
  ];

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300 border-b ${
      isDark 
        ? 'bg-[#090b10]/90 border-white/[0.06] text-white' 
        : 'bg-white/90 border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-margin-desktop h-16 flex items-center justify-between">
        
        {/* Brand Logo Minimalis & Elegan */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 group cursor-pointer text-left shrink-0"
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-sm transition-all shadow-xs ${
            isDark 
              ? 'bg-white/5 border border-white/10 text-white group-hover:border-white/25' 
              : 'bg-indigo-600 text-white'
          }`}>
            <span>K</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`font-extrabold text-base sm:text-lg tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              kaze<span className="text-indigo-500">.</span>
            </span>
            <span className={`mono-badge text-[9px] px-1.5 py-0.5 rounded border ${
              isDark 
                ? 'bg-white/5 border-white/10 text-slate-400' 
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              STUDIO
            </span>
          </div>
        </button>

        {/* Desktop Quick-Switcher Navigation */}
        <nav className="hidden lg:flex items-center gap-1 h-full">
          <button
            onClick={onGoHome}
            className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentScreen === 'welcome'
                ? isDark 
                  ? 'bg-white/10 text-white border border-white/15' 
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : isDark 
                  ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </button>

          <div className={`h-4 w-px mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          {tools.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTool(item.id)}
                className={`h-8 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? isDark 
                      ? 'bg-white/10 text-white border border-white/20 shadow-sm' 
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                    : isDark 
                      ? 'text-slate-400 hover:text-white hover:bg-white/5' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Theme Switcher & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Tombol Ganti Tema (Dark / Light) */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-300' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-indigo-600'
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
            aria-label="Buka menu navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`lg:hidden backdrop-blur-2xl border-b px-4 py-4 flex flex-col gap-1 animate-fadeIn ${
          isDark 
            ? 'bg-[#0a0c12]/95 border-white/10 text-white' 
            : 'bg-white/95 border-slate-200 text-slate-900'
        }`}>
          <button
            onClick={() => {
              onGoHome();
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
              currentScreen === 'welcome'
                ? isDark ? 'bg-white/10 text-white font-bold' : 'bg-indigo-50 text-indigo-700 font-bold'
                : isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Beranda Semua Alat</span>
          </button>

          <div className={`h-px my-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

          {tools.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTool(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? isDark ? 'bg-white/10 text-white font-bold' : 'bg-indigo-50 text-indigo-700 font-bold'
                    : isDark ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-500" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
