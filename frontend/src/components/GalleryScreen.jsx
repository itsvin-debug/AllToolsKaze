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
      const rawUrl = item.downloadData || item.previewUrl || '';
      const filename = item.filename || `kuro_${item.title.toLowerCase().replace(/\s+/g, '_')}.${(item.extension || 'mp4').toLowerCase()}`;

      if (rawUrl.startsWith('data:') || rawUrl.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = rawUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(filename)}`;
        const link = document.createElement('a');
        link.href = proxyUrl;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (rawUrl) {
        window.open(rawUrl, '_blank');
      }

      if (onShowToast) {
        onShowToast(`${t.gallery.downloadSuccess} (${filename})`);
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
    <main className="flex-grow flex flex-col items-center justify-start px-3 sm:px-6 py-5 sm:py-8 max-w-5xl mx-auto w-full">
      <div className="w-full flex flex-col gap-4 sm:gap-5">
        
        {/* Header Navigasi & Kembali */}
        <div className="w-full flex items-center justify-between">
          <CosmicBackButton onClick={onBack} label={t.nav.backToHome} />

          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded border-2 border-black bg-neutral-100 text-black uppercase">
            {items.length} {t.gallery.itemsCount}
          </span>
        </div>

        {/* Banner Judul Layar */}
        <div className="w-full rounded-xl border-2 border-black p-4 sm:p-6 bg-white shadow-[4px_4px_0px_#000000] flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg border-2 border-black bg-black text-white flex items-center justify-center shrink-0">
              <Images className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black text-black tracking-tight font-display">
                {t.gallery.title}
              </h1>
              <p className="text-xs text-neutral-600 mt-0.5">
                {t.gallery.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 w-full custom-scrollbar">
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
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg border-2 border-black text-xs font-bold transition-all cursor-pointer shrink-0 min-h-[36px] sm:min-h-[40px] flex items-center justify-center ${
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

        {/* Daftar Hasil Karya: 2 Card di Mobile, 3 Card di Desktop */}
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
              className="mt-2 px-4 py-2 rounded-lg border-2 border-black bg-black text-white text-xs font-bold hover:bg-neutral-800 transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer min-h-[44px]"
            >
              <span>{t.gallery.exploreTools}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
            {filteredItems.map(item => {
              const ItemIcon = getIconForType(item.type);
              const hasVideo = item.type === 'video';
              const hasImage = item.type === 'image';
              const hasAudio = item.type === 'audio';
              const isDocument = item.type === 'document';

              const thumbnailSrc = item.thumbnail || (hasImage ? (item.previewUrl || item.downloadData) : null);
              const playableVideoSrc = item.previewUrl || item.downloadData || '';

              return (
                <div 
                  key={item.id}
                  className="rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] transition-all flex flex-col justify-between overflow-hidden"
                >
                  
                  {/* 1. Header Informasi Asal Alat */}
                  <div className="p-2 sm:p-3 border-b-2 border-black bg-neutral-50 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-black bg-white flex items-center justify-center text-black shrink-0">
                        <ItemIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.2]" />
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold text-neutral-700 truncate max-w-[85px] sm:max-w-[130px]">
                        {item.category}
                      </span>
                    </div>

                    <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1 sm:px-1.5 py-0.5 rounded border border-black bg-black text-white shrink-0">
                      {item.extension}
                    </span>
                  </div>

                  {/* 2. AREA OUTPUT VISUAL (Bisa Dilihat / Diputar Langsung) */}
                  <div className="relative w-full bg-neutral-100 border-b-2 border-black overflow-hidden flex items-center justify-center group select-none">
                    
                    {/* A. Pratinjau Video */}
                    {hasVideo && (
                      <div 
                        onClick={() => setPreviewModalItem(item)}
                        className="relative w-full aspect-[9/16] sm:aspect-video bg-black flex items-center justify-center cursor-pointer overflow-hidden group/vid"
                        title="Klik untuk memutar video"
                      >
                        {thumbnailSrc ? (
                          <img
                            src={thumbnailSrc}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover/vid:scale-105 transition-transform duration-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-2 text-center">
                            <Film className="w-8 h-8 text-neutral-500 mb-1" />
                            <span className="text-[9px] font-mono">Video HD</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/25 group-hover/vid:bg-black/40 transition-colors flex items-center justify-center">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-black border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] group-hover/vid:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                        </div>

                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded border border-black bg-black/80 text-white font-mono text-[8px] sm:text-[9px] font-bold">
                          {item.size || 'HD MP4'}
                        </span>
                      </div>
                    )}

                    {/* B. Pratinjau Gambar & QR Code */}
                    {hasImage && (
                      <div 
                        onClick={() => setPreviewModalItem(item)}
                        className="relative w-full h-32 sm:h-44 bg-white flex items-center justify-center p-2 sm:p-3 cursor-pointer select-none"
                        title="Klik untuk memperbesar gambar"
                      >
                        <img
                          src={thumbnailSrc || item.previewUrl || item.downloadData}
                          alt={item.title}
                          className="max-h-full max-w-full object-contain rounded"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded border border-black bg-white text-black font-mono text-[9px] font-bold shadow-[1px_1px_0px_#000000] flex items-center gap-1">
                            <Eye className="w-3 h-3 stroke-[2.5]" />
                            <span>Perbesar</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* C. Pratinjau Audio */}
                    {hasAudio && (
                      <div 
                        onClick={() => setPreviewModalItem(item)}
                        className="w-full p-3 sm:p-4 flex flex-col items-center justify-center gap-2 bg-neutral-50 cursor-pointer"
                      >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-black bg-white flex items-center justify-center text-black shadow-[1px_1px_0px_#000000]">
                          <Music className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-center line-clamp-1">
                          Putar Audio MP3
                        </span>
                      </div>
                    )}

                    {/* D. Pratinjau Dokumen & XML */}
                    {isDocument && (
                      <div 
                        onClick={() => setPreviewModalItem(item)}
                        className="w-full p-3 bg-neutral-900 text-neutral-200 font-mono text-[10px] sm:text-[11px] h-32 sm:h-40 overflow-hidden flex flex-col justify-between cursor-pointer select-none"
                        title="Klik untuk melihat isi berkas"
                      >
                        <div className="flex items-center justify-between pb-1 border-b border-neutral-700 text-neutral-400 text-[9px]">
                          <span className="flex items-center gap-1">
                            <Code2 className="w-3 h-3 text-cyan-400" />
                            <span>{item.extension}</span>
                          </span>
                          <span>Buka</span>
                        </div>
                        <div className="text-[9.5px] sm:text-[10px] leading-relaxed text-neutral-300 font-mono line-clamp-3 select-none">
                          {item.downloadData?.startsWith('data:') 
                            ? decodeURIComponent(item.downloadData.split(',')[1] || '').slice(0, 100)
                            : item.title}
                        </div>
                        <div className="pt-1 flex items-center justify-end text-cyan-300 text-[9px] font-bold">
                          <span>Lihat Berkas</span>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* 3. Body Info Judul & Metadata */}
                  <div className="p-2.5 sm:p-3 flex flex-col flex-1 gap-1">
                    <h3 className="font-extrabold text-[11px] sm:text-xs md:text-sm text-black tracking-tight line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-neutral-500 mt-auto pt-1">
                      <span>{item.size || 'HD'}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* 4. Actions Footer (Unduh Ulang & Hapus) */}
                  <div className="p-2 sm:p-2.5 border-t-2 border-black bg-white flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="flex-1 py-2 px-2 sm:px-3 rounded-lg border-2 border-black bg-black hover:bg-neutral-800 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 shadow-[1.5px_1.5px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[44px]"
                    >
                      <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span className="truncate">{t.gallery.redownload}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg border-2 border-black bg-white hover:bg-red-50 text-neutral-700 hover:text-red-600 shadow-[1.5px_1.5px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
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
          className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewModalItem(null)}
        >
          <div 
            className="w-full max-w-sm sm:max-w-xl md:max-w-2xl rounded-xl border-2 border-black bg-white p-3.5 sm:p-6 shadow-[5px_5px_0px_#000000] flex flex-col gap-3.5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black bg-black text-white shrink-0">
                  {previewModalItem.extension}
                </span>
                <h3 className="font-extrabold text-xs sm:text-base text-black truncate">
                  {previewModalItem.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="p-1.5 rounded-md border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[1px_1px_0px_#000000] cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Tutup Pratinjau"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Media Content Body: Memanjang ke Bawah (9:16 portrait) di Mobile */}
            <div className="w-full rounded-lg border-2 border-black bg-neutral-900 overflow-hidden flex items-center justify-center min-h-[220px]">
              
              {/* Pratinjau Video Modal */}
              {previewModalItem.type === 'video' && (
                <div className="w-full flex items-center justify-center bg-black">
                  <video
                    src={
                      previewModalItem.previewUrl?.startsWith('http') && !previewModalItem.previewUrl?.includes('proxy')
                        ? `/api/proxy-stream?url=${encodeURIComponent(previewModalItem.previewUrl)}&type=video`
                        : (previewModalItem.previewUrl || previewModalItem.downloadData)
                    }
                    poster={previewModalItem.thumbnail || undefined}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="max-h-[68vh] sm:max-h-[60vh] w-auto max-w-full aspect-[9/16] sm:aspect-auto object-contain bg-black mx-auto"
                    onError={(e) => {
                      if (previewModalItem.downloadData && e.target.src !== previewModalItem.downloadData) {
                        e.target.src = previewModalItem.downloadData;
                      }
                    }}
                  />
                </div>
              )}

              {/* Pratinjau Gambar & QR Code Modal */}
              {previewModalItem.type === 'image' && (
                <div className="p-3 sm:p-4 flex items-center justify-center bg-white w-full">
                  <img
                    src={previewModalItem.thumbnail || previewModalItem.previewUrl || previewModalItem.downloadData}
                    alt={previewModalItem.title}
                    className="max-h-[65vh] max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Pratinjau Audio Modal */}
              {previewModalItem.type === 'audio' && (
                <div className="p-6 w-full flex flex-col items-center justify-center gap-3 bg-white text-black">
                  <div className="w-14 h-14 rounded-full border-2 border-black bg-black text-white flex items-center justify-center">
                    <Music className="w-7 h-7 stroke-[2]" />
                  </div>
                  <span className="font-extrabold text-sm text-black text-center">
                    {previewModalItem.title}
                  </span>
                  <audio
                    controls
                    autoPlay
                    src={
                      previewModalItem.previewUrl?.startsWith('http') && !previewModalItem.previewUrl?.includes('proxy')
                        ? `/api/proxy-stream?url=${encodeURIComponent(previewModalItem.previewUrl)}&type=audio`
                        : (previewModalItem.previewUrl || previewModalItem.downloadData)
                    }
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
            <div className="flex items-center justify-between pt-2 border-t-2 border-black gap-2">
              <span className="text-xs font-mono text-neutral-500">
                {previewModalItem.size || 'HD'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(previewModalItem)}
                  className="px-3.5 py-2 rounded-lg border-2 border-black bg-black hover:bg-neutral-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[44px]"
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
