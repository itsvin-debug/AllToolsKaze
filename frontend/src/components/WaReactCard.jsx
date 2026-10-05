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
  Link2, 
  Zap,
  Send,
  Sliders,
  ArrowLeft,
  Plus,
  X,
  Smartphone,
  Check,
  ExternalLink,
  ShieldCheck,
  Search,
  Sparkles,
  QrCode,
  LogOut
} from 'lucide-react';

export default function WaReactCard({ theme = 'dark', onBack }) {
  // ─── 1. Form Inputs State ───
  const [channelInput, setChannelInput] = useState('');
  const [messageLink, setMessageLink] = useState('');
  const [detectedMessageId, setDetectedMessageId] = useState('');
  const [targetCount, setTargetCount] = useState(100);

  // ─── 2. Multi-Emoji Selection State ───
  const [selectedEmojis, setSelectedEmojis] = useState(['👍', '❤️']);
  const [customEmojiInput, setCustomEmojiInput] = useState('');

  // Pilihan Preset 12 Emoji Populer
  const presetEmojis = [
    { emoji: '👍', name: 'Jempol' },
    { emoji: '❤️', name: 'Hati' },
    { emoji: '😂', name: 'Tertawa' },
    { emoji: '😮', name: 'Kagum' },
    { emoji: '😢', name: 'Sedih' },
    { emoji: '🔥', name: 'Api' },
    { emoji: '🎉', name: 'Pesta' },
    { emoji: '🙏', name: 'Syukur' },
    { emoji: '👏', name: 'Tepuk' },
    { emoji: '💯', name: 'Seratus' },
    { emoji: '🚀', name: 'Roket' },
    { emoji: '✨', name: 'Kilau' }
  ];

  // ─── 3. Deteksi Saluran Otomatis State ───
  const [detectedChannel, setDetectedChannel] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // ─── 4. WhatsApp Session & QR Code / Pairing Code State ───
  const [sessionStatus, setSessionStatus] = useState({ connected: false, qrCode: null, user: null });
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectTab, setConnectTab] = useState('qr'); // 'qr' | 'pairing'
  const [pairPhone, setPairPhone] = useState('');
  const [pairCodeResult, setPairCodeResult] = useState('');
  const [isPairingLoading, setIsPairingLoading] = useState(false);

  // ─── 5. Status Eksekusi Job State ───
  const [isRunning, setIsRunning] = useState(false);
  const [activeJobId, setActiveJobId] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const logContainerRef = useRef(null);

  // Auto-scroll log terminal
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Polling status koneksi WhatsApp & QR Code secara realtime
  useEffect(() => {
    fetchSessionStatus();
    // Jika modal koneksi sedang dibuka, polling lebih cepat (1.5 detik) agar deteksi scan QR instan
    const sInt = setInterval(fetchSessionStatus, showConnectModal ? 1500 : 5000);
    return () => clearInterval(sInt);
  }, [showConnectModal]);

  const fetchSessionStatus = async () => {
    try {
      const res = await axios.get('/api/wa-react/session');
      if (res.data?.success) {
        setSessionStatus(res.data.data);
      }
    } catch {
      // ignore
    }
  };

  // ─── Deteksi Otomatis Saat Input Saluran Berubah ───
  useEffect(() => {
    const query = channelInput.trim();
    if (!query) {
      setDetectedChannel(null);
      return;
    }

    const postMatch = query.match(/channel\/[a-zA-Z0-9_-]+\/([0-9]+)/);
    if (postMatch) {
      if (!messageLink) setMessageLink(query);
      if (!detectedMessageId) setDetectedMessageId(postMatch[1]);
    }

    const timer = setTimeout(async () => {
      setIsDetecting(true);
      try {
        const res = await axios.get('/api/wa-react/detect', {
          params: { url: query, messageId: detectedMessageId || undefined }
        });
        if (res.data?.success && res.data.data) {
          setDetectedChannel(res.data.data);
          if (res.data.data.detectedMessageId && !detectedMessageId) {
            setDetectedMessageId(res.data.data.detectedMessageId);
          }
        }
      } catch (err) {
        console.warn('Gagal deteksi otomatis:', err);
      } finally {
        setIsDetecting(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [channelInput]);

  // ─── Handler Perubahan Input Link Pesan yang Disalin ───
  const handleMessageLinkChange = (val) => {
    setMessageLink(val);
    const raw = String(val).trim();
    if (!raw) {
      setDetectedMessageId('');
      return;
    }

    const postMatch = raw.match(/channel\/([a-zA-Z0-9_-]+\/([0-9]+))/);
    let extractedId = '';

    if (postMatch) {
      extractedId = postMatch[2];
      const channelExtract = raw.match(/(https?:\/\/[^\/]+\/channel\/[a-zA-Z0-9_-]+)/);
      if (channelExtract && !channelInput) {
        setChannelInput(channelExtract[1]);
      }
    } else {
      const slashMatch = raw.match(/\/([0-9]+)(?:\?.*)?$/);
      if (slashMatch) {
        extractedId = slashMatch[1];
      } else {
        extractedId = raw.replace(/[^0-9]/g, '');
      }
    }

    setDetectedMessageId(extractedId);
  };

  // ─── Multi-Emoji Toggle & Custom Emoji Handler ───
  const toggleEmoji = (emojiChar) => {
    if (selectedEmojis.includes(emojiChar)) {
      if (selectedEmojis.length > 1) {
        setSelectedEmojis(selectedEmojis.filter((e) => e !== emojiChar));
      }
    } else {
      setSelectedEmojis([...selectedEmojis, emojiChar]);
    }
  };

  const handleAddCustomEmoji = (e) => {
    if (e) e.preventDefault();
    const trimmed = customEmojiInput.trim();
    if (!trimmed) return;

    const regex = /\p{Extended_Pictographic}/gu;
    const matches = trimmed.match(regex);
    if (matches && matches.length > 0) {
      const newItems = matches.filter((m) => !selectedEmojis.includes(m));
      if (newItems.length > 0) {
        setSelectedEmojis([...selectedEmojis, ...newItems]);
      }
    } else {
      if (!selectedEmojis.includes(trimmed)) {
        setSelectedEmojis([...selectedEmojis, trimmed]);
      }
    }
    setCustomEmojiInput('');
  };

  // ─── Real-Time Polling Job Status ───
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

            if (!data.running) {
              setIsRunning(false);
              const emojiStr = Array.isArray(data.emojis) ? data.emojis.join(' ') : 'reaksi';
              setSuccessMessage(`✓ Selesai! Berhasil mengirim ${data.sentCount} reaksi [ ${emojiStr} ] ke pesan saluran.`);
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

  // ─── Handler Mulai Bot ───
  const handleStartBot = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validasi syarat 1: Koneksi WhatsApp
    if (!sessionStatus.connected) {
      setShowConnectModal(true);
      setErrorMessage('⚠️ WhatsApp belum terhubung! Silakan scan Kode QR atau gunakan Kode Pairing di atas terlebih dahulu agar reaksi langsung masuk secara nyata ke aplikasi WhatsApp di HP Anda.');
      return;
    }

    // Validasi syarat 2: Link saluran & link pesan
    if (!channelInput.trim() && !messageLink.trim()) {
      setErrorMessage('Silakan masukkan link saluran atau link pesan WhatsApp Anda.');
      return;
    }

    const finalMessageId = detectedMessageId || messageLink.replace(/[^0-9]/g, '');
    if (!finalMessageId) {
      setErrorMessage('Link pesan saluran belum terdeteksi. Silakan salin link pesan dari saluran WA Anda dan tempel di kolom yang tersedia.');
      return;
    }

    const countNum = parseInt(targetCount, 10);
    if (isNaN(countNum) || countNum <= 0) {
      setErrorMessage('Target react harus berupa angka lebih dari 0.');
      return;
    }

    if (selectedEmojis.length === 0) {
      setErrorMessage('Pilih minimal 1 emoji reaksi.');
      return;
    }

    try {
      setIsRunning(true);
      setProgressPercent(0);
      setSentCount(0);
      setLogs([
        `[${new Date().toLocaleTimeString('id-ID')}] Mengirim request job ke server Baileys...`,
        `[${new Date().toLocaleTimeString('id-ID')}] Saluran: ${detectedChannel?.title || channelInput.trim() || 'WhatsApp Channel'}`,
        `[${new Date().toLocaleTimeString('id-ID')}] Target Pesan: ID #${finalMessageId} | Target: ${countNum} react`,
        `[${new Date().toLocaleTimeString('id-ID')}] Emoji Terpilih: [ ${selectedEmojis.join(' ')} ]`,
        `[${new Date().toLocaleTimeString('id-ID')}] 🟢 Sesi WhatsApp Aktif (${sessionStatus.user?.name || sessionStatus.user?.id}) -> Mengirim reaksi nyata!`
      ]);

      const res = await axios.post('/api/wa-react/start', {
        channelJid: channelInput.trim() || messageLink.trim(),
        messageId: finalMessageId,
        targetCount: countNum,
        emojis: selectedEmojis
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

  // ─── Handler Hentikan Bot ───
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

  // ─── Handler Minta Pairing Code ───
  const handleRequestPairing = async (e) => {
    if (e) e.preventDefault();
    if (!pairPhone.trim()) return;

    setIsPairingLoading(true);
    setPairCodeResult('');
    try {
      const res = await axios.post('/api/wa-react/pair', {
        phoneNumber: pairPhone.trim()
      });
      if (res.data?.success && res.data.data?.pairingCode) {
        setPairCodeResult(res.data.data.pairingCode);
      } else if (res.data.data?.alreadyRegistered) {
        setSuccessMessage('WhatsApp sudah terhubung!');
        setShowConnectModal(false);
        fetchSessionStatus();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Gagal meminta kode pairing.');
    } finally {
      setIsPairingLoading(false);
    }
  };

  // ─── Handler Logout Sesi WhatsApp ───
  const handleLogoutSession = async () => {
    try {
      await axios.post('/api/wa-react/logout');
      setSessionStatus({ connected: false, user: null, qrCode: null });
      setSuccessMessage('Sesi WhatsApp berhasil diputuskan.');
      fetchSessionStatus();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Gagal logout');
    }
  };

  const isDark = theme === 'dark';

  const cardContent = (
    <div className={`w-full max-w-xl mx-auto rounded-3xl p-5 sm:p-7 transition-all duration-300 border ${
      isDark 
        ? 'bg-[#12151f] border-white/10 shadow-2xl text-slate-100' 
        : 'bg-white border-slate-200 shadow-xl text-slate-900'
    }`}>
      
      {/* ─── Header Card ─── */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5 fill-emerald-400/20" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2">
              <span>WhatsApp Channel Auto-React</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Koneksi langsung QR Code/Pairing, link pesan otomatis, &amp; multi-emoji
            </p>
          </div>
        </div>

        {/* Status Badge Live */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : sessionStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span className={isRunning ? 'text-emerald-400 font-bold' : sessionStatus.connected ? 'text-emerald-400' : 'text-amber-400'}>
            {isRunning ? 'RUNNING' : sessionStatus.connected ? 'WA CONNECTED' : 'BELUM TERHUBUNG'}
          </span>
        </div>
      </div>

      {/* ─── Banner Status Koneksi WhatsApp Real-Time ─── */}
      <div className={`mb-5 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs border transition-all ${
        sessionStatus.connected
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          : isDark
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          : 'bg-amber-50 border-amber-200 text-amber-800'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            sessionStatus.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {sessionStatus.connected ? <ShieldCheck className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <div className="font-bold flex items-center gap-1.5 flex-wrap">
              <span>Status Koneksi:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                sessionStatus.connected ? 'bg-emerald-500/25 text-emerald-300' : 'bg-amber-500/25 text-amber-300'
              }`}>
                {sessionStatus.connected ? '✓ TERHUBUNG NYATA' : '⚠️ BELUM TERHUBUNG'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {sessionStatus.connected
                ? `Akun aktif: ${sessionStatus.user?.name || sessionStatus.user?.id} (Reaksi langsung muncul di HP)`
                : 'Scan Kode QR atau Pairing Code agar reaksi masuk ke aplikasi WhatsApp Anda'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {sessionStatus.connected ? (
            <button
              type="button"
              onClick={handleLogoutSession}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Putuskan</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConnectModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR / Tautkan</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Modal Scan QR Code & Pairing Code WhatsApp ─── */}
      {showConnectModal && (
        <div className="mb-5 p-5 rounded-2xl bg-black/60 backdrop-blur-md border border-emerald-500/40 space-y-4 animate-fadeIn shadow-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-extrabold text-sm text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Tautkan Akun WhatsApp (Agar Reaksi Muncul Nyata di HP)
            </span>
            <button 
              onClick={() => setShowConnectModal(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Pilihan Metode Koneksi: QR Code vs Pairing Code */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => setConnectTab('qr')}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                connectTab === 'qr'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Kode QR (Rekomendasi)</span>
            </button>
            <button
              type="button"
              onClick={() => setConnectTab('pairing')}
              className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                connectTab === 'pairing'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Kode Pairing (8 Digit)</span>
            </button>
          </div>

          {/* ─── Pilihan 1: Tampilan Scan Kode QR Langsung di Layar ─── */}
          {connectTab === 'qr' && (
            <div className="text-center space-y-3 pt-1">
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                Buka <strong>WhatsApp di HP</strong> &gt; Ketuk menu <strong>(⋮) Perangkat Tertaut</strong> &gt; Ketuk <strong>Tautkan Perangkat</strong> &gt; Arahkan kamera ke QR Code di bawah:
              </p>

              {/* Kontainer QR Code Bersih Bebas Halangan 100% */}
              <div className="flex flex-col items-center justify-center gap-3 my-2">
                {sessionStatus.qrCode ? (
                  <div className="p-4 rounded-3xl bg-white shadow-2xl border-4 border-emerald-500 inline-block animate-scaleIn">
                    <img 
                      src={sessionStatus.qrCode} 
                      alt="Scan Kode QR WhatsApp" 
                      className="w-64 h-64 sm:w-72 sm:h-72 object-contain block mx-auto rounded-lg"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-3 text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                    <span className="text-xs font-mono font-bold">Sedang memuat Kode QR WhatsApp...</span>
                  </div>
                )}

                {/* Status Indicator diletakkan di BAWAH kotak QR, BUKAN menutupi QR code! */}
                {sessionStatus.qrCode && (
                  <div className="py-1.5 px-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold rounded-full flex items-center justify-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Kode QR Aktif &amp; Terbaca Jelas • Arahkan Kamera HP ke Kotak</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await axios.post('/api/wa-react/refresh-qr');
                      fetchSessionStatus();
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Segarkan / Buat QR Baru</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── Pilihan 2: Tampilan Kode Pairing 8 Digit ─── */}
          {connectTab === 'pairing' && (
            <div className="space-y-3 pt-1">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Alternatif jika kamera HP tidak bisa scan: Masukkan nomor WhatsApp Anda (dengan kode negara, contoh: <strong>628123456789</strong>). Server akan memberikan 8 digit kode resmi untuk dimasukkan di <em>WhatsApp &gt; Perangkat Tertaut &gt; Tautkan dengan nomor telepon</em>.
              </p>

              <form onSubmit={handleRequestPairing} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Contoh: 628123456789"
                  value={pairPhone}
                  onChange={(e) => setPairPhone(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-black/40 border border-white/10 text-white font-mono outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={isPairingLoading || !pairPhone.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPairingLoading ? 'Meminta...' : 'Minta Kode'}
                </button>
              </form>

              {pairCodeResult && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-center space-y-1 animate-fadeIn">
                  <span className="text-[10px] text-slate-300 block">Kode Pairing 8 Digit Anda:</span>
                  <span className="font-mono text-2xl font-black text-emerald-300 tracking-widest selection:bg-emerald-400 selection:text-black">
                    {pairCodeResult}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Buka notifikasi WhatsApp di HP &gt; Masukkan kode di atas untuk menghubungkan.
                  </span>
                </div>
              )}
            </div>
          )}

          {sessionStatus.connected && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Berhasil Terhubung! Anda sudah siap mengirim reaksi nyata.</span>
            </div>
          )}
        </div>
      )}

      {/* ─── Form Input Grid ─── */}
      <form onSubmit={handleStartBot} className="space-y-4">
        
        {/* Input 1: Link Saluran WhatsApp */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Link atau ID Saluran WhatsApp</span>
              {isDetecting && <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />}
            </label>
            <span className="text-[10px] text-slate-400">Saluran induk</span>
          </div>

          <div className="relative">
            <Radio className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              disabled={isRunning}
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              placeholder="https://whatsapp.com/channel/0029VbDfI32EAKWIfTviOv3I"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none font-mono transition-all disabled:opacity-60 ${
                isDark 
                  ? 'bg-black/30 border-white/10 text-white placeholder-slate-500 focus:border-emerald-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
              }`}
            />
          </div>

          {/* ─── Tampilan Preview Saluran Terdeteksi Otomatis ─── */}
          {detectedChannel && detectedChannel.verified && (
            <div className="mt-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 animate-fadeIn">
              {detectedChannel.avatar ? (
                <img 
                  src={detectedChannel.avatar} 
                  alt={detectedChannel.title} 
                  className="w-10 h-10 rounded-xl object-cover border border-emerald-400/40 shrink-0" 
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                  WA
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-white truncate">
                    {detectedChannel.title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-400 text-black">
                    TERDETEKSI
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate">
                  {detectedChannel.description || 'Saluran Resmi WhatsApp'}
                </p>
                <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-2 mt-0.5">
                  <span>Kode: {detectedChannel.inviteCode}</span>
                  {detectedMessageId && <span>| Pesan: #{detectedMessageId}</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input 2: Link Pesan Saluran WhatsApp (Hasil Salin Pesan dari Saluran) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Link Pesan yang Ada di Saluran (Salin Link Pesan)</span>
            </label>
            {detectedMessageId && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Pesan ID: #{detectedMessageId}
              </span>
            )}
          </div>

          <div className="relative">
            <Link2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              disabled={isRunning}
              value={messageLink}
              onChange={(e) => handleMessageLinkChange(e.target.value)}
              placeholder="https://whatsapp.com/channel/0029VbDfI32EAKWIfTviOv3I/101"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none font-mono transition-all disabled:opacity-60 ${
                isDark 
                  ? 'bg-black/30 border-white/10 text-white placeholder-slate-500 focus:border-emerald-400' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
              }`}
            />
          </div>

          <span className="text-[10px] text-slate-400 mt-1 block">
            Salin tautan pesan di saluran WA (Buka pesan &gt; Bagikan / Salin Tautan) lalu tempel di sini agar otomatis terdeteksi.
          </span>
        </div>

        {/* Input 3: Target Jumlah React */}
        <div>
          <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Jumlah React</span>
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
          <span className="text-[10px] text-slate-400 mt-1 block">
            Target jumlah reaksi emoji yang akan dikirim ke pesan saluran
          </span>
        </div>

        {/* ─── Pemilihan Multi-Emoji & Custom Emoji Bebas ─── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih Emoji Reaksi (Bisa Pilih Lebih dari 1 Emoji):
            </label>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              {selectedEmojis.length} emoji aktif
            </span>
          </div>

          {/* Grid Preset Emoji */}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {presetEmojis.map((item) => {
              const isSelected = selectedEmojis.includes(item.emoji);
              return (
                <button
                  key={item.emoji}
                  type="button"
                  disabled={isRunning}
                  onClick={() => toggleEmoji(item.emoji)}
                  className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer disabled:opacity-60 relative ${
                    isSelected
                      ? 'bg-emerald-500/20 border-2 border-emerald-400 scale-102 shadow-md shadow-emerald-500/20'
                      : isDark
                      ? 'bg-black/20 hover:bg-white/5 border border-white/10'
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 text-black rounded-full flex items-center justify-center text-[8px] font-bold">
                      ✓
                    </span>
                  )}
                  <span className="text-xl transition-transform hover:scale-125">
                    {item.emoji}
                  </span>
                  <span className={`text-[9px] font-semibold truncate ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Input Emoji Bebas Tambahan */}
          <div className="p-3 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/10 space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Mau Emoji Lain? Tambah Emoji Apa Saja:
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                disabled={isRunning}
                value={customEmojiInput}
                onChange={(e) => setCustomEmojiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomEmoji();
                  }
                }}
                placeholder="Ketik/paste emoji apa saja (misal: 😎 🥳 🗿 ⚡)"
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-black/30 border border-white/10 text-white outline-none focus:border-emerald-400"
              />
              <button
                type="button"
                disabled={isRunning || !customEmojiInput.trim()}
                onClick={handleAddCustomEmoji}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {/* List Emoji yang Saat Ini Terpilih */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400">Aktif bergiliran:</span>
              {selectedEmojis.map((em, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-300"
                >
                  <span>{em}</span>
                  {selectedEmojis.length > 1 && !isRunning && (
                    <button
                      type="button"
                      onClick={() => toggleEmoji(em)}
                      className="hover:text-rose-400 cursor-pointer text-[10px] ml-0.5"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Tombol Aksi: Jalankan & Hentikan ─── */}
        <div className="flex items-center gap-2.5 pt-2">
          
          {/* Tombol Utama: Jalankan Bot */}
          <button
            type="submit"
            disabled={isRunning || (!channelInput.trim() && !messageLink.trim()) || !detectedMessageId}
            className="flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sedang Mengirim Reaksi ke WhatsApp...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Jalankan Bot Auto-React</span>
              </>
            )}
          </button>

          {/* Tombol Sekunder: Hentikan Bot */}
          <button
            type="button"
            onClick={handleStopBot}
            disabled={!isRunning}
            className="px-5 py-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Hentikan</span>
          </button>

        </div>

      </form>

      {/* ─── Alert Notifikasi Pesan ─── */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1 leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="flex-1 leading-relaxed">{successMessage}</span>
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
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full transition-all duration-300"
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
          <span className="text-[10px] text-slate-500">Live Socket &amp; Multi-Emoji</span>
        </div>

        <div 
          ref={logContainerRef}
          className="w-full h-32 overflow-y-auto rounded-xl p-3 bg-[#0a0c13] border border-white/10 font-mono text-[10px] leading-relaxed text-slate-300 space-y-1 select-all"
        >
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div 
                key={index} 
                className={
                  log.includes('LIVE WA') || log.includes('Sukses') || log.includes('Selesai')
                    ? 'text-emerald-400' 
                    : log.includes('⚠️') 
                    ? 'text-amber-400 font-bold' 
                    : log.includes('TIP')
                    ? 'text-cyan-400'
                    : 'text-slate-300'
                }
              >
                {log}
              </div>
            ))
          ) : (
            <div className="text-slate-600 italic">
              Belum ada aktivitas. Scan QR Code WhatsApp &amp; masukkan link pesan saluran untuk memulai pengiriman reaksi.
            </div>
          )}
        </div>
      </div>

    </div>
  );

  if (onBack) {
    return (
      <main className="flex-grow relative z-10 flex flex-col items-center justify-start px-4 sm:px-6 md:px-margin-desktop py-6 sm:py-10 w-full max-w-4xl mx-auto">
        <div className="w-full flex items-center justify-between mb-6 max-w-xl">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda Tools</span>
          </button>
        </div>
        {cardContent}
      </main>
    );
  }

  return cardContent;
}
