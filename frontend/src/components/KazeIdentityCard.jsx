import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Crown, 
  ShieldCheck, 
  Smartphone, 
  Battery, 
  BatteryCharging, 
  CheckCircle2, 
  Search, 
  ExternalLink, 
  MessageCircle, 
  Radio, 
  Lock,
  LogOut,
  X,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export default function KazeIdentityCard({ 
  searchQuery, 
  setSearchQuery, 
  onSearchSubmit 
}) {
  const [role, setRole] = useState(() => {
    const isAuth = localStorage.getItem('kaze_admin_auth') === 'true';
    return isAuth ? 'Admin' : 'Member';
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const videoRef = useRef(null);
  const bannerContainerRef = useRef(null);

  const triggerWallpaperPlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.defaultMuted = true;
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    triggerWallpaperPlayback();

    const handleUserInteraction = () => {
      if (video && video.paused) {
        triggerWallpaperPlayback();
      }
    };

    const handleVisibility = () => {
      if (!document.hidden && video && video.paused) {
        triggerWallpaperPlayback();
      }
    };

    window.addEventListener('pointerdown', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('scroll', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pointerdown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isCharging, setIsCharging] = useState(false);
  const [deviceType, setDeviceType] = useState('Android');
  const [detectedDevice, setDetectedDevice] = useState('Android');

  useEffect(() => {
    localStorage.setItem('kaze_user_role', role);
  }, [role]);

  useEffect(() => {
    let batteryRef = null;

    const handleBatteryUpdate = (battery) => {
      setBatteryLevel(Math.round(battery.level * 100));
      setIsCharging(battery.charging);
    };

    if (typeof navigator !== 'undefined' && typeof navigator.getBattery === 'function') {
      navigator.getBattery().then((battery) => {
        batteryRef = battery;
        handleBatteryUpdate(battery);

        const onLevelChange = () => handleBatteryUpdate(battery);
        const onChargeChange = () => handleBatteryUpdate(battery);

        battery.addEventListener('levelchange', onLevelChange);
        battery.addEventListener('chargingchange', onChargeChange);
      }).catch(() => {});
    }

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

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const pass = adminPassword.trim();
    if (!pass) {
      setLoginError('Silakan masukkan kata sandi admin.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    const envPassword = (import.meta.env.VITE_ADMIN_PASSWORD || 'VINZ6767').trim();

    if (pass === envPassword) {
      setRole('Admin');
      localStorage.setItem('kaze_user_role', 'Admin');
      localStorage.setItem('kaze_admin_auth', 'true');
      setShowLoginModal(false);
      setAdminPassword('');
      setLoginError('');
      setIsLoggingIn(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRole('Admin');
        localStorage.setItem('kaze_user_role', 'Admin');
        localStorage.setItem('kaze_admin_auth', 'true');
        setShowLoginModal(false);
        setAdminPassword('');
        setLoginError('');
        setIsLoggingIn(false);
        return;
      }
    } catch {
      // ignore
    }

    setIsLoggingIn(false);
    setLoginError('Kata sandi admin salah. Akses role Admin ditolak.');
  };

  const handleAdminLogout = () => {
    setRole('Member');
    localStorage.setItem('kaze_user_role', 'Member');
    localStorage.removeItem('kaze_admin_auth');
  };

  return (
    <div className="w-full flex flex-col gap-4 mb-5">
      
      {/* ─── 1. TOP PROFILE & VIDEO SHOWCASE CARD (CLEAN NEOBRUTALISM) ─── */}
      <div className="rounded-xl border-2 border-black p-4 sm:p-5 bg-white shadow-[4px_4px_0px_#000000]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* Left: 16:9 Black Hole Video Player with Crisp Black Frame */}
          <div className="md:col-span-7 w-full">
            <div 
              ref={bannerContainerRef}
              onClick={triggerWallpaperPlayback}
              className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border-2 border-black shadow-[2px_2px_0px_#000000] cursor-pointer"
              title="Black Hole Visual Studio (Klik untuk memutar)"
            >
              <video 
                ref={videoRef}
                src="/videos/blackholev2.mp4"
                preload="auto"
                autoPlay 
                loop 
                muted
                playsInline
                onCanPlay={triggerWallpaperPlayback}
                onLoadedData={triggerWallpaperPlayback}
                onEnded={triggerWallpaperPlayback}
                className="w-full h-full object-cover object-center pointer-events-none"
              />
            </div>
          </div>

          {/* Right: User Information & Real-time Metrics */}
          <div className="md:col-span-5 w-full flex flex-col justify-between space-y-3">
            
            {/* Header: Username & Circular Avatar */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
                  Pengguna Aktif
                </span>
                <span className="text-xl sm:text-2xl font-black text-black tracking-tight font-display">
                  kaze
                </span>
              </div>

              <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-neutral-100 flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                <User className="w-7 h-7 text-black stroke-[2]" />
              </div>
            </div>

            {/* Metrics List */}
            <div className="space-y-2 text-xs font-semibold">
              
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 font-medium flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>Status</span>
                </span>
                <span className="font-mono font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-black inline-block animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>

              {/* Region */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 font-medium">Region</span>
                <span className="font-bold text-black flex items-center gap-1.5">
                  <span className="inline-block w-4 h-3 rounded-xs overflow-hidden border border-black shrink-0">
                    <span className="block w-full h-1/2 bg-[#EE1B24]" />
                    <span className="block w-full h-1/2 bg-[#FFFFFF]" />
                  </span>
                  <span>Indonesia</span>
                </span>
              </div>

              {/* Perangkat */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 font-medium flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>Perangkat</span>
                </span>
                <button
                  type="button"
                  onClick={() => setDeviceType(prev => prev === 'Android' ? detectedDevice : 'Android')}
                  className="font-mono font-bold text-black px-2 py-0.5 rounded border border-black bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer text-[11px]"
                  title="Klik untuk beralih deteksi"
                >
                  {deviceType}
                </button>
              </div>

              {/* Baterai */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 font-medium flex items-center gap-1.5">
                  {isCharging ? (
                    <BatteryCharging className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  ) : (
                    <Battery className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  )}
                  <span>Baterai</span>
                </span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-black">
                  <div className="w-10 h-2.5 rounded-sm border border-black p-[1px] flex items-center">
                    <div 
                      className="h-full bg-black transition-all duration-300" 
                      style={{ width: `${Math.min(100, Math.max(5, batteryLevel))}%` }}
                    />
                  </div>
                  <span>{batteryLevel}%</span>
                  {isCharging && <span className="text-[10px]">(CAS)</span>}
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-neutral-600 font-medium">Role</span>
                <div className="flex items-center gap-1.5">
                  {role === 'Admin' ? (
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded border border-black bg-black text-white font-mono text-[10px] font-bold">
                        ADMIN
                      </span>
                      <button
                        onClick={handleAdminLogout}
                        className="p-1 rounded border border-black bg-white hover:bg-neutral-100 text-black cursor-pointer"
                        title="Keluar dari Admin"
                      >
                        <LogOut className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded border border-black bg-neutral-100 text-black font-mono text-[10px] font-bold">
                        MEMBER
                      </span>
                      <button
                        onClick={() => {
                          setShowLoginModal(true);
                          setLoginError('');
                        }}
                        className="px-2 py-0.5 rounded border border-black bg-white hover:bg-neutral-100 text-black font-mono text-[10px] font-bold cursor-pointer"
                      >
                        Login
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ─── 2. INPUT PENCARIAN ALAT CEPAT (HIGH-CONTRAST MONOCHROME) ─── */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (onSearchSubmit) onSearchSubmit(searchQuery);
        }}
        className="w-full flex items-center gap-2"
      >
        <div className="relative flex-grow">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black stroke-[2.5]" />
          <input
            id="search-tools-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari alat di Kaze Studio (Media Downloader, PDF, QR Code, Kompres...)"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-black bg-white text-black placeholder:text-neutral-500 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-black transition-all shadow-[2px_2px_0px_#000000]"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg border-2 border-black bg-black text-white font-extrabold text-xs sm:text-sm shadow-[2px_2px_0px_#000000] hover:bg-neutral-800 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer shrink-0"
        >
          Cari
        </button>
      </form>

      {/* ─── 3. SALURAN KOMUNITAS & MEDIA SOSIAL ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <a 
          href="https://whatsapp.com/channel/0029VbDfI32EAKWIfTviOv3I" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-lg border-2 border-black bg-white hover:bg-neutral-50 text-black font-bold text-xs flex items-center justify-between shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Saluran WhatsApp</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <a 
          href="https://www.tiktok.com/@kazexy1?_r=1&_t=ZS-9AI327NzPvw" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-lg border-2 border-black bg-white hover:bg-neutral-50 text-black font-bold text-xs flex items-center justify-between shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-xs">TT</span>
            <span>@kazexy1 (TikTok)</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ─── MODAL LOGIN ADMIN (CLEAN NEOBRUTALISM) ─── */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-none animate-fadeIn">
          <div className="w-full max-w-sm rounded-xl p-6 bg-white border-2 border-black shadow-[6px_6px_0px_#000000] text-black">
            <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 stroke-[2.5]" />
                <h3 className="font-extrabold text-sm sm:text-base">Login Admin Kaze</h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1 rounded border border-black hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5 uppercase">
                  Kata Sandi Admin
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="Masukkan sandi admin..."
                    autoFocus
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border-2 border-black bg-white text-black text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-black bg-neutral-100 p-2 rounded border border-black font-medium">
                  {loginError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 py-2.5 rounded-lg border-2 border-black bg-white hover:bg-neutral-100 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex-1 py-2.5 rounded-lg border-2 border-black bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-bold text-xs shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  {isLoggingIn ? 'Memeriksa...' : 'Masuk Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
