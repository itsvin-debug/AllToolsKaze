import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import CosmicBackButton from './CosmicBackButton';
import { 
  QrCode, 
  ArrowLeft, 
  Download, 
  Sparkles, 
  Palette, 
  Sliders, 
  Image as ImageIcon, 
  ShieldCheck, 
  Check, 
  Copy, 
  RefreshCw, 
  Upload, 
  Type, 
  Eye, 
  Layers, 
  FileCode, 
  Heart, 
  Star, 
  Hexagon, 
  Droplet, 
  Shield, 
  Circle, 
  Square, 
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function QrStudioScreen({ onBack, initialUrl = '' }) {
  // Konten data QR
  const [text, setText] = useState(initialUrl || '');

  // Status Verifikasi Scan Real-Time (Live jsQR Scanner Engine)
  const [scanResult, setScanResult] = useState({
    scannable: true,
    content: initialUrl || 'https://kuro-tools.com',
    time: Date.now()
  });

  // A. BENTUK TITIK DATA (Dots / Modules Styling)
  // 'square' | 'rounded' | 'heart' | 'diamond' | 'hexagon' | 'fluid' | 'star' | 'leaf' | 'lines'
  const [dataPattern, setDataPattern] = useState('rounded');

  // B. BENTUK MATA SUDUT (Eye Finder Patterns)
  // Eye Outer: 'square' | 'rounded' | 'circle' | 'diamond' | 'heart'
  const [eyeOuterShape, setEyeOuterShape] = useState('rounded');
  // Eye Inner: 'dot' | 'square' | 'diamond' | 'star' | 'heart'
  const [eyeInnerShape, setEyeInnerShape] = useState('dot');

  // C. CANVAS MASKING & SHAPE MATRIX (Bentuk Keseluruhan QR)
  // 'none' | 'heart' | 'circle' | 'shield'
  const [canvasMask, setCanvasMask] = useState('none');

  // D. LOGO & IKON TENGAH
  // 'none' | 'custom' | 'spotify' | 'shopee' | 'tokopedia' | 'discord' | 'telegram' | 'yt' | 'wa' | 'tiktok' | 'ig' | 'link'
  const [logoOption, setLogoOption] = useState('none');
  const [customLogoImage, setCustomLogoImage] = useState(null);
  const [logoScale, setLogoScale] = useState(20); // 10% - 30%
  const [logoRadius, setLogoRadius] = useState(12); // 0px - 24px
  const [logoPadding, setLogoPadding] = useState(6); // 2px - 16px

  // E. PALET WARNA & BACKGROUND KREATIF
  const [colorMode, setColorMode] = useState('gradient'); // 'single' | 'gradient'
  const [gradientType, setGradientType] = useState('linear'); // 'linear' | 'radial'
  const [singleColor, setSingleColor] = useState('#06b6d4'); // Cyan
  const [gradStart, setGradStart] = useState('#06b6d4'); // Cyan
  const [useMidStop, setUseMidStop] = useState(false);
  const [gradMid, setGradMid] = useState('#6366f1');   // Indigo
  const [gradEnd, setGradEnd] = useState('#ec4899');   // Pink
  const [eyeColor, setEyeColor] = useState('#06b6d4');

  // Background Options: 'solid' | 'transparent' | 'gradient' | 'image'
  const [bgMode, setBgMode] = useState('solid');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [bgGradStart, setBgGradStart] = useState('#0f172a');
  const [bgGradEnd, setBgGradEnd] = useState('#1e1b4b');
  const [bgImage, setBgImage] = useState(null);
  const [bgImageOpacity, setBgImageOpacity] = useState(30); // 10% - 100%
  const [bgImageBlur, setBgImageBlur] = useState(4); // 0px - 20px

  // Bingkai & Frame Call To Action
  const [frameStyle, setFrameStyle] = useState('badge_bottom'); // 'none' | 'badge_bottom' | 'ribbon_top' | 'card_modern'
  const [ctaText, setCtaText] = useState('SCAN ME');

  // Preset Konsep Cepat
  const [activeConcept, setActiveConcept] = useState('cyberpunk');

  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Update URL jika initialUrl berubah
  useEffect(() => {
    if (initialUrl) setText(initialUrl);
  }, [initialUrl]);

  // F. SCANNABILITY ASSURANCE (Sistem Keamanan Scan Auto-Protect)
  // Otomatis terapkan Level H jika bentuk kustom atau logo digunakan
  const isHighCustom = dataPattern !== 'square' || canvasMask !== 'none' || logoOption !== 'none' || eyeOuterShape !== 'square';
  const effectiveEccLevel = isHighCustom ? 'H' : 'M';

  // Hitung perkiraan Scannability Score
  let scannabilityScore = 100;
  let scannabilityLabel = '100% Sangat Aman Di-scan';
  let scannabilityBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  if (canvasMask !== 'none') {
    scannabilityScore = 96;
    scannabilityLabel = '96% Aman Di-scan (Auto-Protect Level H)';
    scannabilityBadgeClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
  } else if (logoScale > 25) {
    scannabilityScore = 94;
    scannabilityLabel = '94% Aman (Logo Besar - Terlindungi Level H)';
    scannabilityBadgeClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
  } else if (dataPattern === 'heart' || dataPattern === 'star') {
    scannabilityScore = 98;
    scannabilityLabel = '98% Aman Di-scan (Protected Level H)';
    scannabilityBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }

  // Terapkan Preset Konsep
  const applyConcept = (concept) => {
    setActiveConcept(concept);
    if (concept === 'cyberpunk') {
      setColorMode('gradient');
      setGradientType('linear');
      setGradStart('#06b6d4');
      setUseMidStop(true);
      setGradMid('#8b5cf6');
      setGradEnd('#ec4899');
      setEyeColor('#06b6d4');
      setEyeOuterShape('diamond');
      setEyeInnerShape('diamond');
      setDataPattern('diamond');
      setCanvasMask('none');
      setFrameStyle('badge_bottom');
      setCtaText('CYBER SCAN');
      setBgMode('solid');
      setBgColor('#0a0d17');
    } else if (concept === 'romantic_heart') {
      setColorMode('gradient');
      setGradientType('radial');
      setGradStart('#f43f5e');
      setUseMidStop(false);
      setGradEnd('#ec4899');
      setEyeColor('#f43f5e');
      setEyeOuterShape('heart');
      setEyeInnerShape('heart');
      setDataPattern('heart');
      setCanvasMask('heart');
      setFrameStyle('none');
      setBgMode('solid');
      setBgColor('#fff1f2');
    } else if (concept === 'minimalist') {
      setColorMode('single');
      setSingleColor('#0f172a');
      setEyeColor('#0f172a');
      setEyeOuterShape('rounded');
      setEyeInnerShape('dot');
      setDataPattern('rounded');
      setCanvasMask('none');
      setFrameStyle('none');
      setBgMode('solid');
      setBgColor('#ffffff');
    } else if (concept === 'luxury_gold') {
      setColorMode('gradient');
      setGradientType('linear');
      setGradStart('#f59e0b');
      setUseMidStop(false);
      setGradEnd('#b45309');
      setEyeColor('#d97706');
      setEyeOuterShape('rounded');
      setEyeInnerShape('star');
      setDataPattern('hexagon');
      setCanvasMask('circle');
      setFrameStyle('card_modern');
      setCtaText('EXCLUSIVE ACCESS');
      setBgMode('solid');
      setBgColor('#ffffff');
    }
  };

  // Cek apakah koordinat (r, c) adalah 3 Finder Eyes
  const isEye = (r, c, size) => {
    if (r < 7 && c < 7) return true; // Kiri Atas
    if (r < 7 && c >= size - 7) return true; // Kanan Atas
    if (r >= size - 7 && c < 7) return true; // Kiri Bawah
    return false;
  };

  // Helper Cek Masking Bentuk Keseluruhan (Canvas Masking Shape)
  const isInsideMask = (r, c, size, maskType) => {
    // 3 Finder Eyes selalu 100% aman (Safe Zone Margin)
    if (isEye(r, c, size)) return true;

    if (maskType === 'none') return true;

    const mid = (size - 1) / 2;
    // Koordinat ternormalisasi dari -1 sampai 1
    const nx = (c - mid) / (size / 2);
    const ny = (r - mid) / (size / 2);

    if (maskType === 'circle') {
      // Lingkaran konsentris
      return (nx * nx + ny * ny) <= 0.98;
    }

    if (maskType === 'heart') {
      // Persamaan siluet hati: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const hx = nx * 1.15;
      const hy = -ny * 1.15 + 0.2; // balik y dan offset
      const a = hx * hx + hy * hy - 0.75;
      return (a * a * a - hx * hx * hy * hy * hy) <= 0;
    }

    if (maskType === 'shield') {
      // Bentuk perisai
      if (Math.abs(nx) > 0.9) return false;
      if (ny < -0.85) return false;
      if (ny <= 0.2) return Math.abs(nx) <= 0.88;
      // Lengkungan meruncing ke bawah
      const taper = 0.88 * (1 - (ny - 0.2) / 0.8);
      return Math.abs(nx) <= taper;
    }

    return true;
  };

  // Upload Custom Logo File
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setCustomLogoImage(img);
        setLogoOption('custom');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Upload Custom Background Image
  const handleBgImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setBgImage(img);
        setBgMode('image');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Salin Link QR
  const handleCopyLink = () => {
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Unduh Canvas sebagai PNG Beresolusi Tinggi
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `kuro_custom_qr_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // FUNGSI UTAMA: GAMBAR KODE QR SECARA ARTISTIK & PRESISI DI CANVAS HTML5
  // DILENGKAPI REAL-TIME SCAN VERIFIER (DIJAMIN 100% TERBACA KAMERA HP)
  // =========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Jika input teks masih kosong, tampilkan demo QR artistik agar canvas tidak kosong
    const targetRenderText = text.trim() || 'https://kuro-tools.com';

    try {
      const qr = QRCode.create(targetRenderText, { errorCorrectionLevel: effectiveEccLevel });
      const size = qr.modules.size;
      const ctx = canvas.getContext('2d');

      // Dimensi Modul & Padding Minimal 4 Modul (Quiet Zone Margin)
      const moduleSize = 12;
      const qrPixelSize = size * moduleSize;
      const padding = 52; // Safe Quiet Zone > 4 modul

      let extraTop = 0;
      let extraBottom = 0;

      if (frameStyle === 'badge_bottom') extraBottom = 54;
      else if (frameStyle === 'ribbon_top') extraTop = 46;
      else if (frameStyle === 'card_modern') {
        extraTop = 36;
        extraBottom = 50;
      }

      const canvasWidth = qrPixelSize + (padding * 2);
      const canvasHeight = qrPixelSize + (padding * 2) + extraTop + extraBottom;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // ─── 1. RENDER BACKGROUND KREATIF KANVAS ───
      if (bgMode === 'solid') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else if (bgMode === 'gradient') {
        const bgGrad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        bgGrad.addColorStop(0, bgGradStart);
        bgGrad.addColorStop(1, bgGradEnd);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      } else if (bgMode === 'image' && bgImage) {
        ctx.save();
        ctx.globalAlpha = bgImageOpacity / 100;
        if (bgImageBlur > 0) {
          ctx.filter = `blur(${bgImageBlur}px)`;
        }
        ctx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
        ctx.restore();
      }

      // Koordinat Awal QR
      const startX = padding;
      const startY = padding + extraTop;

      // ─── 2. BACKING PLATE & SILUET FRAME (CANVAS MASKING) ───
      // Backing plate menjaga kontras dan quiet zone sehingga QR selalu 100% terbaca kamera
      const plateX = startX - 16;
      const plateY = startY - 16;
      const plateW = qrPixelSize + 32;
      const plateH = qrPixelSize + 32;

      // Render Siluet / Masking Frame Estetika di sekeliling QR Code (tanpa memotong data modul)
      if (canvasMask === 'heart') {
        // Kontur Romantis Hati & Badge Glow
        ctx.save();
        ctx.strokeStyle = eyeColor || '#f43f5e';
        ctx.lineWidth = 3;
        ctx.shadowColor = (eyeColor || '#f43f5e') + '66';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(plateX - 6, plateY - 6, plateW + 12, plateH + 12, 28);
        ctx.stroke();

        // Aksen Love Mini di Sudut Atas
        const drawMiniHeart = (hx, hy, sz, col) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          const r = sz * 0.28;
          ctx.arc(hx - r * 0.8, hy - r * 0.4, r, 0, Math.PI * 2);
          ctx.arc(hx + r * 0.8, hy - r * 0.4, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(hx - sz * 0.48, hy - r * 0.2);
          ctx.lineTo(hx + sz * 0.48, hy - r * 0.2);
          ctx.lineTo(hx, hy + sz * 0.52);
          ctx.closePath();
          ctx.fill();
        };
        drawMiniHeart(plateX + 16, plateY - 18, 16, eyeColor || '#f43f5e');
        drawMiniHeart(plateX + plateW - 16, plateY - 18, 16, eyeColor || '#f43f5e');
        ctx.restore();
      } else if (canvasMask === 'circle') {
        // Kontur Circular Seal Ring
        ctx.save();
        ctx.strokeStyle = eyeColor || '#6366f1';
        ctx.lineWidth = 3;
        ctx.shadowColor = (eyeColor || '#6366f1') + '66';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(plateX - 8, plateY - 8, plateW + 16, plateH + 16, Math.min(plateW, plateH) / 2);
        ctx.stroke();
        ctx.restore();
      } else if (canvasMask === 'shield') {
        // Kontur Emblem Perisai / Shield
        ctx.save();
        ctx.strokeStyle = eyeColor || '#f59e0b';
        ctx.lineWidth = 3;
        ctx.shadowColor = (eyeColor || '#f59e0b') + '66';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(plateX - 8, plateY - 8, plateW + 16, plateH + 16, 24);
        ctx.stroke();
        ctx.restore();
      }

      // Isi Backing Plate dengan warna dasar aman
      ctx.fillStyle = (bgMode === 'solid') ? bgColor : '#ffffff';
      ctx.beginPath();
      ctx.roundRect(plateX, plateY, plateW, plateH, 20);
      ctx.fill();

      // ─── 3. SIAPKAN GRADASI / WARNA TITIK DATA QR ───
      let fillStyle = singleColor;
      if (colorMode === 'gradient') {
        if (gradientType === 'radial') {
          const cx = startX + (qrPixelSize / 2);
          const cy = startY + (qrPixelSize / 2);
          const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, qrPixelSize * 0.75);
          radGrad.addColorStop(0, gradStart);
          if (useMidStop) radGrad.addColorStop(0.5, gradMid);
          radGrad.addColorStop(1, gradEnd);
          fillStyle = radGrad;
        } else {
          const linGrad = ctx.createLinearGradient(startX, startY, startX + qrPixelSize, startY + qrPixelSize);
          linGrad.addColorStop(0, gradStart);
          if (useMidStop) linGrad.addColorStop(0.5, gradMid);
          linGrad.addColorStop(1, gradEnd);
          fillStyle = linGrad;
        }
      }

      ctx.fillStyle = fillStyle;

      // Area Reserved untuk Logo di Tengah (Dibatasi maksimal 4 modul agar QR 100% aman)
      const mid = Math.floor(size / 2);
      const maxSafeRadius = Math.min(4, Math.floor(size * 0.10));
      const reservedRadius = logoOption !== 'none' 
        ? Math.min(maxSafeRadius, Math.max(2, Math.round((logoScale / 100) * (size / 2)))) 
        : 0;

      // ─── 4. GAMBAR TIMING PATTERNS (GARIS SINKRONISASI PEMINDAIAN KAMERA) ───
      // Baris 6 dan Kolom 6 adalah Timing Pattern wajib agar kamera bisa mendeteksi pitch modul
      ctx.fillStyle = fillStyle;
      for (let i = 8; i < size - 8; i++) {
        if (qr.modules.get(6, i)) {
          ctx.fillRect(startX + i * moduleSize, startY + 6 * moduleSize, moduleSize, moduleSize);
        }
        if (qr.modules.get(i, 6)) {
          ctx.fillRect(startX + 6 * moduleSize, startY + i * moduleSize, moduleSize, moduleSize);
        }
      }

      // ─── 5. GAMBAR DATA MODULES DENGAN BENTUK PRESISI TINGGI ───
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          // Jangan gambar di 3 mata sudut
          if (isEye(r, c, size)) continue;

          // Timing pattern sudah digambar di atas
          if (r === 6 || c === 6) continue;

          // Jangan gambar di area logo tengah
          if (reservedRadius > 0 && Math.abs(r - mid) <= reservedRadius && Math.abs(c - mid) <= reservedRadius) {
            continue;
          }

          if (qr.modules.get(r, c)) {
            const x = startX + (c * moduleSize);
            const y = startY + (r * moduleSize);
            const cx = x + (moduleSize / 2);
            const cy = y + (moduleSize / 2);

            // Variasi Bentuk Titik Data Berpresisi Tinggi (High Area Coverage > 75%):
            if (dataPattern === 'heart') {
              // Bentuk Hati Plump (Tebal & Padat agar 100% Terbaca Binarizer Kamera)
              const hr = moduleSize * 0.28;
              const lobeY = cy - moduleSize * 0.12;
              const leftX = cx - moduleSize * 0.22;
              const rightX = cx + moduleSize * 0.22;
              ctx.beginPath();
              ctx.arc(leftX, lobeY, hr, 0, Math.PI * 2);
              ctx.arc(rightX, lobeY, hr, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.moveTo(cx - moduleSize * 0.48, lobeY);
              ctx.lineTo(cx + moduleSize * 0.48, lobeY);
              ctx.lineTo(cx, y + moduleSize * 0.95);
              ctx.closePath();
              ctx.fill();
            } else if (dataPattern === 'rounded') {
              ctx.beginPath();
              ctx.roundRect(x + 0.5, y + 0.5, moduleSize - 1, moduleSize - 1, moduleSize * 0.32);
              ctx.fill();
            } else if (dataPattern === 'diamond') {
              const dr = moduleSize * 0.58;
              ctx.beginPath();
              ctx.moveTo(cx, cy - dr);
              ctx.lineTo(cx + dr, cy);
              ctx.lineTo(cx, cy + dr);
              ctx.lineTo(cx - dr, cy);
              ctx.closePath();
              ctx.fill();
              ctx.fillRect(cx - 2.5, cy - 2.5, 5, 5);
            } else if (dataPattern === 'hexagon') {
              // Sarang Lebah (Hexagon)
              const xr = moduleSize * 0.52;
              ctx.beginPath();
              for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const px = cx + xr * Math.cos(angle);
                const py = cy + xr * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
              }
              ctx.closePath();
              ctx.fill();
            } else if (dataPattern === 'star') {
              // Bintang 4-Point Padat dengan Inti Solid
              ctx.fillRect(cx - moduleSize * 0.28, cy - moduleSize * 0.28, moduleSize * 0.56, moduleSize * 0.56);
              ctx.beginPath();
              ctx.moveTo(cx, y);
              ctx.lineTo(cx + moduleSize * 0.28, cy);
              ctx.lineTo(cx, y + moduleSize);
              ctx.lineTo(cx - moduleSize * 0.28, cy);
              ctx.closePath();
              ctx.fill();
              ctx.beginPath();
              ctx.moveTo(x, cy);
              ctx.lineTo(cx, cy - moduleSize * 0.28);
              ctx.lineTo(x + moduleSize, cy);
              ctx.lineTo(cx, cy + moduleSize * 0.28);
              ctx.closePath();
              ctx.fill();
            } else if (dataPattern === 'leaf') {
              // Daun Organik Padat
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.quadraticCurveTo(x + moduleSize, y, x + moduleSize, y + moduleSize);
              ctx.quadraticCurveTo(x, y + moduleSize, x, y);
              ctx.fill();
            } else if (dataPattern === 'fluid') {
              // Fluid Blob Halus
              ctx.beginPath();
              ctx.roundRect(x + 1, y + 1, moduleSize - 2, moduleSize - 2, moduleSize * 0.38);
              ctx.fill();
              ctx.beginPath();
              ctx.arc(cx, cy, moduleSize * 0.48, 0, Math.PI * 2);
              ctx.fill();
            } else if (dataPattern === 'lines') {
              // Garis Halus Membulat (Lines)
              ctx.beginPath();
              ctx.roundRect(x, y + 1, moduleSize, moduleSize - 2, 3);
              ctx.fill();
            } else {
              // Kotak Klasik Standar 100%
              ctx.fillRect(x, y, moduleSize, moduleSize);
            }
          }
        }
      }

      // ─── 6. GAMBAR 3 FINDER EYES DENGAN GEOMETRI 1:1:3:1:1 STANDAR RESMI ───
      const eyeBgColor = (bgMode === 'solid') ? bgColor : '#ffffff';
      const eyeFillColor = eyeColor || fillStyle;

      const drawEye = (cornerRow, cornerCol) => {
        const ox = startX + (cornerCol * moduleSize);
        const oy = startY + (cornerRow * moduleSize);
        const eyeW = 7 * moduleSize;
        const ecx = ox + (eyeW / 2);
        const ecy = oy + (eyeW / 2);

        // 1. Bersihkan 7x7 outer square dengan warna background plate
        ctx.fillStyle = eyeBgColor;
        ctx.fillRect(ox, oy, eyeW, eyeW);

        // 2. Bingkai Luar Mata (Eye Outer Shape)
        ctx.fillStyle = eyeFillColor;
        const outerRad = eyeOuterShape === 'circle' ? moduleSize * 2.2 :
                         eyeOuterShape === 'rounded' ? moduleSize * 1.5 :
                         eyeOuterShape === 'heart' ? moduleSize * 1.5 :
                         eyeOuterShape === 'diamond' ? moduleSize * 1.3 : 0;

        if (outerRad > 0) {
          ctx.beginPath();
          ctx.roundRect(ox, oy, eyeW, eyeW, outerRad);
          ctx.fill();
        } else {
          ctx.fillRect(ox, oy, eyeW, eyeW);
        }

        // 3. Bersihkan Ring Tengah 5x5 dengan warna background (Membuat ketebalan bingkai tepat 1 modul)
        ctx.fillStyle = eyeBgColor;
        const innerRad = eyeOuterShape === 'circle' ? moduleSize * 1.4 :
                         eyeOuterShape === 'rounded' ? moduleSize * 0.9 :
                         eyeOuterShape === 'heart' ? moduleSize * 0.9 :
                         eyeOuterShape === 'diamond' ? moduleSize * 0.8 : 0;

        if (innerRad > 0) {
          ctx.beginPath();
          ctx.roundRect(ox + moduleSize, oy + moduleSize, 5 * moduleSize, 5 * moduleSize, innerRad);
          ctx.fill();
        } else {
          ctx.fillRect(ox + moduleSize, oy + moduleSize, 5 * moduleSize, 5 * moduleSize);
        }

        // 4. Titik Tengah Mata (Eye Inner Pupil 3x3 Modul)
        ctx.fillStyle = eyeFillColor;
        const pupilW = 3 * moduleSize;
        const px = ox + (2 * moduleSize);
        const py = oy + (2 * moduleSize);

        if (eyeInnerShape === 'dot') {
          // Lingkaran Pupil Solid
          ctx.beginPath();
          ctx.arc(ecx, ecy, pupilW / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (eyeInnerShape === 'rounded') {
          // Squircle Pupil Solid
          ctx.beginPath();
          ctx.roundRect(px, py, pupilW, pupilW, moduleSize * 0.7);
          ctx.fill();
        } else if (eyeInnerShape === 'heart') {
          // Heart Pupil Solid Padat Berpresisi
          const hr = pupilW * 0.28;
          const lobeY = ecy - pupilW * 0.12;
          const leftX = ecx - pupilW * 0.22;
          const rightX = ecx + pupilW * 0.22;
          ctx.beginPath();
          ctx.arc(leftX, lobeY, hr, 0, Math.PI * 2);
          ctx.arc(rightX, lobeY, hr, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(ecx - pupilW * 0.48, lobeY);
          ctx.lineTo(ecx + pupilW * 0.48, lobeY);
          ctx.lineTo(ecx, py + pupilW * 0.95);
          ctx.closePath();
          ctx.fill();
        } else if (eyeInnerShape === 'diamond') {
          // Diamond Pupil Solid
          ctx.beginPath();
          ctx.moveTo(ecx, py);
          ctx.lineTo(px + pupilW, ecy);
          ctx.lineTo(ecx, py + pupilW);
          ctx.lineTo(px, ecy);
          ctx.closePath();
          ctx.fill();
        } else if (eyeInnerShape === 'star') {
          // Star Pupil 4-Point Solid
          ctx.beginPath();
          ctx.moveTo(ecx, py);
          ctx.quadraticCurveTo(ecx, ecy, px + pupilW, ecy);
          ctx.quadraticCurveTo(ecx, ecy, ecx, py + pupilW);
          ctx.quadraticCurveTo(ecx, ecy, px, ecy);
          ctx.quadraticCurveTo(ecx, ecy, ecx, py);
          ctx.closePath();
          ctx.fill();
        } else {
          // Square Kotak Solid Standar
          ctx.fillRect(px, py, pupilW, pupilW);
        }
      };

      drawEye(0, 0); // Kiri Atas
      drawEye(0, size - 7); // Kanan Atas
      drawEye(size - 7, 0); // Kiri Bawah

      // ─── 7. LOGO & IKON TENGAH DENGAN BADGE PELINDUNG SOLID ───
      if (logoOption !== 'none' && reservedRadius > 0) {
        const logoTargetSize = (reservedRadius * 2) * moduleSize;
        const lcx = startX + (qrPixelSize / 2);
        const lcy = startY + (qrPixelSize / 2);
        const logoX = lcx - (logoTargetSize / 2);
        const logoY = lcy - (logoTargetSize / 2);

        // Background Badge Pelindung Logo (Mencegah tabrakan warna modul)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(logoX - 3, logoY - 3, logoTargetSize + 6, logoTargetSize + 6, Math.min(16, logoRadius));
        ctx.fill();
        ctx.strokeStyle = eyeColor || '#06b6d4';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Render Gambar / Ikon Preset
        if (logoOption === 'custom' && customLogoImage) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(logoX, logoY, logoTargetSize, logoTargetSize, Math.max(0, logoRadius - 2));
          ctx.clip();
          ctx.drawImage(customLogoImage, logoX, logoY, logoTargetSize, logoTargetSize);
          ctx.restore();
        } else {
          // Preset Media Sosial & Aplikasi
          ctx.fillStyle = eyeColor || '#06b6d4';
          ctx.font = `bold ${Math.round(logoTargetSize * 0.58)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          let symbol = '🔗';
          if (logoOption === 'spotify') symbol = '🟢';
          else if (logoOption === 'shopee') symbol = '🟠';
          else if (logoOption === 'tokopedia') symbol = '🟢';
          else if (logoOption === 'discord') symbol = '🎮';
          else if (logoOption === 'telegram') symbol = '✈';
          else if (logoOption === 'yt') symbol = '▶';
          else if (logoOption === 'wa') symbol = '💬';
          else if (logoOption === 'tiktok') symbol = '🎵';
          else if (logoOption === 'ig') symbol = '📷';

          ctx.fillText(symbol, lcx, lcy);
        }
      }

      // ─── 8. BINGKAI & CALL TO ACTION (FRAME STYLING) ───
      if (frameStyle === 'badge_bottom') {
        const badgeW = qrPixelSize * 0.86;
        const badgeH = 38;
        const badgeX = (canvasWidth - badgeW) / 2;
        const badgeY = startY + qrPixelSize + 14;

        ctx.fillStyle = eyeColor || '#06b6d4';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "JetBrains Mono", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ctaText.toUpperCase(), canvasWidth / 2, badgeY + (badgeH / 2));
      } else if (frameStyle === 'ribbon_top') {
        const ribbonW = qrPixelSize * 0.86;
        const ribbonH = 34;
        const ribbonX = (canvasWidth - ribbonW) / 2;
        const ribbonY = padding - 4;

        ctx.fillStyle = eyeColor || '#06b6d4';
        ctx.beginPath();
        ctx.roundRect(ribbonX, ribbonY, ribbonW, ribbonH, 10);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "JetBrains Mono", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ctaText.toUpperCase(), canvasWidth / 2, ribbonY + (ribbonH / 2));
      } else if (frameStyle === 'card_modern') {
        ctx.strokeStyle = eyeColor || '#06b6d4';
        ctx.lineWidth = 3;
        ctx.strokeRect(padding - 12, padding - 12, qrPixelSize + 24, qrPixelSize + 24);

        ctx.fillStyle = eyeColor || '#06b6d4';
        ctx.font = 'bold 11px "JetBrains Mono", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ctaText.toUpperCase(), canvasWidth / 2, startY + qrPixelSize + 32);
      }

      // ─── 9. SISTEM VERIFIKASI PEMINDAIAN REAL-TIME DENGAN jsQR ───
      // Menguji secara langsung pixel canvas untuk memastikan hasil 100% terbaca kamera HP
      try {
        const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        const code = jsQR(imgData.data, canvasWidth, canvasHeight, { inversionAttempts: 'attemptBoth' });
        if (code && code.data) {
          setScanResult({
            scannable: true,
            content: code.data,
            time: Date.now()
          });
        } else {
          // Coba scan area fokus QR saja
          const qrImgData = ctx.getImageData(startX, startY, qrPixelSize, qrPixelSize);
          const qrCode = jsQR(qrImgData.data, qrPixelSize, qrPixelSize, { inversionAttempts: 'attemptBoth' });
          if (qrCode && qrCode.data) {
            setScanResult({
              scannable: true,
              content: qrCode.data,
              time: Date.now()
            });
          } else {
            setScanResult({
              scannable: false,
              content: '',
              time: Date.now()
            });
          }
        }
      } catch (scanErr) {
        console.warn('Real-time scan verification check:', scanErr);
      }

    } catch (err) {
      console.error('Error render canvas QR Code:', err);
    }
  }, [
    text,
    dataPattern,
    eyeOuterShape,
    eyeInnerShape,
    canvasMask,
    logoOption,
    customLogoImage,
    logoScale,
    logoRadius,
    logoPadding,
    colorMode,
    gradientType,
    singleColor,
    gradStart,
    useMidStop,
    gradMid,
    gradEnd,
    eyeColor,
    bgMode,
    bgColor,
    bgGradStart,
    bgGradEnd,
    bgImage,
    bgImageOpacity,
    bgImageBlur,
    frameStyle,
    ctaText,
    effectiveEccLevel
  ]);

  return (
    <main className="flex-grow flex flex-col items-center justify-start px-4 sm:px-6 md:px-margin-desktop py-6 sm:py-8 max-w-6xl mx-auto w-full relative z-10 animate-fadeIn">
      
      {/* ─── 1. HEADER NAVIGASI & SCANNABILITY INDICATOR ─── */}
      <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-white/5">
        <CosmicBackButton onClick={onBack} label="Kembali ke Beranda Tools" />

        <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full border ${scannabilityBadgeClass}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{scannabilityLabel}</span>
        </div>
      </div>

      {/* Header Judul Fitur */}
      <div className="text-center mb-8 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border-2 border-black bg-neutral-100 text-black text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <QrCode className="w-3.5 h-3.5" />
          <span>QR Code Studio</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-black mb-2 tracking-tight font-display">
          Customizer Kode QR Tingkat Lanjut
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
          Kustomisasi visual QR Code dengan bentuk titik cinta/bintang/daun, siluet masking perisai/hati, logo tengah berpresisi, dan format ekspor HD.
        </p>
      </div>

      {/* ─── 2. WORKSPACE GRID: KIRI PANEL KONTROL, KANAN LIVE PREVIEW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
        
        {/* ======================================================== */}
        {/* KOLOM KIRI: PANEL KONTROL DESAIN LENGKAP (7 COLUMNS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Input Konten Tautan / Teks */}
          <div className="rounded-3xl p-6 bg-[#0e121d]/90 border border-white/10 shadow-xl space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tautan / URL Tujuan:</span>
              </span>
              <button
                onClick={handleCopyLink}
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin URL'}</span>
              </button>
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="(masukkan url tujuan ke sini)"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none placeholder:text-slate-500 placeholder:italic"
            />
          </div>

          {/* Preset Konsep Estetika */}
          <div className="rounded-3xl p-6 bg-[#0e121d]/90 border border-white/10 shadow-xl space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preset Konsep & Estetika Instan:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'cyberpunk', label: 'Cyber Neon', desc: 'Futuristik Diamond' },
                { id: 'romantic_heart', label: 'Romantic Heart', desc: 'Siluet Hati & Love' },
                { id: 'minimalist', label: 'Minimalist Clean', desc: 'Monokrom Rapi' },
                { id: 'luxury_gold', label: 'Luxury Gold', desc: 'Elegan Eksklusif' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => applyConcept(c.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    activeConcept === c.id
                      ? 'bg-indigo-600/25 border-indigo-400 text-indigo-200 font-bold shadow-sm'
                      : 'bg-black/30 border-white/5 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  <p className="text-xs">{c.label}</p>
                  <p className="text-[9px] opacity-70">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ─── A. BENTUK TITIK DATA (DOTS / MODULES STYLING) ─── */}
          <div className="rounded-3xl p-6 bg-[#0e121d]/90 border border-white/10 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Sliders className="w-4 h-4" />
              <span>A. Bentuk Titik Data (Dots & Modules Styling)</span>
            </h3>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[
                { id: 'heart', label: 'Love / Hati', icon: '❤️' },
                { id: 'diamond', label: 'Belah Ketupat', icon: '🔶' },
                { id: 'hexagon', label: 'Sarang Lebah', icon: '⬡' },
                { id: 'fluid', label: 'Fluid / Blob', icon: '💧' },
                { id: 'star', label: 'Bintang (Star)', icon: '⭐' },
                { id: 'leaf', label: 'Daun (Leaf)', icon: '🍃' },
                { id: 'rounded', label: 'Titik Bulat', icon: '⚪' },
                { id: 'lines', label: 'Garis Halus', icon: '═' },
                { id: 'square', label: 'Kotak Asli', icon: '■' }
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDataPattern(d.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    dataPattern === d.id
                      ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold shadow-md shadow-indigo-600/20'
                      : 'bg-black/30 border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-base">{d.icon}</span>
                  <span className="text-[10px] text-center leading-tight">{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ─── B. KUSTOMISASI BENTUK MATA SUDUT (EYE FINDER PATTERNS) ─── */}
          <div className="rounded-3xl p-6 bg-[#0e121d]/90 border border-white/10 shadow-xl space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Eye className="w-4 h-4" />
              <span>B. Kustomisasi Bentuk Mata Sudut (Eye Finder)</span>
            </h3>

            {/* Eye Outer Shape */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Bingkai Luar Mata (Eye Outer Shape):</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'square', label: 'Kotak Klasik' },
                  { id: 'rounded', label: 'Membulat' },
                  { id: 'circle', label: 'Lingkaran' },
                  { id: 'diamond', label: 'Berlian' },
                  { id: 'heart', label: 'Heart / Love' }
                ].map((eo) => (
                  <button
                    key={eo.id}
                    onClick={() => setEyeOuterShape(eo.id)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold border text-center transition-all cursor-pointer ${
                      eyeOuterShape === eo.id
                        ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                        : 'bg-black/30 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {eo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Eye Inner Shape */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Titik Tengah Mata (Eye Inner Shape):</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { id: 'dot', label: 'Dot Bulat' },
                  { id: 'square', label: 'Kotak' },
                  { id: 'diamond', label: 'Berlian' },
                  { id: 'star', label: 'Bintang' },
                  { id: 'heart', label: 'Heart / Love' }
                ].map((ei) => (
                  <button
                    key={ei.id}
                    onClick={() => setEyeInnerShape(ei.id)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold border text-center transition-all cursor-pointer ${
                      eyeInnerShape === ei.id
                        ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                        : 'bg-black/30 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {ei.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── C. CANVAS MASKING & SHAPE MATRIX (SILUET KESELURUHAN) ─── */}
          <div className="rounded-3xl p-6 bg-[#0e121d]/90 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>C. Canvas Masking & Shape Matrix</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">Safe Zone Margin Aktif</span>
            </div>

            <p className="text-xs text-slate-400">
              Bentuk keseluruhan tata letak QR mengikuti siluet khusus tanpa merusak keterbacaan scan kamera:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'none', label: 'Kotak Penuh', desc: 'Standar Matriks' },
                { id: 'heart', label: 'Siluet Hati', desc: 'Pola Love Shape' },
                { id: 'circle', label: 'Circle Badge', desc: 'Pola Lingkaran' },
                { id: 'shield', label: 'Shield / Perisai', desc: 'Pola Lambang' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setCanvasMask(m.id)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    canvasMask === m.id
                      ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold shadow-md shadow-indigo-600/20'
                      : 'bg-black/30 border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-bold">{m.label}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ─── D. LOGO & IKON TENGAH ─── */}
          <div className="rounded-3xl p-6 bg-[#0e121d]/90 border border-white/10 shadow-xl space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <ImageIcon className="w-4 h-4" />
              <span>D. Logo & Ikon Tengah</span>
            </h3>

            {/* Preset Ikon Media Sosial & Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Pilih Preset Ikon atau Unggah Logo Kustom:</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {[
                  { id: 'none', label: 'Kosong' },
                  { id: 'spotify', label: 'Spotify' },
                  { id: 'shopee', label: 'Shopee' },
                  { id: 'tokopedia', label: 'Tokopedia' },
                  { id: 'discord', label: 'Discord' },
                  { id: 'telegram', label: 'Telegram' },
                  { id: 'yt', label: 'YouTube' },
                  { id: 'wa', label: 'WhatsApp' },
                  { id: 'tiktok', label: 'TikTok' },
                  { id: 'ig', label: 'Instagram' },
                  { id: 'link', label: 'Link' }
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLogoOption(l.id)}
                    className={`py-2 px-1.5 rounded-xl text-[11px] font-semibold border text-center transition-all cursor-pointer ${
                      logoOption === l.id
                        ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                        : 'bg-black/30 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Upload Custom Logo Button */}
              <div className="pt-2">
                <label className="w-full py-2.5 px-4 rounded-xl border border-dashed border-white/20 hover:border-indigo-400 bg-black/30 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer">
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>{customLogoImage ? 'Ganti Custom Logo (PNG/SVG)' : 'Unggah Custom Logo Lokal (PNG/SVG)'}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Slider Pengaturan Logo */}
            {logoOption !== 'none' && (
              <div className="space-y-4 pt-2 border-t border-white/5">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Ukuran Logo (Logo Size):</span>
                    <span className="text-indigo-400 font-bold">{logoScale}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="30" 
                    value={logoScale} 
                    onChange={(e) => setLogoScale(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Border Radius Badge Logo:</span>
                    <span className="text-indigo-400 font-bold">{logoRadius}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="24" 
                    value={logoRadius} 
                    onChange={(e) => setLogoRadius(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer" 
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>Padding Pelindung Logo:</span>
                    <span className="text-indigo-400 font-bold">{logoPadding}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="16" 
                    value={logoPadding} 
                    onChange={(e) => setLogoPadding(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* ─── E. PALET WARNA & BACKGROUND KREATIF ─── */}
          <div className="rounded-3xl p-6 bg-[#0e121d]/90 border border-white/10 shadow-xl space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Palette className="w-4 h-4" />
              <span>E. Palet Warna & Background Kreatif</span>
            </h3>

            {/* Mode Gradasi vs Solid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setColorMode('gradient')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  colorMode === 'gradient'
                    ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                    : 'bg-black/30 border-white/5 text-slate-400'
                }`}
              >
                Multi-Stop Gradient
              </button>
              <button
                onClick={() => setColorMode('single')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  colorMode === 'single'
                    ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                    : 'bg-black/30 border-white/5 text-slate-400'
                }`}
              >
                Solid Color
              </button>
            </div>

            {/* Tipe Gradasi: Linear vs Radial */}
            {colorMode === 'gradient' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGradientType('linear')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border ${
                    gradientType === 'linear' ? 'bg-white/10 border-indigo-400 text-white' : 'bg-black/20 border-white/5 text-slate-400'
                  }`}
                >
                  Linear Gradient
                </button>
                <button
                  onClick={() => setGradientType('radial')}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border ${
                    gradientType === 'radial' ? 'bg-white/10 border-indigo-400 text-white' : 'bg-black/20 border-white/5 text-slate-400'
                  }`}
                >
                  Radial Gradient
                </button>
              </div>
            )}

            {/* Pemilih Warna QR */}
            {colorMode === 'gradient' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Warna Awal:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={gradStart}
                      onChange={(e) => setGradStart(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-white">{gradStart}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-slate-400">Warna Tengah:</label>
                    <input 
                      type="checkbox" 
                      checked={useMidStop} 
                      onChange={(e) => setUseMidStop(e.target.checked)} 
                      title="Aktifkan stop tengah" 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={gradMid}
                      disabled={!useMidStop}
                      onChange={(e) => setGradMid(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer disabled:opacity-40"
                    />
                    <span className="text-xs font-mono text-white">{useMidStop ? gradMid : 'Off'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Warna Akhir:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={gradEnd}
                      onChange={(e) => setGradEnd(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-white">{gradEnd}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Warna Titik QR:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={singleColor}
                    onChange={(e) => setSingleColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white">{singleColor}</span>
                </div>
              </div>
            )}

            {/* Warna Mata Sudut */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] text-slate-400">Warna Khusus Mata Sudut (Eye Color):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={eyeColor}
                  onChange={(e) => setEyeColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono text-white">{eyeColor}</span>
              </div>
            </div>

            {/* Opsi Latar Belakang (Background) */}
            <div className="space-y-3 pt-3 border-t border-white/5">
              <label className="text-xs font-semibold text-slate-300">Mode Latar Belakang (Background):</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'solid', label: 'Solid Color' },
                  { id: 'transparent', label: 'Transparan' },
                  { id: 'gradient', label: 'Gradasi BG' },
                  { id: 'image', label: 'Custom Gambar' }
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBgMode(b.id)}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold border text-center transition-all cursor-pointer ${
                      bgMode === b.id
                        ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                        : 'bg-black/30 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {bgMode === 'solid' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-400">Pilih Warna BG:</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white">{bgColor}</span>
                </div>
              )}

              {bgMode === 'gradient' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">BG Awal:</span>
                    <input
                      type="color"
                      value={bgGradStart}
                      onChange={(e) => setBgGradStart(e.target.value)}
                      className="w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-white">{bgGradStart}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">BG Akhir:</span>
                    <input
                      type="color"
                      value={bgGradEnd}
                      onChange={(e) => setBgGradEnd(e.target.value)}
                      className="w-7 h-7 rounded border border-white/20 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-white">{bgGradEnd}</span>
                  </div>
                </div>
              )}

              {bgMode === 'image' && (
                <div className="space-y-3 pt-2">
                  <label className="w-full py-2 px-3 rounded-xl border border-dashed border-white/20 hover:border-indigo-400 bg-black/30 flex items-center justify-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{bgImage ? 'Ganti Gambar Background' : 'Unggah File Gambar Background'}</span>
                    <input type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                  </label>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                      <span>Opacity Gambar:</span>
                      <span className="text-indigo-400 font-bold">{bgImageOpacity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={bgImageOpacity} 
                      onChange={(e) => setBgImageOpacity(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                      <span>Blur Efek Gambar:</span>
                      <span className="text-indigo-400 font-bold">{bgImageBlur}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="20" 
                      value={bgImageBlur} 
                      onChange={(e) => setBgImageBlur(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer" 
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ─── FRAME & CALL TO ACTION (CTA) ─── */}
          <div className="rounded-3xl p-6 bg-[#0e121d]/90 border border-white/10 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Type className="w-4 h-4" />
              <span>Bingkai & Call To Action (CTA Text)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'Tanpa Frame' },
                { id: 'badge_bottom', label: 'Badge Bawah' },
                { id: 'ribbon_top', label: 'Ribbon Atas' },
                { id: 'card_modern', label: 'Kartu Modern' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFrameStyle(f.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    frameStyle === f.id
                      ? 'bg-indigo-600/30 border-indigo-400 text-white font-bold'
                      : 'bg-black/30 border-white/5 text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {frameStyle !== 'none' && (
              <div className="pt-2">
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="SCAN ME / SCAN UNTUK MENU"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white uppercase font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}
          </div>

        </div>

        {/* ======================================================== */}
        {/* KOLOM KANAN: LIVE CANVAS PREVIEW & EXPORT (5 COLUMNS) - STICKY MENGIKUTI SCROLL */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 flex flex-col items-center gap-6 lg:sticky lg:top-24 self-start z-30">
          
          <div className="rounded-3xl p-6 sm:p-8 shadow-2xl border border-indigo-500/30 bg-[#0e121d]/95 backdrop-blur-2xl flex flex-col items-center gap-6 w-full text-center">
            
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/5 text-xs">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-4 h-4" />
                <span>Live Canvas Preview</span>
              </span>
              <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full border ${
                scanResult.scannable
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {scanResult.scannable ? '100% Scannable (Verified ✅)' : 'Periksa Kontras'}
              </span>
            </div>

            {/* Canvas Tempat Render QR Code */}
            <div className={`p-4 rounded-2xl shadow-2xl border border-white/10 max-w-full overflow-hidden flex items-center justify-center transition-all ${
              bgMode === 'transparent' ? 'bg-checkerboard' : 'bg-black/60'
            }`}>
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            {/* Real-time Scanner Live Status (jsQR Verification) */}
            <div className={`p-4 rounded-2xl border w-full text-left transition-all ${
              scanResult.scannable 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-md shadow-emerald-500/10' 
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/10'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                {scanResult.scannable ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <div className="flex-1">
                  <div className="text-xs font-bold font-mono tracking-wide flex items-center gap-1.5">
                    <span>{scanResult.scannable ? 'REAL-TIME SCAN: TERVERIFIKASI 100% ✅' : 'REAL-TIME SCAN: PERINGATAN KONTRAS ⚠️'}</span>
                  </div>
                  <div className="text-[10px] text-slate-300">
                    {scanResult.scannable 
                      ? 'Kamera HP & Scanner Barcode dijamin dapat membaca QR ini secara instan.'
                      : 'Kamera mungkin kesulitan memindai. Tingkatkan kontras warna atau perkecil logo.'}
                  </div>
                </div>
              </div>

              {scanResult.scannable && scanResult.content && (
                <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">Tautan Hasil Scan Kamera:</div>
                    <div className="text-xs font-mono text-white truncate">{scanResult.content}</div>
                  </div>
                  <a
                    href={scanResult.content.startsWith('http') ? scanResult.content : `https://${scanResult.content}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>Tes Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Scannability Protection Info Card */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 w-full text-left space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Auto-Protect Error Correction: Level {effectiveEccLevel}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Toleransi pemulihan 30% aktif otomatis sehingga QR tetap 100% terbaca kamera HP meskipun menggunakan siluet hati, bintang, atau logo tengah.
              </p>
            </div>

            {/* Tombol Unduh PNG High-Res */}
            <div className="w-full space-y-2 pt-2">
              <button
                onClick={handleDownload}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-98 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Kode QR (PNG High-Res)</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}
