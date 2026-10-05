import React, { useState, useEffect } from 'react';
import { 
  User, 
  Crown, 
  ShieldCheck, 
  Smartphone, 
  Battery, 
  BatteryCharging, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Search, 
  ExternalLink, 
  MessageCircle, 
  Radio, 
  Volume2,
  Lock,
  LogOut,
  X,
  KeyRound
} from 'lucide-react';

export default function KazeIdentityCard({ 
  searchQuery, 
  setSearchQuery, 
  theme, 
  onToggleTheme, 
  onSearchSubmit 
}) {
  // 1. Role State: Default adalah 'Member' (pengguna biasa) sesuai permintaan user
  const [role, setRole] = useState(() => {
    return localStorage.getItem('kaze_user_role') || 'Member';
  });

  // Modal Login Admin
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 2. Real-Time Battery API
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isCharging, setIsCharging] = useState(false);
  const [batterySupported, setBatterySupported] = useState(false);

  // 3. Device detection (default Android, bisa disesuaikan)
  const [deviceType, setDeviceType] = useState('Android');
  const [detectedDevice, setDetectedDevice] = useState('Android');

  useEffect(() => {
    localStorage.setItem('kaze_user_role', role);
  }, [role]);

  // Hook Battery Real-time
  useEffect(() => {
    let batteryRef = null;

    const handleBatteryUpdate = (battery) => {
      setBatteryLevel(Math.round(battery.level * 100));
      setIsCharging(battery.charging);
      setBatterySupported(true);
    };

    if (typeof navigator !== 'undefined' && typeof navigator.getBattery === 'function') {
      navigator.getBattery().then((battery) => {
        batteryRef = battery;
        handleBatteryUpdate(battery);

        const onLevelChange = () => handleBatteryUpdate(battery);
        const onChargeChange = () => handleBatteryUpdate(battery);

        battery.addEventListener('levelchange', onLevelChange);
        battery.addEventListener('chargingchange', onChargeChange);
      }).catch(() => {
        setBatterySupported(false);
      });
    }

    // Deteksi perangkat sistem
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      let detected = 'Android';
      if (/Android/i.test(ua)) detected = 'Android';
      else if (/iPhone|iPad|iPod/i.test(ua)) detected = 'iOS (iPhone)';
      else if (/Windows/i.test(ua)) detected = 'Windows PC';
      else if (/Mac/i.test(ua)) detected = 'macOS';
      else if (/Linux/i.test(ua)) detected = 'Linux';
      setDetectedDevice(detected);
    }
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const pass = adminPassword.trim().toLowerCase();
    // Password admin: 'kaze', 'admin123', atau 'kaze123'
    if (pass === 'kaze' || pass === 'admin123' || pass === 'kaze123' || pass === 'admin') {
      setRole('Admin');
      setShowLoginModal(false);
      setAdminPassword('');
      setLoginError('');
    } else {
      setLoginError('Kata sandi admin salah! Coba ketik: kaze');
    }
  };

  const handleAdminLogout = () => {
    setRole('Member');
  };

  const isDark = theme === 'dark';

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 mb-6">
      
      {/* ─── 1. HEADER ATAS: ALL TOOLS KAZE & PENCARIAN & GANTI TEMA ─── */}
      <div className={`rounded-2xl p-4 transition-all duration-300 border ${
        isDark 
          ? 'bg-[#12151f] border-white/10 shadow-lg' 
          : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight font-mono flex items-center gap-1.5">
              <span className={isDark ? 'text-white' : 'text-slate-900'}>ALL TOOLS KAZE</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-bold">
                VIP
              </span>
            </h2>
          </div>

          {/* Tombol Tema Terang / Gelap */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark 
                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-300' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-indigo-600'
            }`}
            title={isDark ? 'Ganti ke Tema Terang' : 'Ganti ke Tema Gelap'}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline text-[11px] text-amber-200">Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline text-[11px] text-indigo-900">Gelap</span>
              </>
            )}
          </button>
        </div>

        {/* Input Pencarian Rapi ala Foto Kedua */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (onSearchSubmit) onSearchSubmit(searchQuery);
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-grow">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari alat di All Tools Kaze (Instagram, TikTok, YouTube, PDF...)"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border transition-all outline-none ${
                isDark 
                  ? 'bg-[#090b12] border-white/10 text-white placeholder-slate-500 focus:border-indigo-400/60' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
              }`}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            Cari
          </button>
        </form>
      </div>

      {/* ─── 2. MEDIA BANNER: GIF DARI GIPHY ─── */}
      <div className={`rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 overflow-hidden transition-all duration-300 border ${
        isDark ? 'bg-[#12151f] border-white/10 shadow-xl' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="relative w-full h-44 sm:h-60 md:h-64 rounded-xl sm:rounded-2xl overflow-hidden bg-black/60">
          <img 
            src="https://media.giphy.com/media/4lu5FuhtrbaOQgKN57/giphy.gif"
            alt="Anime Kaze"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.src = "https://i.giphy.com/4lu5FuhtrbaOQgKN57.gif";
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Top Audio indicator badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono text-cyan-300 shadow-md">
            <Volume2 className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5 h-2.5">
              <span className="w-0.5 h-2 bg-cyan-400 animate-pulse" />
              <span className="w-0.5 h-3 bg-cyan-300 animate-pulse delay-75" />
              <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse delay-150" />
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="text-xs sm:text-sm font-bold drop-shadow-md">
              All Tools Kaze
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 backdrop-blur-md text-slate-300 border border-white/20">
              HD
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. IDENTITAS CARD (SMOOTH & CLEAN ALA FOTO KEDUA) ─── */}
      <div className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 transition-all duration-300 border ${
        isDark ? 'bg-[#12151f] border-white/10 shadow-xl' : 'bg-white border-slate-200 shadow-md'
      }`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          
          {/* Kolom Informasi Identitas */}
          <div className="flex-1 w-full space-y-3.5">
            
            {/* Username: kaze */}
            <div className="flex items-center justify-between text-xs sm:text-sm border-b pb-2.5 border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <User className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Username</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold font-mono text-sm sm:text-base">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>kaze</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              </div>
            </div>

            {/* Status: Online */}
            <div className="flex items-center justify-between text-xs sm:text-sm border-b pb-2.5 border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-semibold text-emerald-500 dark:text-emerald-400 uppercase text-xs tracking-wider font-mono">
                  Online
                </span>
              </div>
            </div>

            {/* Region: Indonesia (Bendera Merah Putih) */}
            <div className="flex items-center justify-between text-xs sm:text-sm border-b pb-2.5 border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <span className="text-sm">🌐</span>
                <span>Region</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-5 h-3.5 rounded-[2px] overflow-hidden border border-black/15 shadow-xs shrink-0">
                  <span className="block w-full h-1/2 bg-[#EE1B24]" />
                  <span className="block w-full h-1/2 bg-[#FFFFFF]" />
                </span>
                <span className="font-bold font-mono text-xs sm:text-sm">
                  Indonesia
                </span>
                <span className="text-xs">🇮🇩</span>
              </div>
            </div>

            {/* Perangkat: Android */}
            <div className="flex items-center justify-between text-xs sm:text-sm border-b pb-2.5 border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Perangkat</span>
              </div>
              <button
                type="button"
                onClick={() => setDeviceType(prev => prev === 'Android' ? detectedDevice : 'Android')}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition-all hover:bg-emerald-500/20 cursor-pointer"
                title="Beralih tampilan perangkat"
              >
                <span>{deviceType}</span>
              </button>
            </div>

            {/* Baterai: Real-time */}
            <div className="flex items-center justify-between text-xs sm:text-sm border-b pb-2.5 border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                {isCharging ? (
                  <BatteryCharging className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                ) : (
                  <Battery className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>Baterai</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <div className="w-12 h-2.5 rounded-full bg-black/20 dark:bg-white/10 p-0.5 overflow-hidden flex items-center">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      batteryLevel <= 20 
                        ? 'bg-rose-500' 
                        : batteryLevel <= 50 
                        ? 'bg-amber-400' 
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, batteryLevel))}%` }}
                  />
                </div>
                <span className="font-bold text-xs sm:text-sm">
                  {batteryLevel}%
                </span>
                {isCharging && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">
                    ⚡ CAS
                  </span>
                )}
              </div>
            </div>

            {/* Role: Default Member, Login Admin untuk menjadi Admin */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                {role === 'Admin' ? (
                  <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                )}
                <span>Role</span>
              </div>
              
              <div className="flex items-center gap-2">
                {role === 'Admin' ? (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>ADMIN</span>
                    </span>
                    <button
                      onClick={handleAdminLogout}
                      className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                      title="Keluar dari Admin"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>MEMBER</span>
                    </span>
                    
                    {/* Tombol Login Admin */}
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setLoginError('');
                      }}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-mono transition-all cursor-pointer"
                      title="Masuk sebagai Admin"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Login Admin</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Avatar Bulat */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative">
              <div className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 ${
                role === 'Admin' ? 'border-amber-400/80 shadow-lg shadow-amber-500/20' : 'border-indigo-400/40 shadow-md'
              } bg-black/60`}>
                <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80" 
                  alt="Kaze Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black/90 border border-white/20 flex items-center justify-center shadow-lg">
                {role === 'Admin' ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                )}
              </div>
            </div>

            <span className="mt-2 text-xs font-bold font-mono text-center">
              @{role === 'Admin' ? 'kaze_admin' : 'kaze_member'}
            </span>
          </div>

        </div>
      </div>

      {/* ─── 4. TOMBOL SALURAN WHATSAPP & MEDSOS ─── */}
      <div className="flex flex-col gap-2">
        <a 
          href="https://whatsapp.com/channel/0029VbDfI32EAKWIfTviOv3I" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md active:scale-[0.99] transition-all cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white/20" />
          <span>Saluran WhatsApp (Day In My Life)</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-auto" />
        </a>

        <a 
          href="https://www.tiktok.com/@kazexy1?_r=1&_t=ZS-9AI327NzPvw" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`w-full py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] transition-all cursor-pointer border ${
            isDark 
              ? 'bg-[#12151f] hover:bg-[#1a1e2c] text-white border-white/10' 
              : 'bg-slate-900 hover:bg-slate-800 text-white border-transparent'
          }`}
        >
          <span className="text-sm">🎵</span>
          <span>@kazexy1</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-auto" />
        </a>
      </div>

      {/* ─── MODAL LOGIN ADMIN ─── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border transition-all ${
            isDark ? 'bg-[#151926] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base">Login Admin Kaze</h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Kata Sandi Admin
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Masukkan kata sandi (kaze)"
                  autoFocus
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition-all ${
                    isDark 
                      ? 'bg-black/40 border-white/15 text-white placeholder-slate-500 focus:border-amber-400' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500'
                  }`}
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose-500 font-medium">
                  {loginError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Masuk Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
