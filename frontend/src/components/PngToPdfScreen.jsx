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
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Check, 
  AlertCircle, 
  Loader2, 
  Settings, 
  FileText,
  RotateCcw,
  Maximize2,
  X
} from 'lucide-react';

export default function PngToPdfScreen({ onBack }) {
  const [images, setImages] = useState([]);
  const [docTitle, setDocTitle] = useState('Kuro_Dokumen');
  const [pageOrientation, setPageOrientation] = useState('p'); // 'p' (Portrait) atau 'l' (Landscape)
  const [pageMargin, setPageMargin] = useState(15); // mm: 10 (ringkas), 15 (standar), 20 (lebar)
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Proses upload berkas foto
  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    setError('');

    const newEntries = [];
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

    if (validFiles.length === 0) {
      setError('Hanya berkas gambar (PNG, JPG, JPEG, WEBP) yang didukung.');
      return;
    }

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
            // Konfigurasi teks per foto
            text: '',
            textPosition: 'below', // 'above' | 'below'
            fontFamily: 'helvetica', // 'helvetica' (Sans), 'times' (Serif), 'courier' (Mono)
            fontSize: 12, // 10, 12, 14, 18, 22
            isBold: false,
            isItalic: false,
            textAlign: 'center' // 'left', 'center', 'right'
          });

          loadedCount++;
          if (loadedCount === validFiles.length) {
            setImages(prev => [...prev, ...newEntries]);
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

  // Hapus foto tunggal
  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // Bersihkan semua foto
  const clearAllImages = () => {
    setImages([]);
    setError('');
  };

  // Geser posisi urutan foto
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
  };

  // Perbarui properti teks pada foto tertentu
  const updateImageField = (id, field, value) => {
    setImages(prev => prev.map(img => {
      if (img.id !== id) return img;
      return { ...img, [field]: value };
    }));
  };

  // Buka modal konfirmasi nama dokumen sebelum mengunduh
  const [showNameModal, setShowNameModal] = useState(false);
  const [pdfDownloadName, setPdfDownloadName] = useState('Kuro_Dokumen');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState('');

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

  // Ekspor Dokumen PDF dengan jsPDF dan Native Blob Download
  const processAndDownloadPdf = async (customName) => {
    if (images.length === 0) {
      setError('Unggah minimal 1 gambar untuk membuat dokumen PDF.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress('Menyiapkan halaman dokumen PDF...');
    setError('');

    try {
      // Inisialisasi dokumen PDF (A4)
      const doc = new jsPDF({
        orientation: pageOrientation,
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = Number(pageMargin);
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      for (let i = 0; i < images.length; i++) {
        setGenerationProgress(`Merender halaman ${i + 1} dari ${images.length}...`);
        if (i > 0) {
          doc.addPage(pageOrientation === 'l' ? 'a4' : 'a4', pageOrientation);
        }

        const item = images[i];
        const hasText = Boolean(item.text && item.text.trim());

        // Atur gaya teks jika ada
        let textLines = [];
        let textBlockHeight = 0;
        const fontStyle = item.isBold && item.isItalic ? 'bolditalic' : item.isBold ? 'bold' : item.isItalic ? 'italic' : 'normal';

        if (hasText) {
          doc.setFont(item.fontFamily, fontStyle);
          doc.setFontSize(item.fontSize);

          // Pisahkan teks menjadi beberapa baris sesuai lebar konten
          textLines = doc.splitTextToSize(item.text.trim(), contentWidth);
          const lineHeightMm = (item.fontSize * 0.3527) * 1.25;
          textBlockHeight = (textLines.length * lineHeightMm) + 6;
        }

        // Hitung area gambar yang tersedia
        const availableImgHeight = contentHeight - textBlockHeight;
        const imgAspect = item.width / item.height;

        let renderImgWidth = contentWidth;
        let renderImgHeight = renderImgWidth / imgAspect;

        if (renderImgHeight > availableImgHeight) {
          renderImgHeight = availableImgHeight;
          renderImgWidth = renderImgHeight * imgAspect;
        }

        // Posisi horizontal gambar (rata tengah pada halaman)
        const imgX = margin + ((contentWidth - renderImgWidth) / 2);

        // Posisi vertikal berdasarkan layout posisi teks (Above atau Below)
        let imgY = margin;
        let textY = margin;

        if (hasText) {
          const totalBlockHeight = renderImgHeight + textBlockHeight;
          const startY = margin + Math.max(0, (contentHeight - totalBlockHeight) / 2);

          if (item.textPosition === 'above') {
            textY = startY + (item.fontSize * 0.3527);
            imgY = startY + textBlockHeight;
          } else {
            // Below (default)
            imgY = startY;
            textY = startY + renderImgHeight + 6 + (item.fontSize * 0.3527);
          }

          // Cetak Teks
          doc.setFont(item.fontFamily, fontStyle);
          doc.setFontSize(item.fontSize);
          doc.setTextColor(0, 0, 0);

          let textAnchorX = margin;
          if (item.textAlign === 'center') {
            textAnchorX = margin + (contentWidth / 2);
          } else if (item.textAlign === 'right') {
            textAnchorX = margin + contentWidth;
          }

          doc.text(textLines, textAnchorX, textY, { align: item.textAlign });
        } else {
          // Hanya gambar tanpa teks: letakkan tepat di tengah halaman vertikal
          imgY = margin + Math.max(0, (contentHeight - renderImgHeight) / 2);
        }

        // Render Gambar ke dalam PDF
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
      }

      setGenerationProgress('Menyimpan berkas PDF...');

      // Format nama berkas aman dan selalu berakhiran .pdf
      let targetName = (customName || docTitle || 'Kuro_Dokumen').trim();
      targetName = targetName.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
      if (!targetName) targetName = 'Kuro_Dokumen';
      if (!targetName.toLowerCase().endsWith('.pdf')) {
        targetName += '.pdf';
      }

      // 1. Ekspor via Native Blob untuk memastikan peramban selalu mengunduh dengan ekstensi .pdf
      const pdfBlob = doc.output('blob');
      const typedBlob = new Blob([pdfBlob], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(typedBlob);

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
          window.URL.revokeObjectURL(blobUrl);
        } catch {}
      }, 3000);

      // Tutup modal nama dan tampilkan notifikasi sukses
      setShowNameModal(false);
      setDocTitle(targetName.replace(/\.pdf$/i, ''));
      setDownloadSuccessToast(`Berkas ${targetName} berhasil diunduh!`);
      setTimeout(() => setDownloadSuccessToast(''), 4000);

    } catch (err) {
      setError(`Gagal membuat PDF: ${err.message || 'Terjadi kesalahan sistem.'}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  return (
    <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-black">
      
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
              Satukan banyak foto menjadi satu dokumen PDF rapi. Lengkapi setiap foto dengan teks keterangan opsional menggunakan kontrol tipografi lengkap ala Word.
            </p>
          </div>
        </div>

        {/* ─── 2. PENGATURAN GLOBAL DOKUMEN PDF ─── */}
        <div className="mt-4 pt-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Judul File PDF */}
          <div>
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
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
              Orientasi Halaman
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setPageOrientation('p')}
                className={`py-2 px-2.5 rounded-lg border-2 border-black text-xs font-bold transition-all cursor-pointer ${
                  pageOrientation === 'p' ? 'bg-black text-white shadow-[1.5px_1.5px_0px_#000000]' : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                Potret (Tegak)
              </button>
              <button
                type="button"
                onClick={() => setPageOrientation('l')}
                className={`py-2 px-2.5 rounded-lg border-2 border-black text-xs font-bold transition-all cursor-pointer ${
                  pageOrientation === 'l' ? 'bg-black text-white shadow-[1.5px_1.5px_0px_#000000]' : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                Lanskap (Mendatar)
              </button>
            </div>
          </div>

          {/* Margin Halaman */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-neutral-600 mb-1">
              Margin Sisi
            </label>
            <select
              value={pageMargin}
              onChange={(e) => setPageMargin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border-2 border-black bg-white text-xs font-semibold outline-none focus:ring-2 focus:ring-black cursor-pointer"
            >
              <option value={10}>Ringkas (10 mm)</option>
              <option value={15}>Standar (15 mm)</option>
              <option value={20}>Lebar (20 mm)</option>
            </select>
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
          Mendukung banyak gambar sekaligus (PNG, JPG, JPEG, WEBP). Gambar akan dirangkum rapi ke dalam urutan halaman PDF.
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="mt-4 px-4 py-2 rounded-lg border-2 border-black bg-black text-white font-bold text-xs shadow-[2px_2px_0px_#000000] hover:bg-neutral-800 cursor-pointer"
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

      {/* ─── 4. DAFTAR FOTO, URUTAN & KONTROL TEKS PER FOTO ─── */}
      {images.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Bar Aksi Atas */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base font-sans">
                Daftar Foto Terunggah
              </h2>
              <span className="px-2 py-0.5 rounded border border-black bg-black text-white font-mono text-[10px] font-bold">
                {images.length} Halaman
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearAllImages}
                className="px-2.5 py-1.5 rounded border border-black bg-white hover:bg-neutral-100 text-black font-mono text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus Semua</span>
              </button>

              <button
                type="button"
                onClick={initiateDownloadFlow}
                disabled={isGenerating}
                className="px-4 py-1.5 rounded border-2 border-black bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-bold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengekspor...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Unduh PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Kartu Masing-Masing Foto */}
          <div className="space-y-4">
            {images.map((item, index) => (
              <div 
                key={item.id}
                className="rounded-xl border-2 border-black bg-white p-4 sm:p-5 shadow-[3px_3px_0px_#000000] flex flex-col md:flex-row gap-5 items-start"
              >
                
                {/* Sisi Kiri: Preview Thumbnail & Tombol Urutan */}
                <div className="w-full md:w-44 flex flex-col items-center shrink-0">
                  <div className="relative w-full aspect-square rounded-lg border-2 border-black bg-neutral-100 overflow-hidden flex items-center justify-center shadow-[1.5px_1.5px_0px_#000000]">
                    <img 
                      src={item.previewUrl} 
                      alt={item.name} 
                      className="w-full h-full object-contain p-1"
                    />
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded border border-black bg-black text-white font-mono font-bold text-[10px]">
                      Halaman {index + 1}
                    </span>
                  </div>

                  {/* Info File */}
                  <div className="w-full text-center mt-2">
                    <p className="text-xs font-bold text-black truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-500">
                      {item.width} × {item.height} px • {item.sizeKb} KB
                    </p>
                  </div>

                  {/* Tombol Reordering & Hapus */}
                  <div className="flex items-center gap-1.5 mt-2.5">
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

                {/* Sisi Kanan: Input Teks & Bilah Pemformatan Bergaya Word */}
                <div className="flex-1 w-full space-y-3">
                  
                  {/* Toolbar Pemformatan Word-like */}
                  <div className="p-2.5 rounded-lg border-2 border-black bg-neutral-50 flex flex-wrap items-center gap-2">
                    
                    {/* Posisi Layout Teks */}
                    <div className="flex items-center gap-1 border-r border-black/30 pr-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 hidden sm:inline">
                        Tata Letak:
                      </span>
                      <button
                        type="button"
                        onClick={() => updateImageField(item.id, 'textPosition', 'above')}
                        className={`px-2 py-1 rounded text-[11px] font-bold border border-black cursor-pointer ${
                          item.textPosition === 'above' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                        }`}
                        title="Tampilkan teks di atas gambar"
                      >
                        Atas
                      </button>
                      <button
                        type="button"
                        onClick={() => updateImageField(item.id, 'textPosition', 'below')}
                        className={`px-2 py-1 rounded text-[11px] font-bold border border-black cursor-pointer ${
                          item.textPosition === 'below' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                        }`}
                        title="Tampilkan teks di bawah gambar"
                      >
                        Bawah
                      </button>
                    </div>

                    {/* Pemilihan Font */}
                    <div className="flex items-center gap-1 border-r border-black/30 pr-2">
                      <select
                        value={item.fontFamily}
                        onChange={(e) => updateImageField(item.id, 'fontFamily', e.target.value)}
                        className="px-2 py-1 rounded border border-black bg-white text-[11px] font-bold outline-none cursor-pointer"
                      >
                        <option value="helvetica">Sans (Helvetica)</option>
                        <option value="times">Serif (Times)</option>
                        <option value="courier">Mono (Courier)</option>
                      </select>
                    </div>

                    {/* Ukuran Font */}
                    <div className="flex items-center gap-1 border-r border-black/30 pr-2">
                      <select
                        value={item.fontSize}
                        onChange={(e) => updateImageField(item.id, 'fontSize', Number(e.target.value))}
                        className="px-2 py-1 rounded border border-black bg-white text-[11px] font-mono font-bold outline-none cursor-pointer"
                      >
                        <option value={10}>10 pt</option>
                        <option value={12}>12 pt (Normal)</option>
                        <option value={14}>14 pt</option>
                        <option value={18}>18 pt (Judul)</option>
                        <option value={22}>22 pt (Besar)</option>
                      </select>
                    </div>

                    {/* Bold & Italic Toggles */}
                    <div className="flex items-center gap-1 border-r border-black/30 pr-2">
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

                    {/* Rata Teks (Alignment) */}
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
                    </div>

                  </div>

                  {/* Input Teks Area Khusus Foto Ini */}
                  <div>
                    <textarea
                      rows={3}
                      value={item.text}
                      onChange={(e) => updateImageField(item.id, 'text', e.target.value)}
                      placeholder="Tambahkan teks judul, deskripsi, atau keterangan untuk foto ini (opsional, kosongkan jika hanya ingin menampilkan foto)..."
                      className={`w-full p-3 rounded-lg border-2 border-black bg-white text-black text-xs sm:text-sm outline-none focus:ring-2 focus:ring-black placeholder:text-neutral-400 ${
                        item.fontFamily === 'times' ? 'font-serif' : item.fontFamily === 'courier' ? 'font-mono' : 'font-sans'
                      } ${item.isBold ? 'font-bold' : 'font-normal'} ${item.isItalic ? 'italic' : 'not-italic'}`}
                      style={{ textAlign: item.textAlign }}
                    />
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1 font-mono">
                      <span>Status teks: {item.text.trim() ? `${item.text.trim().length} karakter` : 'Hanya gambar (bersih)'}</span>
                      <span>Posisi: {item.textPosition === 'above' ? 'Di Atas Foto' : 'Di Bawah Foto'}</span>
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>

          {/* ─── 5. FLOATING BAR / BOTTOM ACTION UNTUK EKSPOR ─── */}
          <div className="rounded-xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
            <div className="flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4 text-black" />
              <span className="font-semibold">
                Siap mencetak {images.length} halaman PDF format A4 ({pageOrientation === 'p' ? 'Potret' : 'Lanskap'}).
              </span>
            </div>

            <button
              type="button"
              onClick={initiateDownloadFlow}
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg border-2 border-black bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{generationProgress || 'Memproses PDF...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 stroke-[2.5]" />
                  <span>Konversi & Unduh PDF Sekarang</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* ─── MODAL KONFIRMASI NAMA BERKAS PDF (CLEAN NEOBRUTALISM) ─── */}
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
                className="p-1 rounded border border-black hover:bg-neutral-100 cursor-pointer"
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
                  Nama ini akan langsung menjadi nama berkas PDF saat diunduh ke perangkat Anda.
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
                  <span className="text-neutral-600">Margin:</span>
                  <span className="font-bold">{pageMargin} mm</span>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="flex-1 py-2.5 rounded-lg border-2 border-black bg-white hover:bg-neutral-100 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 py-2.5 rounded-lg border-2 border-black bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-bold text-xs shadow-[2px_2px_0px_#000000] flex items-center justify-center gap-1.5 cursor-pointer"
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
