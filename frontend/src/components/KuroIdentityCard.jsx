import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Smartphone, 
  Monitor,
  Tablet,
  Zap,
  Battery, 
  BatteryCharging, 
  Search, 
  ExternalLink, 
  MessageCircle, 
  Radio, 
  LogOut,
  X,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

/**
 * Deteksi perangkat, sistem operasi, dan peramban secara universal
 * Mendukung iOS (iPhone, iPadOS), Android, Windows, macOS, Linux, ChromeOS
 * serta peramban web mandiri maupun In-App WebView (TikTok, Instagram, WhatsApp, Facebook, Safari, Chrome, Firefox)
 */
export function detectUserDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { 
      os: 'Windows', 
      browser: 'Browser', 
      type: 'desktop', 
      badge: 'Windows • Browser',
      isIOS: false,
      isAndroid: false
    };
  }

  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  // 1. Deteksi Sistem Operasi
  let os = 'Windows';
  let type = 'desktop';

  const isIPhone = /iPhone/i.test(ua);
  const isIPad = /iPad/i.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);
  const isIPod = /iPod/i.test(ua);
  const isIOS = isIPhone || isIPad || isIPod;

  const isAndroid = /Android/i.test(ua);
  const isWindows = /Windows NT|Win32|Win64|WOW64|Windows/i.test(ua) || /Win/i.test(platform);
  const isMac = !isIOS && (/Macintosh|Mac OS X|MacPPC|MacIntel/i.test(ua) || /Mac/i.test(platform));
  const isLinux = !isAndroid && (/Linux|X11/i.test(ua) || /Linux/i.test(platform));
  const isChromeOS = /CrOS/i.test(ua);

  if (isIPhone) {
    os = 'iOS';
    type = 'mobile';
  } else if (isIPad) {
    os = 'iPadOS';
    type = 'tablet';
  } else if (isIPod) {
    os = 'iOS';
    type = 'mobile';
  } else if (isAndroid) {
    os = 'Android';
    type = (/Tablet/i.test(ua) || (maxTouchPoints > 0 && !/Mobile/i.test(ua))) ? 'tablet' : 'mobile';
  } else if (isWindows) {
    os = 'Windows';
    type = 'desktop';
  } else if (isMac) {
    os = 'macOS';
    type = 'desktop';
  } else if (isChromeOS) {
    os = 'ChromeOS';
    type = 'desktop';
  } else if (isLinux) {
    os = 'Linux';
    type = 'desktop';
  }

  // 2. Deteksi Peramban Lintas Platform & In-App WebView
  let browser = 'Browser';
  const isBrave = typeof navigator.brave !== 'undefined' || (navigator.brave && typeof navigator.brave.isBrave === 'function');

  if (/Instagram/i.test(ua)) {
    browser = 'Instagram';
  } else if (/musical_ly|ByteDance|TikTok/i.test(ua)) {
    browser = 'TikTok';
  } else if (/WhatsApp/i.test(ua)) {
    browser = 'WhatsApp';
  } else if (/FBAN|FBAV|FB_IAB/i.test(ua)) {
    browser = 'Facebook';
  } else if (/Twitter|TwitterAndroid|TwitteriPhone/i.test(ua)) {
    browser = 'X';
  } else if (/Line\//i.test(ua)) {
    browser = 'LINE';
  } else if (isBrave) {
    browser = 'Brave';
  } else if (/SamsungBrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/Edg\/|EdgiOS|Edge/i.test(ua)) {
    browser = 'Edge';
  } else if (/OPR\/|Opera|OPT\//i.test(ua)) {
    browser = 'Opera';
  } else if (/Vivaldi/i.test(ua)) {
    browser = 'Vivaldi';
  } else if (/UCBrowser/i.test(ua)) {
    browser = 'UC Browser';
  } else if (/Firefox|FxiOS/i.test(ua)) {
    browser = 'Firefox';
  } else if (/CriOS/i.test(ua)) {
    browser = 'Chrome (iOS)';
  } else if (/Chrome/i.test(ua) && !/Edg|OPR|SamsungBrowser/i.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari/i.test(ua) && !/Chrome|CriOS|Android/i.test(ua)) {
    browser = 'Safari';
  } else if (/wv|WebView/i.test(ua)) {
    browser = 'WebView';
  }

  const badge = `${os} • ${browser}`;
  return { os, browser, type, badge, isIOS, isAndroid };
}

