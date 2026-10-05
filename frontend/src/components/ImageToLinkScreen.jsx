import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Link2, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Copy, 
  ExternalLink, 
  ArrowLeft, 
  QrCode, 
  Code, 
  Sparkles, 
  History, 
  Trash2, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function ImageToLinkScreen({ onBack }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadHistory, setUploadHistory] = useState([]);

  // Load history dari localStorage saat mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kaze_image_links_history');
      if (saved) setUploadHistory(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const saveToHistory = (item) => {
    const updated = [item, ...uploadHistory.filter(h => h.url !== item.url)].slice(0, 10);
    setUploadHistory(updated);
    try {
      localStorage.setItem('kaze_image_links_history', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearHistory = () => {
    setUploadHistory([]);
    try {
      localStorage.removeItem('kaze_image_links_history');
    } catch {
      // ignore
    }
  };

  // Handle pilih file foto
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('File yang dipilih harus berupa gambar (JPG, PNG, WebP, GIF).');
      return;
    }

    setErrorMessage('');
    setSelectedImage(file);
    setResultData(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Drop file
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('File yang didrop harus berupa gambar.');
      return;
    }

    setErrorMessage('');
    setSelectedImage(file);
    setResultData(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload ke backend
  const handleUpload = async () => {
    if (!previewUrl) return;

    setUploading(true);
    setErrorMessage('');

    try {
      const res = await axios.post('/api/upload-image', {
        imageBase64: previewUrl,
        originalName: selectedImage?.name || 'foto.png'
      });

      if (res.data && res.data.success) {
        const item = res.data.data;
        setResultData(item);
        saveToHistory({
          url: item.url,
          fileName: item.fileName,
          date: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          preview: previewUrl
        });
      } else {
        setErrorMessage(res.data?.message || 'Gagal mengubah foto menjadi tautan.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Terjadi kesalahan saat mengunggah foto.');
    } finally {
      setUploading(false);
    }
  };

  // Copy helper
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <main className="flex-grow relative z-10 flex flex-col items-center justify-start px-4 sm:px-6 md:px-margin-desktop py-6 sm:py-10 w-full max-w-4xl mx-auto">
      
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Link2 className="w-3.5 h-3.5" />
          <span>Instant Image Hosting & CDN</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-on-surface mb-2">
          Ubah Foto Menjadi Link
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Upload foto dari perangkatmu dan dapatkan URL link langsung secara instan untuk disematkan di web, Discord, WhatsApp, atau media sosial.
        </p>
      </div>

      {/* Upload Box Zone */}
      <div className="w-full glass-panel rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
        
        {/* Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            previewUrl 
              ? 'border-indigo-500/50 bg-indigo-500/5' 
              : 'border-outline-variant/40 hover:border-indigo-400/80 bg-surface-container-high/30 hover:bg-surface-container-high/50'
          }`}
          onClick={() => !previewUrl && document.getElementById('image-input-file')?.click()}
        >
          <input
            id="image-input-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {previewUrl ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="relative max-w-sm max-h-72 overflow-hidden rounded-xl border border-outline-variant/40 shadow-lg">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="font-semibold text-on-surface">{selectedImage?.name}</span>
                <span>•</span>
                <span>{(selectedImage?.size / 1024).toFixed(1)} KB</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('image-input-file')?.click();
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
              >
                Pilih foto lain
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-on-surface">
                Tarik & Lepas Foto ke Sini, atau Klik untuk Memilih
              </h3>
              <p className="text-xs text-on-surface-variant max-w-md">
                Mendukung format PNG, JPG, JPEG, WEBP, dan GIF tanpa batas waktu kadaluarsa.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        {previewUrl && !resultData && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:scale-103 active:scale-97 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Mengunggah & Membuat Link...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Jadikan Foto Sebagai Link</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

      </div>

      {/* Hasil URL Link yang Tergenerate */}
      {resultData && (
        <div className="w-full glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl animate-fadeIn space-y-6 mb-8">
          
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Foto Berhasil Diubah Jadi Link Publik!</span>
            </div>
            <a
              href={resultData.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <span>Buka Gambar Asli</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 1. Direct URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Direct Link Gambar (URL Langsung)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={resultData.url}
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-high text-xs sm:text-sm text-cyan-300 font-mono select-all border border-outline-variant/30"
              />
              <button
                onClick={() => handleCopy(resultData.url, 'direct')}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  copiedField === 'direct'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {copiedField === 'direct' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'direct' ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* 2. Markdown & HTML */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Markdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-pink-400" />
                <span>Format Markdown</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={resultData.markdown}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-high text-xs text-on-surface font-mono select-all border border-outline-variant/30"
                />
                <button
                  onClick={() => handleCopy(resultData.markdown, 'markdown')}
                  className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest text-xs font-bold text-on-surface shrink-0 cursor-pointer"
                >
                  {copiedField === 'markdown' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* HTML Tag */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-amber-400" />
                <span>Format HTML Embed</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={resultData.html}
                  className="w-full px-3 py-2 rounded-lg bg-surface-container-high text-xs text-on-surface font-mono select-all border border-outline-variant/30"
                />
                <button
                  onClick={() => handleCopy(resultData.html, 'html')}
                  className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest text-xs font-bold text-on-surface shrink-0 cursor-pointer"
                >
                  {copiedField === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

          </div>

          {/* 3. QR Code Bar */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container/50 border border-outline-variant/20">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(resultData.url)}`}
              alt="QR Code"
              className="w-16 h-16 rounded-lg bg-white p-1 shrink-0"
            />
            <div>
              <h4 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>QR Code Gambar</span>
              </h4>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Scan kode QR ini di smartphone untuk langsung membuka gambar di browser HP.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Riwayat Upload Lokal */}
      {uploadHistory.length > 0 && (
        <div className="w-full glass-panel rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface uppercase tracking-wider">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Riwayat Foto Yang Pernah Diubah ke Link</span>
            </div>
            <button
              onClick={clearHistory}
              className="inline-flex items-center gap-1 text-[11px] text-error hover:underline cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Bersihkan Riwayat</span>
            </button>
          </div>

          <div className="divide-y divide-outline-variant/20">
            {uploadHistory.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="w-8 h-8 rounded-lg overflow-hidden bg-surface-container shrink-0 border border-white/10">
                    <img src={item.preview || item.url} alt="" className="w-full h-full object-cover" />
                  </span>
                  <div className="truncate">
                    <div className="font-semibold text-on-surface truncate">{item.fileName || 'Foto'}</div>
                    <div className="text-[10px] text-on-surface-variant font-mono truncate">{item.url}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(item.url, `hist_${idx}`)}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer"
                    title="Salin Link"
                  >
                    {copiedField === `hist_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface cursor-pointer"
                    title="Buka"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}
