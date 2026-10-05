import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
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
  Volume2
} from 'lucide-react';

export default function ResultsSection({ result, preferredFormat = '1080p', onReset, onBack }) {
  const [selectedQualityIndex, setSelectedQualityIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [downloadingAllPhotos, setDownloadingAllPhotos] = useState(false);
  const [downloadAllProgress, setDownloadAllProgress] = useState(0);
  const [detectedDuration, setDetectedDuration] = useState('');
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  if (!result || !result.downloadLinks || result.downloadLinks.length === 0) {
    return null;
  }

  // pisahkan file video, audio, dan gambar
  const videoLinks = result.downloadLinks.filter((l) => l.type === 'video');
  const audioLinks = result.downloadLinks.filter((l) => l.type === 'audio');
  const imageLinks = result.downloadLinks.filter((l) => l.type === 'image');

  const allPhotos = (result.photos && result.photos.length > 0)
    ? result.photos
    : imageLinks;

  useEffect(() => {
    if (preferredFormat === '720p' && videoLinks.length > 1) {
      setSelectedQualityIndex(1);
    } else {
      setSelectedQualityIndex(0);
    }
  }, [preferredFormat, result]);

  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [result]);

  const activeVideo = videoLinks[selectedQualityIndex] || videoLinks[0];
  const activePhoto = allPhotos[currentPhotoIndex] || allPhotos[0];

  // Ekstrak durasi menit & detik dari tag video asli
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
    setDownloadAllProgress(1);

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    for (let i = 0; i < allPhotos.length; i++) {
      setDownloadAllProgress(i + 1);
      const photo = allPhotos[i];
      try {
        await handleDownload(photo, false);
      } catch (err) {
        console.warn(`Gagal mengunduh foto #${i + 1}:`, err);
      }
      if (i < allPhotos.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }

    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => {
      setDownloadingAllPhotos(false);
      setDownloadAllProgress(0);
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

  // Durasi final: prioritas metadata video, fallback result.duration
  const displayDuration = detectedDuration 
    ? `${detectedDuration} Menit` 
    : result.duration 
    ? `${result.duration}` 
    : null;

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn mt-2">
      
      {/* 1. Kartu Hasil Video */}
      {videoLinks.length > 0 && (
        <div className="w-full bg-white dark:bg-[#12151f] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col md:flex-row gap-6 items-start relative overflow-hidden">
          
          {/* Pratinjau Video & Player dengan Suara Aktif */}
          <div className="w-full md:w-72 aspect-[9/16] sm:aspect-[3/4] max-h-[380px] rounded-2xl bg-black/80 border border-black/10 dark:border-white/10 overflow-hidden relative group shrink-0 flex items-center justify-center mx-auto md:mx-0 shadow-lg">
            
            {activeVideo?.url ? (
              <video
                ref={videoRef}
                key={activeVideo.url}
                src={activeVideo.url}
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
                  {activeVideo.quality || 'HD'}
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
                {videoLinks.map((link, idx) => {
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
              {activeVideo && (
                <button
                  onClick={() => handleDownload(activeVideo)}
                  disabled={downloading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base rounded-xl py-3.5 flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>
                    {downloading ? 'Memulai Unduhan...' : `Download Video MP4 (${activeVideo.label || activeVideo.quality})`}
                  </span>
                </button>
              )}

              {/* Tombol Download Audio / Sound Video MP3 */}
              <button
                onClick={() => {
                  const audioItem = audioLinks[0] || {
                    url: activeVideo.url,
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

      {/* 2. Kartu Hasil Foto / Carousel Slideshow */}
      {allPhotos.length > 0 && (
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
                    <span>Mengunduh Foto {downloadAllProgress}/{allPhotos.length}...</span>
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

      {/* 3. Audio Player Mandiri */}
      {audioLinks.length > 0 && (
        <div className="w-full bg-white dark:bg-[#12151f] border border-black/10 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Music2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {result.musicInfo?.title || 'Sound Musik / Lagu Asli'}
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

      {/* Navigasi Aksi Bawah */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 w-full">
        {onBack && (
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
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
