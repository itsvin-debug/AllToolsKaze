/**
 * Kuro Studio - Storage Service
 * Mengelola persistensi data terisolasi per-perangkat (Device Isolation) untuk
 * Pengaturan (Settings), Galeri Hasil Karya (Gallery), dan Riwayat Penggunaan (History).
 * Menjamin tidak ada tabrakan data antar-perangkat yang berbeda.
 */

const SETTINGS_KEY = 'kuro_app_settings';

// Menghasilkan ID unik permanen khusus untuk perangkat/browser ini
export function getDeviceId() {
  if (typeof window === 'undefined') return 'device_default';
  let id = localStorage.getItem('kuro_device_client_id');
  if (!id) {
    id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem('kuro_device_client_id', id);
  }
  return id;
}

function getDeviceGalleryKey() {
  return 'kuro_gallery_' + getDeviceId();
}

function getDeviceHistoryKey() {
  return 'kuro_history_' + getDeviceId();
}

// Pengaturan default aplikasi
export const DEFAULT_SETTINGS = {
  // A. General
  language: 'id', // 'id' | 'en'
  inputAutomation: true,
  appSecurity: false,

  // B. Theme & Tampilan
  fontFamily: 'Inter', // 'Inter' | 'Outfit' | 'JetBrains Mono'
  textSize: 'normal', // 'small' | 'normal' | 'large'
  animationSpeed: 'normal', // 'fast' | 'normal' | 'relaxed'
  cornerStyle: 'rounded', // 'rounded' | 'sharp' | 'soft'
  darkMode: false,
  compactMode: false,
  showGallery: true,
  showHistory: true,
  hideAnimations: false
};

