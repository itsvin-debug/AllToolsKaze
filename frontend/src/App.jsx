import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import WelcomeScreen from './components/WelcomeScreen';
import ConverterScreen from './components/ConverterScreen';
import LinkToDocScreen from './components/LinkToDocScreen';
import ImageToLinkScreen from './components/ImageToLinkScreen';
import PhotoStudioScreen from './components/PhotoStudioScreen';
import VideoStudioScreen from './components/VideoStudioScreen';
import BgRemoverScreen from './components/BgRemoverScreen';
import WaReactCard from './components/WaReactCard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ShaderBackground from './components/ShaderBackground';

export default function App() {
  // State layar aktif:
  // 'splash' | 'welcome' | 'downloader' | 'linkToDoc' | 'imageToLink' | 'photoStudio' | 'videoStudio' | 'bgRemover'
  const [currentScreen, setCurrentScreen] = useState('welcome');
  
  // Platform sosmed yang dipilih jika masuk ke downloader
  const [activePlatform, setActivePlatform] = useState('tiktok');

  // Tema Gelap (dark) & Terang (light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('kaze_theme') || 'dark';
  });

  // Sinkronisasi class dark / light ke documentElement (html)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('kaze_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Jika pengguna ingin masuk lewat splash screen
  if (currentScreen === 'splash') {
    return <SplashScreen onEnter={() => setCurrentScreen('welcome')} />;
  }

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-300 ${
      isDark ? 'bg-[#08090c] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      
      {/* Background shader dinamis responsif tema */}
      <ShaderBackground theme={theme} />

      {/* Header Navigasi Atas Multi-Tools */}
      <Navbar
        currentScreen={currentScreen}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSelectTool={(toolId) => {
          if (toolId === 'downloader') {
            setCurrentScreen('downloader');
          } else {
            setCurrentScreen(toolId);
          }
        }}
        onGoHome={() => setCurrentScreen('welcome')}
      />

      {/* Render Layar Sesuai State */}
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          theme={theme}
          onToggleTheme={toggleTheme}
          onSelectPlatform={(platformId) => {
            setActivePlatform(platformId);
            setCurrentScreen('downloader');
          }}
          onOpenTool={(toolId) => setCurrentScreen(toolId)}
        />
      )}

      {currentScreen === 'downloader' && (
        <ConverterScreen
          activePlatform={activePlatform}
          onSelectPlatform={(p) => setActivePlatform(p)}
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'linkToDoc' && (
        <LinkToDocScreen
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'imageToLink' && (
        <ImageToLinkScreen
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'photoStudio' && (
        <PhotoStudioScreen
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'videoStudio' && (
        <VideoStudioScreen
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'bgRemover' && (
        <BgRemoverScreen
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'waReact' && (
        <WaReactCard
          theme={theme}
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {/* Footer Bawah */}
      <Footer />
    </div>
  );
}
