import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, 
  Sparkles, 
  Link2, 
  Clipboard, 
  Download, 
  Music2, 
  Camera, 
  Play, 
  AlertCircle,
  X,
  ChevronDown,
  Info,
  CheckCircle2,
  Loader2,
  ArrowRight
} from 'lucide-react';
import ResultsSection from './ResultsSection';

export default function ConverterScreen({ activePlatform: initialPlatform = 'tiktok', onSelectPlatform, onBack }) {
  const [activePlatform, setActivePlatform] = useState(initialPlatform);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [suggestedPlatform, setSuggestedPlatform] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('1080p');

  useEffect(() => {
    setActivePlatform(initialPlatform);
  }, [initialPlatform]);

  // Metadata platform dinamis
  const platformMeta = {
    tiktok: {
      name: 'TikTok',
      icon: Music2,
      placeholder: 'Tempel link TikTok khusus (vt.tiktok.com atau tiktok.com/@user/...)',
      accentColor: 'text-[#00f2fe]',
      accentBg: 'bg-[#00f2fe]/10 border-[#00f2fe]/20',
      hint: 'Hanya menerima link resmi TikTok (video & slide foto tanpa watermark)',
      badge: 'Khusus TikTok'
    },
    instagram: {
      name: 'Instagram',
      icon: Camera,
      placeholder: 'Tempel link Instagram khusus (instagram.com/reel/... atau /p/...)',
      accentColor: 'text-[#ec4899]',
      accentBg: 'bg-[#ec4899]/10 border-[#ec4899]/20',
      hint: 'Hanya menerima link resmi Instagram (Reels & Carousel album foto HD)',
      badge: 'Khusus Instagram'
    },
    youtube: {
      name: 'YouTube',
      icon: Play,
      placeholder: 'Tempel link YouTube khusus (youtube.com/watch?v=... atau youtu.be/...)',
      accentColor: 'text-[#ef4444]',
      accentBg: 'bg-[#ef4444]/10 border-[#ef4444]/20',
      hint: 'Hanya menerima link resmi YouTube (Shorts & Video reguler + MP3)',
      badge: 'Khusus YouTube'
    },
    twitter: {
      name: 'X (Twitter)',
      icon: () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </svg>
      ),
      placeholder: 'Tempel link X / Twitter khusus (x.com/.../status/... atau twitter.com/...)',
      accentColor: 'text-white',
      accentBg: 'bg-white/10 border-white/20',
      hint: 'Hanya menerima link resmi postingan tweet video X (Twitter)',
      badge: 'Khusus X (Twitter)'
    }
  };

  const currentMeta = platformMeta[activePlatform] || platformMeta.tiktok;
  const CurrentIcon = currentMeta.icon;

  // Deteksi asal medsos dari string URL secara ketat
  const detectPlatformFromUrl = (rawUrl) => {
    if (!rawUrl) return null;
    const lower = rawUrl.toLowerCase();
    if (lower.includes('tiktok.com')) return 'tiktok';
    if (lower.includes('instagram.com') || lower.includes('instagr.am') || lower.includes('ig.me')) return 'instagram';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
    return 'unknown';
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const cleanText = text.trim();
          setUrlInput(cleanText);
          validateUrlAgainstPlatform(cleanText, activePlatform);
        }
      }
    } catch (err) {
      console.warn('Gagal membaca clipboard:', err);
    }
  };

  // Validasi kecocokan platform: jika link dari medsos lain -> otomatis ditolak
  const validateUrlAgainstPlatform = (url, platform) => {
    if (!url) {
      setErrorMsg('');
      setSuggestedPlatform(null);
      return true;
    }

    const detected = detectPlatformFromUrl(url);
    const platformNames = {
      tiktok: 'TikTok',
      instagram: 'Instagram',
      youtube: 'YouTube',
      twitter: 'X (Twitter)'
    };

    if (detected !== 'unknown' && detected !== platform) {
      setErrorMsg(
        `❌ Ditolak: Link yang kamu masukkan adalah link ${platformNames[detected]}, bukan ${platformNames[platform]}! Di opsi ${platformNames[platform]}, link medsos lain otomatis ditolak.`
      );
      setSuggestedPlatform(detected);
      return false;
    }

    if (detected === 'unknown') {
      setErrorMsg(
        `❌ Ditolak: Link tidak dikenali sebagai link resmi ${platformNames[platform]}. Pastikan URL mengandung domain ${platform === 'twitter' ? 'x.com / twitter.com' : platform + '.com'}.`
      );
      setSuggestedPlatform(null);
      return false;
    }

    setErrorMsg('');
    setSuggestedPlatform(null);
    return true;
  };

  const handleUrlChange = (val) => {
    setUrlInput(val);
    if (val.trim().length > 12) {
      validateUrlAgainstPlatform(val.trim(), activePlatform);
    } else {
      setErrorMsg('');
      setSuggestedPlatform(null);
    }
  };

  const handleSwitchPlatform = (newPlatform) => {
    setActivePlatform(newPlatform);
    if (onSelectPlatform) onSelectPlatform(newPlatform);
    setErrorMsg('');
    setSuggestedPlatform(null);
    if (urlInput.trim()) {
      validateUrlAgainstPlatform(urlInput.trim(), newPlatform);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuggestedPlatform(null);
    setResultData(null);

    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      setErrorMsg('Silakan tempelkan link media terlebih dahulu.');
      return;
    }

    // Validasi ketat sebelum diproses: otomatis tolak jika beda medsos!
    const isValid = validateUrlAgainstPlatform(trimmedUrl, activePlatform);
    if (!isValid) {
      return;
    }

    try {
      setLoading(true);
      setDownloadProgress(1);

      // Animasi progress bar 1% hingga 92%
      const progressTimer = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 92) return prev;
          const inc = Math.floor(Math.random() * 8) + 3;
          return Math.min(92, prev + inc);
        });
      }, 150);

      const response = await axios.post('/api/download', {
        url: trimmedUrl,
        expectedPlatform: activePlatform
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });

      clearInterval(progressTimer);

      if (response.data && response.data.success && response.data.data) {
        setDownloadProgress(100);
        setTimeout(() => {
          setResultData(response.data.data);
          setLoading(false);
          setDownloadProgress(0);
        }, 500);
      } else {
        throw new Error(response.data?.message || 'Gagal memproses link.');
      }
    } catch (err) {
      console.error('Error submit link:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Terjadi kesalahan saat memproses media.';
      setErrorMsg(serverMsg);
      setLoading(false);
      setDownloadProgress(0);
    }
  };

  const handleReset = () => {
    setUrlInput('');
    setResultData(null);
    setErrorMsg('');
    setSuggestedPlatform(null);
    setDownloadProgress(0);
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-start px-4 sm:px-6 md:px-margin-desktop py-6 sm:py-8 max-w-4xl mx-auto w-full relative z-10">
      
      <div className="w-full flex flex-col gap-4">
        
        {/* Navigation & Header */}
        <div className="w-full flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-xl hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda Tools</span>
          </button>

          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
            {currentMeta.badge}
          </span>
        </div>

        {/* Tab Switcher 4 Opsi Medsos: TikTok, Instagram, YouTube, X */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-200 dark:bg-[#12151f] border border-black/10 dark:border-white/10">
          {[
            { id: 'tiktok', name: 'TikTok', icon: Music2 },
            { id: 'instagram', name: 'Instagram', icon: Camera },
            { id: 'youtube', name: 'YouTube', icon: Play },
            { 
              id: 'twitter', 
              name: 'X (Twitter)', 
              icon: () => (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 fill-current inline">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              ) 
            }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isTabActive = activePlatform === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSwitchPlatform(tab.id)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isTabActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span className="truncate">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Input Card */}
        <div className="w-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#12151f] flex flex-col gap-4">
          
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${currentMeta.accentBg} ${currentMeta.accentColor}`}>
              <CurrentIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Unduh Video {currentMeta.name}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentMeta.hint}
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-3 w-full">
            
            {/* Input URL */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              
              <input
                type="text"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={currentMeta.placeholder}
                className="w-full bg-slate-50 dark:bg-[#0c0e15] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl py-3.5 pl-10 pr-24 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={handlePasteClipboard}
                className="absolute inset-y-0 right-2 px-3 my-2 text-xs font-mono rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            </div>

            {/* Error Message & Quick Switch Suggestion */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs animate-fadeIn">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>

                {suggestedPlatform && (
                  <button
                    type="button"
                    onClick={() => handleSwitchPlatform(suggestedPlatform)}
                    className="shrink-0 px-3 py-1 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Pindah ke Opsi {suggestedPlatform === 'twitter' ? 'X (Twitter)' : suggestedPlatform.toUpperCase()}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Format & Submit Button */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full">
              <div className="relative sm:w-60">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-[#0c0e15] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl py-3 px-3.5 pr-9 cursor-pointer focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-medium"
                >
                  <option value="1080p">HD 1080p (Kualitas Maksimal)</option>
                  <option value="720p">HD 720p (Standar Cepat)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex-grow bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl px-6 py-3 flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Mengunduh... {downloadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>Download Media {currentMeta.name}</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Loading Progress Bar 1% - 100% */}
        {loading && (
          <div className="w-full rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-4 border border-black/10 dark:border-white/10 bg-white dark:bg-[#12151f] shadow-xl animate-fadeIn">
            <div className="w-full max-w-md flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                  <span>Proses Ekstraksi Video {currentMeta.name}...</span>
                </span>
                <span className="font-bold text-sm text-indigo-500">
                  {downloadProgress}%
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-white/10 p-0.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-200 ${
                    downloadProgress === 100 
                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/50' 
                      : 'bg-indigo-600 shadow-md shadow-indigo-600/40'
                  }`}
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 text-center font-mono">
                {downloadProgress < 100 
                  ? `Mengambil video tanpa watermark dari CDN ${currentMeta.name}...` 
                  : '✓ 100% Berhasil! Menyiapkan pratinjau output video...'}
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!loading && resultData && (
          <ResultsSection 
            result={resultData} 
            preferredFormat={selectedFormat}
            onReset={handleReset}
            onBack={onBack}
          />
        )}

      </div>

    </main>
  );
}
