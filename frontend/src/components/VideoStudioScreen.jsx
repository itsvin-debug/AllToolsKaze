import React, { useState, useRef, useEffect } from 'react';
import { 
  Film, 
  ArrowLeft, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Volume2, 
  VolumeX, 
  Zap, 
  Droplet, 
  Sun, 
  Contrast, 
  Sliders, 
  Clock, 
  Sparkles, 
  Check, 
  Loader2,
  Gauge
} from 'lucide-react';

export default function VideoStudioScreen({ onBack }) {
  const [videoSrc, setVideoSrc] = useState(null);
  const [fileName, setFileName] = useState('video.mp4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Parameter Filter Video
  const [blur, setBlur] = useState(0);
  const [contrast, setContrast] = useState(115); // HD Boost
  const [brightness, setBrightness] = useState(105);
  const [saturation, setSaturation] = useState(120);
  const [sepia, setSepia] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Status Ekspor Video
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedUrl, setExportedUrl] = useState(null);

  const videoRef = useRef(null);
  const exportCanvasRef = useRef(null);

  // Upload video
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setIsPlaying(false);
    setExportedUrl(null);
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Update speed
  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle seek
  const handleSeek = (e) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Reset filter
  const resetFilters = () => {
    setBlur(0);
    setContrast(100);
    setBrightness(100);
    setSaturation(100);
    setSepia(0);
    changeSpeed(1.0);
  };

  // Format detik ke MM:SS
  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Ekspor & Render Video dengan Efek menggunakan Canvas & MediaRecorder
  const handleExportVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportedUrl(null);

    // Siapkan canvas render
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(30); // 30 FPS HD

    // Tangkap audio jika video memiliki audio track
    let combinedStream = stream;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(video);
      const destination = audioCtx.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioCtx.destination);
      destination.stream.getAudioTracks().forEach(track => stream.addTrack(track));
      combinedStream = stream;
    } catch {
      // Audio capture fallback
    }

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    const recorder = new MediaRecorder(combinedStream, { mimeType });
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const downloadUrl = URL.createObjectURL(blob);
      setExportedUrl(downloadUrl);
      setIsExporting(false);
      setExportProgress(100);
    };

    // Mulai render dari awal video
    video.currentTime = 0;
    video.playbackRate = playbackSpeed;
    video.muted = isMuted;

    recorder.start();
    await video.play();
    setIsPlaying(true);

    const filterString = `blur(${blur}px) contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%) sepia(${sepia}%)`;

    const drawFrame = () => {
      if (video.paused || video.ended) {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
        return;
      }

      ctx.filter = filterString;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (video.duration) {
        setExportProgress(Math.min(99, Math.round((video.currentTime / video.duration) * 100)));
      }

      requestAnimationFrame(drawFrame);
    };

    requestAnimationFrame(drawFrame);
  };

  const cssFilter = `blur(${blur}px) contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%) sepia(${sepia}%)`;

  return (
    <main className="flex-grow relative z-10 flex flex-col items-center justify-start px-4 sm:px-6 md:px-margin-desktop py-6 sm:py-10 w-full max-w-6xl mx-auto">
      
      {/* Tombol Navigasi Kembali */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-surface-container"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Tools</span>
        </button>
      </div>

      {/* Header Judul Fitur */}
      <div className="text-center mb-8 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Film className="w-3.5 h-3.5" />
          <span>Standalone Real-Time Video Studio</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface mb-2">
          Video Studio HD & Filter FX
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Tingkatkan ketajaman HD video, efek blur dinamis, filter warna sinematik, dan kecepatan putar slow-mo/fast-motion dengan render instan di browser.
        </p>
      </div>

      {/* Upload Banner jika belum ada video */}
      {!videoSrc ? (
        <div className="w-full max-w-2xl glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center border-2 border-dashed border-outline-variant/40 hover:border-violet-400 transition-all cursor-pointer shadow-xl">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            id="video-upload-input"
            className="hidden"
          />
          <label htmlFor="video-upload-input" className="cursor-pointer flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4 shadow-lg">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">
              Pilih Video Untuk Diedit & Ditingkatkan ke HD
            </h3>
            <p className="text-xs text-on-surface-variant max-w-md mb-6">
              Mendukung semua format video (MP4, WebM, MOV, dll). Diproses langsung secara privat di perangkatmu.
            </p>
            <span className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-xs shadow-lg shadow-violet-500/20 hover:scale-103 transition-all">
              Pilih File Video Dari Perangkat
            </span>
          </label>
        </div>
      ) : (
        /* Workspace Studio Video */
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Kolom Kiri: Pemutar Video & Timeline Controls */}
          <div className="lg:col-span-8 flex flex-col items-center gap-4">
            
            <div className="w-full glass-panel rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden bg-black/40 min-h-[380px] sm:min-h-[480px]">
              
              {/* Video Element dengan CSS Filter GPU Acceleration */}
              <video
                ref={videoRef}
                src={videoSrc}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onEnded={() => setIsPlaying(false)}
                muted={isMuted}
                playsInline
                style={{ filter: cssFilter }}
                className="max-w-full max-h-[460px] rounded-xl shadow-2xl transition-all"
              />

              {/* Overlay Play Icon saat pause */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute w-16 h-16 rounded-full bg-violet-600/80 hover:bg-violet-600 text-white flex items-center justify-center shadow-2xl backdrop-blur-md cursor-pointer transition-all hover:scale-110"
                >
                  <Play className="w-8 h-8 fill-white ml-1" />
                </button>
              )}

            </div>

            {/* Video Controls Bar */}
            <div className="w-full glass-panel rounded-xl p-4 flex flex-col gap-3">
              
              {/* Timeline Seek Bar */}
              <div className="flex items-center gap-3 w-full">
                <span className="text-[11px] font-mono text-on-surface-variant w-12 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-grow accent-violet-500 cursor-pointer h-1.5 rounded-lg bg-surface-container"
                />
                <span className="text-[11px] font-mono text-on-surface-variant w-12">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Buttons Row */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="text-xs text-on-surface-variant ml-2 truncate max-w-[160px]">
                    {fileName}
                  </span>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1 mr-1">
                    <Gauge className="w-3.5 h-3.5 text-violet-400" /> Speed:
                  </span>
                  {[0.5, 1.0, 1.5, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        playbackSpeed === s
                          ? 'bg-violet-600 text-white'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Kolom Kanan: Pengaturan Filter & Ekspor */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-6 shadow-xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                <span>Efek & Filter Video HD</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* 1. HD Contrast & Definition */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Ketajaman & Kontras HD
                </span>
                <span className="font-mono text-on-surface-variant">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* 2. Efek Blur Video */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-on-surface flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-blue-400" /> Efek Blur (Latar)
                </span>
                <span className="font-mono text-on-surface-variant">{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                className="w-full accent-blue-400 cursor-pointer"
              />
            </div>

            {/* 3. Kecerahan (Brightness) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-on-surface flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Kecerahan Video
                </span>
                <span className="font-mono text-on-surface-variant">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* 4. Saturasi Warna */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-on-surface">Saturasi Warna (Vibrance)</span>
                <span className="font-mono text-on-surface-variant">{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full accent-pink-400 cursor-pointer"
              />
            </div>

            {/* 5. Sepia / Film Klasik */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-on-surface">Efek Film Klasik (Sepia)</span>
                <span className="font-mono text-on-surface-variant">{sepia}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sepia}
                onChange={(e) => setSepia(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Ekspor & Render Video Button */}
            <div className="pt-4 border-t border-outline-variant/30 space-y-3">
              <button
                onClick={handleExportVideo}
                disabled={isExporting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-extrabold text-sm shadow-xl shadow-violet-600/25 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Merender Video ({exportProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Render & Download Video HD</span>
                  </>
                )}
              </button>

              {/* Progress bar render */}
              {isExporting && (
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-violet-500 to-pink-500 h-full transition-all duration-200"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              )}

              {/* Tombol Unduh Hasil Render */}
              {exportedUrl && (
                <a
                  href={exportedUrl}
                  download={`kaze_enhanced_${fileName.replace(/\.[^/.]+$/, '')}.mp4`}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all animate-fadeIn"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Video Hasil Render</span>
                </a>
              )}
            </div>

          </div>

        </div>
      )}

    </main>
  );
}
