import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Radio, 
  Hash, 
  MessageSquare, 
  Zap,
  ShieldCheck,
  Send,
  Sliders
} from 'lucide-react';

export default function WaReactCard({ theme = 'dark' }) {
  // ─── 1. Form Inputs State ───
  const [channelJid, setChannelJid] = useState('');
  const [messageId, setMessageId] = useState('');
  const [targetCount, setTargetCount] = useState(100);
  const [selectedEmoji, setSelectedEmoji] = useState('❤️');

  // ─── 2. Execution & Status State ───
  const [isRunning, setIsRunning] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 5 Pilihan Emoji Sesuai Permintaan
  const emojiOptions = [
    { emoji: '👍', name: 'Jempol' },
    { emoji: '❤️', name: 'Hati' },
    { emoji: '😂', name: 'Tertawa' },
    { emoji: '😮', name: 'Kagum' },
    { emoji: '😢', name: 'Sedih' }
  ];

  const logContainerRef = useRef(null);

  // Auto-scroll ke log paling bawah setiap ada log baru
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // ─── 3. Real-Time Polling Status Worker ───
  useEffect(() => {
    let intervalId = null;

    if (isRunning && activeJobId) {
      intervalId = setInterval(async () => {
        try {
          const res = await axios.get(`/api/wa-react/status/${activeJobId}`);
          if (res.data && res.data.success) {
            const data = res.data.data;
            setSentCount(data.sentCount);
            setProgressPercent(data.progressPercent);
            setLogs(data.logs || []);

            // Jika job selesai dari sisi backend
            if (!data.running) {
              setIsRunning(false);
              setSuccessMessage(`✓ Berhasil mengirim ${data.sentCount} reaksi ${data.emoji} ke channel!`);
              clearInterval(intervalId);
            }
          }
        } catch (err) {
          console.error('Gagal mengambil status wa-react:', err);
        }
      }, 650);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, activeJobId]);

  // ─── 4. Handler Mulai Bot Auto-React ───
  const handleStartBot = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!channelJid.trim()) {
      setErrorMessage('Channel JID wajib diisi (contoh: 120363xxx@newsletter)');
      return;
    }

    if (!messageId.trim()) {
      setErrorMessage('Message ID wajib diisi (contoh: 105 atau id pesan)');
      return;
    }

    const countNum = parseInt(targetCount, 10);
    if (isNaN(countNum) || countNum <= 0) {
      setErrorMessage('Target react harus berupa angka lebih dari 0.');
      return;
    }

    try {
      setIsRunning(true);
      setProgressPercent(0);
      setSentCount(0);
      setLogs([
        `[${new Date().toLocaleTimeString('id-ID')}] Mengirim request job ke server...`,
        `[${new Date().toLocaleTimeString('id-ID')}] Channel: ${channelJid.trim()}`,
        `[${new Date().toLocaleTimeString('id-ID')}] Target: ${countNum} react ${selectedEmoji}`
      ]);

      const res = await axios.post('/api/wa-react/start', {
        channelJid: channelJid.trim(),
        messageId: messageId.trim(),
        targetCount: countNum,
        emoji: selectedEmoji
      });

      if (res.data && res.data.success) {
        setActiveJobId(res.data.data.jobId);
      } else {
        throw new Error(res.data?.message || 'Gagal memulai auto-react.');
      }
    } catch (err) {
      console.error('Error start wa-react:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Gagal memulai bot.');
      setIsRunning(false);
    }
  };

  // ─── 5. Handler Hentikan Bot ───
  const handleStopBot = async () => {
    if (!activeJobId) {
      setIsRunning(false);
      return;
    }

    try {
      await axios.post('/api/wa-react/stop', { jobId: activeJobId });
      setIsRunning(false);
      setSuccessMessage(`Bot berhasil dihentikan. Total terkirim: ${sentCount} react.`);
    } catch (err) {
      console.error('Error stop wa-react:', err);
      setIsRunning(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`w-full max-w-xl mx-auto rounded-3xl p-5 sm:p-7 transition-all duration-300 border ${
      isDark 
        ? 'bg-[#12151f] border-white/10 shadow-2xl text-slate-100' 
        : 'bg-white border-slate-200 shadow-xl text-slate-900'
    }`}>
      
      {/* ─── Header Card ─── */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5 fill-emerald-400/20" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2">
              <span>WhatsApp Channel Auto-React</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Multi-sesi pengiriman reaksi emoji otomatis ke saluran WhatsApp
            </p>
          </div>
        </div>

        {/* Status Badge Live */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
          <span className={isRunning ? 'text-emerald-400' : 'text-slate-400'}>
            {isRunning ? 'RUNNING' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* ─── Form Input Grid ─── */}
      <form onSubmit={handleStartBot} className="space-y-4">
        
        {/* Input 1: Channel JID */}
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
            Channel JID WhatsApp
          </label>
          <div className="relative">
            <Radio className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              disabled={isRunning}
              value={channelJid}
              onChange={(e) => setChannelJid(e.target.value)}
              placeholder="120363xxx@newsletter"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none font-mono transition-all disabled:opacity-60 ${
                isDark 
                  ? 'bg-black/30 border-white/10 text-white placeholder-slate-500 focus:border-emerald-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
              }`}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            ID saluran WA (akhiran @newsletter)
          </span>
        </div>

        {/* Input 2 & 3: Message ID & Target Jumlah React */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              Message ID Pesan
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                disabled={isRunning}
                value={messageId}
                onChange={(e) => setMessageId(e.target.value)}
                placeholder="105"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none font-mono transition-all disabled:opacity-60 ${
                  isDark 
                    ? 'bg-black/30 border-white/10 text-white placeholder-slate-500 focus:border-emerald-400' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              Target Jumlah React
            </label>
            <div className="relative">
              <Sliders className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                disabled={isRunning}
                min="1"
                max="2000"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                placeholder="500"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none font-mono transition-all disabled:opacity-60 ${
                  isDark 
                    ? 'bg-black/30 border-white/10 text-white placeholder-slate-500 focus:border-emerald-400' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                }`}
              />
            </div>
          </div>

        </div>

        {/* ─── Pemilihan 5 Emoji Reaksi ─── */}
        <div>
          <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Pilih Emoji Reaksi:
          </label>
          <div className="grid grid-cols-5 gap-2">
            {emojiOptions.map((item) => {
              const isSelected = selectedEmoji === item.emoji;
              return (
                <button
                  key={item.emoji}
                  type="button"
                  disabled={isRunning}
                  onClick={() => setSelectedEmoji(item.emoji)}
                  className={`py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer disabled:opacity-60 ${
                    isSelected
                      ? 'bg-emerald-500/20 border-2 border-emerald-400 scale-105 shadow-md shadow-emerald-500/20'
                      : isDark
                      ? 'bg-black/20 hover:bg-white/5 border border-white/10'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span className="text-xl sm:text-2xl transition-transform hover:scale-125">
                    {item.emoji}
                  </span>
                  <span className={`text-[10px] font-semibold ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Tombol Aksi: Jalankan & Hentikan ─── */}
        <div className="flex items-center gap-2.5 pt-2">
          
          {/* Tombol Utama: Jalankan Bot */}
          <button
            type="submit"
            disabled={isRunning || !channelJid.trim() || !messageId.trim()}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Bot Sedang Berjalan...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Jalankan Bot</span>
              </>
            )}
          </button>

          {/* Tombol Sekunder: Hentikan Bot */}
          <button
            type="button"
            onClick={handleStopBot}
            disabled={!isRunning}
            className="px-5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Hentikan</span>
          </button>

        </div>

      </form>

      {/* ─── Alert Notifikasi Pesan ─── */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ─── Real-Time Progress Bar & Statistik ─── */}
      <div className="mt-5 p-4 rounded-2xl bg-black/20 dark:bg-black/40 border border-black/5 dark:border-white/5 space-y-2">
        
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>Progres Reaksi:</span>
          </span>
          <span className="font-bold text-emerald-400">
            {sentCount} / {targetCount} ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar Strip */}
        <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

      </div>

      {/* ─── Live Real-time Status Terminal Log ─── */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Log Aktivitas Multi-Sesi:</span>
          </span>
          <span className="text-[10px] text-slate-500">Live Queue</span>
        </div>

        <div 
          ref={logContainerRef}
          className="w-full h-28 overflow-y-auto rounded-xl p-3 bg-[#0a0c13] border border-white/10 font-mono text-[10px] leading-relaxed text-slate-300 space-y-1 select-all"
        >
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div 
                key={index}
                className={log.includes('Sukses') ? 'text-emerald-400' : log.includes('⚠️') ? 'text-amber-400' : 'text-slate-300'}
              >
                {log}
              </div>
            ))
          ) : (
            <div className="text-slate-600 italic">
              Belum ada aktivitas. Tekan "Jalankan Bot" untuk memulai pengiriman reaksi.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
