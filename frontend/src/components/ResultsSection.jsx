import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
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
  Clock,
  Volume2,
  VolumeX,
  FileArchive,
  Film,
  RotateCcw,
  RotateCw,
  Disc3
} from 'lucide-react';

export default function ResultsSection({ result, preferredFormat = '1080p', onReset, onBack }) {
  if (!result || !result.downloadLinks || result.downloadLinks.length === 0) {
    return null;
  }

  // ─── 1. DETEKSI TIPE KONTEN SECARA KETAT (FOTO SLIDE VS VIDEO REGULER) ───
  // Ekstrak semua foto
  const allPhotos = (result.photos && result.photos.length > 0)
    ? result.photos
    : (result.downloadLinks?.filter((l) => l.type === 'image') || []);

  const hasPhotos = allPhotos.length > 0;
  // Jika postingan memiliki foto, ini PASTI Foto Slide (Carousel), BUKAN video!
  const isSlidePost = result.mediaType === 'slide' || result.isSlide || hasPhotos;

  // Video reguler (HANYA jika bukan postingan foto slide)
  const regularVideoLinks = !isSlidePost
    ? (result.downloadLinks?.filter((l) => l.type === 'video') || [])
    : [];
  const hasVideo = regularVideoLinks.length > 0;

  // Audio MP3 (Tersedia baik di postingan video maupun di postingan foto slide)
  const audioLinks = result.downloadLinks?.filter((l) => l.type === 'audio') || [];
  const activeAudio = audioLinks[0] || null;

  // ─── 2. STATE INTERAKTIF ───
  const [selectedQualityIndex, setSelectedQualityIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadingAllPhotos, setDownloadingAllPhotos] = useState(false);
  const [downloadAllProgressText, setDownloadAllProgressText] = useState('');
  const [detectedDuration, setDetectedDuration] = useState('');

  // Audio Player State (Real-time Running Seconds & Progress)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [currentAudioSrcIndex, setCurrentAudioSrcIndex] = useState(0);

  // Swipe Touch State untuk HP
  const [touchStartX, setTouchStartX] = useState(null);

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  // Urutan fallback sumber audio (Stream Proxy -> Stream Direct Proxy -> Proxy Download -> URL Asli)
  const audioSources = useMemo(() => {
    if (!activeAudio) return [];
    const list = [];
    if (activeAudio.streamUrl) list.push(activeAudio.streamUrl);
    if (activeAudio.url) {
      list.push(`/api/proxy-stream?url=${encodeURIComponent(activeAudio.url)}&type=audio`);
    }
    if (activeAudio.proxyUrl) list.push(activeAudio.proxyUrl);
    if (activeAudio.url) list.push(activeAudio.url);
    return [...new Set(list)];
  }, [activeAudio]);

  const activeAudioSrc = audioSources[currentAudioSrcIndex] || audioSources[0] || '';

  useEffect(() => {
    setCurrentPhotoIndex(0);
    setIsPlayingAudio(false);
    setIsAudioLoading(false);
    setAudioCurrentTime(0);
    setCurrentAudioSrcIndex(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [result]);

  useEffect(() => {
    if (preferredFormat === '720p' && regularVideoLinks.length > 1) {
      setSelectedQualityIndex(1);
    } else {
      setSelectedQualityIndex(0);
    }
  }, [preferredFormat, regularVideoLinks]);

  const activeRegularVideo = regularVideoLinks[selectedQualityIndex] || regularVideoLinks[0];
  const activePhoto = allPhotos[currentPhotoIndex] || allPhotos[0];

  // ─── 3. FUNGSI DOWNLOAD KE GALERI / PERANGKAT (MOBILE & DESKTOP) ───
  const downloadToDevice = async (mediaItem, customFilename = null, triggerCelebration = true) => {
    setDownloading(true);
    if (triggerCelebration) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }

    const filename = customFilename || mediaItem.filename || (
      mediaItem.type === 'image' 
        ? `kaze_photo_${Date.now()}.jpg` 
        : mediaItem.type === 'audio' 
        ? `kaze_audio_${Date.now()}.mp3` 
        : `kaze_video_${Date.now()}.mp4`
    );

    const proxyUrl = mediaItem.proxyUrl 
      || `/api/proxy-download?url=${encodeURIComponent(mediaItem.url)}&filename=${encodeURIComponent(filename)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const rawBlob = await response.blob();
      
      // Tentukan MIME Type yang tepat agar galeri HP mengenali file langsung
      let mimeType = rawBlob.type;
      if (!mimeType || mimeType === 'application/octet-stream') {
        if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) mimeType = 'image/jpeg';
        else if (filename.endsWith('.png')) mimeType = 'image/png';
        else if (filename.endsWith('.mp4')) mimeType = 'video/mp4';
        else if (filename.endsWith('.mp3')) mimeType = 'audio/mpeg';
      }

      const typedBlob = new Blob([rawBlob], { type: mimeType });
      const blobUrl = URL.createObjectURL(typedBlob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 8000);
    } catch (err) {
      console.warn('Fetch blob download fallback to native download manager:', err.message);
      // Fallback: Langsung arahkan ke proxyUrl yang menyertakan header Content-Disposition: attachment
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = proxyUrl;
      document.body.appendChild(iframe);
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 10000);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  // ─── 4. DOWNLOAD ALL SLIDE (ZIP ALBUM & BATCH KE GALERI) ───
  const handleDownloadAllPhotosZip = async () => {
    if (!allPhotos || allPhotos.length === 0 || downloadingAllPhotos) return;
    setDownloadingAllPhotos(true);
    setDownloadAllProgressText('Menyiapkan album...');

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    try {
      const zip = new JSZip();
      const folderName = `AllToolsKaze_Slides_${result.id || Date.now()}`;
      const imgFolder = zip.folder(folderName);

      for (let i = 0; i < allPhotos.length; i++) {
        setDownloadAllProgressText(`Mengambil foto ${i + 1} dari ${allPhotos.length}...`);
        const photo = allPhotos[i];
        const filename = photo.filename || `slide_${i + 1}.jpg`;
        const proxyUrl = photo.proxyUrl 
          || `/api/proxy-download?url=${encodeURIComponent(photo.url)}&filename=${encodeURIComponent(filename)}`;

        try {
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const blob = await res.blob();
            imgFolder.file(filename, blob);
          }
        } catch (fetchErr) {
          console.warn(`Gagal mengambil foto slide #${i + 1}:`, fetchErr);
        }
      }

      setDownloadAllProgressText('Mengemas ZIP Album HD...');
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const zipFilename = `AllToolsKaze_Album_Semua_Slide_${allPhotos.length}_Foto.zip`;

      const blobUrl = URL.createObjectURL(zipContent);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', zipFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (zipErr) {
      console.error('Error saat membuat ZIP:', zipErr);
      // Fallback: Unduh satu per satu secara berurutan
      for (let i = 0; i < allPhotos.length; i++) {
        setDownloadAllProgressText(`Unduh otomatis #${i + 1}...`);
        await downloadToDevice(allPhotos[i], null, false);
        await new Promise((r) => setTimeout(r, 600));
      }
    } finally {
      setTimeout(() => {
        setDownloadingAllPhotos(false);
        setDownloadAllProgressText('');
      }, 1200);
    }
  };

  // ─── 5. KONTROL AUDIO PLAYER REAL-TIME DENGAN MENIT & DETIK BERJALAN ───
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      setIsAudioLoading(true);
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
        setIsAudioLoading(false);
      }).catch((e) => {
        console.warn('Audio play failed, switching to next stream source:', e);
        setIsAudioLoading(false);
        setIsPlayingAudio(false);
        if (currentAudioSrcIndex < audioSources.length - 1) {
          setCurrentAudioSrcIndex((prev) => prev + 1);
        }
      });
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration || 0);
      setIsAudioLoading(false);
    }
  };

  const handleAudioError = () => {
    console.warn(`Audio source ${activeAudioSrc} failed, attempting next fallback...`);
    setIsAudioLoading(false);
    if (currentAudioSrcIndex < audioSources.length - 1) {
      setCurrentAudioSrcIndex((prev) => prev + 1);
    } else {
      setIsPlayingAudio(false);
    }
  };

  const handleAudioSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setAudioCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleSeekDelta = (deltaSeconds) => {
    if (!audioRef.current) return;
    const maxDur = audioDuration || 100;
    const newTime = Math.max(0, Math.min(maxDur, (audioRef.current.currentTime || 0) + deltaSeconds));
    audioRef.current.currentTime = newTime;
    setAudioCurrentTime(newTime);
  };

  const toggleAudioMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isAudioMuted;
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Navigasi Slide Foto
  const handleNextPhoto = () => {
    if (allPhotos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const handlePrevPhoto = () => {
    if (allPhotos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  // Dukungan Swipe di Layar HP
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (diffX > 45) {
      handleNextPhoto(); // Swipe kiri -> foto selanjutnya
    } else if (diffX < -45) {
      handlePrevPhoto(); // Swipe kanan -> foto sebelumnya
    }
    setTouchStartX(null);
  };

  // Ekstrak durasi video
  const handleVideoMetadata = (e) => {
    const sec = e.target.duration;
    if (sec && !isNaN(sec)) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      setDetectedDuration(`${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`);
    }
  };

  const displayDuration = detectedDuration 
    ? `${detectedDuration} Menit` 
    : result.duration 
    ? `${result.duration}` 
    : null;

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn mt-2">

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ─── A. JIKA KONTEN ADALAH FOTO SLIDE (CAROUSEL SLIDE BISA DIGESER) ─── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {isSlidePost && hasPhotos && (
        <div className="w-full bg-[#12151f] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 animate-fadeIn">
          
          {/* Header Kartu Slide */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Images className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Foto Slide Album ({allPhotos.length} Foto HD)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                    ✓ Slide Carousel
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Geser foto ke kanan/kiri dengan tombol panah atau usap layar HP
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 font-mono border border-amber-500/30">
              Slide {currentPhotoIndex + 1} dari {allPhotos.length}
            </span>
          </div>

          {/* Area Preview Foto Slide Utama (Bisa Diusap / Swipe di HP & Tombol Next/Prev) */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full max-w-xl mx-auto min-h-[380px] xs:min-h-[430px] sm:min-h-[480px] max-h-[520px] rounded-2xl overflow-hidden bg-black/95 flex items-center justify-center shadow-2xl border border-white/10 select-none"
          >
            {activePhoto ? (
              <img
                key={activePhoto.url}
                src={activePhoto.url}
                alt={activePhoto.label || `Foto Slide ${currentPhotoIndex + 1}`}
                className="w-full h-full object-contain pointer-events-none transition-all duration-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-xs text-slate-400">Foto Siap Diunduh</div>
            )}

            {/* Tombol Navigasi Panah Kiri / Kanan */}
            {allPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-xl border border-white/15 active:scale-90"
                  aria-label="Slide Sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-xl border border-white/15 active:scale-90"
                  aria-label="Slide Selanjutnya"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Badge Posisi Slide */}
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-mono text-white pointer-events-none border border-white/10">
              {currentPhotoIndex + 1} / {allPhotos.length}
            </div>

            {/* Tag Kualitas Asli HD */}
            <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md text-[10px] font-mono text-emerald-300 pointer-events-none border border-emerald-500/30 font-bold">
              HD 1080p Image
            </div>
          </div>

          {/* Thumbnail Strip: Klik untuk Langsung Lompat ke Slide Tertentu */}
          {allPhotos.length > 1 && (
            <div className="w-full flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto py-2 px-1 no-scrollbar touch-pan-x">
              {allPhotos.map((photo, idx) => {
                const isCurrent = idx === currentPhotoIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      isCurrent 
                        ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/30' 
                        : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <img 
                      src={photo.url} 
                      alt={`Thumb ${idx + 1}`} 
                      className="w-full h-full object-cover pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 px-1 text-[8px] font-mono bg-black/85 text-white rounded-tl font-bold">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── 2 JENIS TOMBOL DOWNLOAD FOTO SLIDE (SESUAI PERMINTAAN) ─── */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full">
            
            {/* 1. DOWNLOAD THIS SLIDE */}
            {activePhoto && (
              <button
                onClick={() => downloadToDevice(activePhoto, `tiktok_slide_${currentPhotoIndex + 1}_1080p.jpg`)}
                disabled={downloading}
                className="w-full sm:flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl py-3.5 sm:py-4 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {downloading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Download className="w-4 h-4 text-slate-950" />
                )}
                <span>Download This Slide (Foto #{currentPhotoIndex + 1})</span>
              </button>
            )}

            {/* 2. DOWNLOAD ALL SLIDE */}
            {allPhotos.length > 1 && (
              <button
                onClick={handleDownloadAllPhotosZip}
                disabled={downloadingAllPhotos}
                className="w-full sm:flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl py-3.5 sm:py-4 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer border border-indigo-400/30 disabled:opacity-50"
              >
                {downloading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Download className="w-4 h-4 text-slate-950" />
                )}
                <span>Download This Slide (Foto #{currentPhotoIndex + 1})</span>
              </button>
            )}

            {/* 2. DOWNLOAD ALL SLIDE */}
            {allPhotos.length > 1 && (
              <button
                onClick={handleDownloadAllPhotosZip}
                disabled={downloadingAllPhotos}
                className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer border border-indigo-400/30 disabled:opacity-50"
              >
                {downloadingAllPhotos ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>{downloadAllProgressText || 'Mengunduh Semua Slide...'}</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-4 h-4 text-amber-300" />
                    <span>Download All Slide ({allPhotos.length} Foto ZIP)</span>
                  </>
                )}
              </button>
            )}

          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ─── B. JIKA KONTEN ADALAH VIDEO REGULER (RESOLUSI 1080p & 720p HD) ─── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {!isSlidePost && hasVideo && (
        <div className="w-full bg-[#12151f] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col md:flex-row gap-6 items-start relative overflow-hidden">
          
          {/* Player Video dengan Suara Jernih */}
          <div className="w-full md:w-72 aspect-[9/16] sm:aspect-[3/4] max-h-[380px] rounded-2xl bg-black/90 border border-white/10 overflow-hidden relative group shrink-0 flex items-center justify-center mx-auto md:mx-0 shadow-xl">
            
            {activeRegularVideo?.url ? (
              <video
                ref={videoRef}
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

            {/* Badge No Watermark */}
            <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-emerald-400 font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md border border-emerald-400/30 pointer-events-none">
              ✓ No Watermark
            </div>

            {/* Durasi Menit Video */}
            {displayDuration && (
              <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md text-white font-mono text-[10px] px-2 py-0.5 rounded-md shadow-md border border-white/20 pointer-events-none flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{displayDuration}</span>
              </div>
            )}
          </div>

          {/* Rincian Video & Pilihan Resolusi HD */}
          <div className="flex-grow flex flex-col justify-between gap-5 w-full">
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  {result.platform || 'Video HD'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Bebas Watermark
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-snug">
                {result.title || 'Video Siap Diunduh'}
              </h3>

              {result.author && (
                <p className="text-xs text-indigo-400 font-medium font-mono">
                  Kreator: @{result.author}
                </p>
              )}

              <p className="text-slate-400 text-xs">
                Pilih resolusi video HD terbaik tanpa watermark untuk disimpan langsung ke galeri:
              </p>
            </div>

            {/* Pilihan Resolusi (1080p Full HD vs 720p Standard HD) */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap w-full">
                {regularVideoLinks.map((link, idx) => {
                  const isSelected = selectedQualityIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedQualityIndex(idx)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 border border-indigo-400/50'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:border-indigo-400/40 hover:text-white'
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      )}
                      <span className="font-mono">{link.label || link.quality}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tombol Download Video Utama */}
              {activeRegularVideo && (
                <button
                  onClick={() => downloadToDevice(activeRegularVideo)}
                  disabled={downloading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm sm:text-base rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Download className="w-4 h-4 text-white" />
                  )}
                  <span>
                    {downloading ? 'Menyimpan ke Perangkat...' : `Download Video MP4 (${activeRegularVideo.label || activeRegularVideo.quality})`}
                  </span>
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ─── C. REVISI DESAIN: MODERN STUDIO AUDIO PLAYER (RESPONSIF & RAPIH) ─── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {activeAudio && (
        <div className="w-full bg-gradient-to-b from-[#131722]/95 via-[#10131d]/95 to-[#0b0d14]/98 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col gap-5 sm:gap-6 animate-fadeIn">
          
          {/* Ambient Cosmic Lights */}
          <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Tag Audio Tersembunyi dengan Multi-Fallback Proxy */}
          <audio
            ref={audioRef}
            src={activeAudioSrc}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoadedMetadata}
            onWaiting={() => setIsAudioLoading(true)}
            onPlaying={() => {
              setIsAudioLoading(false);
              setIsPlayingAudio(true);
            }}
            onPause={() => setIsPlayingAudio(false)}
            onError={handleAudioError}
            onEnded={() => {
              setIsPlayingAudio(false);
              setAudioCurrentTime(0);
              if (audioRef.current) audioRef.current.currentTime = 0;
            }}
            preload="metadata"
            className="hidden"
          />

          {/* Header Track: Artwork Vinyl, Info Lagu, dan Equalizer Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            
            <div className="flex items-center gap-3.5 sm:gap-4 overflow-hidden">
              {/* Piringan Vinyl / Disc Berputar saat Play */}
              <div className="relative shrink-0">
                <div className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 border-2 border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 ${isPlayingAudio ? 'animate-[spin_6s_linear_infinite]' : ''}`}>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/10 flex items-center justify-center bg-black/40">
                    <Disc3 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#12151f] ${isPlayingAudio ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              </div>

              {/* Rincian Judul & Creator Lagu */}
              <div className="flex flex-col min-w-0 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Audio Asli
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Official Track
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate mt-1 tracking-wide">
                  {result.musicInfo?.title || result.title || 'Sound Musik Asli'}
                </h3>
                <p className="text-slate-400 text-xs truncate font-mono flex items-center gap-1.5 mt-0.5">
                  <Music2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{result.musicInfo?.author || result.author || 'TikTok Creator'}</span>
                </p>
              </div>
            </div>

            {/* Equalizer Badge Status */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t border-white/5 sm:border-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10">
                <div className="flex items-end gap-1 h-3.5">
                  <span className={`w-0.5 sm:w-1 bg-emerald-400 rounded-full transition-all duration-200 ${isPlayingAudio ? 'h-3.5 animate-pulse' : 'h-1.5 opacity-40'}`} />
                  <span className={`w-0.5 sm:w-1 bg-teal-400 rounded-full transition-all duration-300 ${isPlayingAudio ? 'h-2.5 animate-bounce' : 'h-2 opacity-40'}`} style={{ animationDelay: '120ms' }} />
                  <span className={`w-0.5 sm:w-1 bg-emerald-300 rounded-full transition-all duration-200 ${isPlayingAudio ? 'h-3.5 animate-pulse' : 'h-1 opacity-40'}`} style={{ animationDelay: '240ms' }} />
                  <span className={`w-0.5 sm:w-1 bg-cyan-400 rounded-full transition-all duration-300 ${isPlayingAudio ? 'h-2 animate-bounce' : 'h-1.5 opacity-40'}`} style={{ animationDelay: '60ms' }} />
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-300">
                  {isPlayingAudio ? 'Sedang Diputar' : 'MP3 HD 128kbps'}
                </span>
              </div>
            </div>

          </div>

          {/* Area Scrubber / Seeker Bar dengan Running Time Lega & Jelas */}
          <div className="flex flex-col gap-2 p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/10 relative z-10 shadow-inner">
            
            {/* Range Input Slider yang Halus */}
            <div className="relative flex items-center w-full py-1">
              <input
                type="range"
                min="0"
                max={audioDuration || 100}
                step="0.1"
                value={audioCurrentTime}
                onChange={handleAudioSeek}
                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-400 focus:outline-none transition-all hover:bg-slate-700"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #14b8a6 ${audioDuration ? (audioCurrentTime / audioDuration) * 100 : 0}%, #1e293b ${audioDuration ? (audioCurrentTime / audioDuration) * 100 : 0}%, #1e293b 100%)`
                }}
              />
            </div>

            {/* Penunjuk Menit & Detik Berjalan Real-Time (Kiri: Detik Berjalan, Kanan: Durasi Total) */}
            <div className="flex items-center justify-between text-xs font-mono select-none px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-bold tracking-wider text-xs sm:text-sm">
                  {formatTime(audioCurrentTime)}
                </span>
              </div>

              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                {isAudioLoading ? 'Memuat stream audio...' : isPlayingAudio ? 'Pemutaran Real-time' : 'Geser untuk memilih detik'}
              </span>

              <span className="text-slate-400 font-semibold tracking-wider text-xs sm:text-sm">
                {formatTime(audioDuration)}
              </span>
            </div>

            {/* Tombol Kontrol Audio Interaktif: Seek Back, Play/Pause, Seek Forward, Mute */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 pt-3 mt-1 border-t border-white/5">
              
              {/* Mundur 5 Detik */}
              <button
                type="button"
                onClick={() => handleSeekDelta(-5)}
                className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-emerald-400 hover:bg-white/5 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                title="Mundur 5 detik"
                aria-label="Mundur 5 detik"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[9px] font-mono ml-0.5 font-bold">-5s</span>
              </button>

              {/* Tombol Utama Play / Pause */}
              <button
                type="button"
                onClick={togglePlayAudio}
                className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                aria-label={isPlayingAudio ? 'Jeda Audio' : 'Putar Audio'}
              >
                {isAudioLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                ) : isPlayingAudio ? (
                  <Pause className="w-6 h-6 fill-current text-slate-950" />
                ) : (
                  <Play className="w-6 h-6 fill-current text-slate-950 ml-0.5" />
                )}
              </button>

              {/* Maju 5 Detik */}
              <button
                type="button"
                onClick={() => handleSeekDelta(5)}
                className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-emerald-400 hover:bg-white/5 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                title="Maju 5 detik"
                aria-label="Maju 5 detik"
              >
                <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[9px] font-mono ml-0.5 font-bold">+5s</span>
              </button>

              {/* Tombol Mute / Unmute */}
              <button
                type="button"
                onClick={toggleAudioMute}
                className="p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                title={isAudioMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
                aria-label={isAudioMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
              >
                {isAudioMuted ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                )}
              </button>

            </div>

          </div>

          {/* Tombol Download Sound MP3 Langsung ke Galeri / Penyimpanan HP & Laptop */}
          <button
            onClick={() => downloadToDevice(activeAudio, `tiktok_sound_${Date.now()}.mp3`)}
            disabled={downloading}
            className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50 relative z-10"
          >
            {downloading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Download className="w-4 h-4 text-white" />
            )}
            <span>Download Lagu / Sound MP3 Ini (Kualitas Jernih)</span>
          </button>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ─── D. NAVIGASI AKSI BAWAH ─── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full">
        {onBack && (
          <CosmicBackButton onClick={onBack} label="Kembali ke Beranda" />
        )}

        <button
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Unduh Link Lainnya</span>
        </button>
      </div>

    </div>
  );
}
