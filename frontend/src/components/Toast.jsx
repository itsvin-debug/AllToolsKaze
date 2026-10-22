import React, { useEffect } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

/**
 * Toast Component (Neo-Brutalism)
 * Notifikasi melayang berdesain kontras tinggi dengan bayangan tegas.
 * Digunakan untuk menampilkan feedback instan saat pengguna mengubah opsi atau sakelar.
 */
export default function Toast({ message, type = 'info', onClose, duration = 2600 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div 
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-5 md:translate-x-0 z-[120] max-w-sm w-[90%] md:w-auto animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-auto"
    >
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 border-black bg-black text-white shadow-[3px_3px_0px_#ffffff] text-xs font-bold tracking-tight">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2.5]" />
        <span className="flex-1 font-sans">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-0.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
