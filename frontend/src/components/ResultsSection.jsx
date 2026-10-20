import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import CosmicBackButton from './CosmicBackButton';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Images,
  Play,
  Pause,
  Music2,
  CheckCircle2,
  RefreshCw,
  Clock,
  Volume2,
  VolumeX,
  FileArchive,
  RotateCcw,
  RotateCw,
  Disc3
} from 'lucide-react';

export default function ResultsSection({ result, preferredFormat = '1080p', onReset, onBack }) {
  if (!result || !result.downloadLinks || result.downloadLinks.length === 0) {
    return null;
  }

  const allPhotos = (result.photos && result.photos.length > 0)
    ? result.photos
    : (result.downloadLinks?.filter((l) => l.type === 'image') || []);

  const hasPhotos = allPhotos.length > 0;
  const isSlidePost = result.mediaType === 'slide' || result.isSlide || hasPhotos;

  const regularVideoLinks = !isSlidePost
    ? (result.downloadLinks?.filter((l) => l.type === 'video') || [])
    : [];
  const hasVideo = regularVideoLinks.length > 0;

  const audioLinks = result.downloadLinks?.filter((l) => l.type === 'audio') || [];
  const activeAudio = audioLinks[0] || null;

  const [selectedQualityIndex, setSelectedQualityIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadingAllPhotos, setDownloadingAllPhotos] = useState(false);
  const [downloadAllProgressText, setDownloadAllProgressText] = useState('');
  const [detectedDuration, setDetectedDuration] = useState('');

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [currentAudioSrcIndex, setCurrentAudioSrcIndex] = useState(0);

  const [touchStartX, setTouchStartX] = useState(null);

  const audioRef = useRef(null);
  const videoRef = useRef(null);

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

  const downloadToDevice = async (mediaItem, customFilename = null, triggerCelebration = true) => {
    setDownloading(true);
    if (triggerCelebration) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
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
      const response = await fetch(proxyUrl, { method: 'GET' });
      if (!response.ok) throw new Error('Proxy unduh gagal');

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.download = filename;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(mediaItem.url, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAllPhotosZip = async () => {
    if (!allPhotos || allPhotos.length === 0) return;
    setDownloadingAllPhotos(true);
    setDownloadAllProgressText('Menyiapkan ZIP...');

    const zip = new JSZip();
    const folder = zip.folder('kaze_slides');

    try {
      for (let i = 0; i < allPhotos.length; i++) {
        setDownloadAllProgressText(`Mengunduh foto ${i + 1} dari ${allPhotos.length}...`);
        const photo = allPhotos[i];
        const proxyUrl = photo.proxyUrl || `/api/proxy-download?url=${encodeURIComponent(photo.url)}`;

        try {
          const res = await fetch(proxyUrl);
          const blob = await res.blob();
          folder.file(`slide_${i + 1}.jpg`, blob);
        } catch {
          // ignore individual failure
        }
      }

      setDownloadAllProgressText('Mengompres arsip ZIP...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `kaze_slides_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(zipUrl);
      confetti({ particleCount: 50, spread: 60 });
    } catch {
      // ignore
    } finally {
      setDownloadingAllPhotos(false);
      setDownloadAllProgressText('');
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleAudioSeek = (e) => {
    const time = parseFloat(e.target.value);
    setAudioCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSeekDelta = (delta) => {
    if (audioRef.current) {
      const nextTime = Math.max(0, Math.min(audioDuration, audioRef.current.currentTime + delta));
      audioRef.current.currentTime = nextTime;
      setAudioCurrentTime(nextTime);
    }
  };

  const toggleAudioMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isAudioMuted;
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const handleAudioError = () => {
    if (currentAudioSrcIndex < audioSources.length - 1) {
      setCurrentAudioSrcIndex(prev => prev + 1);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNextPhoto = () => {
    if (allPhotos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const handlePrevPhoto = () => {
    if (allPhotos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (diffX > 45) {
      handleNextPhoto();
    } else if (diffX < -45) {
      handlePrevPhoto();
    }
    setTouchStartX(null);
  };

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
    <div className="w-full flex flex-col gap-5 mt-2">

      {/* ─── 1. FOTO SLIDE CAROUSEL ─── */}
      {isSlidePost && hasPhotos && (
        <div className="w-full bg-white border-2 border-black rounded-xl p-5 sm:p-6 shadow-[4px_4px_0px_#000000] flex flex-col gap-4 text-black">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-md border-2 border-black bg-black text-white flex items-center justify-center">
                <Images className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-black flex items-center gap-2">
                  <span>Album Slide ({allPhotos.length} Foto HD)</span>
                </h3>
                <p className="text-xs text-neutral-600">
                  Gunakan tombol panah atau geser layar untuk melihat seluruh foto
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded border-2 border-black text-xs font-mono font-bold bg-neutral-100 text-black">
              Foto {currentPhotoIndex + 1} dari {allPhotos.length}
            </span>
          </div>

          <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full max-w-xl mx-auto min-h-[360px] sm:min-h-[460px] max-h-[500px] rounded-lg overflow-hidden bg-neutral-100 border-2 border-black flex items-center justify-center select-none"
          >
            {activePhoto ? (
              <img
                key={activePhoto.url}
                src={activePhoto.url}
                alt={activePhoto.label || `Foto Slide ${currentPhotoIndex + 1}`}
                className="w-full h-full object-contain pointer-events-none"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-xs font-bold text-neutral-500">Foto Siap Diunduh</div>
            )}

            {allPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-white text-black border-2 border-black flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  aria-label="Slide Sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-white text-black border-2 border-black flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  aria-label="Slide Selanjutnya"
                >
                  <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                </button>
              </>
            )}

            <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded border border-black bg-black text-white text-[10px] font-mono font-bold">
              {currentPhotoIndex + 1} / {allPhotos.length}
            </div>

            <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded border border-black bg-white text-black text-[10px] font-mono font-bold">
              HD Image
            </div>
          </div>

          {allPhotos.length > 1 && (
            <div className="w-full flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-1 px-0.5 custom-scrollbar">
              {allPhotos.map((photo, idx) => {
                const isCurrent = idx === currentPhotoIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`relative w-12 h-12 rounded-md overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      isCurrent 
                        ? 'border-black shadow-[2px_2px_0px_#000000] -translate-y-0.5' 
                        : 'border-neutral-300 opacity-60 hover:opacity-100 hover:border-black'
                    }`}
                  >
                    <img 
                      src={photo.url} 
                      alt={`Thumb ${idx + 1}`} 
                      className="w-full h-full object-cover pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 w-full">
            {activePhoto && (
              <button
                onClick={() => downloadToDevice(activePhoto, `slide_${currentPhotoIndex + 1}_hd.jpg`)}
                disabled={downloading}
                className="w-full sm:flex-1 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm rounded-lg py-3 flex items-center justify-center gap-2 border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer disabled:opacity-50"
              >
                {downloading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Download className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>Unduh Slide Ini (Foto #{currentPhotoIndex + 1})</span>
              </button>
            )}

            {allPhotos.length > 1 && (
              <button
                onClick={handleDownloadAllPhotosZip}
                disabled={downloadingAllPhotos}
                className="w-full sm:flex-1 bg-white hover:bg-neutral-100 text-black font-extrabold text-xs sm:text-sm rounded-lg py-3 flex items-center justify-center gap-2 border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer disabled:opacity-50"
              >
                {downloadingAllPhotos ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{downloadAllProgressText || 'Menyiapkan ZIP...'}</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-4 h-4 stroke-[2.5]" />
                    <span>Unduh Semua Slide ({allPhotos.length} Foto ZIP)</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      )}

      {/* ─── 2. VIDEO REGULER ─── */}
      {!isSlidePost && hasVideo && (
        <div className="w-full bg-white border-2 border-black rounded-xl p-5 sm:p-6 shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row gap-5 items-start text-black">
          
          <div className="w-full md:w-72 aspect-[9/16] sm:aspect-[3/4] max-h-[380px] rounded-lg bg-black border-2 border-black overflow-hidden relative shrink-0 flex items-center justify-center mx-auto md:mx-0 shadow-[2px_2px_0px_#000000]">
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
              <div className="flex flex-col items-center justify-center text-neutral-400 p-4 text-center">
                <Play className="w-10 h-10 text-white" />
                <span className="text-xs mt-2 text-white">Video Siap Diputar</span>
              </div>
            )}

            <div className="absolute top-2.5 left-2.5 bg-white text-black font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-black shadow-xs">
              Tanpa Watermark
            </div>

            {displayDuration && (
              <div className="absolute bottom-2.5 right-2.5 bg-black text-white font-mono text-[10px] px-2 py-0.5 rounded border border-white/20 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{displayDuration}</span>
              </div>
            )}
          </div>

          <div className="flex-grow flex flex-col justify-between gap-4 w-full">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold border border-black bg-neutral-100 text-black">
                  {result.platform || 'Video HD'}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold border border-black bg-black text-white">
                  Bebas Watermark
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-black line-clamp-2 leading-snug font-sans">
                {result.title || 'Video Siap Diunduh'}
              </h3>

              {result.author && (
                <p className="text-xs text-neutral-600 font-bold font-mono">
                  Kreator: @{result.author}
                </p>
              )}

              <p className="text-neutral-600 text-xs mt-1">
                Pilih opsi resolusi video untuk disimpan ke perangkat:
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap w-full">
                {regularVideoLinks.map((link, idx) => {
                  const isSelected = selectedQualityIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedQualityIndex(idx)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold font-mono transition-all duration-150 cursor-pointer border-2 border-black flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                          : 'bg-white text-black hover:bg-neutral-100'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                      <span>{link.label || link.quality}</span>
                    </button>
                  );
                })}
              </div>

              {activeRegularVideo && (
                <button
                  onClick={() => downloadToDevice(activeRegularVideo)}
                  disabled={downloading}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm rounded-lg py-3 flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Download className="w-4 h-4 stroke-[2.5]" />
                  )}
                  <span>
                    {downloading ? 'Menyimpan...' : `Download Video MP4 (${activeRegularVideo.label || activeRegularVideo.quality})`}
                  </span>
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ─── 3. AUDIO PLAYER & DOWNLOAD ─── */}
      {activeAudio && (
        <div className="w-full bg-white border-2 border-black rounded-xl p-5 sm:p-6 shadow-[4px_4px_0px_#000000] flex flex-col gap-4 text-black">
          
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-11 h-11 rounded-lg border-2 border-black bg-neutral-100 flex items-center justify-center shrink-0">
                <Disc3 className={`w-6 h-6 stroke-[2] ${isPlayingAudio ? 'animate-spin' : ''}`} />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                  Audio Resmi
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-black truncate">
                  {result.musicInfo?.title || result.title || 'Trek Audio'}
                </h4>
                <p className="text-xs text-neutral-600 truncate font-mono">
                  {result.musicInfo?.author || result.author || 'Audio Creator'}
                </p>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded border border-black bg-neutral-100 font-mono text-xs font-bold self-start sm:self-auto">
              MP3 Audio HD
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 sm:p-4 rounded-lg bg-neutral-50 border-2 border-black">
            <input
              type="range"
              min="0"
              max={audioDuration || 100}
              step="0.1"
              value={audioCurrentTime}
              onChange={handleAudioSeek}
              className="w-full h-2 bg-neutral-300 rounded-none appearance-none cursor-pointer accent-black focus:outline-none"
            />

            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span>{formatTime(audioCurrentTime)}</span>
              <span className="text-neutral-500 font-normal">
                {isAudioLoading ? 'Memuat audio...' : isPlayingAudio ? 'Sedang Diputar' : 'Pratinjau Suara'}
              </span>
              <span>{formatTime(audioDuration)}</span>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2 border-t border-black/15">
              <button
                type="button"
                onClick={() => handleSeekDelta(-5)}
                className="p-2 rounded border border-black hover:bg-neutral-200 cursor-pointer text-xs font-bold font-mono"
                title="Mundur 5s"
              >
                <RotateCcw className="w-4 h-4 inline stroke-[2.5]" /> -5s
              </button>

              <button
                type="button"
                onClick={togglePlayAudio}
                className="w-11 h-11 rounded-lg border-2 border-black bg-black text-white flex items-center justify-center shadow-[2px_2px_0px_#000000] hover:bg-neutral-800 cursor-pointer"
                aria-label={isPlayingAudio ? 'Jeda Audio' : 'Putar Audio'}
              >
                {isAudioLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : isPlayingAudio ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSeekDelta(5)}
                className="p-2 rounded border border-black hover:bg-neutral-200 cursor-pointer text-xs font-bold font-mono"
                title="Maju 5s"
              >
                +5s <RotateCw className="w-4 h-4 inline stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={toggleAudioMute}
                className="p-2 rounded border border-black hover:bg-neutral-200 cursor-pointer"
                title={isAudioMuted ? 'Nyalakan' : 'Bisukan'}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => downloadToDevice(activeAudio, `audio_${Date.now()}.mp3`)}
            disabled={downloading}
            className="w-full py-3 rounded-lg border-2 border-black bg-black text-white font-extrabold text-xs sm:text-sm hover:bg-neutral-800 shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Download className="w-4 h-4 stroke-[2.5]" />
            )}
            <span>Download File Audio MP3</span>
          </button>

        </div>
      )}

      {/* ─── RESET & NAVIGASI KEMBALI ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full">
        {onBack && (
          <CosmicBackButton onClick={onBack} label="Kembali ke Beranda" />
        )}

        <button
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 border-black bg-white hover:bg-neutral-100 text-black text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        >
          <RefreshCw className="w-4 h-4 stroke-[2.5]" />
          <span>Unduh Tautan Lainnya</span>
        </button>
      </div>

    </div>
  );
}
