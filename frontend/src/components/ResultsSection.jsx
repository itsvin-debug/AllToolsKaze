import React, { useState, useEffect, useRef } from 'react';
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
  Film
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
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Swipe Touch State untuk HP
  const [touchStartX, setTouchStartX] = useState(null);

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    setCurrentPhotoIndex(0);
    setIsPlayingAudio(false);
    setAudioCurrentTime(0);
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
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true);
      }).catch((e) => {
        console.warn('Audio play failed:', e);
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
    }
  };

  const handleAudioSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setAudioCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
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
            className="relative w-full max-w-xl mx-auto aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center shadow-2xl border border-white/5 select-none"
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-xl border border-white/10 active:scale-90"
                  aria-label="Slide Sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-xl border border-white/10 active:scale-90"
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
            <div className="w-full flex items-center justify-center gap-2 overflow-x-auto py-1 px-2 no-scrollbar">
              {allPhotos.map((photo, idx) => {
                const isCurrent = idx === currentPhotoIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      isCurrent 
                        ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/20' 
                        : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <img 
                      src={photo.url} 
                      alt={`Thumb ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 px-1 text-[8px] font-mono bg-black/80 text-white rounded-tl">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── 2 JENIS TOMBOL DOWNLOAD FOTO SLIDE (SESUAI PERMINTAAN) ─── */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            
            {/* 1. DOWNLOAD THIS SLIDE */}
            {activePhoto && (
              <button
                onClick={() => downloadToDevice(activePhoto, `tiktok_slide_${currentPhotoIndex + 1}_1080p.jpg`)}
                disabled={downloading}
                className="w-full sm:flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
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
      {/* ─── C. CUSTOM AUDIO PLAYER DENGAN MENIT & DETIK BERJALAN REAL-TIME ─── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {activeAudio && (
        <div className="w-full bg-[#12151f] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 animate-fadeIn">
          
          {/* Tag Audio Tersembunyi untuk Kontrol Penuh */}
          <audio
            ref={audioRef}
            src={activeAudio.url}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoadedMetadata}
            onEnded={() => {
              setIsPlayingAudio(false);
              setAudioCurrentTime(0);
            }}
            preload="metadata"
            className="hidden"
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Music2 className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <h3 className="text-sm font-bold text-white truncate">
                  {result.musicInfo?.title || 'Sound Musik / Audio Asli'}
                </h3>
                <p className="text-slate-400 text-xs truncate font-mono">
                  {result.musicInfo?.author || result.author || 'Audio MP3'}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
              MP3 HD 128kbps
            </span>
          </div>

          {/* Bar Kontrol Audio Interaktif */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-3">
              
              {/* Tombol Play / Pause */}
              <button
                type="button"
                onClick={togglePlayAudio}
                className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                aria-label={isPlayingAudio ? 'Jeda Audio' : 'Putar Audio'}
              >
                {isPlayingAudio ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Progress Slider & Waktu Detik Berjalan */}
              <div className="flex-grow flex flex-col gap-1.5 min-w-0">
                <input
                  type="range"
                  min="0"
                  max={audioDuration || 100}
                  step="0.1"
                  value={audioCurrentTime}
                  onChange={handleAudioSeek}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
                />

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">
                    {formatTime(audioCurrentTime)}
                  </span>
                  <span>
                    {formatTime(audioDuration)}
                  </span>
                </div>
              </div>

              {/* Tombol Mute / Unmute */}
              <button
                type="button"
                onClick={toggleAudioMute}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title={isAudioMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
              >
                {isAudioMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-slate-300" />
                )}
              </button>

            </div>
          </div>

          {/* Tombol Download Sound MP3 Langsung ke Perangkat */}
          <button
            onClick={() => downloadToDevice(activeAudio, `tiktok_sound_${Date.now()}.mp3`)}
            disabled={downloading}
            className="w-full py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Lagu / Sound MP3 Ini</span>
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
