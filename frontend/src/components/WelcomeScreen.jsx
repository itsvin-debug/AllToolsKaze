import React, { useState } from 'react';
import { 
  Download,
  Flame, 
  FileText, 
  Link2, 
  Minimize2, 
  QrCode, 
  Music, 
  Sparkles, 
  Film, 
  Scissors, 
  ArrowRight, 
  X,
  Filter,
  Images
} from 'lucide-react';
import KuroIdentityCard from './KuroIdentityCard';

export default function WelcomeScreen({ onSelectPlatform, onOpenTool }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Semua Alat', count: 12 },
    { id: 'downloader', label: 'Downloader', count: 2 },
    { id: 'file', label: 'Konversi & File', count: 4 },
    { id: 'creative', label: 'Studio & Kreatif', count: 5 },
    { id: 'utility', label: 'Utilitas & WA', count: 1 }
  ];

  const tools = [
    {
      id: 'downloader',
      category: 'downloader',
      name: 'Media Downloader',
      desc: 'Unduh video HD, foto slide, dan audio tanpa watermark dari 16 platform medsos.',
      tag: '16 PLATFORM',
      icon: Download,
      onClick: () => onOpenTool('downloader')
    },
    {
      id: 'jjFinder',
      category: 'downloader',
      name: 'Cari Link JJ',
      desc: 'Template XML dan preset 5MB TikTok jedag-jedug untuk Alight Motion.',
      tag: 'SOSMED',
      icon: Flame,
      onClick: () => onOpenTool('jjFinder')
    },
    {
      id: 'pngToPdf',
      category: 'file',
      name: 'PNG to PDF',
      desc: 'Satukan multi-foto menjadi dokumen PDF dengan kustomisasi teks dan layout tipografi.',
      tag: 'MULTI-IMG',
      icon: Images,
      onClick: () => onOpenTool('pngToPdf')
    },
    {
      id: 'linkToDoc',
      category: 'file',
      name: 'Link to PDF & PPT',
      desc: 'Konversi tautan dokumen web menjadi dokumen PDF dan presentasi PPTX terstruktur.',
      tag: 'DOC & PPTX',
      icon: FileText,
      onClick: () => onOpenTool('linkToDoc')
    },
    {
      id: 'imageToLink',
      category: 'file',
      name: 'File ke Link',
      desc: 'Unggah foto, video, dan PDF untuk dijadikan tautan URL publik yang dapat diakses langsung.',
      tag: 'UNIVERSAL',
      icon: Link2,
      onClick: () => onOpenTool('imageToLink')
    },
    {
      id: 'compressor',
      category: 'file',
      name: 'Kompres Media HD',
      desc: 'Optimasi ukuran file gambar dan video hingga kilobyte tanpa merusak ketajaman visual.',
      tag: 'MB + KB',
      icon: Minimize2,
      onClick: () => onOpenTool('compressor')
    },
    {
      id: 'qrStudio',
      category: 'creative',
      name: 'QR Code Studio',
      desc: 'Desain kode QR kustom dengan logo dan frame panggilan aksi untuk berbagai kebutuhan.',
      tag: 'CUSTOM QR',
      icon: QrCode,
      onClick: () => onOpenTool('qrStudio')
    },
    {
      id: 'audioMerger',
      category: 'creative',
      name: 'Audio Merger',
      desc: 'Satukan dan potong menit atau detik beberapa lagu audio dalam satu linimasa.',
      tag: 'TIMELINE',
      icon: Music,
      onClick: () => onOpenTool('audioMerger')
    },
    {
      id: 'photoStudio',
      category: 'creative',
      name: 'Photo Studio',
      desc: 'Pertajam foto, atur kontras hitam putih, dan sesuaikan resolusi gambar.',
      tag: 'STUDIO HD',
      icon: Sparkles,
      onClick: () => onOpenTool('photoStudio')
    },
    {
      id: 'videoStudio',
      category: 'creative',
      name: 'Video Studio',
      desc: 'Editor filter visual video untuk penyesuaian kecerahan, saturasi, dan efek gerak.',
      tag: 'FX STUDIO',
      icon: Film,
      onClick: () => onOpenTool('videoStudio')
    },
    {
      id: 'videoTrimmer',
      category: 'creative',
      name: 'Video Trimmer',
      desc: 'Potong durasi video dari titik awal ke akhir tanpa kompresi ulang kualitas.',
      tag: 'LOSSLESS',
      icon: Scissors,
      onClick: () => onOpenTool('videoTrimmer')
    },
    {
      id: 'bgRemover',
      category: 'utility',
      name: 'Hapus Background',
      desc: 'Ekstraksi subjek foto dan logo untuk menghasilkan gambar transparan format PNG.',
      tag: 'PNG HD',
      icon: Scissors,
      onClick: () => onOpenTool('bgRemover')
    }
  ];

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

  return (
    <main className="flex-grow flex flex-col items-center justify-start px-4 sm:px-6 py-6 sm:py-8 w-full max-w-4xl mx-auto">
      
      {/* ─── 1. IDENTITAS & MEDIA PROFIL ─── */}
      <KuroIdentityCard 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={(q) => setSearchQuery(q)}
      />

      {/* ─── 2. SECTION ALAT UTAMA ─── */}
      <section className="w-full mt-3 flex flex-col gap-4">
        
        {/* Header Kategori Filter */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b-2 border-black">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight font-display text-black flex items-center gap-2">
              <span>DAFTAR ALAT UTAMA</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black bg-black text-white">
                {filteredTools.length} ALAT
              </span>
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Pilih alat utilitas yang ingin digunakan. Setiap alat membuka halaman kerja khusus.
            </p>
          </div>

          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-xs text-black font-mono font-bold flex items-center gap-1 self-start sm:self-auto cursor-pointer hover:underline"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Pencarian</span>
            </button>
          )}
        </div>

        {/* Filter Kategori: Pills Neobrutalisme */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 w-full custom-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer flex items-center gap-1.5 shrink-0 border-2 border-black ${
                  isActive
                    ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border border-black ${
                  isActive ? 'bg-white text-black' : 'bg-neutral-100 text-black'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid Card Alat: Clean Neobrutalism (NO POP-UPS) */}
        {filteredTools.length === 0 ? (
          <div className="w-full py-12 rounded-xl border-2 border-black text-center flex flex-col items-center justify-center p-6 bg-white shadow-[3px_3px_0px_#000000]">
            <Filter className="w-8 h-8 text-black stroke-[2] mb-2" />
            <p className="font-extrabold text-sm text-black">Alat tidak ditemukan</p>
            <p className="text-xs text-neutral-600 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 w-full">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={tool.onClick}
                  className="rounded-xl border-2 border-black p-4 sm:p-5 flex flex-col justify-between text-left cursor-pointer transition-all duration-150 bg-white shadow-[3px_3px_0px_#000000] hover:shadow-[5px_5px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 select-none min-h-[175px]"
                >
                  {/* Header Card: Icon & Tag Badge */}
                  <div className="flex items-center justify-between w-full mb-2.5">
                    <div className="w-9 h-9 rounded-md border-2 border-black bg-white flex items-center justify-center text-black shadow-[1.5px_1.5px_0px_#000000]">
                      <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black bg-neutral-100 text-black">
                      {tool.tag}
                    </span>
                  </div>

                  {/* Body Card: Judul & Deskripsi Fungsional */}
                  <div className="my-1.5 flex flex-col">
                    <h3 className="text-sm sm:text-base font-extrabold text-black tracking-tight font-sans">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>

                  {/* Footer Card: Tombol Buka Alat */}
                  <div className="mt-3 pt-2.5 border-t border-black/15">
                    <button
                      type="button"
                      className="w-full py-2 px-3 rounded-lg border-2 border-black bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <span>Buka Alat</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

    </main>
  );
}
