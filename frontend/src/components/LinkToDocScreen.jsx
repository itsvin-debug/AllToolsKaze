import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { 
  FileText, 
  Presentation, 
  ArrowLeft, 
  Link as LinkIcon, 
  Clipboard, 
  Sparkles, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Loader2
} from 'lucide-react';

export default function LinkToDocScreen({ onBack }) {
  const [url, setUrl] = useState('');
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Paste dari clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text.trim());
    } catch {
      // fallback
    }
  };

  // Ekstrak dokumen dari URL
  const handleExtract = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMessage('Silakan tempel tautan dokumen terlebih dahulu.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setDocData(null);
    setStatusMessage('Menghubungkan ke sumber dokumen...');

    try {
      const res = await axios.post('/api/link-to-doc', { url: url.trim() });
      if (res.data && res.data.success) {
        setDocData(res.data.data);
        setActivePageIndex(0);
      } else {
        setErrorMessage(res.data?.message || 'Gagal mengekstrak isi dokumen.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Terjadi kesalahan saat memproses tautan.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  // 1. Generate & Download PDF
  const handleDownloadPDF = async () => {
    if (!docData || !docData.pages) return;
    setGenerating(true);
    setStatusMessage('Menyusun dokumen PDF berkualitas tinggi...');

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const title = docData.title || 'Dokumen Kaze';
      const pages = docData.pages;

      // Halaman Judul (Cover Page)
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 297, 'F');
      
      doc.setTextColor(56, 189, 248);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      const splitTitle = doc.splitTextToSize(title, 170);
      doc.text(splitTitle, 20, 80);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Sumber: ${docData.source?.toUpperCase() || 'WEB'}`, 20, 110);
      doc.text(`Total Halaman: ${pages.length} Halaman`, 20, 118);
      doc.text(`Dikonversi dengan website download by kaze`, 20, 260);

      // Render setiap lembar
      for (let i = 0; i < pages.length; i++) {
        doc.addPage();
        const p = pages[i];

        // Header halaman
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`${title.slice(0, 50)}...`, 20, 15);
        doc.line(20, 18, 190, 18);

        // Nomor Halaman
        doc.text(`Halaman ${i + 1} dari ${pages.length}`, 160, 285);

        // Jika ada judul halaman
        if (p.title) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          const splitPTitle = doc.splitTextToSize(p.title, 170);
          doc.text(splitPTitle, 20, 30);
        }

        // Isi Teks
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        const bodyY = p.title ? 45 : 30;
        const splitText = doc.splitTextToSize(p.text || '', 170);
        doc.text(splitText, 20, bodyY);
      }

      const safeName = title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
      doc.save(`${safeName}.pdf`);
    } catch (err) {
      alert('Gagal membuat PDF: ' + err.message);
    } finally {
      setGenerating(false);
      setStatusMessage('');
    }
  };

  // 2. Generate & Download PPTX (PowerPoint)
  const handleDownloadPPT = async () => {
    if (!docData || !docData.pages) return;
    setGenerating(true);
    setStatusMessage('Memformat slide presentasi PPTX...');

    try {
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';

      const title = docData.title || 'Presentasi Dokumen';
      const pages = docData.pages;

      // 1. Slide Judul
      const slideTitle = pptx.addSlide();
      slideTitle.background = { color: '0F172A' };
      slideTitle.addText(title, {
        x: 1.0,
        y: 2.0,
        w: '80%',
        h: 1.5,
        fontSize: 32,
        bold: true,
        color: '38BDF8',
        align: 'left'
      });
      slideTitle.addText(`Sumber: ${docData.source?.toUpperCase() || 'WEB'} | ${pages.length} Slides\nDikonversi melalui kaze multi-tools`, {
        x: 1.0,
        y: 4.0,
        w: '80%',
        h: 1.0,
        fontSize: 14,
        color: '94A3B8',
        align: 'left'
      });

      // 2. Setiap Halaman menjadi 1 Slide
      pages.forEach((p, idx) => {
        const slide = pptx.addSlide();
        slide.background = { color: '0B0F19' };

        // Judul Slide
        slide.addText(p.title || `Slide ${idx + 1}`, {
          x: 0.8,
          y: 0.6,
          w: '85%',
          h: 0.8,
          fontSize: 22,
          bold: true,
          color: 'F8FAFC'
        });

        // Konten Teks
        slide.addText(p.text || '', {
          x: 0.8,
          y: 1.6,
          w: '85%',
          h: 4.8,
          fontSize: 14,
          color: 'CBD5E1',
          lineSpacing: 22,
          valign: 'top'
        });

        // Footer slide number
        slide.addText(`Slide ${idx + 1} / ${pages.length} - website download by kaze`, {
          x: 0.8,
          y: 6.8,
          w: '85%',
          h: 0.4,
          fontSize: 10,
          color: '64748B'
        });
      });

      const safeName = title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
      await pptx.writeFile({ fileName: `${safeName}.pptx` });
    } catch (err) {
      alert('Gagal membuat PPTX: ' + err.message);
    } finally {
      setGenerating(false);
      setStatusMessage('');
    }
  };

  return (
    <main className="flex-grow relative z-10 flex flex-col items-center justify-start px-4 sm:px-6 md:px-margin-desktop py-6 sm:py-10 w-full max-w-5xl mx-auto">
      
      {/* Tombol Kembali */}
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Bypass & Document Converter</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface mb-2">
          Ubah Link ke PDF & PPT
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Masukkan link Scribd (otomatis diakali tanpa akun premium), Canva view presentation, atau artikel web apa saja untuk dijadikan dokumen PDF atau slide PPT.
        </p>
      </div>

      {/* Form Input URL */}
      <div className="w-full glass-panel rounded-2xl p-5 sm:p-7 shadow-xl mb-8">
        <form onSubmit={handleExtract} className="space-y-4">
          <div className="relative flex items-center">
            <LinkIcon className="absolute left-4 w-5 h-5 text-on-surface-variant pointer-events-none" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Tempel link Scribd (scribd.com/doc/...), Canva, atau tautan web di sini..."
              className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-xl bg-surface-container-high/60 border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm sm:text-base transition-all"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant/70">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mendukung: Scribd (Bypass Paywall), Canva Slide, Medium, Blog, & Web Umum</span>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengekstrak Konten...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Ekstrak Dokumen</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Pesan Error */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading Spinner Message */}
        {loading && (
          <div className="mt-4 p-4 rounded-xl bg-surface-container/60 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm flex items-center gap-3 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Hasil Ekstraksi Dokumen & Opsi Download */}
      {docData && (
        <div className="w-full glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl animate-fadeIn space-y-6">
          
          {/* Header Info Dokumen */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Dokumen Berhasil Diekstrak ({docData.source?.toUpperCase()})</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
                {docData.title}
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Ditemukan {docData.pages?.length || 0} halaman/slide siap dikonversi.
              </p>
            </div>

            {/* Tombol Export PDF & PPT */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleDownloadPDF}
                disabled={generating}
                className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>Download PDF</span>
              </button>

              <button
                onClick={handleDownloadPPT}
                disabled={generating}
                className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Presentation className="w-4 h-4" />
                <span>Download PPTX</span>
              </button>
            </div>
          </div>

          {generating && (
            <div className="p-3 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Interactive Document Page Viewer */}
          {docData.pages && docData.pages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm text-on-surface-variant">
                <span>Preview Halaman: <strong>{activePageIndex + 1}</strong> dari <strong>{docData.pages.length}</strong></span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivePageIndex(prev => Math.max(0, prev - 1))}
                    disabled={activePageIndex === 0}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActivePageIndex(prev => Math.min(docData.pages.length - 1, prev + 1))}
                    disabled={activePageIndex === docData.pages.length - 1}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tampilan Konten Lembar Aktif */}
              <div className="p-6 sm:p-8 rounded-xl bg-surface-container/70 border border-outline-variant/30 min-h-[260px] flex flex-col justify-between">
                <div>
                  {docData.pages[activePageIndex]?.title && (
                    <h3 className="text-base sm:text-lg font-bold text-cyan-300 mb-3">
                      {docData.pages[activePageIndex].title}
                    </h3>
                  )}
                  <p className="text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-line line-clamp-10">
                    {docData.pages[activePageIndex]?.text}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-on-surface-variant/60">
                  <span>Lembar #{docData.pages[activePageIndex]?.pageNumber}</span>
                  <span>website download by kaze</span>
                </div>
              </div>

              {/* Strip Halaman */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {docData.pages.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePageIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                      activePageIndex === idx
                        ? 'bg-cyan-500 text-white shadow-md'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Hal {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </main>
  );
}
