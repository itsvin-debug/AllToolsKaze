import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronDown,
  Search,
  Check,
  Download,
  Flame,
  FileText,
  Link2,
  Minimize2,
  QrCode,
  Music,
  Sparkles,
  Film,
  Scissors
} from 'lucide-react';

export default function Navbar({ currentScreen, onSelectTool, onGoHome }) {
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const tools = [
    { id: 'downloader', label: 'Media Downloader', icon: Download },
    { id: 'jjFinder', label: 'Cari Link JJ', icon: Flame },
    { id: 'linkToDoc', label: 'Link to PDF/PPT', icon: FileText },
    { id: 'imageToLink', label: 'File ke Link', icon: Link2 },
    { id: 'compressor', label: 'Kompres Media HD', icon: Minimize2 },
    { id: 'qrStudio', label: 'QR Code Studio', icon: QrCode },
    { id: 'audioMerger', label: 'Audio Merger', icon: Music },
    { id: 'photoStudio', label: 'Photo Studio', icon: Sparkles },
    { id: 'videoStudio', label: 'Video Studio', icon: Film },
    { id: 'videoTrimmer', label: 'Video Trimmer', icon: Scissors },
    { id: 'bgRemover', label: 'Hapus Background', icon: Scissors }
  ];

  const currentToolObj = tools.find(t => t.id === currentScreen);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setToolsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    const searchEl = document.getElementById('search-tools-input');
    if (searchEl) {
      searchEl.focus();
      searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-black w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Brand Logo: KAZE STUDIO */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 group cursor-pointer text-left transition-transform active:scale-98"
          title="Kaze Studio - Beranda"
        >
          <div className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center font-mono font-black text-sm border-2 border-black shadow-[1.5px_1.5px_0px_#000000]">
            K
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-lg sm:text-xl tracking-tight text-black font-display">
              KAZE
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-black bg-white text-black tracking-wider uppercase">
              STUDIO
            </span>
          </div>
        </button>

        {/* Right Section Navigation */}
        <div className="flex items-center gap-2.5">
          {currentScreen === 'welcome' ? (
            <button
              onClick={handleSearchClick}
              className="px-3.5 py-1.5 rounded-lg border-2 border-black bg-black text-white font-bold text-xs sm:text-sm hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Cari</span>
            </button>
          ) : (
            <div className="flex items-center gap-2" ref={dropdownRef}>
              <button
                onClick={onGoHome}
                className="px-3 py-1.5 rounded-lg border-2 border-black bg-white text-black font-bold text-xs sm:text-sm hover:bg-black hover:text-white transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden xs:inline">Beranda</span>
              </button>

              {/* Tool Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                  className="px-3 py-1.5 rounded-lg border-2 border-black bg-white text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-[2px_2px_0px_#000000] hover:bg-neutral-50 cursor-pointer"
                >
                  <span className="max-w-[120px] truncate">
                    {currentToolObj?.label || 'Pilih Alat'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {toolsDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg p-1.5 bg-white border-2 border-black shadow-[4px_4px_0px_#000000] z-50">
                    <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-black font-bold border-b border-black mb-1">
                      Beralih ke Alat Lain
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-0.5 custom-scrollbar">
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
                            className={`w-full px-2 py-1.5 rounded text-left text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-black text-white'
                                : 'text-black hover:bg-neutral-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Icon className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{t.label}</span>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
