/**
 * Kuro Studio - Storage Service
 * Mengelola penyimpanan lokal (localStorage) untuk Pengaturan (Settings),
 * Galeri Hasil Karya (Gallery), dan Riwayat Penggunaan Alat (History).
 */

const SETTINGS_KEY = 'kuro_app_settings';
const GALLERY_KEY = 'kuro_app_gallery';
const HISTORY_KEY = 'kuro_app_history';

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

// Item galeri awal untuk contoh nyata (tidak kosong saat pertama dibuka)
const SEED_GALLERY_ITEMS = [
  {
    id: 'gal-seed-1',
    title: 'Kuro Studio Cyber Neon QR Code',
    type: 'image',
    category: 'QR Studio',
    extension: 'PNG',
    size: '184 KB',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    previewUrl: '/icons.svg',
    downloadData: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100"><rect width="100" height="100" fill="#000"/><rect x="10" y="10" width="30" height="30" fill="#fff"/><rect x="15" y="15" width="20" height="20" fill="#000"/><rect x="60" y="10" width="30" height="30" fill="#fff"/><rect x="10" y="60" width="30" height="30" fill="#fff"/><circle cx="50" cy="50" r="10" fill="#06b6d4"/></svg>'),
    filename: 'kuro_qr_cyber_neon.png'
  },
  {
    id: 'gal-seed-2',
    title: 'Preset Jedag Jedug 5MB TikTok Drift',
    type: 'document',
    category: 'Cari Link JJ',
    extension: 'XML',
    size: '42 KB',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    previewUrl: null,
    downloadData: 'data:text/xml;charset=utf-8,' + encodeURIComponent('<?xml version="1.0" encoding="utf-8"?><alightmotion project="KuroJJDrift" version="5.0"><effect type="shake"/></alightmotion>'),
    filename: 'preset_jj_kuro_drift.xml'
  },
  {
    id: 'gal-seed-3',
    title: 'Sample Lo-Fi Beat Chill Audio',
    type: 'audio',
    category: 'Audio Merger',
    extension: 'MP3',
    size: '2.4 MB',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    previewUrl: null,
    downloadData: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
    filename: 'kuro_chill_lofi.mp3'
  }
];

// Riwayat awal saat pertama kali dibuka
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

// --- GALERI HASIL (GALLERY) ---
export function getGalleryItems() {
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    if (!raw) {
      localStorage.setItem(GALLERY_KEY, JSON.stringify(SEED_GALLERY_ITEMS));
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
    const current = getGalleryItems();
    const newItem = {
      id: 'gal-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
      ...item
    };
    const updated = [newItem, ...current];
    localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function removeGalleryItem(id) {
  try {
    const current = getGalleryItems();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

// --- RIWAYAT PENGGUNAAN (HISTORY) ---
export function getHistoryItems() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(SEED_HISTORY_ITEMS));
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
    const current = getHistoryItems();
    const newEntry = {
      id: 'hist-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      status: 'success',
      ...entry
    };
    // Batasi hingga 50 riwayat terakhir agar hemat memori
    const updated = [newEntry, ...current].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return [];
  } catch {
    return [];
  }
}
