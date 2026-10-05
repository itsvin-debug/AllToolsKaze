import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  Upload, 
  Sliders, 
  Download, 
  RotateCcw, 
  Eye, 
  Layers, 
  Sun, 
  Contrast, 
  Droplet, 
  Zap, 
  Maximize2,
  Check
} from 'lucide-react';

export default function PhotoStudioScreen({ onBack }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [fileName, setFileName] = useState('photo.png');
  
  // Parameter Filter FX
  const [blur, setBlur] = useState(0);
  const [sharpen, setSharpen] = useState(30); // Default HD Crisp
  const [brightness, setBrightness] = useState(105);
  const [contrast, setContrast] = useState(115);
  const [saturation, setSaturation] = useState(110);
  const [warmth, setWarmth] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [invert, setInvert] = useState(0);
  const [upscaleFactor, setUpscaleFactor] = useState(1); // 1x, 2x, 4x

  const [isComparing, setIsComparing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);

  // Preset Filters Cepat
  const applyPreset = (name) => {
    switch (name) {
      case 'hd_crisp':
        setSharpen(75);
        setContrast(125);
        setBrightness(105);
        setSaturation(115);
        setBlur(0);
        setGrayscale(0);
        setSepia(0);
        setVignette(15);
        break;
      case 'dreamy_blur':
        setBlur(6);
        setBrightness(110);
        setContrast(95);
        setSaturation(120);
        setSharpen(0);
        setVignette(25);
        break;
      case 'cinematic':
        setContrast(135);
        setSaturation(125);
        setWarmth(15);
        setSharpen(50);
        setVignette(40);
        setBlur(0);
        break;
      case 'monochrome':
        setGrayscale(100);
        setContrast(140);
        setSharpen(60);
        setBrightness(100);
        setVignette(30);
        setBlur(0);
        break;
      case 'vintage':
        setSepia(70);
        setContrast(110);
        setBrightness(95);
        setWarmth(25);
        setVignette(35);
        setBlur(0.5);
        break;
      default: // Reset
        setBlur(0);
        setSharpen(0);
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setWarmth(0);
        setGrayscale(0);
        setSepia(0);
        setVignette(0);
        setInvert(0);
        break;
    }
  };

  // Pilih foto
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        originalImageRef.current = img;
        setImageSrc(img.src);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // Render Canvas Real-Time saat parameter berubah
  useEffect(() => {
    if (!imageSrc || !canvasRef.current || !originalImageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = originalImageRef.current;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    if (isComparing) {
      // Tampilkan foto asli tanpa efek saat tombol Compare ditahan
      ctx.filter = 'none';
      ctx.drawImage(img, 0, 0);
      return;
    }

    // Bangun Filter CSS Canvas
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%) invert(${invert}%) blur(${blur}px)`;
    ctx.filter = filterString;
    ctx.drawImage(img, 0, 0);

    // Terapkan Smart Sharpening (Convolution Kernel) jika sharpen > 0
    if (sharpen > 0) {
      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;
        const factor = (sharpen / 100) * 0.8;

        // Convolution 3x3 Unsharp mask kernel
        // [ 0, -1, 0, -1, 4+c, -1, 0, -1, 0 ]
        const buff = new Uint8ClampedArray(data);
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
              const val = buff[idx + c] * (1 + 4 * factor)
                - buff[((y - 1) * w + x) * 4 + c] * factor
                - buff[((y + 1) * w + x) * 4 + c] * factor
                - buff[(y * w + (x - 1)) * 4 + c] * factor
                - buff[(y * w + (x + 1)) * 4 + c] * factor;
              data[idx + c] = Math.min(255, Math.max(0, val));
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (err) {
        // Skip convolution jika cross-origin
      }
    }

    // Efek Vignette
    if (vignette > 0) {
      const radius = Math.max(canvas.width, canvas.height) * 0.7;
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, radius * 0.4,
        canvas.width / 2, canvas.height / 2, radius
      );
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(0,0,0,${vignette / 100})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Efek Warmth (Suhu Warna)
    if (warmth !== 0) {
      ctx.fillStyle = warmth > 0 ? `rgba(255, 140, 0, ${warmth / 250})` : `rgba(0, 150, 255, ${Math.abs(warmth) / 250})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

  }, [imageSrc, blur, sharpen, brightness, contrast, saturation, warmth, grayscale, sepia, vignette, invert, isComparing]);

  // Ekspor & Download Foto HD
  const handleDownload = () => {
    if (!canvasRef.current) return;

    const sourceCanvas = canvasRef.current;
    let exportCanvas = sourceCanvas;

    // Jika user memilih Super Resolution Upscale (2x atau 4x)
    if (upscaleFactor > 1) {
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = sourceCanvas.width * upscaleFactor;
      scaledCanvas.height = sourceCanvas.height * upscaleFactor;
      const sCtx = scaledCanvas.getContext('2d');
      sCtx.imageSmoothingEnabled = true;
      sCtx.imageSmoothingQuality = 'high';
      sCtx.drawImage(sourceCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
      exportCanvas = scaledCanvas;
    }

    const link = document.createElement('a');
    const safeName = fileName.replace(/\.[^/.]+$/, '');
    link.download = `${safeName}_HD_${upscaleFactor}x.png`;
    link.href = exportCanvas.toDataURL('image/png', 1.0);
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Image Enhancer & FX</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface mb-2">
          Photo Studio HD & Filter FX
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Tingkatkan ketajaman foto jadi HD, atur efek blur, kontras, saturasi, filter warna sinematik, serta upscale resolusi secara real-time.
        </p>
      </div>

      {/* Upload Banner jika belum ada gambar */}
      {!imageSrc ? (
        <div className="w-full max-w-2xl glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center border-2 border-dashed border-outline-variant/40 hover:border-pink-400 transition-all cursor-pointer shadow-xl">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            id="photo-upload-input"
            className="hidden"
          />
          <label htmlFor="photo-upload-input" className="cursor-pointer flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4 shadow-lg">
              <Upload className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">
              Pilih Foto Untuk Diedit & Ditingkatkan ke HD
            </h3>
            <p className="text-xs text-on-surface-variant max-w-md mb-6">
              Mendukung semua format foto (PNG, JPG, WebP, dll) dengan proses rendering instan di perangkatmu.
            </p>
            <span className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-xs shadow-lg shadow-pink-500/20 hover:scale-103 transition-all">
              Pilih Foto Dari Perangkat
            </span>
          </label>
        </div>
      ) : (
        /* Workspace Studio Foto */
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Kolom Kiri: Canvas Viewport & Controls */}
          <div className="lg:col-span-8 flex flex-col items-center gap-4">
            
            <div className="w-full glass-panel rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[380px] sm:min-h-[480px]">
              
              {/* Tombol Compare (Tahan untuk melihat foto asli) */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <button
                  onMouseDown={() => setIsComparing(true)}
                  onMouseUp={() => setIsComparing(false)}
                  onTouchStart={() => setIsComparing(true)}
                  onTouchEnd={() => setIsComparing(false)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-highest/80 border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 backdrop-blur-md shadow-md cursor-pointer select-none"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isComparing ? 'Melihat Asli' : 'Tahan: Lihat Asli'}</span>
                </button>
              </div>

              {/* Status info resolusi */}
              <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg bg-surface-container-highest/80 border border-white/20 text-[11px] font-mono text-cyan-300 backdrop-blur-md">
                {originalImageRef.current?.naturalWidth} × {originalImageRef.current?.naturalHeight} px
              </div>

              {/* Canvas Render Element */}
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[500px] object-contain rounded-xl shadow-2xl transition-all"
              />

            </div>

            {/* Presets Bar */}
            <div className="w-full glass-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-on-surface-variant px-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-pink-400" />
                <span>Preset FX:</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => applyPreset('hd_crisp')}
                  className="px-3 py-1 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold hover:bg-pink-500/30 cursor-pointer"
                >
                  HD Ultra Crisp
                </button>
                <button
                  onClick={() => applyPreset('cinematic')}
                  className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 cursor-pointer"
                >
                  Cinematic Vibe
                </button>
                <button
                  onClick={() => applyPreset('dreamy_blur')}
                  className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-500/30 cursor-pointer"
                >
                  Dreamy Blur
                </button>
                <button
                  onClick={() => applyPreset('monochrome')}
                  className="px-3 py-1 rounded-lg bg-slate-500/20 border border-slate-500/40 text-slate-300 text-xs font-bold hover:bg-slate-500/30 cursor-pointer"
                >
                  Noir Hitam-Putih
                </button>
                <button
                  onClick={() => applyPreset('vintage')}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 cursor-pointer"
                >
                  Vintage Retro
                </button>
                <button
                  onClick={() => applyPreset('reset')}
                  className="px-3 py-1 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Panel Kontrol Slider Efek */}
          <div className="lg:col-span-4 glass-panel rounded-2xl p-6 shadow-xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Sliders className="w-4 h-4 text-pink-400" />
                <span>Pengaturan Efek Visual</span>
              </h3>
              <label htmlFor="change-photo-input" className="text-xs text-pink-400 hover:underline cursor-pointer">
                Ganti Foto
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                id="change-photo-input"
                className="hidden"
              />
            </div>

            {/* 1. Ketajaman HD (Sharpen) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Ketajaman HD (Sharpening)
                </span>
                <span className="font-mono text-on-surface-variant">{sharpen}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sharpen}
                onChange={(e) => setSharpen(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* 2. Efek Blur */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-on-surface flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-blue-400" /> Efek Blur (Latar/Lembut)
                </span>
                <span className="font-mono text-on-surface-variant">{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
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
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Kecerahan (Brightness)
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

            {/* 4. Kontras (Contrast) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-on-surface flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-purple-400" /> Kontras (Contrast)
                </span>
                <span className="font-mono text-on-surface-variant">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            {/* 5. Saturasi Warna */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-on-surface">Saturasi Warna</span>
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

            {/* 6. Vignette (Bayangan Tepi Sinematik) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-on-surface">Vignette Sinematik</span>
                <span className="font-mono text-on-surface-variant">{vignette}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={vignette}
                onChange={(e) => setVignette(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>

            {/* 7. Suhu Warna (Warmth) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-on-surface">Suhu Warna (Cool / Warm)</span>
                <span className="font-mono text-on-surface-variant">{warmth > 0 ? `+${warmth}` : warmth}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={warmth}
                onChange={(e) => setWarmth(Number(e.target.value))}
                className="w-full accent-orange-400 cursor-pointer"
              />
            </div>

            {/* Pilihan Resolusi Ekspor (Upscale Factor) */}
            <div className="pt-3 border-t border-outline-variant/30 space-y-2">
              <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Resolusi Unduh:</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { factor: 1, label: 'Asli HD' },
                  { factor: 2, label: '2x Ultra HD' },
                  { factor: 4, label: '4x Super Res' }
                ].map((item) => (
                  <button
                    key={item.factor}
                    onClick={() => setUpscaleFactor(item.factor)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      upscaleFactor === item.factor
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tombol Download Foto HD */}
            <button
              onClick={handleDownload}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-pink-500/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-5 h-5 text-white animate-bounce" />
                  <span>Foto Berhasil Diunduh!</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download Foto HD ({upscaleFactor}x)</span>
                </>
              )}
            </button>

          </div>

        </div>
      )}

    </main>
  );
}
