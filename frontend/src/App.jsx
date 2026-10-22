import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import WelcomeScreen from './components/WelcomeScreen';
import ConverterScreen from './components/ConverterScreen';
import LinkToDocScreen from './components/LinkToDocScreen';
import ImageToLinkScreen from './components/ImageToLinkScreen';
import PhotoStudioScreen from './components/PhotoStudioScreen';
import VideoStudioScreen from './components/VideoStudioScreen';
import VideoTrimmerScreen from './components/VideoTrimmerScreen';
import BgRemoverScreen from './components/BgRemoverScreen';
import JjFinderScreen from './components/JjFinderScreen';
import PngToPdfScreen from './components/PngToPdfScreen';
import MediaCompressorScreen from './components/MediaCompressorScreen';
import QrStudioScreen from './components/QrStudioScreen';
import AudioMergerScreen from './components/AudioMergerScreen';
import GalleryScreen from './components/GalleryScreen';
import HistoryScreen from './components/HistoryScreen';
import SettingsScreen from './components/SettingsScreen';
import FallingLeavesBackground from './components/FallingLeavesBackground';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Toast from './components/Toast';
import Footer from './components/Footer';
import { getSettings, saveSettings, logHistoryItem } from './services/storageService';

// Kamus nama alat untuk logging riwayat aktivitas
const TOOL_NAMES = {
  downloader: 'Media Downloader',
  jjFinder: 'Cari Link JJ',
  pngToPdf: 'PNG to PDF',
  linkToDoc: 'Link to PDF/PPT',
  imageToLink: 'File ke Link',
  compressor: 'Kompres Media HD',
  qrStudio: 'QR Code Studio',
  audioMerger: 'Audio Merger',
  photoStudio: 'Photo Studio',
  videoStudio: 'Video Studio',
  videoTrimmer: 'Video Trimmer',
  bgRemover: 'Hapus Background'
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [qrInitialUrl, setQrInitialUrl] = useState('');
  const [activePlatform, setActivePlatform] = useState('tiktok');
  
  // Pengaturan dinamis aplikasi
  const [settings, setSettings] = useState(() => getSettings());
  const [toastMessage, setToastMessage] = useState(null);

  // Menerapkan tema dinamis ke elemen root (HTML)
  useEffect(() => {
    const root = document.documentElement;

    // Dark Mode / Light Mode
    if (settings.darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      localStorage.setItem('kuro_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      localStorage.setItem('kuro_theme', 'light');
    }

    // Atribut kustom untuk Font, Text Size, Corner Style, dan Compact Mode
    root.setAttribute('data-font', settings.fontFamily || 'Inter');
    root.setAttribute('data-text-size', settings.textSize || 'normal');
    root.setAttribute('data-corner', settings.cornerStyle || 'rounded');
    root.setAttribute('data-compact', settings.compactMode ? 'true' : 'false');
  }, [settings]);

  // Fungsi pembaruan pengaturan
  const handleUpdateSettings = (partial) => {
    setSettings(prev => {
      const updated = saveSettings({ ...prev, ...partial });
      return updated;
    });
  };

  const handleShowToast = (msg) => {
    setToastMessage(msg);
  };

  // Navigasi layar & pencatatan riwayat alat
  const handleNavigate = (screenId) => {
    setCurrentScreen(screenId);

    // Jika masuk ke salah satu alat, catat ke riwayat
    if (TOOL_NAMES[screenId]) {
      logHistoryItem({
        toolId: screenId,
        toolName: TOOL_NAMES[screenId],
        action: settings.language === 'en' ? 'Opened utility studio' : 'Membuka studio utilitas'
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentScreen === 'splash') {
    return <SplashScreen onEnter={() => handleNavigate('welcome')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-black font-sans selection:bg-black selection:text-white relative overflow-x-hidden">
      
      {/* Toast Notifikasi Feedback Instan */}
      <Toast 
        message={toastMessage} 
        onClose={() => setToastMessage(null)} 
      />

      {/* Background Animasi Sakura Gugur (Hanya aktif jika opsi 'Matikan Animasi' dinonaktifkan) */}
      {!settings.hideAnimations && <FallingLeavesBackground />}

      {/* Konten Halaman (Lapisan Depan z-10 agar menutup animasi latar) */}
      <div className="relative z-10 flex flex-col flex-1 pb-20 md:pb-6">
        
        {/* Top Header Navigation (Berisi navigasi desktop di dekat tombol cari) */}
        <Navbar
          currentScreen={currentScreen}
          onSelectTool={(toolId) => handleNavigate(toolId)}
          onGoHome={() => handleNavigate('welcome')}
          onNavigate={(target) => handleNavigate(target)}
          settings={settings}
        />

        {/* Screen Routing */}
        <div className="flex-1 flex flex-col">
          
          {/* 1. Halaman Utama (Welcome) */}
          {currentScreen === 'welcome' && (
            <WelcomeScreen
              theme={settings.darkMode ? 'dark' : 'light'}
              onSelectPlatform={(platformId) => {
                setActivePlatform(platformId);
                handleNavigate('downloader');
              }}
              onOpenTool={(toolId) => handleNavigate(toolId)}
            />
          )}

          {/* 2. Galeri Hasil Karya (Gallery) */}
          {currentScreen === 'gallery' && (
            <GalleryScreen
              onBack={() => handleNavigate('welcome')}
              onOpenTool={(toolId) => handleNavigate(toolId)}
              lang={settings.language || 'id'}
              onShowToast={handleShowToast}
            />
          )}

          {/* 3. Riwayat Penggunaan (History) */}
          {currentScreen === 'history' && (
            <HistoryScreen
              onBack={() => handleNavigate('welcome')}
              onOpenTool={(toolId) => handleNavigate(toolId)}
              lang={settings.language || 'id'}
              onShowToast={handleShowToast}
            />
          )}

          {/* 4. Pengaturan Studio (Settings) */}
          {currentScreen === 'settings' && (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onBack={() => handleNavigate('welcome')}
              onShowToast={handleShowToast}
            />
          )}

          {/* ─── 12 ALAT UTILITAS STUDIO ─── */}
          {currentScreen === 'downloader' && (
            <ConverterScreen
              activePlatform={activePlatform}
              onSelectPlatform={(p) => setActivePlatform(p)}
              onBack={() => handleNavigate('welcome')}
            />
          )}

          {currentScreen === 'pngToPdf' && (
            <PngToPdfScreen
              onBack={() => handleNavigate('welcome')}
            />
          )}

          {currentScreen === 'linkToDoc' && (
            <LinkToDocScreen
              onBack={() => handleNavigate('welcome')}
            />
          )}

          {currentScreen === 'imageToLink' && (
            <ImageToLinkScreen
              onBack={() => handleNavigate('welcome')}
              onOpenQrStudio={(url) => {
                setQrInitialUrl(url);
                handleNavigate('qrStudio');
              }}
            />
          )}

          {currentScreen === 'compressor' && (
            <MediaCompressorScreen
              onBack={() => handleNavigate('welcome')}
            />
          )}

          {currentScreen === 'qrStudio' && (
            <QrStudioScreen
              initialUrl={qrInitialUrl}
              onBack={() => handleNavigate('welcome')}
            />
          )}

          {currentScreen === 'audioMerger' && (
            <AudioMergerScreen
              onBack={() => handleNavigate('welcome')}
            />
          )}

          {currentScreen === 'photoStudio' && (
            <PhotoStudioScreen
              onBack={() => handleNavigate('welcome')}
            />
          )}

          {currentScreen === 'videoStudio' && (
            <VideoStudioScreen
              onBack={() => handleNavigate('welcome')}
              onOpenTrimmer={() => handleNavigate('videoTrimmer')}
            />
          )}

          {currentScreen === 'videoTrimmer' && (
            <VideoTrimmerScreen
              onBack={() => handleNavigate('welcome')}
            />
          )}

          {currentScreen === 'bgRemover' && (
            <BgRemoverScreen
              onBack={() => handleNavigate('welcome')}
            />
          )}

          {currentScreen === 'jjFinder' && (
            <JjFinderScreen
              theme={settings.darkMode ? 'dark' : 'light'}
              onBack={() => handleNavigate('welcome')}
            />
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Navigasi Bilah Bawah Khusus Tampilan Layar HP / Mobile */}
      <MobileBottomNav
        currentScreen={currentScreen}
        onNavigate={(target) => handleNavigate(target)}
        settings={settings}
      />

    </div>
  );
}
