import React, { useState } from 'react';
import CosmicBackButton from './CosmicBackButton';
import { 
  Flame, 
  Search, 
  Download, 
  Copy, 
  Check, 
  CheckCircle2, 
  Loader2, 
  Film, 
  Music, 
  ExternalLink, 
  Play, 
  Pause, 
  AlertCircle,
  FileCode,
  FolderDown,
  Sparkles,
  Link2,
  XCircle
} from 'lucide-react';

export default function JjFinderScreen({ onBack }) {
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultData, setResultData] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

  // Contoh tautan video TikTok JJ resmi untuk tombol contoh
  const sampleTikTokLinks = [
    { 
      label: 'vt.tiktok.com/ZSjPreset5MB', 
      url: 'https://vt.tiktok.com/ZSjPreset5MB/' 
    },
    { 
      label: 'vt.tiktok.com/ZSjXML916', 
      url: 'https://vt.tiktok.com/ZSjXML916/' 
    },
    { 
      label: 'vt.tiktok.com/ZSjGdrivePreset', 
      url: 'https://vt.tiktok.com/ZSjGdrivePreset/' 
    },
    { 
      label: 'tiktok.com/@alight_jj/video/7328910291', 
      url: 'https://www.tiktok.com/@alight_jj/video/7328910291' 
    }
  ];

  const handleSearch = async (e, directQuery = null) => {
    if (e) e.preventDefault();
    const targetQuery = (directQuery !== null ? directQuery : inputQuery).trim();

    if (!targetQuery) {
      setError('Masukkan tautan video TikTok JJ terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError('');
    setResultData(null);
    setIsPlayingAudio(false);
    if (audioElement) {
      audioElement.pause();
    }

    try {
      let res = await fetch('/api/jj-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetQuery })
      });

      if (res.status === 404) {
        res = await fetch('/api/jj/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: targetQuery })
        });
      }

      const contentType = res.headers.get('content-type') || '';
      let data = null;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        throw new Error(rawText || 'Format balasan server tidak sesuai.');
      }

      if (res.ok && data.success && data.data) {
        setResultData(data.data);
      } else {
        throw new Error(data.message || 'Gagal mengekstrak preset dari tautan TikTok ini.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi gangguan saat memproses tautan TikTok.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Tautan berhasil disalin');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectSample = (sampleUrl) => {
    setInputQuery(sampleUrl);
    setError('');
    handleSearch(null, sampleUrl);
  };

  const togglePlayAudio = (audioUrl) => {
    if (!audioUrl) return;

    if (isPlayingAudio && audioElement) {
      audioElement.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (audioElement && audioElement.src === audioUrl) {
      audioElement.play().then(() => setIsPlayingAudio(true)).catch(() => {});
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(audioUrl);
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => setIsPlayingAudio(false);
    audio.play().then(() => {
      setAudioElement(audio);
      setIsPlayingAudio(true);
    }).catch(() => {
      setIsPlayingAudio(false);
    });
  };

  const allTemplates = resultData?.templates || [];
  const filteredTemplates = allTemplates.filter((t) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'gdrive') return t.category === 'gdrive' || t.platform === 'Google Drive' || t.type === 'XML';
    if (activeFilter === '5mb') return t.category === '5mb' || t.platform === 'Alight Motion' || t.type === '5MB';
    return true;
  });

  const detection = resultData?.detectionSummary;

  return (
    <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-black">
      
      {/* Tombol Navigasi Kembali */}
      <div className="mb-5">
        <CosmicBackButton onClick={onBack} label="Kembali ke Beranda" />
      </div>

      {/* ─── 1. KARTU PENCARIAN & INPUT LINK TIKTOK JJ ─── */}
      <div className="rounded-xl p-5 sm:p-6 border-2 border-black bg-white shadow-[4px_4px_0px_#000000] mb-6">
        
        <div className="flex items-center gap-3 pb-3 border-b-2 border-black">
          <div className="w-10 h-10 rounded-md border-2 border-black bg-black text-white flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black tracking-tight font-display text-black">
              Cari Link JJ (Jedag-Jedug)
            </h1>
            <p className="text-xs text-neutral-600">
              Salin dan tempel tautan video TikTok JJ. Sistem mendeteksi berkas XML Google Drive, Preset 5MB Alight Motion, dan trek audio secara otomatis.
            </p>
          </div>
        </div>

        {/* Form Input Link */}
        <form onSubmit={handleSearch} className="mt-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => {
                setInputQuery(e.target.value);
                setError('');
              }}
              placeholder="Tempel tautan video TikTok JJ (contoh: https://vt.tiktok.com/...)"
              className="w-full pl-10 pr-28 py-3.5 rounded-lg border-2 border-black bg-white text-black text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-black placeholder:text-neutral-500 shadow-[2px_2px_0px_#000000]"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded border border-black bg-black text-white font-extrabold text-xs hover:bg-neutral-800 disabled:opacity-50 transition-all cursor-pointer shadow-[1px_1px_0px_#000000]"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mendeteksi...</span>
                </span>
              ) : (
                <span>Cari Preset</span>
              )}
            </button>
          </div>

          {/* Contoh Tautan TikTok */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-neutral-600 font-mono font-bold mr-1">
              Contoh Link TikTok:
            </span>
            {sampleTikTokLinks.map((sample, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleSelectSample(sample.url)}
                className="text-[10px] font-mono font-bold px-2.5 py-1.5 rounded border border-black bg-neutral-100 hover:bg-black hover:text-white transition-all cursor-pointer shadow-[1px_1px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
                title={`Pilih contoh link: ${sample.url}`}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </form>

        {/* Pesan Kesalahan */}
        {error && (
          <div className="mt-4 p-3.5 rounded-lg border-2 border-black bg-neutral-100 text-black text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ─── 2. OUTPUT HASIL DETEKSI PRESET JJ TIKTOK ─── */}
      {resultData && (
        <div className="space-y-5 animate-fadeIn">
          
          {/* Status Deteksi Isi Video TikTok */}
          <div className="rounded-xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000]">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Status Deteksi Isi JJ
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Google Drive XML */}
              <div className={`p-3 rounded-lg border-2 border-black flex items-center gap-2.5 ${
                detection?.hasGdrive ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'
              }`}>
                {detection?.hasGdrive ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] font-mono font-extrabold uppercase">Google Drive (XML)</div>
                  <div className="text-[10px] opacity-80 truncate">
                    {detection?.hasGdrive ? 'Terdeteksi di Video' : 'Tidak Disertakan'}
                  </div>
                </div>
              </div>

              {/* Preset 5MB Alight Motion */}
              <div className={`p-3 rounded-lg border-2 border-black flex items-center gap-2.5 ${
                detection?.has5mb ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'
              }`}>
                {detection?.has5mb ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] font-mono font-extrabold uppercase">Preset 5MB (Alight)</div>
                  <div className="text-[10px] opacity-80 truncate">
                    {detection?.has5mb ? 'Terdeteksi di Video' : 'Tidak Disertakan'}
                  </div>
                </div>
              </div>

              {/* Format XML */}
              <div className={`p-3 rounded-lg border-2 border-black flex items-center gap-2.5 ${
                detection?.hasXml ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'
              }`}>
                {detection?.hasXml ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] font-mono font-extrabold uppercase">Format XML</div>
                  <div className="text-[10px] opacity-80 truncate">
                    {detection?.hasXml ? 'Format Siap Impor' : 'Tidak Ditemukan'}
                  </div>
                </div>
              </div>

              {/* Sound JJ MP3 */}
              <div className={`p-3 rounded-lg border-2 border-black flex items-center gap-2.5 ${
                detection?.hasAudio ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-700'
              }`}>
                {detection?.hasAudio ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] font-mono font-extrabold uppercase">Sound JJ MP3</div>
                  <div className="text-[10px] opacity-80 truncate">
                    {detection?.hasAudio ? 'Audio Tersedia' : 'Audio Nihil'}
                  </div>
                </div>
              </div>
            </div>

            {/* Pemberitahuan Bio Kreator */}
            {detection?.bioNotice && (
              <div className="mt-3 p-3 rounded-lg border border-black bg-neutral-50 flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-neutral-800">{detection.bioNotice}</span>
                {resultData.videoInfo?.profileUrl && (
                  <a
                    href={resultData.videoInfo.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded border border-black bg-white hover:bg-black hover:text-white font-mono font-bold text-[10px] shrink-0 transition-colors"
                  >
                    Buka Profil TikTok
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Ringkasan Video & Trek Audio TikTok */}
          <div className="rounded-xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row gap-5 items-start">
            
            {/* Thumbnail Video */}
            <div className="w-full md:w-44 aspect-[9/16] max-h-[200px] rounded-lg border-2 border-black bg-neutral-100 overflow-hidden relative shrink-0 mx-auto md:mx-0 shadow-[2px_2px_0px_#000000]">
              {resultData.videoInfo?.thumbnail ? (
                <img 
                  src={resultData.videoInfo.thumbnail} 
                  alt={resultData.videoInfo.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-xs font-mono font-bold">
                  <Film className="w-8 h-8 mb-1" />
                  <span>Pratinjau Video</span>
                </div>
              )}

              <span className="absolute top-2 left-2 px-2 py-0.5 rounded border border-black bg-white text-black font-mono font-bold text-[9px]">
                {resultData.videoInfo?.aspectRatio || '9:16'}
              </span>

              {resultData.videoInfo?.duration && (
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded border border-black bg-black text-white font-mono text-[9px] font-bold">
                  {resultData.videoInfo.duration}
                </span>
              )}
            </div>

            {/* Info Lengkap Video, Audio, dan Aksi */}
            <div className="flex-1 min-w-0 space-y-3 w-full">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2 py-0.5 rounded border border-black bg-black text-white font-mono text-[10px] font-bold">
                    TikTok JJ
                  </span>
                  <span className="px-2 py-0.5 rounded border border-black bg-neutral-100 text-black font-mono text-[10px] font-bold">
                    Kreator: {resultData.videoInfo?.author}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-black line-clamp-2 leading-snug font-sans">
                  {resultData.videoInfo?.title}
                </h3>
              </div>

              {/* Sound JJ Info */}
              <div className="p-3 rounded-lg border border-black bg-neutral-50 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Music className="w-4 h-4 shrink-0 text-black" />
                  <span className="font-mono font-bold truncate">
                    {resultData.videoInfo?.audioTitle || 'Sound JJ Asli'}
                  </span>
                </div>

                {resultData.videoInfo?.audioUrl && (
                  <button
                    type="button"
                    onClick={() => togglePlayAudio(resultData.videoInfo.audioUrl)}
                    className="px-3 py-1.5 rounded border border-black bg-white hover:bg-black hover:text-white font-mono text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3 h-3" />
                        <span>Jeda</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        <span>Putar</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Tombol Aksi Video & Trek Audio JJ */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {resultData.videoInfo?.audioUrl && (
                  <a
                    href={resultData.videoInfo.audioUrl}
                    download="sound_jedag_jedug.mp3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-lg border-2 border-black bg-white hover:bg-neutral-100 text-black font-bold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Unduh Sound MP3</span>
                  </a>
                )}

                {resultData.videoInfo?.videoUrl && (
                  <a
                    href={resultData.videoInfo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-lg border-2 border-black bg-black hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Unduh Video JJ</span>
                  </a>
                )}
              </div>

            </div>

          </div>

          {/* ─── 3. TAB FILTER KATEGORI PRESET ─── */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <h3 className="font-extrabold text-sm sm:text-base tracking-tight font-sans">
              Daftar Preset Terdeteksi ({filteredTemplates.length})
            </h3>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'gdrive', label: 'Google Drive XML' },
                { id: '5mb', label: 'Preset 5MB Alight' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded text-xs font-mono font-bold border border-black cursor-pointer transition-all ${
                    activeFilter === tab.id
                      ? 'bg-black text-white shadow-[1.5px_1.5px_0px_#000000]'
                      : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ─── 4. KARTU PRESET JJ YANG MENYESUAIKAN ISI ─── */}
          <div className="space-y-3">
            {filteredTemplates.map((item) => {
              const isCopied = copiedId === item.id;
              const isXML = item.type === 'XML';
              const is5MB = item.type === '5MB';
              const isGdrive = item.category === 'gdrive' || item.platform === 'Google Drive';

              return (
                <div
                  key={item.id}
                  className="rounded-xl p-4 sm:p-5 border-2 border-black bg-white shadow-[3px_3px_0px_#000000] flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
                >
                  {/* Kolom Kiri: Detail Preset */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-neutral-100 border-2 border-black flex flex-col items-center justify-center p-1 shrink-0">
                      <span className="text-xs font-mono font-black text-black">
                        {item.aspectRatio}
                      </span>
                      <span className="text-[9px] font-mono text-neutral-600 font-bold truncate max-w-full text-center">
                        {item.platform}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-extrabold text-black truncate font-sans mb-1">
                        {item.title}
                      </h4>

                      {/* Badges: Kategori, Tipe Berkas, dan Ukuran */}
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        {isXML && (
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded border border-black bg-black text-white">
                            XML
                          </span>
                        )}
                        {is5MB && (
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded border border-black bg-black text-white">
                            Preset 5MB
                          </span>
                        )}
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black bg-neutral-100 text-black">
                          {item.platform}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black bg-neutral-100 text-neutral-700">
                          {item.size}
                        </span>
                        {item.isDirectLink ? (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-black bg-white text-black">
                            Tautan di Video
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-neutral-300 bg-neutral-50 text-neutral-600">
                            Preset Terverifikasi
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {item.description}
                      </p>

                      <p className="text-[11px] font-mono text-neutral-500 truncate mt-1">
                        {item.link}
                      </p>
                    </div>
                  </div>

                  {/* Kolom Kanan: Tombol Buka/Impor dan Salin Link */}
                  <div className="flex items-center gap-2 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/15">
                    {/* Tombol Utama Buka / Impor */}
                    <a
                      href={item.downloadUrl || item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 rounded-lg text-xs font-extrabold bg-black hover:bg-neutral-800 text-white border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{is5MB ? 'Buka Alight' : (isGdrive ? 'Buka Drive' : 'Buka Tautan')}</span>
                    </a>

                    {/* Tombol Unduh Khusus XML Google Drive */}
                    {isGdrive && item.downloadUrl && (
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="px-3 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Unduh berkas XML langsung"
                      >
                        <FolderDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span className="hidden sm:inline">Unduh XML</span>
                      </a>
                    )}

                    {/* Tombol Salin Tautan */}
                    <button
                      type="button"
                      onClick={() => handleCopy(item.link, item.id)}
                      className="px-3.5 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Salin tautan preset"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-lg bg-black text-white border-2 border-black text-xs font-bold font-mono shadow-[4px_4px_0px_#000000] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

    </main>
  );
}
