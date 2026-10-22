import React, { useState, useEffect } from 'react';
import CosmicBackButton from './CosmicBackButton';
import { 
  Images, 
  Download, 
  Trash2, 
  FileText, 
  Film, 
  Music, 
  QrCode, 
  Eye, 
  Play, 
  X, 
  ArrowRight,
  Code2
} from 'lucide-react';
import { getGalleryItems, removeGalleryItem } from '../services/storageService';
import { translations } from '../utils/translations';

export default function GalleryScreen({ onBack, onOpenTool, lang = 'id', onShowToast }) {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'image' | 'video' | 'document' | 'audio'
  const [previewModalItem, setPreviewModalItem] = useState(null);
  
  const t = translations[lang] || translations.id;

  // Sinkronisasi otomatis saat berkas baru ditambahkan dari alat mana pun
  useEffect(() => {
    const loadItems = () => {
      setItems(getGalleryItems());
    };

    loadItems();

    // Event internal untuk pembaruan instan tanpa refresh manual
    window.addEventListener('kuro_gallery_updated', loadItems);
    window.addEventListener('storage', loadItems);

    return () => {
      window.removeEventListener('kuro_gallery_updated', loadItems);
      window.removeEventListener('storage', loadItems);
    };
  }, []);

  const handleDelete = (id) => {
    const updated = removeGalleryItem(id);
    setItems(updated);
    if (previewModalItem?.id === id) {
      setPreviewModalItem(null);
    }
    if (onShowToast) {
      onShowToast(t.gallery.itemDeleted);
    }
  };

  const handleDownload = (item) => {
    try {
      const link = document.createElement('a');
      link.href = item.downloadData || item.previewUrl || '#';
      link.download = item.filename || `kuro_${item.title.toLowerCase().replace(/\s+/g, '_')}.${item.extension.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (onShowToast) {
        onShowToast(`${t.gallery.downloadSuccess} (${item.filename || item.title})`);
      }
    } catch {
      window.open(item.previewUrl || item.downloadData, '_blank');
    }
  };

  const filteredItems = items.filter(item => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const getIconForType = (type) => {
    switch (type) {
      case 'video':
        return Film;
      case 'document':
        return FileText;
      case 'audio':
        return Music;
      case 'image':
      default:
        return QrCode;
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-start px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto w-full">
      <div className="w-full flex flex-col gap-5">
        
        {/* Header Navigasi & Kembali */}
        <div className="w-full flex items-center justify-between">
          <CosmicBackButton onClick={onBack} label={t.nav.backToHome} />

          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded border-2 border-black bg-neutral-100 text-black uppercase">
            {items.length} {t.gallery.itemsCount}
          </span>
        </div>

        {/* Banner Judul Layar */}
        <div className="w-full rounded-xl border-2 border-black p-5 sm:p-6 bg-white shadow-[4px_4px_0px_#000000] flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg border-2 border-black bg-black text-white flex items-center justify-center shrink-0">
              <Images className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-black tracking-tight font-display">
                {t.gallery.title}
              </h1>
              <p className="text-xs text-neutral-600 mt-0.5">
                {t.gallery.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 w-full custom-scrollbar">
          {[
            { id: 'all', label: t.gallery.filterAll },
            { id: 'image', label: t.gallery.filterImage },
            { id: 'video', label: t.gallery.filterVideo },
            { id: 'document', label: t.gallery.filterDoc },
            { id: 'audio', label: t.gallery.filterAudio }
          ].map(f => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-black text-white shadow-[2px_2px_0px_#000000] -translate-x-0.5 -translate-y-0.5'
                    : 'bg-white text-black hover:bg-neutral-100 shadow-[1px_1px_0px_#000000]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Daftar Hasil Karya / Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="w-full rounded-xl border-2 border-black p-8 sm:p-12 bg-white shadow-[4px_4px_0px_#000000] text-center flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full border-2 border-black bg-neutral-100 flex items-center justify-center text-black mb-1">
              <Images className="w-7 h-7 stroke-[1.8]" />
            </div>
            <h2 className="text-base font-extrabold text-black font-display">
              {t.gallery.emptyTitle}
            </h2>
            <p className="text-xs text-neutral-600 max-w-md">
              {t.gallery.emptyDesc}
            </p>
            <button
              type="button"
              onClick={onBack}
              className="mt-2 px-4 py-2 rounded-lg border-2 border-black bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              <span>{t.gallery.exploreTools}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map(item => {
              const ItemIcon = getIconForType(item.type);
              const hasImagePreview = item.type === 'image' && (item.previewUrl || item.downloadData);
              const hasVideoPreview = item.type === 'video' && (item.previewUrl || item.downloadData);
              const hasAudioPreview = item.type === 'audio' && (item.previewUrl || item.downloadData);
              const isDocument = item.type === 'document';

              return (
                <div 
                  key={item.id}
                  className="rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between overflow-hidden"
                >
                  
                  {/* 1. Header Informasi Asal Alat */}
                  <div className="p-3 border-b-2 border-black bg-neutral-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border border-black bg-white flex items-center justify-center text-black">
                        <ItemIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-neutral-700 truncate max-w-[140px]">
                        {item.category}
                      </span>
                    </div>

                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-black bg-black text-white">
                      {item.extension}
                    </span>
                  </div>

                  {/* 2. AREA OUTPUT VISUAL (Bisa Dilihat / Diputar Langsung) */}
                  <div className="relative w-full bg-neutral-100 border-b-2 border-black overflow-hidden flex items-center justify-center group">
                    
                    {/* A. Pratinjau Video (Bisa Ditonton Langsung) */}
                    {hasVideoPreview && (
                      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                        <video
                          src={item.previewUrl || item.downloadData}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewModalItem(item)}
                          className="absolute top-2 right-2 p-1.5 rounded-md border border-black bg-white/90 hover:bg-white text-black shadow-[1px_1px_0px_#000000] cursor-pointer"
                          title="Perbesar Layar Video"
                        >
                          <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    )}

                    {/* B. Pratinjau Gambar & QR Code (Bisa Dilihat Langsung) */}
                    {hasImagePreview && (
                      <div 
                        onClick={() => setPreviewModalItem(item)}
                        className="relative w-full h-44 bg-white flex items-center justify-center p-3 cursor-pointer select-none"
                        title="Klik untuk memperbesar gambar"
                      >
                        <img
                          src={item.previewUrl || item.downloadData}
                          alt={item.title}
                          className="max-h-full max-w-full object-contain rounded"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded border border-black bg-white text-black font-mono text-[10px] font-bold shadow-[1px_1px_0px_#000000] flex items-center gap-1">
                            <Eye className="w-3 h-3 stroke-[2.5]" />
                            <span>Perbesar</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* C. Pratinjau Audio (Bisa Diputar Langsung) */}
                    {hasAudioPreview && (
                      <div className="w-full p-4 flex flex-col items-center justify-center gap-2.5 bg-neutral-50">
                        <div className="w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center text-black shadow-[1px_1px_0px_#000000]">
                          <Music className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <audio 
                          controls 
                          src={item.previewUrl || item.downloadData} 
                          className="w-full h-8"
                        />
                      </div>
                    )}

                    {/* D. Pratinjau Dokumen & XML */}
                    {isDocument && (
                      <div 
                        onClick={() => setPreviewModalItem(item)}
                        className="w-full p-4 bg-neutral-900 text-neutral-200 font-mono text-[11px] h-40 overflow-hidden flex flex-col justify-between cursor-pointer select-none"
                        title="Klik untuk melihat isi berkas"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-neutral-700 text-neutral-400 text-[10px]">
                          <span className="flex items-center gap-1">
                            <Code2 className="w-3 h-3 text-cyan-400" />
                            <span>Preview {item.extension}</span>
                          </span>
                          <span className="text-[9px] text-neutral-400">Klik Buka</span>
                        </div>
                        <div className="text-[10.5px] leading-relaxed text-neutral-300 font-mono line-clamp-4 select-none">
                          {item.downloadData?.startsWith('data:') 
                            ? decodeURIComponent(item.downloadData.split(',')[1] || '').slice(0, 140)
                            : item.title}
                        </div>
                        <div className="pt-1 flex items-center justify-end text-cyan-300 text-[10px] font-bold">
                          <span>Buka Kode Lengkap</span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* 3. Body Info Judul & Metadata */}
                  <div className="p-3.5 flex flex-col flex-1 gap-1">
                    <h3 className="font-extrabold text-xs sm:text-sm text-black tracking-tight line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 mt-auto pt-1">
                      <span>{item.size}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* 4. Actions Footer (Unduh Ulang & Hapus) */}
                  <div className="p-3 border-t-2 border-black bg-white flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="flex-1 py-2 px-3 rounded-lg border-2 border-black bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[44px]"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{t.gallery.redownload}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg border-2 border-black bg-white hover:bg-red-50 text-neutral-700 hover:text-red-600 shadow-[1.5px_1.5px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title={t.gallery.delete}
                      aria-label={t.gallery.delete}
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ─── MODAL PRATINJAU OUTPUT BERKAS LENGKAP ─── */}
      {previewModalItem && (
        <div 
          className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewModalItem(null)}
        >
          <div 
            className="w-full max-w-2xl rounded-xl border-2 border-black bg-white p-4 sm:p-6 shadow-[5px_5px_0px_#000000] flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black bg-black text-white shrink-0">
                  {previewModalItem.extension}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-black truncate">
                  {previewModalItem.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="p-1 rounded-md border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[1px_1px_0px_#000000] cursor-pointer"
                aria-label="Tutup Pratinjau"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Media Content Body */}
            <div className="w-full rounded-lg border-2 border-black bg-neutral-50 overflow-hidden flex items-center justify-center min-h-[220px]">
              
              {/* Pratinjau Video Modal */}
              {previewModalItem.type === 'video' && (
                <video
                  src={previewModalItem.previewUrl || previewModalItem.downloadData}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[60vh] w-full object-contain bg-black"
                />
              )}

              {/* Pratinjau Gambar & QR Code Modal */}
              {previewModalItem.type === 'image' && (
                <div className="p-4 flex items-center justify-center bg-white w-full">
                  <img
                    src={previewModalItem.previewUrl || previewModalItem.downloadData}
                    alt={previewModalItem.title}
                    className="max-h-[60vh] max-w-full object-contain"
                  />
                </div>
              )}

              {/* Pratinjau Audio Modal */}
              {previewModalItem.type === 'audio' && (
                <div className="p-6 w-full flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-full border-2 border-black bg-black text-white flex items-center justify-center">
                    <Music className="w-7 h-7 stroke-[2]" />
                  </div>
                  <span className="font-extrabold text-sm text-black">
                    {previewModalItem.title}
                  </span>
                  <audio
                    controls
                    autoPlay
                    src={previewModalItem.previewUrl || previewModalItem.downloadData}
                    className="w-full max-w-md mt-2"
                  />
                </div>
              )}

              {/* Pratinjau Dokumen & XML Modal */}
              {previewModalItem.type === 'document' && (
                <div className="w-full p-4 bg-neutral-900 text-neutral-100 font-mono text-xs max-h-[50vh] overflow-y-auto">
                  <pre className="whitespace-pre-wrap break-all">
                    {previewModalItem.downloadData?.startsWith('data:')
                      ? decodeURIComponent(previewModalItem.downloadData.split(',')[1] || '')
                      : previewModalItem.title}
                  </pre>
                </div>
              )}

            </div>

            {/* Footer Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t-2 border-black gap-3">
              <span className="text-xs font-mono text-neutral-500">
                Ukuran: {previewModalItem.size}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(previewModalItem)}
                  className="px-4 py-2 rounded-lg border-2 border-black bg-black hover:bg-neutral-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[44px]"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t.gallery.redownload}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewModalItem(null)}
                  className="px-3 py-2 rounded-lg border-2 border-black bg-white hover:bg-neutral-100 text-black font-bold text-xs shadow-[1.5px_1.5px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[44px]"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
