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
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { getGalleryItems, removeGalleryItem } from '../services/storageService';
import { translations } from '../utils/translations';

export default function GalleryScreen({ onBack, onOpenTool, lang = 'id', onShowToast }) {
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'image' | 'video' | 'document' | 'audio'
  const t = translations[lang] || translations.id;

  useEffect(() => {
    setItems(getGalleryItems());
  }, []);

  const handleDelete = (id) => {
    const updated = removeGalleryItem(id);
    setItems(updated);
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
      // Fallback jika unduhan langsung dibatasi
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
    <main className="flex-grow flex flex-col items-center justify-start px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto w-full">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const ItemIcon = getIconForType(item.type);
              return (
                <div 
                  key={item.id}
                  className="rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Header & Preview Visual */}
                  <div className="p-3.5 border-b-2 border-black bg-neutral-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded border border-black bg-white flex items-center justify-center text-black">
                        <ItemIcon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-neutral-700">
                        {item.category}
                      </span>
                    </div>

                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-black bg-black text-white">
                      {item.extension}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex flex-col flex-1 gap-1.5">
                    <h3 className="font-extrabold text-sm text-black tracking-tight line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500 mt-auto">
                      <span>{item.size}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
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
    </main>
  );
}
