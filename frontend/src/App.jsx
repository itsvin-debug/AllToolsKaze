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
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-black font-sans selection:bg-black selection:text-white relative overflow-x-hidden">
      {/* Background Animasi Kelopak Sakura Gugur (Di Lapisan Belakang / z-0) */}
      <FallingLeavesBackground />

      {/* Konten Halaman (Lapisan Depan / z-10) sehingga semua Card & Tombol menutup daun di belakangnya */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Top Header Navigation */}
        <Navbar
          currentScreen={currentScreen}
          onSelectTool={(toolId) => {
            setCurrentScreen(toolId);
          }}
          onGoHome={() => setCurrentScreen('welcome')}
        />

        {/* Screen Routing */}
        <div className="flex-1 flex flex-col">
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
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
