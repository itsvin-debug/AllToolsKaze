import React, { useState, useRef } from 'react';
import CosmicBackButton from './CosmicBackButton';
import { jsPDF } from 'jspdf';
import { 
  Images, 
  Upload, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  FileDown, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Bold, 
  Italic, 
  Check, 
  AlertCircle, 
  Loader2, 
  FileText, 
  X,
  Eye,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Smartphone,
  CheckSquare,
  Square,
  Layers,
  Sparkles
} from 'lucide-react';

export default function PngToPdfScreen({ onBack }) {
  const [images, setImages] = useState([]);
  const [docTitle, setDocTitle] = useState('Kuro_Dokumen');
  const [pageOrientation, setPageOrientation] = useState('p'); // 'p' (Portrait) atau 'l' (Landscape)
  const [pageMargin, setPageMargin] = useState(15); // mm: 10, 15, 20
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const [previewTab, setPreviewTab] = useState('preview'); // 'edit' | 'preview' di mobile
  const [showMarginGuide, setShowMarginGuide] = useState(true);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Modal download & file naming
  const [showNameModal, setShowNameModal] = useState(false);
  const [pdfDownloadName, setPdfDownloadName] = useState('Kuro_Dokumen');
  const [generatedBlobUrl, setGeneratedBlobUrl] = useState(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState('');

  const fileInputRef = useRef(null);

  // Proses upload berkas foto
  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    setError('');

    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setError('Hanya berkas gambar (PNG, JPG, JPEG, WEBP) yang didukung.');
      return;
    }

    const newEntries = [];
    let loadedCount = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          newEntries.push({
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            file,
            previewUrl,
            width: img.naturalWidth || 800,
            height: img.naturalHeight || 600,
            name: file.name,
            sizeKb: Math.round(file.size / 1024),
            
            // KELOMPOK 1: TATA LETAK FOTO & HALAMAN
            photoScale: 'fit', // 'fit' (Pas Halaman) | 'fill' (Lebar Penuh) | 'compact' (Kompak 75%)
            photoAlign: 'center', // 'center' | 'left' | 'right'
            photoBorder: 'none', // 'none' | 'thin' (1px) | 'brutal' (2px tebal)
            photoGap: 8, // mm: 4 (rapat), 8 (standar), 14 (renggang)
            textPosition: 'below', // 'below' | 'above'

            // KELOMPOK 2: TIPOGRAFI & TULISAN
            text: '',
            fontFamily: 'helvetica', // 'helvetica' (Sans), 'times' (Serif), 'courier' (Mono)
            fontSize: 12, // 10, 12, 14, 18, 22
            isBold: false,
            isItalic: false,
            textAlign: 'center', // 'left', 'center', 'right', 'justify'
            lineHeight: 1.35 // 1.15, 1.35, 1.65
          });

          loadedCount++;
          if (loadedCount === validFiles.length) {
            setImages(prev => {
              const updated = [...prev, ...newEntries];
              return updated;
            });
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === validFiles.length) {
            setImages(prev => [...prev, ...newEntries]);
          }
        };
        img.src = previewUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const onFileInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = (id) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      if (previewPageIndex >= filtered.length && filtered.length > 0) {
        setPreviewPageIndex(filtered.length - 1);
      }
      return filtered;
    });
  };

  const clearAllImages = () => {
    setImages([]);
    setError('');
    setPreviewPageIndex(0);
    setGeneratedBlobUrl(null);
  };

  const moveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    setImages(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setPreviewPageIndex(targetIndex);
  };

  const updateImageField = (id, field, value) => {
    setImages(prev => prev.map(img => {
      if (img.id !== id) return img;
      return { ...img, [field]: value };
    }));
  };

  // Salin pengaturan tata letak & font halaman ini ke seluruh halaman
  const applyStyleToAllPages = (sourceItem) => {
    if (!sourceItem) return;
    setImages(prev => prev.map(img => ({
      ...img,
      photoScale: sourceItem.photoScale,
      photoAlign: sourceItem.photoAlign,
      photoBorder: sourceItem.photoBorder,
      photoGap: sourceItem.photoGap,
      textPosition: sourceItem.textPosition,
      fontFamily: sourceItem.fontFamily,
      fontSize: sourceItem.fontSize,
      isBold: sourceItem.isBold,
      isItalic: sourceItem.isItalic,
      textAlign: sourceItem.textAlign,
      lineHeight: sourceItem.lineHeight
    })));
    setDownloadSuccessToast('Gaya tata letak & font berhasil diterapkan ke semua halaman!');
    setTimeout(() => setDownloadSuccessToast(''), 3000);
  };

  const initiateDownloadFlow = () => {
    if (images.length === 0) {
      setError('Unggah minimal 1 gambar untuk membuat dokumen PDF.');
      return;
    }
    setError('');
    const currentName = docTitle.trim() || 'Kuro_Dokumen';
    setPdfDownloadName(currentName);
    setShowNameModal(true);
  };

  // Ekspor Dokumen PDF dengan jsPDF dan dukungan download universal HP & Laptop
  const processAndDownloadPdf = async (customName) => {
    if (images.length === 0) {
      setError('Unggah minimal 1 gambar untuk membuat dokumen PDF.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('Menyiapkan tata letak dokumen PDF...');
    setError('');

    try {
      const doc = new jsPDF({
        orientation: pageOrientation,
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = Number(pageMargin);
      const contentWidth = pageWidth - (margin * 2);
      const footerReserve = showPageNumbers ? 10 : 0;
      const contentHeight = pageHeight - (margin * 2) - footerReserve;

      for (let i = 0; i < images.length; i++) {
        setGenerationProgress(`Merender halaman ${i + 1} dari ${images.length}...`);
        if (i > 0) {
          doc.addPage('a4', pageOrientation);
        }

        const item = images[i];
        const hasText = Boolean(item.text && item.text.trim());
        const fontStyle = item.isBold && item.isItalic ? 'bolditalic' : item.isBold ? 'bold' : item.isItalic ? 'italic' : 'normal';
        const gapMm = Number(item.photoGap || 8);

        let textLines = [];
        let textBlockHeight = 0;
        let lineHeightMm = 0;

        if (hasText) {
          doc.setFont(item.fontFamily, fontStyle);
          doc.setFontSize(item.fontSize);
          textLines = doc.splitTextToSize(item.text.trim(), contentWidth);
          lineHeightMm = (item.fontSize * 0.3527) * (item.lineHeight || 1.35);
          textBlockHeight = (textLines.length * lineHeightMm);
        }

        const availableImgHeight = Math.max(10, contentHeight - (hasText ? textBlockHeight + gapMm : 0));
        const imgAspect = item.width / item.height;

        let renderImgWidth = contentWidth;
        let renderImgHeight = renderImgWidth / imgAspect;

        if (item.photoScale === 'compact') {
          renderImgWidth = contentWidth * 0.75;
          renderImgHeight = renderImgWidth / imgAspect;
        }

        if (renderImgHeight > availableImgHeight) {
          renderImgHeight = availableImgHeight;
          renderImgWidth = renderImgHeight * imgAspect;
        }

        if (renderImgWidth > contentWidth) {
          renderImgWidth = contentWidth;
          renderImgHeight = renderImgWidth / imgAspect;
        }

        let imgX = margin;
        if (item.photoAlign === 'center') {
          imgX = margin + ((contentWidth - renderImgWidth) / 2);
        } else if (item.photoAlign === 'right') {
          imgX = margin + (contentWidth - renderImgWidth);
        }

        let imgY = margin;
        let textY = margin;

        if (hasText) {
          const totalBlockHeight = renderImgHeight + gapMm + textBlockHeight;
          const startY = margin + Math.max(0, (contentHeight - totalBlockHeight) / 2);

          if (item.textPosition === 'above') {
            textY = startY + (item.fontSize * 0.3527);
            imgY = startY + textBlockHeight + gapMm;
          } else {
            imgY = startY;
            textY = startY + renderImgHeight + gapMm + (item.fontSize * 0.3527);
          }

          doc.setFont(item.fontFamily, fontStyle);
          doc.setFontSize(item.fontSize);
          doc.setTextColor(0, 0, 0);

          let textAnchorX = margin;
          if (item.textAlign === 'center') {
            textAnchorX = margin + (contentWidth / 2);
          } else if (item.textAlign === 'right') {
            textAnchorX = margin + contentWidth;
          }

          doc.text(textLines, textAnchorX, textY, { 
            align: item.textAlign === 'justify' ? 'left' : item.textAlign,
            lineHeightFactor: item.lineHeight || 1.35 
          });
        } else {
          imgY = margin + Math.max(0, (contentHeight - renderImgHeight) / 2);
        }

        // Cetak foto
        try {
          doc.addImage(
            item.previewUrl,
            'JPEG',
            imgX,
            imgY,
            renderImgWidth,
            renderImgHeight,
            undefined,
            'FAST'
          );
        } catch {
          doc.addImage(
            item.previewUrl,
            imgX,
            imgY,
            renderImgWidth,
            renderImgHeight
          );
        }

        // Garis bingkai foto opsional
        if (item.photoBorder === 'thin') {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.3);
          doc.rect(imgX, imgY, renderImgWidth, renderImgHeight);
        } else if (item.photoBorder === 'brutal') {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.8);
          doc.rect(imgX, imgY, renderImgWidth, renderImgHeight);
        }

        // Nomor halaman
        if (showPageNumbers) {
          doc.setFont('courier', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          const pageNumStr = `Halaman ${i + 1} dari ${images.length}`;
          doc.text(pageNumStr, pageWidth / 2, pageHeight - (margin / 2), { align: 'center' });
        }
      }

      setGenerationProgress('Menyimpan berkas PDF...');

      let targetName = (customName || docTitle || 'Kuro_Dokumen').trim();
      targetName = targetName.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
      if (!targetName) targetName = 'Kuro_Dokumen';
      if (!targetName.toLowerCase().endsWith('.pdf')) {
        targetName += '.pdf';
      }

      // Download universal: menghasilkan blob resmi application/pdf
      const pdfBlob = doc.output('blob');
      const typedBlob = new Blob([pdfBlob], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(typedBlob);
      setGeneratedBlobUrl(blobUrl);

      // Jalankan native download trigger
      try {
        doc.save(targetName);
      } catch {
        const downloadLink = document.createElement('a');
        downloadLink.style.display = 'none';
        downloadLink.href = blobUrl;
        downloadLink.download = targetName;
        downloadLink.setAttribute('download', targetName);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        setTimeout(() => {
          try {
            document.body.removeChild(downloadLink);
          } catch {}
        }, 1500);
      }

      setDocTitle(targetName.replace(/\.pdf$/i, ''));
      setDownloadSuccessToast(`Berkas ${targetName} berhasil diunduh!`);
      setTimeout(() => setDownloadSuccessToast(''), 4500);

    } catch (err) {
      setError(`Gagal membuat PDF: ${err.message || 'Terjadi kesalahan sistem.'}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  const activeItem = images[previewPageIndex] || null;

  return (
    <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-black">
      
      {/* Tombol Navigasi Kembali */}
      <div className="mb-5">
        <CosmicBackButton onClick={onBack} label="Kembali ke Beranda" />
      </div>

      {/* ─── 1. HEADER UTAMA ALAT PNG TO PDF ─── */}
      <div className="rounded-xl p-5 sm:p-6 border-2 border-black bg-white shadow-[4px_4px_0px_#000000] mb-6">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-black">
          <div className="w-10 h-10 rounded-md border-2 border-black bg-black text-white flex items-center justify-center shrink-0">
            <Images className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black tracking-tight font-display text-black">
              PNG to PDF Converter
            </h1>
            <p className="text-xs text-neutral-600">
              Satukan foto menjadi dokumen PDF rapi dengan pratinjau real-time, pengaturan tata letak foto, dan tipografi lengkap.
            </p>
          </div>
        </div>

        {/* ─── 2. PENGATURAN GLOBAL DOKUMEN PDF ─── */}
        <div className="mt-4 pt-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          {/* Judul File PDF */}
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
              Nama Berkas PDF
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Kuro_Dokumen"
              className="w-full px-3 py-2 rounded-lg border-2 border-black bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Orientasi Halaman */}
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
              Orientasi Halaman
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setPageOrientation('p')}
                className={`py-2 px-2 rounded-lg border-2 border-black text-xs font-bold transition-all cursor-pointer ${
                  pageOrientation === 'p' ? 'bg-black text-white shadow-[1.5px_1.5px_0px_#000000]' : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                Potret
              </button>
              <button
                type="button"
                onClick={() => setPageOrientation('l')}
                className={`py-2 px-2 rounded-lg border-2 border-black text-xs font-bold transition-all cursor-pointer ${
                  pageOrientation === 'l' ? 'bg-black text-white shadow-[1.5px_1.5px_0px_#000000]' : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                Lanskap
              </button>
            </div>
          </div>

          {/* Margin Halaman */}
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
              Margin Sisi
            </label>
            <select
              value={pageMargin}
              onChange={(e) => setPageMargin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border-2 border-black bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value={10}>Ramping (10 mm)</option>
              <option value={15}>Standar (15 mm)</option>
              <option value={20}>Lebar (20 mm)</option>
            </select>
          </div>

          {/* Nomor Halaman */}
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
              Nomor Halaman
            </label>
            <button
              type="button"
              onClick={() => setShowPageNumbers(!showPageNumbers)}
              className={`w-full py-2 px-3 rounded-lg border-2 border-black text-xs font-bold flex items-center justify-between cursor-pointer ${
                showPageNumbers ? 'bg-black text-white shadow-[1.5px_1.5px_0px_#000000]' : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <span>{showPageNumbers ? 'Aktif (1/n)' : 'Tanpa Nomor'}</span>
              {showPageNumbers ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* ─── 3. AREA DRAG & DROP UNGGAH FOTO ─── */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full p-8 rounded-xl border-2 border-dashed border-black flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 mb-6 bg-white ${
          isDragOver ? 'bg-neutral-100 scale-[0.99] shadow-[2px_2px_0px_#000000]' : 'hover:bg-neutral-50 shadow-[3px_3px_0px_#000000]'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={onFileInputChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-lg border-2 border-black bg-neutral-100 flex items-center justify-center text-black mb-3 shadow-[2px_2px_0px_#000000]">
          <Upload className="w-6 h-6 stroke-[2]" />
        </div>

        <h3 className="font-extrabold text-sm sm:text-base text-black font-sans">
          Pilih atau Tarik Berkas Foto ke Sini
        </h3>
        <p className="text-xs text-neutral-600 mt-1 max-w-sm">
          Mendukung banyak gambar sekaligus (PNG, JPG, JPEG, WEBP). Siap diatur tata letak dan langsung dipratinjau.
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="mt-4 min-h-[44px] px-5 py-2.5 rounded-lg border-2 border-black bg-black text-white font-bold text-xs shadow-[2px_2px_0px_#000000] hover:bg-neutral-800 cursor-pointer"
        >
          Pilih dari Perangkat
        </button>
      </div>

      {/* Pesan Kesalahan */}
      {error && (
        <div className="mb-5 p-3.5 rounded-lg border-2 border-black bg-neutral-100 text-black text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── 4. RUANG KERJA KONTROL, PRATINJAU REAL-TIME & DAFTAR FOTO ─── */}
      {images.length > 0 && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Bar Aksi Utama Atas */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base font-sans">
                Dokumen ({images.length} Halaman)
              </h2>
              <span className="px-2 py-0.5 rounded border border-black bg-black text-white font-mono text-[10px] font-bold">
                A4 {pageOrientation === 'p' ? 'Potret' : 'Lanskap'}
              </span>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="flex sm:hidden items-center rounded-lg border-2 border-black p-0.5 bg-neutral-100">
              <button
                type="button"
                onClick={() => setPreviewTab('preview')}
                className={`px-3 py-1.5 rounded text-xs font-bold ${
                  previewTab === 'preview' ? 'bg-black text-white shadow-[1px_1px_0px_#000000]' : 'text-black'
                }`}
              >
                Pratinjau
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('edit')}
                className={`px-3 py-1.5 rounded text-xs font-bold ${
                  previewTab === 'edit' ? 'bg-black text-white shadow-[1px_1px_0px_#000000]' : 'text-black'
                }`}
              >
                Edit Halaman
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearAllImages}
                className="min-h-[44px] px-3 py-2 rounded-lg border-2 border-black bg-white hover:bg-neutral-100 text-black font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus Semua</span>
              </button>

              <button
                type="button"
                onClick={initiateDownloadFlow}
                disabled={isGenerating}
                className="min-h-[44px] px-5 py-2 rounded-lg border-2 border-black bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengekspor...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 stroke-[2.5]" />
                    <span>Unduh PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ─── 4A. PANEL PRATINJAU REAL-TIME LEMBAR DOKUMEN PDF (WYSIWYG) ─── */}
          <div className={`${previewTab === 'edit' ? 'hidden sm:block' : 'block'} rounded-xl border-2 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_#000000]`}>
            
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-black" />
                <h3 className="text-xs sm:text-sm font-extrabold uppercase font-mono tracking-wider">
                  Pratinjau Lembar Kerja PDF (Halaman {previewPageIndex + 1} dari {images.length})
                </h3>
              </div>

              {/* Kontrol Navigasi Pratinjau */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMarginGuide(!showMarginGuide)}
                  className={`px-2.5 py-1 rounded border border-black text-[11px] font-bold cursor-pointer ${
                    showMarginGuide ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                  title="Tampilkan batas margin dokumen"
                >
                  Panduan Margin
                </button>

                <div className="flex items-center border-2 border-black rounded-lg overflow-hidden">
                  <button
                    type="button"
                    disabled={previewPageIndex === 0}
                    onClick={() => setPreviewPageIndex(prev => Math.max(0, prev - 1))}
                    className="p-1.5 bg-white hover:bg-neutral-100 disabled:opacity-30 border-r border-black cursor-pointer"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-neutral-100 text-xs font-mono font-bold">
                    {previewPageIndex + 1} / {images.length}
                  </span>
                  <button
                    type="button"
                    disabled={previewPageIndex === images.length - 1}
                    onClick={() => setPreviewPageIndex(prev => Math.min(images.length - 1, prev + 1))}
                    className="p-1.5 bg-white hover:bg-neutral-100 disabled:opacity-30 border-l border-black cursor-pointer"
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* AREA LEMBAR DOKUMEN SIMULASI A4 */}
            <div className="w-full flex items-center justify-center p-2 sm:p-6 bg-neutral-100 rounded-lg border border-black/30 overflow-auto">
              {activeItem && (
                <div 
                  className={`bg-white border-2 border-black shadow-[4px_4px_0px_#000000] relative flex flex-col justify-between transition-all duration-150 ${
                    pageOrientation === 'p' 
                      ? 'w-full max-w-[340px] sm:max-w-[420px] aspect-[1/1.414]' 
                      : 'w-full max-w-[500px] sm:max-w-[620px] aspect-[1.414/1]'
                  }`}
                  style={{
                    padding: `${(pageMargin / 210) * 100}%`
                  }}
                >
                  {/* Garis Panduan Margin */}
                  {showMarginGuide && (
                    <div className="absolute inset-0 border border-dashed border-neutral-300 pointer-events-none m-[5%]" />
                  )}

                  {/* Isi Konten Halaman: Foto & Teks */}
                  <div className={`w-full h-full flex flex-col justify-center ${
                    activeItem.photoAlign === 'left' ? 'items-start text-left' :
                    activeItem.photoAlign === 'right' ? 'items-end text-right' :
                    'items-center text-center'
                  } ${
                    activeItem.photoGap === 4 ? 'gap-1' :
                    activeItem.photoGap === 14 ? 'gap-3.5' :
                    'gap-2'
                  }`}>
                    
                    {/* Teks Posisi di Atas Foto */}
                    {activeItem.text && activeItem.textPosition === 'above' && (
                      <div className={`w-full overflow-hidden ${
                        activeItem.fontFamily === 'times' ? 'font-serif' :
                        activeItem.fontFamily === 'courier' ? 'font-mono' :
                        'font-sans'
                      } ${activeItem.isBold ? 'font-bold' : 'font-normal'} ${activeItem.isItalic ? 'italic' : 'not-italic'}`}
                      style={{
                        textAlign: activeItem.textAlign,
                        lineHeight: activeItem.lineHeight || 1.35
                      }}>
                        <p className={`whitespace-pre-wrap break-words ${
                          activeItem.fontSize === 10 ? 'text-[9px]' :
                          activeItem.fontSize === 12 ? 'text-[11px]' :
                          activeItem.fontSize === 14 ? 'text-xs' :
                          activeItem.fontSize === 18 ? 'text-sm font-bold' :
                          'text-base font-black'
                        }`}>
                          {activeItem.text}
                        </p>
                      </div>
                    )}

                    {/* Foto */}
                    <div className={`flex items-center justify-center overflow-hidden ${
                      activeItem.photoScale === 'fill' ? 'w-full max-h-[65%]' :
                      activeItem.photoScale === 'compact' ? 'w-[75%] max-h-[50%]' :
                      'max-w-full max-h-[60%]'
                    } ${
                      activeItem.photoBorder === 'thin' ? 'border border-black' :
                      activeItem.photoBorder === 'brutal' ? 'border-2 border-black shadow-[2px_2px_0px_#000000]' :
                      ''
                    }`}>
                      <img 
                        src={activeItem.previewUrl} 
                        alt={activeItem.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Teks Posisi di Bawah Foto (Default) */}
                    {activeItem.text && activeItem.textPosition !== 'above' && (
                      <div className={`w-full overflow-hidden ${
                        activeItem.fontFamily === 'times' ? 'font-serif' :
                        activeItem.fontFamily === 'courier' ? 'font-mono' :
                        'font-sans'
                      } ${activeItem.isBold ? 'font-bold' : 'font-normal'} ${activeItem.isItalic ? 'italic' : 'not-italic'}`}
                      style={{
                        textAlign: activeItem.textAlign,
                        lineHeight: activeItem.lineHeight || 1.35
                      }}>
                        <p className={`whitespace-pre-wrap break-words ${
                          activeItem.fontSize === 10 ? 'text-[9px]' :
                          activeItem.fontSize === 12 ? 'text-[11px]' :
                          activeItem.fontSize === 14 ? 'text-xs' :
                          activeItem.fontSize === 18 ? 'text-sm font-bold' :
                          'text-base font-black'
                        }`}>
                          {activeItem.text}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Footer Nomor Halaman */}
                  {showPageNumbers && (
                    <div className="w-full text-center text-[9px] font-mono text-neutral-500 pt-1 border-t border-neutral-200 mt-1">
                      Halaman {previewPageIndex + 1} dari {images.length}
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Strip Mini Thumbnail Halaman untuk Navigasi Cepat */}
            <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1">
              {images.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPreviewPageIndex(idx)}
                  className={`w-14 h-16 rounded border-2 shrink-0 p-1 bg-white flex flex-col items-center justify-between cursor-pointer transition-all ${
                    previewPageIndex === idx ? 'border-black shadow-[2px_2px_0px_#000000] scale-105' : 'border-neutral-300 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={item.previewUrl} alt={item.name} className="w-full h-8 object-contain" />
                  <span className="text-[9px] font-mono font-bold text-black">
                    Hal {idx + 1}
                  </span>
                </button>
              ))}
            </div>

          </div>

          {/* ─── 4B. DAFTAR FORM EDIT TATA LETAK & TIPOGRAFI PER FOTO ─── */}
          <div className={`${previewTab === 'preview' ? 'hidden sm:block' : 'block'} space-y-4`}>
            {images.map((item, index) => (
              <div 
                key={item.id}
                id={`page_card_${index}`}
                className={`rounded-xl border-2 border-black bg-white p-4 sm:p-5 shadow-[3px_3px_0px_#000000] flex flex-col gap-4 transition-all ${
                  previewPageIndex === index ? 'ring-2 ring-black' : ''
                }`}
              >
                
                {/* Header Kartu Halaman */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded border border-black bg-black text-white font-mono font-bold text-xs">
                      Halaman {index + 1}
                    </span>
                    <span className="text-xs font-bold truncate max-w-[180px] sm:max-w-xs text-black" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 hidden sm:inline">
                      ({item.width} × {item.height} px • {item.sizeKb} KB)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewPageIndex(index)}
                      className="px-2 py-1 rounded border border-black bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-black flex items-center gap-1 cursor-pointer"
                      title="Lihat halaman ini di pratinjau"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Pratinjau</span>
                    </button>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveImage(index, -1)}
                      className="p-1.5 rounded border border-black bg-white hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                      title="Pindahkan ke halaman sebelumnya"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => moveImage(index, 1)}
                      className="p-1.5 rounded border border-black bg-white hover:bg-neutral-100 disabled:opacity-30 cursor-pointer"
                      title="Pindahkan ke halaman berikutnya"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="p-1.5 rounded border border-black bg-white hover:bg-neutral-200 text-black cursor-pointer ml-1"
                      title="Hapus foto ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* DUA BAGIAN TERPISAH: TATA LETAK FOTO & TIPOGRAFI TEKS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* ─── KELOMPOK 1: PENGATURAN TATA LETAK FOTO ─── */}
                  <div className="p-3.5 rounded-lg border-2 border-black bg-neutral-50 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-black/20">
                      <div className="flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-black" />
                        <h4 className="text-xs font-extrabold uppercase font-mono text-black">
                          Tata Letak Foto
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Visual & Posisi
                      </span>
                    </div>

                    {/* Skala Ukuran Foto */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 mb-1">
                        Ukuran Foto di Halaman
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'fit', label: 'Pas Halaman' },
                          { id: 'fill', label: 'Lebar Penuh' },
                          { id: 'compact', label: 'Kompak 75%' }
                        ].map(scale => (
                          <button
                            key={scale.id}
                            type="button"
                            onClick={() => updateImageField(item.id, 'photoScale', scale.id)}
                            className={`py-1 px-1.5 rounded text-[11px] font-bold border border-black cursor-pointer transition-all ${
                              item.photoScale === scale.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                            }`}
                          >
                            {scale.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Perataan Foto */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 mb-1">
                        Perataan Posisi Foto
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'left', label: 'Kiri' },
                          { id: 'center', label: 'Tengah' },
                          { id: 'right', label: 'Kanan' }
                        ].map(align => (
                          <button
                            key={align.id}
                            type="button"
                            onClick={() => updateImageField(item.id, 'photoAlign', align.id)}
                            className={`py-1 px-1.5 rounded text-[11px] font-bold border border-black cursor-pointer transition-all ${
                              item.photoAlign === align.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                            }`}
                          >
                            {align.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bingkai Foto & Spasi Gap */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 mb-1">
                          Bingkai Garis Foto
                        </label>
                        <select
                          value={item.photoBorder}
                          onChange={(e) => updateImageField(item.id, 'photoBorder', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-black bg-white text-[11px] font-bold cursor-pointer outline-none"
                        >
                          <option value="none">Tanpa Garis</option>
                          <option value="thin">Garis Tipis (1px)</option>
                          <option value="brutal">Bingkai Tebal</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 mb-1">
                          Jarak Foto & Teks
                        </label>
                        <select
                          value={item.photoGap}
                          onChange={(e) => updateImageField(item.id, 'photoGap', Number(e.target.value))}
                          className="w-full px-2 py-1 rounded border border-black bg-white text-[11px] font-bold cursor-pointer outline-none"
                        >
                          <option value={4}>Rapat (4 mm)</option>
                          <option value={8}>Standar (8 mm)</option>
                          <option value={14}>Renggang (14 mm)</option>
                        </select>
                      </div>
                    </div>

                    {/* Posisi Teks Terhadap Foto */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 mb-1">
                        Posisi Teks Keterangan
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateImageField(item.id, 'textPosition', 'below')}
                          className={`py-1 px-2 rounded text-[11px] font-bold border border-black cursor-pointer ${
                            item.textPosition === 'below' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                          }`}
                        >
                          Di Bawah Foto
                        </button>
                        <button
                          type="button"
                          onClick={() => updateImageField(item.id, 'textPosition', 'above')}
                          className={`py-1 px-2 rounded text-[11px] font-bold border border-black cursor-pointer ${
                            item.textPosition === 'above' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                          }`}
                        >
                          Di Atas Foto
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* ─── KELOMPOK 2: PENGATURAN TIPOGRAFI & TULISAN ─── */}
                  <div className="p-3.5 rounded-lg border-2 border-black bg-neutral-50 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-black/20">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-black" />
                        <h4 className="text-xs font-extrabold uppercase font-mono text-black">
                          Tipografi & Tulisan
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Font & Gaya
                      </span>
                    </div>

                    {/* Grup Font & Ukuran */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 mb-1">
                          Grup Font (Family)
                        </label>
                        <select
                          value={item.fontFamily}
                          onChange={(e) => updateImageField(item.id, 'fontFamily', e.target.value)}
                          className="w-full px-2 py-1 rounded border border-black bg-white text-[11px] font-bold cursor-pointer outline-none"
                        >
                          <option value="helvetica">Modern Sans</option>
                          <option value="times">Formal Serif</option>
                          <option value="courier">Clean Mono</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-neutral-600 mb-1">
                          Ukuran Teks
                        </label>
                        <select
                          value={item.fontSize}
                          onChange={(e) => updateImageField(item.id, 'fontSize', Number(e.target.value))}
                          className="w-full px-2 py-1 rounded border border-black bg-white text-[11px] font-mono font-bold cursor-pointer outline-none"
                        >
                          <option value={10}>10 pt (Kecil)</option>
                          <option value={12}>12 pt (Normal)</option>
                          <option value={14}>14 pt (Subjudul)</option>
                          <option value={18}>18 pt (Judul)</option>
                          <option value={22}>22 pt (Besar)</option>
                        </select>
                      </div>
                    </div>

                    {/* Toolbar Gaya Teks: Bold, Italic, Perataan */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateImageField(item.id, 'isBold', !item.isBold)}
                          className={`p-1.5 rounded border border-black cursor-pointer ${
                            item.isBold ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                          }`}
                          title="Tebalkan Teks (Bold)"
                        >
                          <Bold className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => updateImageField(item.id, 'isItalic', !item.isItalic)}
                          className={`p-1.5 rounded border border-black cursor-pointer ${
                            item.isItalic ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                          }`}
                          title="Miringkan Teks (Italic)"
                        >
                          <Italic className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateImageField(item.id, 'textAlign', 'left')}
                          className={`p-1.5 rounded border border-black cursor-pointer ${
                            item.textAlign === 'left' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                          }`}
                          title="Rata Kiri"
                        >
                          <AlignLeft className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => updateImageField(item.id, 'textAlign', 'center')}
                          className={`p-1.5 rounded border border-black cursor-pointer ${
                            item.textAlign === 'center' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                          }`}
                          title="Rata Tengah"
                        >
                          <AlignCenter className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => updateImageField(item.id, 'textAlign', 'right')}
                          className={`p-1.5 rounded border border-black cursor-pointer ${
                            item.textAlign === 'right' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                          }`}
                          title="Rata Kanan"
                        >
                          <AlignRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => updateImageField(item.id, 'textAlign', 'justify')}
                          className={`p-1.5 rounded border border-black cursor-pointer ${
                            item.textAlign === 'justify' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                          }`}
                          title="Rata Kiri Kanan"
                        >
                          <AlignJustify className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Area Input Teks */}
                    <div>
                      <textarea
                        rows={2}
                        value={item.text}
                        onChange={(e) => updateImageField(item.id, 'text', e.target.value)}
                        placeholder="Ketik judul atau keterangan teks untuk foto ini (opsional)..."
                        className={`w-full p-2.5 rounded-lg border-2 border-black bg-white text-black text-xs outline-none focus:ring-2 focus:ring-black placeholder:text-neutral-400 ${
                          item.fontFamily === 'times' ? 'font-serif' : item.fontFamily === 'courier' ? 'font-mono' : 'font-sans'
                        } ${item.isBold ? 'font-bold' : 'font-normal'} ${item.isItalic ? 'italic' : 'not-italic'}`}
                        style={{ textAlign: item.textAlign === 'justify' ? 'left' : item.textAlign }}
                      />
                    </div>

                  </div>

                </div>

                {/* Tombol Terapkan ke Semua Halaman */}
                <div className="flex items-center justify-between pt-2 border-t border-black/15 text-xs">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Status: {item.text.trim() ? `${item.text.trim().length} karakter` : 'Hanya foto'}
                  </span>

                  <button
                    type="button"
                    onClick={() => applyStyleToAllPages(item)}
                    className="px-3 py-1.5 rounded border border-black bg-white hover:bg-black hover:text-white text-black text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Terapkan font dan tata letak halaman ini ke seluruh foto lainnya"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Terapkan Gaya Ini ke Semua Halaman</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* ─── 5. FLOATING BAR / BOTTOM ACTION UNTUK EKSPOR ─── */}
          <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
            <div className="flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4 text-black" />
              <span className="font-semibold">
                Siap mengekspor {images.length} halaman PDF format A4 ({pageOrientation === 'p' ? 'Potret' : 'Lanskap'}).
              </span>
            </div>

            <button
              type="button"
              onClick={initiateDownloadFlow}
              disabled={isGenerating}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-lg border-2 border-black bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{generationProgress || 'Memproses PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 stroke-[2.5]" />
                  <span>Unduh Dokumen PDF Sekarang</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* ─── MODAL KONFIRMASI NAMA BERKAS PDF & UNDUH UNIVERSAL (CLEAN NEOBRUTALISM) ─── */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fadeIn">
          <div className="w-full max-w-md rounded-xl p-6 bg-white border-2 border-black shadow-[6px_6px_0px_#000000] text-black">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 stroke-[2.5]" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  Simpan Dokumen PDF
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNameModal(false)}
                className="p-1.5 rounded border border-black hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Form Nama File */}
            <form onSubmit={(e) => {
              e.preventDefault();
              processAndDownloadPdf(pdfDownloadName);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-neutral-600 mb-1.5">
                  Beri Nama Dokumen PDF Anda
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={pdfDownloadName}
                    onChange={(e) => setPdfDownloadName(e.target.value)}
                    placeholder="Nama_Dokumen"
                    autoFocus
                    className="w-full pl-3.5 pr-16 py-2.5 rounded-lg border-2 border-black bg-white text-black text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-black shadow-[1.5px_1.5px_0px_#000000]"
                  />
                  <span className="absolute right-2 px-2 py-1 rounded bg-black text-white font-mono text-[10px] font-bold">
                    .pdf
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Mendukung download di semua merk HP (Android, iPhone/iOS) dan Laptop/PC.
                </p>
              </div>

              {/* Ringkasan Konversi */}
              <div className="p-3 rounded-lg border border-black bg-neutral-50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-neutral-600">Total Halaman:</span>
                  <span className="font-bold">{images.length} Lembar A4</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-neutral-600">Orientasi:</span>
                  <span className="font-bold">{pageOrientation === 'p' ? 'Potret (Tegak)' : 'Lanskap (Mendatar)'}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-neutral-600">Margin Sisi:</span>
                  <span className="font-bold">{pageMargin} mm</span>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNameModal(false)}
                    className="min-h-[44px] flex-1 py-2.5 rounded-lg border-2 border-black bg-white hover:bg-neutral-100 text-xs font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="min-h-[44px] flex-1 py-2.5 rounded-lg border-2 border-black bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-bold text-xs shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{generationProgress || 'Membuat PDF...'}</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Unduh .PDF Sekarang</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tombol Alternatif Khusus HP / iOS Safari */}
                {generatedBlobUrl && (
                  <a
                    href={generatedBlobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] w-full py-2.5 rounded-lg border-2 border-black bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-[1.5px_1.5px_0px_#000000] cursor-pointer"
                    title="Buka PDF di tab baru untuk disimpan langsung ke file HP"
                  >
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Buka PDF di Tab Baru (Khusus HP / iPhone)</span>
                  </a>
                )}
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg bg-black text-white border-2 border-black text-xs font-bold font-mono shadow-[4px_4px_0px_#000000] flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-white stroke-[3]" />
          <span>{downloadSuccessToast}</span>
        </div>
      )}

    </main>
  );
}