export default function KuroIdentityCard({ 
  searchQuery, 
  setSearchQuery, 
  onSearchSubmit 
}) {
  const [role, setRole] = useState(() => {
    const isAuth = localStorage.getItem('kuro_admin_auth') === 'true' || 
                   localStorage.getItem('kaze_admin_auth') === 'true';
    return isAuth ? 'Admin' : 'Member';
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const videoRef = useRef(null);
  const bannerContainerRef = useRef(null);

  const [deviceInfo, setDeviceInfo] = useState(() => detectUserDevice());
  const [showBrowserInBadge, setShowBrowserInBadge] = useState(true);

  // Status Baterai Lintas Platform
  const [batteryLevel, setBatteryLevel] = useState(() => {
    const saved = localStorage.getItem('kuro_battery_level') || localStorage.getItem('kaze_battery_level');
    return saved ? parseInt(saved, 10) : 100;
  });
  const [isCharging, setIsCharging] = useState(false);
  const [batteryMode, setBatteryMode] = useState('checking'); // 'native', 'system', 'fallback'

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
      // Abaikan jika browser membatasi autoplay
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

  useEffect(() => {
    localStorage.setItem('kuro_user_role', role);
  }, [role]);

  // Manajemen Baterai Universal
  useEffect(() => {
    const currentDevice = detectUserDevice();
    setDeviceInfo(currentDevice);

    let batteryManager = null;
    let isSubscribed = true;

    // 1. Cek Native W3C Battery Status API (Chrome, Edge, Samsung Internet di Android/Desktop)
    if (typeof navigator !== 'undefined' && typeof navigator.getBattery === 'function') {
      navigator.getBattery()
        .then((battery) => {
          if (!isSubscribed) return;
          batteryManager = battery;
          
          const syncNativeBattery = () => {
            if (!isSubscribed || !battery) return;
            const level = Math.round((battery.level || 0) * 100);
            const safeLevel = isNaN(level) ? 100 : Math.max(0, Math.min(100, level));
            setBatteryLevel(safeLevel);
            setIsCharging(Boolean(battery.charging));
            setBatteryMode('native');
            try {
              localStorage.setItem('kuro_battery_level', safeLevel.toString());
            } catch {}
          };

          syncNativeBattery();
          battery.addEventListener('levelchange', syncNativeBattery);
          battery.addEventListener('chargingchange', syncNativeBattery);
        })
        .catch(() => {
          handleBatteryFallback(currentDevice);
        });
    } else {
      handleBatteryFallback(currentDevice);
    }

    async function handleBatteryFallback(dev) {
      if (!isSubscribed) return;

      // Jika di desktop (Windows/Mac/Linux) dan dibuka secara lokal, coba telemetri server
      if (dev.type === 'desktop') {
        try {
          const res = await fetch('/api/system-battery');
          if (res.ok && isSubscribed) {
            const data = await res.json();
            if (data && typeof data.level === 'number') {
              setBatteryLevel(data.level);
              setIsCharging(Boolean(data.isCharging));
              setBatteryMode('system');
              return;
            }
          }
        } catch {
          // Gagal fetch, gunakan fallback desktop
        }
      }

      // Fallback untuk iOS (iPhone/iPad) & peramban non-Battery API
      // Menjaga UI rapi tanpa crash atau persentase palsu yang membingungkan
      if (isSubscribed) {
        setBatteryLevel(100);
        setIsCharging(false);
        setBatteryMode('fallback');
      }
    }

    return () => {
      isSubscribed = false;
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', () => {});
        batteryManager.removeEventListener('chargingchange', () => {});
      }
    };
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
      localStorage.setItem('kuro_user_role', 'Admin');
      localStorage.setItem('kuro_admin_auth', 'true');
      setShowLoginModal(false);
      setAdminPassword('');
      setLoginError('');
      setIsLoggingIn(false);
      return;
    }

    try {
      const res = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRole('Admin');
        localStorage.setItem('kuro_user_role', 'Admin');
        localStorage.setItem('kuro_admin_auth', 'true');
        setShowLoginModal(false);
        setAdminPassword('');
        setLoginError('');
        setIsLoggingIn(false);
        return;
      }
    } catch {
      // Abaikan
    }

    setIsLoggingIn(false);
    setLoginError('Kata sandi admin salah. Akses role Admin ditolak.');
  };

  const handleAdminLogout = () => {
    setRole('Member');
    localStorage.setItem('kuro_user_role', 'Member');
    localStorage.removeItem('kuro_admin_auth');
    localStorage.removeItem('kaze_admin_auth');
  };

  return (
    <div className="w-full flex flex-col gap-4 mb-5">
      
      {/* ─── 1. TOP PROFILE & VIDEO SHOWCASE CARD (CLEAN NEOBRUTALISM) ─── */}
      <div className="rounded-xl border-2 border-black p-4 sm:p-5 bg-white shadow-[4px_4px_0px_#000000]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* Sisi Kiri: Video Showcase 16:9 */}
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

          {/* Sisi Kanan: Identitas Kuro & Metrik Real-time */}
          <div className="md:col-span-5 w-full flex flex-col justify-between space-y-3">
            
            {/* Header Pengguna Aktif */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
                  Pengguna Aktif
                </span>
                <span className="text-xl sm:text-2xl font-black text-black tracking-tight font-display">
                  kuro
                </span>
              </div>

              <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-neutral-100 flex items-center justify-center shadow-[2px_2px_0px_#000000] shrink-0">
                <User className="w-7 h-7 text-black stroke-[2]" />
              </div>
            </div>

            {/* Metrik Perangkat & Daya */}
            <div className="space-y-2 text-xs font-semibold">
              
              {/* Status Jaringan */}
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

              {/* Perangkat & Peramban Universal */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 font-medium flex items-center gap-1.5">
                  {deviceInfo.type === 'desktop' ? (
                    <Monitor className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  ) : deviceInfo.type === 'tablet' ? (
                    <Tablet className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  ) : (
                    <Smartphone className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  )}
                  <span>Perangkat</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowBrowserInBadge(prev => !prev)}
                  className="font-mono font-bold text-black px-2 py-0.5 rounded border border-black bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer text-[11px]"
                  title={`Sistem Operasi: ${deviceInfo.os} | Peramban: ${deviceInfo.browser} (Klik untuk beralih ringkas/lengkap)`}
                >
                  {showBrowserInBadge ? `${deviceInfo.os} • ${deviceInfo.browser}` : deviceInfo.os}
                </button>
              </div>

              {/* Telemetri Baterai Real-time */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 font-medium flex items-center gap-1.5">
                  {isCharging ? (
                    <BatteryCharging className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  ) : (
                    <Battery className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  )}
                  <span>Baterai</span>
                </span>
                
                <div 
                  className="flex items-center gap-1.5 font-mono font-bold text-black"
                  title={
                    batteryMode === 'fallback'
                      ? `${deviceInfo.os} membatasi Battery API demi privasi. Status daya: Siap digunakan.`
                      : isCharging 
                        ? `Perangkat sedang dicas (${batteryLevel}%)` 
                        : `Daya Baterai Aktif (${batteryLevel}%)`
                  }
                >
                  <div className="w-10 h-2.5 rounded-sm border border-black p-[1px] flex items-center bg-white">
                    <div 
                      className="h-full bg-black transition-all duration-300" 
                      style={{ width: `${Math.min(100, Math.max(8, batteryLevel))}%` }}
                    />
                  </div>

                  {batteryMode === 'fallback' && deviceInfo.isIOS ? (
                    <span className="text-[11px]">Daya Aktif</span>
                  ) : (
                    <span>{batteryLevel}%</span>
                  )}

                  {isCharging ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-black bg-black text-white text-[10px] font-mono font-bold">
                      <Zap className="w-2.5 h-2.5 fill-current text-white" />
                      <span className="text-[9px]">CAS</span>
                    </span>
                  ) : batteryMode === 'fallback' ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-black bg-neutral-100 text-black text-[9px] font-mono font-bold">
                      AKTIF
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Status Role Pengguna */}
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
                        title="Keluar dari Admin Kuro"
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
            placeholder="Cari alat di Kuro Studio (Media Downloader, PDF, QR Code, Kompres...)"
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
                <h3 className="font-extrabold text-sm sm:text-base">Login Admin Kuro</h3>
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
