import React, { useState } from 'react';
import CosmicBackButton from './CosmicBackButton';
import { 
  ArrowLeft, 
  Search, 
  Flame, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  FileCode, 
  Sparkles, 
  Film, 
  Share2,
  CheckCircle2,
  Loader2,
  Info
} from 'lucide-react';

export default function JjFinderScreen({ onBack, theme = 'dark' }) {
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Default data awal yang merepresentasikan foto kedua
  const [resultData, setResultData] = useState({
    title: 'FaJaruzumaki 🦊 | Preset JJ Kane Alight Motion',
    author: '@yuanthecliper',
    videoSize: '14.8 MB (HD 1080p 60fps)',
    templates: [
      {
        id: '1',
        title: 'FaJaruzumaki 🦊 | 9:16',
        aspectRatio: '9:16',
        type: 'XML',
        size: '187.8 KB',
        author: '@yuanthecliper',
        link: 'https://drive.google.com/file/d/1qaStdRjx9vhSTg7MFvLHPp3Bj1JXZgyN/view?usp=drivesdk',
        downloadUrl: 'https://drive.google.com/file/d/1qaStdRjx9vhSTg7MFvLHPp3Bj1JXZgyN/view?usp=drivesdk'
      },
      {
        id: '2',
        title: 'FaJaruzumaki 🦊 | 1:1',
        aspectRatio: '1:1',
        type: 'XML',
        size: '187.6 KB',
        author: '@yuanthecliper',
        link: 'https://drive.google.com/file/d/1oi2tn2sJ0-pikfyVw4ie7NL3ND1mhDW8/view?usp=drivesdk',
        downloadUrl: 'https://drive.google.com/file/d/1oi2tn2sJ0-pikfyVw4ie7NL3ND1mhDW8/view?usp=drivesdk'
      },
      {
        id: '3',
        title: 'FaJaruzumaki 🦊 | 9:16 (+1)',
        aspectRatio: '9:16',
        type: '5MB',
        size: '5.0 MB',
        author: '@fajaruzumaki',
        link: 'https://alightcreative.com/am/share/u/es8CxXTDB9UPYjevYGb3mH9wm4k1/p/t0uKXJ1u69-f87375c74f9eb884',
        downloadUrl: 'https://alightcreative.com/am/share/u/es8CxXTDB9UPYjevYGb3mH9wm4k1/p/t0uKXJ1u69-f87375c74f9eb884',
        thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80'
      }
    ]
  });

  const isDark = theme === 'dark';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    showToast('Link berhasil disalin ke clipboard! 📋');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query) {
      setError('Masukkan link video TikTok atau nama creator/kata kunci.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5001/api/jj-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setResultData({
          title: json.data.videoInfo?.title || 'Template JJ TikTok',
          author: json.data.videoInfo?.author || '@creator',
          videoSize: json.data.videoInfo?.videoSize || '14.2 MB',
          thumbnail: json.data.videoInfo?.thumbnail || null,
          videoUrl: json.data.videoInfo?.videoUrl || null,
          templates: json.data.templates || []
        });
        showToast('Template JJ berhasil diekstrak secara real-time! ✨');
      } else {
        setError(json.message || 'Gagal mengekstrak template JJ.');
      }
    } catch (err) {
      setError('Gagal terhubung ke server backend: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickChip = (text) => {
    setInputQuery(text);
  };

  return (
    <main className="flex-grow relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Tombol Kembali */}
      <div className="mb-6">
        <CosmicBackButton onClick={onBack} label="Kembali ke Beranda" />
      </div>

      {/* Header Fitur Cari Link JJ */}
      <div className={`rounded-3xl p-6 sm:p-7 border mb-6 transition-all ${
        isDark ? 'bg-[#12151f] border-white/10 shadow-xl' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Cari Link JJ (Jedag-Jedug)
            </h1>
            <p className="text-xs text-slate-400">
              Ekstrak template XML Google Drive, Preset 5MB Alight Motion & ukuran video TikTok secara real-time.
            </p>
          </div>
        </div>

        {/* Input Form Pencarian */}
        <form onSubmit={handleSearch} className="mt-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => {
                setInputQuery(e.target.value);
                setError('');
              }}
              placeholder="Tempel link video TikTok JJ (atau ketik nama creator/preset)..."
              className={`w-full pl-11 pr-28 py-3.5 rounded-2xl text-xs sm:text-sm border outline-none transition-all ${
                isDark 
                  ? 'bg-[#090b12] border-white/10 text-white placeholder-slate-500 focus:border-rose-400/60' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-rose-500'
              }`}
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-md active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mencari...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cari JJ</span>
                </>
              )}
            </button>
          </div>

          {/* Quick chips contoh */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 font-mono mr-1">Contoh:</span>
            {[
              'FaJaruzumaki 🦊',
              'https://vt.tiktok.com/ZSj...',
              'Preset XML 9:16',
              'Preset 5MB Kane'
            ].map((chip) => (
              <button
                type="button"
                key={chip}
                onClick={() => handleQuickChip(chip)}
                className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Info Ringkasan Metadata Video JJ */}
      {resultData && (
        <div className="mb-4 flex items-center justify-between px-2 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Film className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-white font-bold">{resultData.title}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-emerald-400">
            {resultData.videoSize}
          </span>
        </div>
      )}

      {/* DAFTAR CARD OUTPUT TEMPLATE JJ SESUAI FOTO KEDUA */}
      <div className="space-y-3.5">
        {resultData?.templates?.map((item) => {
          const isCopied = copiedId === item.id;
          const isXML = item.type === 'XML';
          const is5MB = item.type === '5MB';

          return (
            <div
              key={item.id}
              className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:items-center justify-between ${
                isDark 
                  ? 'bg-[#12151f] border-white/10 hover:border-white/20 shadow-lg' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-md'
              }`}
            >
              {/* Kolom Kiri: Thumbnail / Viewfinder Box */}
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                {/* Visual Aspect Ratio Box ala Foto Kedua */}
                {item.thumbnail ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-white/10 shadow-md">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col items-center justify-center relative p-1 shrink-0 select-none">
                    {/* Viewfinder corner brackets */}
                    <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400" />
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-cyan-300 tracking-wider">
                      {item.aspectRatio}
                    </span>
                  </div>
                )}

                {/* Info Title, Badges, Author & Drive Link */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <h3 className="text-sm sm:text-base font-extrabold text-white truncate">
                      {item.title}
                    </h3>
                  </div>

                  {/* Badges: XML / 5MB & Ukuran File */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {isXML && (
                      <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-[#2dd4bf]/20 border border-[#2dd4bf]/40 text-[#2dd4bf]">
                        XML
                      </span>
                    )}
                    {is5MB && (
                      <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                        5MB
                      </span>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/5">
                      {item.size}
                    </span>
                  </div>

                  {/* Handle Author */}
                  <p className="text-xs text-slate-400 font-medium mb-1 truncate">
                    {item.author}
                  </p>

                  {/* Tautan URL asli */}
                  <p className="text-[11px] font-mono text-slate-500 truncate max-w-sm">
                    {item.link}
                  </p>
                </div>
              </div>

              {/* Kolom Kanan: Tombol Aksi (Get file & Copy link) */}
              <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <a
                  href={item.downloadUrl || item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#2dd4bf] hover:bg-[#14b8a6] text-black shadow-md shadow-teal-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get file</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(item.link, item.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Salin Tautan"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Disalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-black/90 backdrop-blur-md border border-teal-500/40 text-teal-300 text-xs font-bold font-mono shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