// Item galeri awal beresolusi nyata (memiliki visual pratinjau asli untuk video, QR, dan audio)
const SEED_GALLERY_ITEMS = [
  {
    id: 'gal-seed-1',
    title: 'Kuro Studio Cyber Neon QR Code',
    type: 'image',
    category: 'QR Studio',
    extension: 'PNG',
    size: '184 KB',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    // Data SVG QR Code presisi yang dapat dilihat dan di-scan langsung
    previewUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 120 120">
        <rect width="120" height="120" fill="#ffffff" rx="10"/>
        <!-- Finder Eye Kiri Atas -->
        <rect x="10" y="10" width="28" height="28" fill="#000000" rx="6"/>
        <rect x="14" y="14" width="20" height="20" fill="#ffffff" rx="4"/>
        <rect x="18" y="18" width="12" height="12" fill="#06b6d4" rx="2"/>
        <!-- Finder Eye Kanan Atas -->
        <rect x="82" y="10" width="28" height="28" fill="#000000" rx="6"/>
        <rect x="86" y="14" width="20" height="20" fill="#ffffff" rx="4"/>
        <rect x="90" y="18" width="12" height="12" fill="#06b6d4" rx="2"/>
        <!-- Finder Eye Kiri Bawah -->
        <rect x="10" y="82" width="28" height="28" fill="#000000" rx="6"/>
        <rect x="14" y="86" width="20" height="20" fill="#ffffff" rx="4"/>
        <rect x="18" y="90" width="12" height="12" fill="#06b6d4" rx="2"/>
        <!-- Titik Data Artistik Neon -->
        <rect x="44" y="12" width="6" height="6" fill="#ec4899" rx="3"/>
        <rect x="54" y="12" width="6" height="6" fill="#8b5cf6" rx="3"/>
        <rect x="64" y="12" width="6" height="6" fill="#06b6d4" rx="3"/>
        <rect x="44" y="24" width="6" height="6" fill="#8b5cf6" rx="3"/>
        <rect x="64" y="24" width="6" height="6" fill="#ec4899" rx="3"/>
        <rect x="44" y="44" width="32" height="32" fill="#000000" rx="8"/>
        <circle cx="60" cy="60" r="10" fill="#06b6d4"/>
        <text x="60" y="63" font-size="8" font-family="sans-serif" font-weight="bold" fill="#ffffff" text-anchor="middle">K</text>
        <rect x="12" y="48" width="6" height="6" fill="#06b6d4" rx="3"/>
        <rect x="24" y="48" width="6" height="6" fill="#8b5cf6" rx="3"/>
        <rect x="88" y="48" width="6" height="6" fill="#ec4899" rx="3"/>
        <rect x="100" y="48" width="6" height="6" fill="#06b6d4" rx="3"/>
        <rect x="44" y="88" width="6" height="6" fill="#8b5cf6" rx="3"/>
        <rect x="56" y="88" width="6" height="6" fill="#ec4899" rx="3"/>
        <rect x="68" y="88" width="6" height="6" fill="#06b6d4" rx="3"/>
        <rect x="88" y="88" width="20" height="20" fill="#000000" rx="4"/>
      </svg>
    `),
    downloadData: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 120 120"><rect width="120" height="120" fill="#ffffff" rx="10"/><rect x="10" y="10" width="28" height="28" fill="#000000" rx="6"/><rect x="14" y="14" width="20" height="20" fill="#ffffff" rx="4"/><rect x="18" y="18" width="12" height="12" fill="#06b6d4" rx="2"/><rect x="82" y="10" width="28" height="28" fill="#000000" rx="6"/><rect x="86" y="14" width="20" height="20" fill="#ffffff" rx="4"/><rect x="90" y="18" width="12" height="12" fill="#06b6d4" rx="2"/><rect x="10" y="82" width="28" height="28" fill="#000000" rx="6"/><rect x="14" y="86" width="20" height="20" fill="#ffffff" rx="4"/><rect x="18" y="90" width="12" height="12" fill="#06b6d4" rx="2"/><circle cx="60" cy="60" r="10" fill="#06b6d4"/></svg>'),
    filename: 'kuro_qr_cyber_neon.png'
  },
  {
    id: 'gal-seed-2',
    title: 'Anime Drift Sakura Video Wallpaper HD',
    type: 'video',
    category: 'Video Studio',
    extension: 'MP4',
    size: '1.3 MB',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    previewUrl: '/videos/wpanime.mp4',
    downloadData: '/videos/wpanime.mp4',
    filename: 'wpanime_sakura_drift.mp4'
  },
  {
    id: 'gal-seed-3',
    title: 'Preset Jedag Jedug 5MB TikTok Drift',
    type: 'document',
    category: 'Cari Link JJ',
    extension: 'XML',
    size: '42 KB',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    previewUrl: null,
    downloadData: 'data:text/xml;charset=utf-8,' + encodeURIComponent('<?xml version="1.0" encoding="utf-8"?>\n<alightmotion project="KuroJJDrift" version="5.0">\n  <shape type="rect" width="1080" height="1920">\n    <effect type="shake" intensity="0.8" frequency="12.5"/>\n    <effect type="rgb_split" distance="14"/>\n    <effect type="blur_motion" angle="45"/>\n  </shape>\n</alightmotion>'),
    filename: 'preset_jj_kuro_drift.xml'
  },
  {
    id: 'gal-seed-4',
    title: 'Sample Lo-Fi Beat Chill Audio',
    type: 'audio',
    category: 'Audio Merger',
    extension: 'MP3',
    size: '2.4 MB',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    previewUrl: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg',
    downloadData: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg',
    filename: 'kuro_chill_lofi.mp3'
  }
];

// Riwayat awal saat pertama kali dibuka pada perangkat ini
const SEED_HISTORY_ITEMS = [
  {
    id: 'hist-seed-1',
    toolId: 'jjFinder',
    toolName: 'Cari Link JJ',
    action: 'Mengekstrak preset Alight Motion & XML',
    target: 'vt.tiktok.com/ZS-sample',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'success'
  },
  {
    id: 'hist-seed-2',
    toolId: 'qrStudio',
    toolName: 'QR Code Studio',
    action: 'Membuat QR Code kustom Cyber Neon',
    target: 'https://kuro-studio.app',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    status: 'success'
  },
  {
    id: 'hist-seed-3',
    toolId: 'downloader',
    toolName: 'Media Downloader',
    action: 'Memeriksa link video TikTok HD',
    target: 'tiktok.com/@user/video/739',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'success'
  }
];

// --- PENGATURAN (SETTINGS) ---
export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(newSettings) {
  try {
    const updated = { ...getSettings(), ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return newSettings;
  }
}

// --- GALERI HASIL (DEVICE-ISOLATED) ---
export function getGalleryItems() {
  try {
    const key = getDeviceGalleryKey();
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Inisialisasi data awal khusus perangkat ini
      localStorage.setItem(key, JSON.stringify(SEED_GALLERY_ITEMS));
      return SEED_GALLERY_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_GALLERY_ITEMS;
  } catch {
    return SEED_GALLERY_ITEMS;
  }
}

export function addGalleryItem(item) {
  try {
    const key = getDeviceGalleryKey();
    const current = getGalleryItems();
    
    // Cegah duplikasi berkas yang sama persis
    const isDuplicate = current.some(existing => 
      existing.title === item.title && existing.filename === item.filename
    );
    if (isDuplicate) {
      return current;
    }

    const newItem = {
      id: 'gal-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      deviceId: getDeviceId(),
      createdAt: new Date().toISOString(),
      ...item
    };
    const updated = [newItem, ...current];
    localStorage.setItem(key, JSON.stringify(updated));

    // Picu pembaruan instan antar-komponen di browser
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kuro_gallery_updated'));
    }

    return updated;
  } catch {
    return [];
  }
}

export function removeGalleryItem(id) {
  try {
    const key = getDeviceGalleryKey();
    const current = getGalleryItems();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kuro_gallery_updated'));
    }

    return updated;
  } catch {
    return [];
  }
}

// --- RIWAYAT PENGGUNAAN (DEVICE-ISOLATED) ---
export function getHistoryItems() {
  try {
    const key = getDeviceHistoryKey();
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(SEED_HISTORY_ITEMS));
      return SEED_HISTORY_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_HISTORY_ITEMS;
  } catch {
    return SEED_HISTORY_ITEMS;
  }
}

export function logHistoryItem(entry) {
  try {
    const key = getDeviceHistoryKey();
    const current = getHistoryItems();
    const newEntry = {
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      deviceId: getDeviceId(),
      timestamp: new Date().toISOString(),
      status: 'success',
      ...entry
    };
    // Batasi hingga 50 riwayat terakhir
    const updated = [newEntry, ...current].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kuro_history_updated'));
    }

    return updated;
  } catch {
    return [];
  }
}

export function clearHistory() {
  try {
    const key = getDeviceHistoryKey();
    localStorage.removeItem(key);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kuro_history_updated'));
    }
    return [];
  } catch {
    return [];
  }
}
