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
import FallingLeavesBackground from './components/FallingLeavesBackground';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [qrInitialUrl, setQrInitialUrl] = useState('');
  const [activePlatform, setActivePlatform] = useState('tiktok');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    localStorage.setItem('kuro_theme', 'light');
  }, []);

  if (currentScreen === 'splash') {
    return <SplashScreen onEnter={() => setCurrentScreen('welcome')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans selection:bg-black selection:text-white relative">
      {/* Background Animasi Daun Gugur Terbawa Angin */}
      <FallingLeavesBackground />

      {/* Konten Utama Aplikasi di Layer Depan (z-10) */}
      <div className="relative z-10 flex flex-col flex-grow w-full">
        {/* Top Header Navigation */}
        <Navbar
          currentScreen={currentScreen}
          onSelectTool={(toolId) => {
            setCurrentScreen(toolId);
          }}
          onGoHome={() => setCurrentScreen('welcome')}
        />

      {/* Screen Routing */}
      {currentScreen === 'welcome' && (
        <WelcomeScreen
          theme="light"
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

      {currentScreen === 'pngToPdf' && (
        <PngToPdfScreen
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
          onOpenQrStudio={(url) => {
            setQrInitialUrl(url);
            setCurrentScreen('qrStudio');
          }}
        />
      )}

      {currentScreen === 'compressor' && (
        <MediaCompressorScreen
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'qrStudio' && (
        <QrStudioScreen
          initialUrl={qrInitialUrl}
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'audioMerger' && (
        <AudioMergerScreen
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
          onOpenTrimmer={() => setCurrentScreen('videoTrimmer')}
        />
      )}

      {currentScreen === 'videoTrimmer' && (
        <VideoTrimmerScreen
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'bgRemover' && (
        <BgRemoverScreen
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

      {currentScreen === 'jjFinder' && (
        <JjFinderScreen
          theme="light"
          onBack={() => setCurrentScreen('welcome')}
        />
      )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
