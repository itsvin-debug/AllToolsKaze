import React, { useState } from 'react';
import CosmicBackButton from './CosmicBackButton';
import { 
  ArrowLeft, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Radio, 
  Sparkles, 
  ExternalLink, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  Smile,
  Copy,
  Check
} from 'lucide-react';

export default function ChannelReactScreen({ onBack, theme = 'dark' }) {
  const [channelLink, setChannelLink] = useState('');
  const [messageLink, setMessageLink] = useState('');
  const [selectedEmojis, setSelectedEmojis] = useState(['🔥', '❤️']);
  const [targetCount, setTargetCount] = useState(100);
  const [customKey, setCustomKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Hasil eksekusi real-time
  const [outputData, setOutputData] = useState(null);

  const emojiOptions = [
    { emoji: '🔥', label: 'Api' },
    { emoji: '❤️', label: 'Cinta' },
    { emoji: '👍', label: 'Jempol' },
    { emoji: '😂', label: 'Tertawa' },
    { emoji: '😮', label: 'Kaget' },
    { emoji: '😢', label: 'Sedih' },
    { emoji: '🙏', label: 'Doa' },
    { emoji: '⚡', label: 'Kilat' },
    { emoji: '🎉', label: 'Pesta' },
    { emoji: '🚀', label: 'Roket' }
  ];

  const isDark = theme === 'dark';

  const toggleEmoji = (emoji) => {
    setSelectedEmojis(prev => {
      if (prev.includes(emoji)) {
        if (prev.length === 1) return prev; // Minimal 1 emoji terpilih
        return prev.filter(e => e !== emoji);
      } else {
        return [...prev, emoji];
      }
    });
  };

  const handleSelectAllEmojis = () => {
    setSelectedEmojis(emojiOptions.map(e => e.emoji));
  };

  const handleResetEmojis = () => {
    setSelectedEmojis(['🔥']);
  };

  const handleAutofillKazeChannel = () => {
    setChannelLink('https://whatsapp.com/channel/0029VbDfI32EAKWIfTviOv3I');
    setMessageLink('https://whatsapp.com/channel/0029VbDfI32EAKWIfTviOv3I/102');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!channelLink.trim() && !messageLink.trim()) {
      setError('Masukkan link saluran WhatsApp atau link pesan saluran.');
      return;
    }

    if (selectedEmojis.length === 0) {
      setError('Pilih minimal satu emoji reaksi.');
      return;
    }

    const safeCount = Math.min(1000, Math.max(1, parseInt(targetCount, 10) || 100));

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5001/api/channel-react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelLink: channelLink.trim(),
          messageLink: messageLink.trim(),
          reactions: selectedEmojis,
          targetCount: safeCount,
          customKey: customKey.trim()
        })
      });

      const json = await res.json();
      if (json.data) {
        setOutputData(json.data);
      } else {
        setError(json.message || 'Gagal mengirim reaksi saluran.');
      }
    } catch (err) {
      setError('Gagal menghubungi backend: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTarget = () => {
    if (outputData?.targetUrl) {
      navigator.clipboard.writeText(outputData.targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="flex-grow relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Tombol Kembali */}
      <div className="mb-6">
        <CosmicBackButton onClick={onBack} label="Kembali ke Beranda" />
      </div>

      {/* Header Card Fitur Saluran WA React */}
      <div className={`rounded-3xl p-6 sm:p-7 border mb-6 transition-all ${
        isDark ? 'bg-[#12151f] border-white/10 shadow-xl' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <MessageCircle className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
                React Saluran WhatsApp Real-Time
              </h1>
              <p className="text-xs text-slate-400">
                Kirim reaksi emoji ke pesan saluran WA secara instan menggunakan endpoint aman di server.
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>REAL-TIME API</span>
          </span>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Input 1: Link Saluran WhatsApp */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Link Saluran WhatsApp
              </label>
              <button
                type="button"
                onClick={handleAutofillKazeChannel}
                className="text-[10px] text-emerald-400 hover:underline font-mono cursor-pointer"
              >
                Gunakan Saluran Kaze ⚡
              </button>
            </div>
            <input
              type="text"
              value={channelLink}
              onChange={(e) => {
                setChannelLink(e.target.value);
                setError('');
              }}
              placeholder="Contoh: https://whatsapp.com/channel/0029VbDfI32EAKWIfTviOv3I"
              className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm border outline-none transition-all ${
                isDark 
                  ? 'bg-[#090b12] border-white/10 text-white placeholder-slate-500 focus:border-emerald-400/60' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Input 2: Link Pesan Saluran / ID Pesan */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Link Pesan Saluran atau ID Pesan
            </label>
            <input
              type="text"
              value={messageLink}
              onChange={(e) => {
                setMessageLink(e.target.value);
                setError('');
              }}
              placeholder="Contoh: https://whatsapp.com/channel/0029VbDfI32EAKWIfTviOv3I/100 (atau ketik ID: 100)"
              className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm border outline-none transition-all ${
                isDark 
                  ? 'bg-[#090b12] border-white/10 text-white placeholder-slate-500 focus:border-emerald-400/60' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* Pemilihan Emoji (Multi-Select) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilih Emoji Reaksi ({selectedEmojis.length} dipilih)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllEmojis}
                  className="text-[10px] text-cyan-400 hover:underline font-mono cursor-pointer"
                >
                  Pilih Semua
                </button>
                <span className="text-slate-600 text-[10px]">•</span>
                <button
                  type="button"
                  onClick={handleResetEmojis}
                  className="text-[10px] text-slate-400 hover:underline font-mono cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {emojiOptions.map((opt) => {
                const isSelected = selectedEmojis.includes(opt.emoji);
                return (
                  <button
                    type="button"
                    key={opt.emoji}
                    onClick={() => toggleEmoji(opt.emoji)}
                    className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 shadow-md shadow-emerald-500/20 scale-105'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 opacity-70'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{opt.emoji}</span>
                    <span className={`text-[9px] font-mono mt-0.5 ${isSelected ? 'text-emerald-300 font-bold' : 'text-slate-400'}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input 3: Jumlah Emoji yang Dikirim (1 - 1000 Reaksi) */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Jumlah Emoji yang Dikirim (1 - 1000)</span>
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {targetCount} Reaksi / Emoji
              </span>
            </div>

            {/* Input Number */}
            <div className="relative mb-2.5">
              <input
                type="number"
                min="1"
                max="1000"
                value={targetCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val)) setTargetCount('');
                  else setTargetCount(Math.min(1000, Math.max(1, val)));
                }}
                onBlur={() => {
                  if (!targetCount || targetCount < 1) setTargetCount(1);
                  else if (targetCount > 1000) setTargetCount(1000);
                }}
                placeholder="Masukkan jumlah 1 - 1000"
                className={`w-full px-4 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold border outline-none transition-all ${
                  isDark 
                    ? 'bg-[#090b12] border-white/10 text-emerald-400 placeholder-slate-500 focus:border-emerald-400' 
                    : 'bg-white border-slate-300 text-emerald-600 placeholder-slate-400 focus:border-emerald-500'
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 pointer-events-none">
                Target: {targetCount || 1} Reaksi
              </div>
            </div>

            {/* Preset Tombol Cepat (10, 50, 100, 250, 500, 1000) */}
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <span className="text-[10px] text-slate-500 font-mono mr-1">Preset Cepat:</span>
              {[10, 50, 100, 250, 500, 1000].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setTargetCount(cnt)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                    targetCount === cnt
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-sm shadow-emerald-500/30'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>

            {/* Kalkulasi Total Distribusi */}
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Distribusi Reaksi:</span>
              <span className="text-emerald-300 font-semibold">
                {targetCount || 1} reaksi × {selectedEmojis.length} emoji = <b className="text-emerald-400 font-bold">{(targetCount || 1) * selectedEmojis.length} Total Reaksi</b>
              </span>
            </div>
          </div>

          {/* Opsi Custom API Key (Opsional, bawaan server mengambil dari .env) */}
          <div className="pt-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowKeyInput(prev => !prev)}
                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>{showKeyInput ? 'Sembunyikan Opsi API Key' : 'Atur API Key Kustom (Opsional)'}</span>
              </button>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Key Server .env: <b>RS-7KIn*8m!</b></span>
              </span>
            </div>

            {showKeyInput && (
              <div className="mt-2 p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="Masukkan API Key alternatif (default: RS-7KIn*8m!)"
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400 font-mono">
                  Default API Key Nexa <b className="text-emerald-400">RS-7KIn*8m!</b> telah aktif di server (.env) dan langsung digunakan untuk mengirim reaksi.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tombol Submit Eksekusi */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black shadow-lg shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Mengirim {(targetCount || 1) * selectedEmojis.length} Reaksi Real-Time...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 fill-black" />
                <span>Kirim {(targetCount || 1) * selectedEmojis.length} Reaksi ke Saluran Sekarang</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* HASIL OUTPUT REAL-TIME REAKSI SALURAN */}
      {outputData && (
        <div className={`rounded-3xl p-6 border transition-all animate-fadeIn ${
          isDark ? 'bg-[#12151f] border-white/10 shadow-xl' : 'bg-white border-slate-200 shadow-md'
        }`}>
          {/* Header Hasil */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-sm sm:text-base font-extrabold font-mono text-white">
                Hasil Output Real-Time Saluran
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
                Total: {outputData.totalReactions || (targetCount * selectedEmojis.length)} Reaksi
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold">
                ID Pesan: #{outputData.messageId}
              </span>
            </div>
          </div>

          {/* Target URL Info */}
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-2 mb-4 font-mono text-xs">
            <div className="truncate text-slate-300">
              <span className="text-slate-500 mr-1.5">Target:</span>
              <span className="text-cyan-300">{outputData.targetUrl}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyTarget}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 shrink-0 cursor-pointer"
              title="Salin Target URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Banner Peringatan jika Nexa API gagal / Limit habis */}
          {!outputData.success && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-200">
                  Laporan Server Nexa: {outputData.overallMessage || 'Limit API Key Tidak Cukup'}
                </p>
                <p className="text-xs text-amber-300/80 leading-relaxed">
                  Key server bawaan (.env) sedang mencapai batas kuota harian di NexaDev. Silakan tempel API Key Nexa baru milik Anda pada menu <strong>"Atur API Key Kustom"</strong> di atas untuk langsung mengirim reaksi ke saluran WhatsApp.
                </p>
              </div>
            </div>
          )}

          {/* Grid Status Per-Emoji */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {outputData.results?.map((res, idx) => (
              <div 
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  res.success 
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm shadow-emerald-500/10' 
                    : 'bg-rose-500/10 border-rose-500/30 shadow-sm shadow-rose-500/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl select-none">{res.emoji}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold font-mono ${res.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {res.status || (res.success ? 'Success' : 'Failed')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({res.responseTime})
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        res.success 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {res.success ? `+${res.count || targetCount}` : 'Gagal'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                      {res.message}
                    </p>
                  </div>
                </div>

                {res.success ? (
                  <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                ) : (
                  <div className="p-1 rounded-full bg-rose-500/20 text-rose-400 shrink-0">
                    <XCircle className="w-5 h-5 text-rose-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Status Message Footer */}
          <div className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between flex-wrap gap-2 ${
            outputData.success 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {outputData.success ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{outputData.overallMessage || 'Proses pengiriman selesai.'}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {new Date(outputData.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
