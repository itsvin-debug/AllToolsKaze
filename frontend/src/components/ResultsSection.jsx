import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import CosmicBackButton from './CosmicBackButton';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Images,
  DownloadCloud,
  Play,
  Pause,
  Music2,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Clock,
  Volume2,
  VolumeX,
  Film,
  Layers
} from 'lucide-react';

export default function ResultsSection({ result, preferredFormat = '1080p', onReset, onBack }) {
  const [selectedQualityIndex, setSelectedQualityIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // State Slide Video Gerak
  const [currentVideoSlideIndex, setCurrentVideoSlideIndex] = useState(0);
  const [downloadingAllVideoSlides, setDownloadingAllVideoSlides] = useState(false);
  const [downloadAllVideoProgress, setDownloadAllVideoProgress] = useState(0);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // State Slide Foto
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [downloadingAllPhotos, setDownloadingAllPhotos] = useState(false);
  const [downloadAllPhotoProgress, setDownloadAllPhotoProgress] = useState(0);

  // Mode Tampilan jika tersedia Video Slide DAN Foto (default ke video jika ada)
  const [activeSlideTab, setActiveSlideTab] = useState('video');

  const [detectedDuration, setDetectedDuration] = useState('');
  const audioRef = useRef(null);
  const singleVideoRef = useRef(null);
  const videoSlideRef = useRef(null);

  if (!result || !result.downloadLinks || result.downloadLinks.length === 0) {
    return null;
  }

  // Ekstrak jenis media secara terstruktur
  const videoSlides = result.videoSlides && result.videoSlides.length > 0
    ? result.videoSlides
    : result.downloadLinks.filter(l => l.isVideoSlide || (l.type === 'video' && l.label?.toLowerCase().includes('slide')));

  const hasVideoSlides = videoSlides.length > 0;

  const allPhotos = (result.photos && result.photos.length > 0)
    ? result.photos
    : result.downloadLinks.filter((l) => l.type === 'image');

  const hasPhotos = allPhotos.length > 0;

  // Video reguler (non-slide)
  const regularVideoLinks = result.downloadLinks.filter((l) => 
    l.type === 'video' && !l.isVideoSlide && !l.label?.toLowerCase().includes('slide')
  );

  const audioLinks = result.downloadLinks.filter((l) => l.type === 'audio');

  // Inisialisasi tab tampilan awal
  useEffect(() => {
    if (hasVideoSlides) {
      setActiveSlideTab('video');
    } else if (hasPhotos) {
      setActiveSlideTab('photo');
    }
    setCurrentVideoSlideIndex(0);
    setCurrentPhotoIndex(0);
  }, [result, hasVideoSlides, hasPhotos]);

  useEffect(() => {
    if (preferredFormat === '720p' && regularVideoLinks.length > 1) {
      setSelectedQualityIndex(1);
    } else {
      setSelectedQualityIndex(0);
    }
  }, [preferredFormat, regularVideoLinks]);

  const activeRegularVideo = regularVideoLinks[selectedQualityIndex] || regularVideoLinks[0];
  const activeVideoSlide = videoSlides[currentVideoSlideIndex] || videoSlides[0];
  const activePhoto = allPhotos[currentPhotoIndex] || allPhotos[0];

  // Ekstrak durasi menit & detik dari tag video
  const handleVideoMetadata = (e) => {
    const sec = e.target.duration;
    if (sec && !isNaN(sec)) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      setDetectedDuration(`${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`);
    }
  };

  const handleDownload = async (mediaItem, triggerConfetti = true) => {
    setDownloading(true);
    if (triggerConfetti) {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    }

    const defaultFilename = mediaItem.type === 'image'
      ? `kaze_photo_${Date.now()}.jpg`
      : mediaItem.type === 'audio'
      ? 'kaze_sound.mp3'
      : mediaItem.isVideoSlide
      ? `kaze_videoslide_${Date.now()}.mp4`
      : 'kaze_download.mp4';
    const filename = mediaItem.filename || defaultFilename;

    const proxyUrl = mediaItem.proxyUrl
      ? mediaItem.proxyUrl
      : `/api/proxy-download?url=${encodeURIComponent(mediaItem.url)}&filename=${encodeURIComponent(filename)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.setAttribute('download', filename);
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.warn('Blob download fallback:', err.message);
      window.open(mediaItem.url, '_blank');
    } finally {
      setTimeout(() => setDownloading(false), 1200);
    }
  };

  // Navigasi Video Slide
  const handleNextVideoSlide = () => {
    if (videoSlides.length <= 1) return;
    setCurrentVideoSlideIndex((prev) => (prev + 1) % videoSlides.length);
  };

  const handlePrevVideoSlide = () => {
    if (videoSlides.length <= 1) return;
    setCurrentVideoSlideIndex((prev) => (prev - 1 + videoSlides.length) % videoSlides.length);
  };

  const handleDownloadAllVideoSlides = async () => {
    if (!videoSlides || videoSlides.length === 0 || downloadingAllVideoSlides) return;
    setDownloadingAllVideoSlides(true);
    setDownloadAllVideoProgress(1);

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    for (let i = 0; i < videoSlides.length; i++) {
      setDownloadAllVideoProgress(i + 1);
      const slide = videoSlides[i];
      try {
        await handleDownload(slide, false);
      } catch (err) {
        console.warn(`Gagal unduh video slide #${i + 1}:`, err);
      }
      if (i < videoSlides.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => {
      setDownloadingAllVideoSlides(false);
      setDownloadAllVideoProgress(0);
    }, 1500);
  };

  // Navigasi Foto Slide
  const handleNextPhoto = () => {
    if (allPhotos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const handlePrevPhoto = () => {
    if (allPhotos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  const handleDownloadAllPhotos = async () => {
    if (!allPhotos || allPhotos.length === 0 || downloadingAllPhotos) return;
    setDownloadingAllPhotos(true);
    setDownloadAllPhotoProgress(1);

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    for (let i = 0; i < allPhotos.length; i++) {
      setDownloadAllPhotoProgress(i + 1);
      const photo = allPhotos[i];
      try {
        await handleDownload(photo, false);
      } catch (err) {
        console.warn(`Gagal unduh foto #${i + 1}:`, err);
      }
      if (i < allPhotos.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }

    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => {
      setDownloadingAllPhotos(false);
      setDownloadAllPhotoProgress(0);
    }, 1500);
  };

  // Toggle pemutar audio
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const displayDuration = detectedDuration 
    ? `${detectedDuration} Menit` 
    : result.duration 
    ? `${result.duration}` 
    : null;

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn mt-2">
      
      {/* ─── TAB SWITCHER: JIKA MEMILIKI KEDUA JENIS (SLIDE VIDEO GERAK & SLIDE FOTO) ─── */}
      {hasVideoSlides && hasPhotos && (
        <div className="w-full flex items-center justify-center">
          <div className="p-1 rounded-2xl bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center gap-1">
            <button
              onClick={() => setActiveSlideTab('video')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSlideTab === 'video'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Film className="w-4 h-4 text-cyan-400" />
              <span>Slide Video Gerak ({videoSlides.length})</span>
            </button>

            <button
              onClick={() => setActiveSlideTab('photo')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSlideTab === 'photo'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Images className="w-4 h-4 text-amber-400" />
              <span>Slide Foto HD ({allPhotos.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── 1. KARTU HASIL SLIDE VIDEO GERAK (OUTPUT VIDEO BERGERAK OTOMATIS) ─── */}
      {hasVideoSlides && activeSlideTab === 'video' && (
        <div className="w-full bg-white dark:bg-[#12151f] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col gap-5 animate-fadeIn">
          
          {/* Header Card Slide Video */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Film className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Slide Video Gerak ({videoSlides.length} Video HD)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    ✓ Bergerak
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Video bergerak otomatis. Geser tombol panah untuk memutar tiap slide video
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
                Video {currentVideoSlideIndex + 1} dari {videoSlides.length}
              </span>
            </div>
          </div>

          {/* Pratinjau Pemutar Video Slide (Bergerak Nyata & Loop Otomatis) */}
          <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[9/16] sm:aspect-[3/4] max-h-[460px] rounded-2xl overflow-hidden bg-black/95 flex items-center justify-center shadow-2xl border border-white/10 group">
            {activeVideoSlide ? (
              <video
                ref={videoSlideRef}
                key={activeVideoSlide.streamUrl || activeVideoSlide.url}
                src={activeVideoSlide.streamUrl || activeVideoSlide.url}
                poster={allPhotos[currentVideoSlideIndex]?.url || result.thumbnail || undefined}
                autoPlay
                loop
                muted={isVideoMuted}
                playsInline
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-xs text-slate-400">Video Slide Siap Diputar</div>
            )}

            {/* Badge Status Bergerak */}
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-emerald-400 font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md border border-emerald-400/30 pointer-events-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Slide Video Gerak #{currentVideoSlideIndex + 1}</span>
            </div>

            {/* Tombol Toggle Bisu / Suara */}
            <button
              onClick={() => {
                const nextMuted = !isVideoMuted;
                setIsVideoMuted(nextMuted);
                if (videoSlideRef.current) {
                  videoSlideRef.current.muted = nextMuted;
                }
              }}
              className="absolute top-3 right-3 bg-black/75 hover:bg-black text-white p-2 rounded-full shadow-md border border-white/20 transition-all cursor-pointer backdrop-blur-md"
              title={isVideoMuted ? 'Nyalakan Suara Video' : 'Bisukan Video'}
            >
              {isVideoMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Tombol Navigasi Panah Kiri / Kanan */}
            {videoSlides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevVideoSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 hover:scale-110 active:scale-95 shadow-xl"
                  aria-label="Video Slide Sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextVideoSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20 hover:scale-110 active:scale-95 shadow-xl"
                  aria-label="Video Slide Selanjutnya"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Indikator Slide Posisi */}
            <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/80 text-[10px] font-mono text-white pointer-events-none border border-white/10">
              {currentVideoSlideIndex + 1} / {videoSlides.length}
            </div>
          </div>

          {/* Tombol Aksi Unduh Video Slide */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {activeVideoSlide && (
              <button
                onClick={() => handleDownload(activeVideoSlide)}
                disabled={downloading}
                className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {downloading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Download Video Slide Ini (#{currentVideoSlideIndex + 1})</span>
              </button>
            )}

            {videoSlides.length > 1 && (
              <button
                onClick={handleDownloadAllVideoSlides}
                disabled={downloadingAllVideoSlides}
                className="w-full sm:flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all cursor-pointer border border-black/5 dark:border-white/10"
              >
                {downloadingAllVideoSlides ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Mengunduh Slide {downloadAllVideoProgress}/{videoSlides.length}...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4 text-cyan-400" />
                    <span>Download Semua ({videoSlides.length} Video Slide)</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      )}

      {/* ─── 2. KARTU HASIL FOTO SLIDE (JIKA BUKAN MODE VIDEO ATAU HANYA BERISI FOTO) ─── */}
      {hasPhotos && (!hasVideoSlides || activeSlideTab === 'photo') && (
        <div className="w-full bg-white dark:bg-[#12151f] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col gap-4 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Images className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Postingan Foto ({allPhotos.length} Gambar HD)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gunakan panah untuk memilih foto atau unduh seluruh album
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 font-mono">
              Foto {currentPhotoIndex + 1} dari {allPhotos.length}
            </span>
          </div>

          {/* Pratinjau Foto */}
          <div className="relative w-full max-w-lg mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black/80 flex items-center justify-center shadow-lg">
            {activePhoto ? (
              <img
                key={activePhoto.url}
                src={activePhoto.url}
                alt={activePhoto.label || `Foto ${currentPhotoIndex + 1}`}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-xs text-slate-400">Foto Siap Diunduh</div>
            )}

            {allPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                  aria-label="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
                  aria-label="Foto Selanjutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/80 text-[10px] font-mono text-white pointer-events-none">
              {currentPhotoIndex + 1} / {allPhotos.length}
            </div>
          </div>

          {/* Tombol Download Foto */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {activePhoto && (
              <button
                onClick={() => handleDownload(activePhoto)}
                disabled={downloading}
                className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl py-3 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Foto Ini (#{currentPhotoIndex + 1})</span>
              </button>
            )}

            {allPhotos.length > 1 && (
              <button
                onClick={handleDownloadAllPhotos}
                disabled={downloadingAllPhotos}
                className="w-full sm:flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {downloadingAllPhotos ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengunduh Foto {downloadAllPhotoProgress}/{allPhotos.length}...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4" />
                    <span>Download Semua ({allPhotos.length} Foto)</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      )}

      {/* ─── 3. KARTU HASIL VIDEO REGULER (JIKA POSTINGAN VIDEO STANDAR TANPA SLIDE) ─── */}
      {!hasVideoSlides && regularVideoLinks.length > 0 && (
        <div className="w-full bg-white dark:bg-[#12151f] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col md:flex-row gap-6 items-start relative overflow-hidden">
          
          {/* Pratinjau Video & Player dengan Suara Aktif */}
          <div className="w-full md:w-72 aspect-[9/16] sm:aspect-[3/4] max-h-[380px] rounded-2xl bg-black/80 border border-black/10 dark:border-white/10 overflow-hidden relative group shrink-0 flex items-center justify-center mx-auto md:mx-0 shadow-lg">
            
            {activeRegularVideo?.url ? (
              <video
                ref={singleVideoRef}
                key={activeRegularVideo.streamUrl || activeRegularVideo.url}
                src={activeRegularVideo.streamUrl || activeRegularVideo.url}
                poster={result.thumbnail || undefined}
                controls
                playsInline
                onLoadedMetadata={handleVideoMetadata}
                className="w-full h-full object-contain"
              />
            ) : result.thumbnail ? (
              <img
                src={result.thumbnail}
                alt={result.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                <Play className="w-10 h-10 text-indigo-400" />
                <span className="text-xs mt-2">Video Siap Diputar</span>
              </div>
            )}

            {/* Badge Tanpa Watermark */}
            <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-emerald-400 font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md border border-emerald-400/30 pointer-events-none">
              ✓ No Watermark
            </div>

            {/* Indikator Menit di Pojok Video */}
            {displayDuration && (
              <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md text-white font-mono text-[10px] px-2 py-0.5 rounded-md shadow-md border border-white/20 pointer-events-none flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{displayDuration}</span>
              </div>
            )}
          </div>

          {/* Rincian Video & Pilihan Kualitas */}
          <div className="flex-grow flex flex-col justify-between gap-5 w-full">
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  {result.platform}
                </span>
                <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  {activeRegularVideo.quality || 'HD'}
                </span>
                {displayDuration && (
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{displayDuration}</span>
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                {result.title || 'Video Siap Diunduh'}
              </h3>

              {result.author && (
                <p className="text-xs text-indigo-400 font-medium">
                  Kreator: @{result.author}
                </p>
              )}

              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Video siap ditonton dengan suara jernih dan diunduh tanpa watermark:
              </p>
            </div>

            {/* Pilihan Resolusi */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap w-full">
                {regularVideoLinks.map((link, idx) => {
                  const isSelected = selectedQualityIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedQualityIndex(idx)}
                      className={`px-3 py-2 rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-md'
                          : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      )}
                      <span>{link.label || link.quality}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tombol Download Video Utama */}
              {activeRegularVideo && (
                <button
                  onClick={() => handleDownload(activeRegularVideo)}
                  disabled={downloading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>
                    {downloading ? 'Memulai Unduhan...' : `Download Video MP4 (${activeRegularVideo.label || activeRegularVideo.quality})`}
                  </span>
                </button>
              )}

              {/* Tombol Download Audio / Sound Video MP3 */}
              <button
                onClick={() => {
                  const audioItem = audioLinks[0] || {
                    url: activeRegularVideo.url,
                    filename: 'kaze_sound.mp3',
                    type: 'audio'
                  };
                  handleDownload(audioItem);
                }}
                className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Music2 className="w-4 h-4 text-emerald-400" />
                <span>Dengar & Download Sound MP3 Saja</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ─── 4. AUDIO PLAYER MANDIRI ─── */}
      {audioLinks.length > 0 && (
        <div className="w-full bg-white dark:bg-[#12151f] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Music2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {result.musicInfo?.title || 'Sound Musik / Audio Asli'}
              </h3>
              <p className="text-slate-400 text-xs truncate">
                {result.musicInfo?.author || result.author || 'Audio MP3'}
              </p>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={audioLinks[0].url}
            onEnded={() => setIsPlayingAudio(false)}
            className="hidden"
          />

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-black/5 dark:border-white/5">
            <button
              onClick={togglePlayAudio}
              className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
              aria-label={isPlayingAudio ? 'Pause' : 'Play'}
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <div className="flex-grow flex flex-col gap-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between font-mono">
                <span>{isPlayingAudio ? 'Sedang Memutar Audio...' : 'Putar Audio Musik'}</span>
                <span>MP3 HD</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-emerald-500 rounded-full transition-all duration-300 ${
                    isPlayingAudio ? 'w-full animate-pulse' : 'w-1/4'
                  }`}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleDownload(audioLinks[0])}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Lagu / Sound MP3 Ini</span>
          </button>
        </div>
      )}

      {/* ─── 5. NAVIGASI AKSI BAWAH ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 w-full">
        {onBack && (
          <CosmicBackButton onClick={onBack} label="Kembali ke Beranda" />
        )}

        <button
          onClick={onReset}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Unduh Link Lainnya</span>
        </button>
      </div>

    </div>
  );
}
