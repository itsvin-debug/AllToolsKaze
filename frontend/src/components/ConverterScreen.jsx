import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CosmicBackButton from './CosmicBackButton';
import { 
  Link2, 
  Clipboard, 
  Download, 
  Music2, 
  Camera, 
  Play, 
  AlertCircle,
  ChevronDown,
  Loader2,
  ArrowRight,
  Music,
  Share2,
  Tv,
  Image as ImageIcon,
  Disc,
  FolderDown,
  Flame,
  Radio,
  ExternalLink
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

  // 16 Platform Medsos & Streaming yang Didukung
  const platforms = [
    {
      id: 'tiktok',
      name: 'TikTok',
      badge: 'Video & Slide',
      placeholder: 'Tempel link video atau slide TikTok (vt.tiktok.com atau tiktok.com/@user/...)',
      hint: 'Mendukung video HD tanpa watermark dan kumpulan slide gambar TikTok.',
      icon: Music2,
      domains: ['tiktok.com']
    },
    {
      id: 'instagram',
      name: 'Instagram',
      badge: 'Reels & Post',
      placeholder: 'Tempel link Reels, Carousel, atau Foto IG (instagram.com/reel/... atau /p/...)',
      hint: 'Mendukung video Reels, postingan carousel multi-foto, dan foto resolusi tinggi.',
      icon: Camera,
      domains: ['instagram.com', 'instagr.am', 'ig.me']
    },
    {
      id: 'youtube',
      name: 'YouTube',
      badge: 'Shorts & MP3',
      placeholder: 'Tempel link video atau Shorts (youtube.com/watch?v=... atau youtu.be/...)',
      hint: 'Mendukung video reguler, YouTube Shorts, serta konversi audio MP3.',
      icon: Play,
      domains: ['youtube.com', 'youtu.be']
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      badge: 'Tweet Video',
      placeholder: 'Tempel link postingan tweet video (x.com/.../status/... atau twitter.com/...)',
      hint: 'Mendukung unduhan file MP4 kualitas master dari postingan video di platform X.',
      icon: () => (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current inline">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </svg>
      ),
      domains: ['x.com', 'twitter.com']
    },
    {
      id: 'spotify',
      name: 'Spotify',
      badge: 'Audio Trek',
      placeholder: 'Tempel link lagu atau album Spotify (open.spotify.com/track/...)',
      hint: 'Ekstrak metadata lagu, cover album resolusi penuh, dan trek audio.',
      icon: Music,
      domains: ['spotify.com', 'spotify.link', 'spoti.fi']
    },
    {
      id: 'bilibili',
      name: 'Bilibili',
      badge: 'Anime & HD',
      placeholder: 'Tempel link video Bilibili (bilibili.com/video/... atau b23.tv/...)',
      hint: 'Unduh klip anime dan konten video streaming Bilibili tanpa penurunan resolusi.',
      icon: Tv,
      domains: ['bilibili.com', 'bilibili.tv', 'b23.tv']
    },
    {
      id: 'douyin',
      name: 'Douyin',
      badge: 'Video China',
      placeholder: 'Tempel link video Douyin (douyin.com/video/... atau iesdouyin.com/...)',
      hint: 'Unduh video original Douyin tanpa watermark langsung dalam format MP4.',
      icon: Music2,
      domains: ['douyin.com', 'iesdouyin.com', 'v.douyin.com']
    },
    {
      id: 'rednote',
      name: 'Rednote',
      badge: 'Xiaohongshu',
      placeholder: 'Tempel link postingan Rednote / Xiaohongshu (xhslink.com/... atau xiaohongshu.com/...)',
      hint: 'Unduh album foto lifestyle dan video pendek resolusi tinggi dari Xiaohongshu.',
      icon: Disc,
      domains: ['xiaohongshu.com', 'xhslink.com']
    },
    {
      id: 'threads',
      name: 'Threads',
      badge: 'Post Media',
      placeholder: 'Tempel link postingan Threads (threads.net/@user/post/...)',
      hint: 'Ekstrak video dan gambar dari postingan teks multimedia Threads.',
      icon: Share2,
      domains: ['threads.net']
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      badge: 'Pins & Foto',
      placeholder: 'Tempel link pin Pinterest (pinterest.com/pin/... atau pin.it/...)',
      hint: 'Unduh gambar resolusi asli penuh dan video pin dari Pinterest.',
      icon: ImageIcon,
      domains: ['pinterest.com', 'pin.it']
    },
    {
      id: 'appleMusic',
      name: 'Apple Music',
      badge: 'Artwork & Audio',
      placeholder: 'Tempel link lagu Apple Music (music.apple.com/.../album/...)',
      hint: 'Ekstrak artwork cover beresolusi tinggi dan metadata resmi Apple Music.',
      icon: Music,
      domains: ['music.apple.com', 'itunes.apple.com', 'apple.co']
    },
    {
      id: 'facebook',
      name: 'Facebook',
      badge: 'Reels & Video',
      placeholder: 'Tempel link video atau Reels Facebook (facebook.com/watch/... atau fb.watch/...)',
      hint: 'Unduh video publik dan klip video Facebook dalam format MP4 HD.',
      icon: Play,
      domains: ['facebook.com', 'fb.watch', 'fb.com']
    },
    {
      id: 'bandcamp',
      name: 'Bandcamp',
      badge: 'Musik Lossless',
      placeholder: 'Tempel link album atau trek Bandcamp (artist.bandcamp.com/track/...)',
      hint: 'Unduh streaming preview audio dan cover artwork artis independen.',
      icon: Radio,
      domains: ['bandcamp.com']
    },
    {
      id: 'pixiv',
      name: 'Pixiv',
      badge: 'Artwork Ilustrasi',
      placeholder: 'Tempel link karya ilustrasi Pixiv (pixiv.net/artworks/...)',
      hint: 'Unduh karya seni ilustrasi master langsung dalam resolusi asli gambar.',
      icon: ImageIcon,
      domains: ['pixiv.net', 'phixiv.net', 'pximg.net']
    },
    {
      id: 'reddit',
      name: 'Reddit',
      badge: 'Video & Post',
      placeholder: 'Tempel link postingan video Reddit (reddit.com/r/.../comments/...)',
      hint: 'Ekstrak video dengan sinkronisasi trek audio dari server media Reddit.',
      icon: Flame,
      domains: ['reddit.com', 'v.redd.it', 'redd.it']
    },
    {
      id: 'terabox',
      name: 'Terabox',
      badge: 'Cloud Media',
      placeholder: 'Tempel tautan file publik Terabox (terabox.com/s/... atau 1024tera.com/...)',
      hint: 'Bypass antrean unduhan file media publik dari penyimpanan cloud Terabox.',
      icon: FolderDown,
      domains: ['terabox.com', '1024tera.com', 'teraboxapp.com']
    }
  ];

  const currentMeta = platforms.find(p => p.id === activePlatform) || platforms[0];
  const CurrentIcon = currentMeta.icon;

  const detectPlatformFromUrl = (rawUrl) => {
    if (!rawUrl) return null;
    const lower = rawUrl.toLowerCase();
    for (const p of platforms) {
      for (const dom of p.domains) {
        if (lower.includes(dom)) return p.id;
      }
    }
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
    } catch {
      // ignore
    }
  };

  const validateUrlAgainstPlatform = (url, platformId) => {
    if (!url) {
      setErrorMsg('');
      setSuggestedPlatform(null);
      return true;
    }

    const detected = detectPlatformFromUrl(url);
    const targetObj = platforms.find(p => p.id === platformId) || platforms[0];

    if (detected !== 'unknown' && detected !== platformId) {
      const detectedObj = platforms.find(p => p.id === detected);
      setErrorMsg(
        `Link yang dimasukkan terdeteksi sebagai tautan ${detectedObj?.name || detected}, bukan ${targetObj.name}. Silakan beralih ke selector ${detectedObj?.name || detected}.`
      );
      setSuggestedPlatform(detected);
      return false;
    }

    if (detected === 'unknown') {
      const allowedDomains = targetObj.domains.join(', ');
      setErrorMsg(
        `Tautan tidak cocok dengan domain resmi ${targetObj.name}. Pastikan URL memuat domain ${allowedDomains}.`
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
    if (val.trim().length > 10) {
      validateUrlAgainstPlatform(val.trim(), activePlatform);
    } else {
      setErrorMsg('');
      setSuggestedPlatform(null);
    }
  };

  const handleSwitchPlatform = (newPlatformId) => {
    setActivePlatform(newPlatformId);
    if (onSelectPlatform) onSelectPlatform(newPlatformId);
    setErrorMsg('');
    setSuggestedPlatform(null);
    if (urlInput.trim()) {
      validateUrlAgainstPlatform(urlInput.trim(), newPlatformId);
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

    const isValid = validateUrlAgainstPlatform(trimmedUrl, activePlatform);
    if (!isValid) {
      return;
    }

    try {
      setLoading(true);
      setDownloadProgress(2);

      const progressTimer = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 92) return prev;
          const inc = Math.floor(Math.random() * 8) + 4;
          return Math.min(92, prev + inc);
        });
      }, 140);

      const response = await axios.post('/api/download', {
        url: trimmedUrl,
        expectedPlatform: activePlatform
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 45000
      });

      clearInterval(progressTimer);

      if (response.data && response.data.success && response.data.data) {
        setDownloadProgress(100);
        setTimeout(() => {
          setResultData(response.data.data);
          setLoading(false);
          setDownloadProgress(0);
        }, 400);
      } else {
        throw new Error(response.data?.message || 'Gagal memproses tautan media.');
      }
    } catch (err) {
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
    <main className="flex-grow flex flex-col items-center justify-start px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto w-full">
      
      <div className="w-full flex flex-col gap-5">
        
        {/* Navigation & Header Status */}
        <div className="w-full flex items-center justify-between">
          <CosmicBackButton onClick={onBack} label="Kembali ke Beranda" />

          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded border-2 border-black bg-neutral-100 text-black uppercase">
            16 Platform Tersedia
          </span>
        </div>

        {/* Clean Page Title & Functional Description */}
        <div className="w-full border-b-2 border-black pb-4">
          <h1 className="text-xl sm:text-3xl font-black text-black tracking-tight font-display uppercase">
            Media Downloader
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1.5 leading-relaxed max-w-2xl">
            Unduh video definisi tinggi, kumpulan slide foto, dan trek audio tanpa watermark dari 16 platform media sosial dan konten streaming. Pilih platform di bawah, tempelkan tautan yang valid, lalu unduh secara langsung.
          </p>
        </div>

        {/* ─── 16 PLATFORM SELECTOR GRID (NEOBRUTALISM STYLE) ─── */}
        <div className="w-full">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-black mb-2 flex items-center justify-between">
            <span>Pilih Platform Media</span>
            <span className="text-neutral-500">{currentMeta.name} Aktif</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {platforms.map((p) => {
              const Icon = p.icon;
              const isSelected = activePlatform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSwitchPlatform(p.id)}
                  className={`p-2.5 sm:p-3 rounded-lg border-2 border-black text-left transition-all duration-150 flex flex-col justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white shadow-[3px_3px_0px_#000000] -translate-x-0.5 -translate-y-0.5'
                      : 'bg-white text-black hover:bg-neutral-100 hover:shadow-[2px_2px_0px_#000000]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`w-7 h-7 rounded border border-current flex items-center justify-center ${isSelected ? 'bg-white text-black' : 'bg-neutral-100 text-black'}`}>
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-current ${isSelected ? 'bg-neutral-900 text-white' : 'bg-white text-black'}`}>
                      {p.badge}
                    </span>
                  </div>

                  <div className="font-extrabold text-xs sm:text-sm tracking-tight truncate">
                    {p.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── ACTIVE FEATURE INTERFACE (INPUT & ACTIONS) ─── */}
        <div className="w-full rounded-xl p-5 sm:p-6 border-2 border-black bg-white shadow-[4px_4px_0px_#000000] flex flex-col gap-4">
          
          <div className="flex items-center gap-3 pb-3 border-b-2 border-black">
            <div className="w-10 h-10 rounded-lg border-2 border-black bg-black text-white flex items-center justify-center">
              <CurrentIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-black uppercase tracking-tight">
                Unduh Media {currentMeta.name}
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                {currentMeta.hint}
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-3 w-full">
            
            {/* Input URL */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-black">
                <Link2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              
              <input
                type="text"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={currentMeta.placeholder}
                className="w-full bg-white border-2 border-black text-black text-xs sm:text-sm font-medium rounded-lg py-3.5 pl-10 pr-24 focus:outline-none focus:ring-2 focus:ring-black transition-all placeholder:text-neutral-400"
              />

              <button
                type="button"
                onClick={handlePasteClipboard}
                className="absolute inset-y-0 right-2 px-3 my-2 text-xs font-mono font-bold rounded border border-black bg-neutral-100 hover:bg-neutral-200 text-black transition-all flex items-center gap-1 cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tempel</span>
              </button>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="p-3.5 rounded-lg border-2 border-black bg-neutral-100 text-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-black stroke-[2.5]" />
                  <span className="font-medium">{errorMsg}</span>
                </div>

                {suggestedPlatform && (
                  <button
                    type="button"
                    onClick={() => handleSwitchPlatform(suggestedPlatform)}
                    className="shrink-0 px-3 py-1 rounded border-2 border-black bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Pindah ke {platforms.find(p => p.id === suggestedPlatform)?.name || suggestedPlatform}</span>
                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                  </button>
                )}
              </div>
            )}

            {/* Format & Submit Button */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full">
              <div className="relative sm:w-64">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full appearance-none bg-white border-2 border-black text-black text-xs sm:text-sm rounded-lg py-3 px-3.5 pr-9 cursor-pointer font-bold focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="1080p">HD 1080p (Kualitas Maksimal)</option>
                  <option value="720p">HD 720p (Standar Cepat)</option>
                  <option value="mp3">Audio MP3 (Ekstrak Suara)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-black">
                  <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex-grow bg-black hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm rounded-lg px-6 py-3 border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Mengunduh... {downloadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Download Media {currentMeta.name}</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Loading Progress State */}
        {loading && (
          <div className="w-full rounded-xl p-6 border-2 border-black bg-white shadow-[3px_3px_0px_#000000] flex flex-col items-center justify-center gap-3">
            <div className="w-full max-w-md flex flex-col items-center gap-2.5">
              <div className="flex items-center justify-between w-full text-xs font-mono font-bold">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Proses Ekstraksi {currentMeta.name}</span>
                </span>
                <span>{downloadProgress}%</span>
              </div>

              <div className="w-full h-4 rounded-md border-2 border-black p-0.5 bg-white overflow-hidden">
                <div 
                  className="h-full bg-black transition-all duration-150"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>

              <p className="text-[11px] text-neutral-600 text-center font-mono">
                {downloadProgress < 100 
                  ? `Mengambil tautan media kualitas master dari ${currentMeta.name}...` 
                  : 'Selesai. Memuat pratinjau output media...'}
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
