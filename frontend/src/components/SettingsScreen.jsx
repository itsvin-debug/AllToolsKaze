import React, { useState } from 'react';
import CosmicBackButton from './CosmicBackButton';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Zap, 
  Shield, 
  Palette, 
  Type, 
  Sliders, 
  Maximize2, 
  Moon, 
  Sun, 
  Layers, 
  Eye, 
  EyeOff, 
  Info, 
  HelpCircle, 
  ExternalLink,
  MessageCircle,
  GitBranch,
  ChevronDown,
  Check
} from 'lucide-react';
import { translations } from '../utils/translations';

export default function SettingsScreen({ 
  settings, 
  onUpdateSettings, 
  onBack, 
  onShowToast 
}) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'theme' | 'about'
  const [openFaq, setOpenFaq] = useState(null);

  const lang = settings.language || 'id';
  const t = translations[lang] || translations.id;

  // Helper toggle switch dengan toast notifikasi langsung
  const handleToggle = (key, customOnMsg, customOffMsg) => {
    const nextVal = !settings[key];
    onUpdateSettings({ [key]: nextVal });

    if (onShowToast) {
      const msg = nextVal ? customOnMsg : customOffMsg;
      onShowToast(msg);
    }
  };

  const handleLanguageChange = (newLang) => {
    if (newLang === settings.language) return;
    onUpdateSettings({ language: newLang });
    if (onShowToast) {
      onShowToast(newLang === 'en' ? 'Language switched to English' : 'Bahasa berhasil diubah ke Bahasa Indonesia');
    }
  };

  const handleFontChange = (fontName) => {
    onUpdateSettings({ fontFamily: fontName });
    if (onShowToast) {
      onShowToast(`${t.toasts.fontChanged} ${fontName}`);
    }
  };

  const handleTextSizeChange = (size) => {
    onUpdateSettings({ textSize: size });
    if (onShowToast) {
      const label = size === 'small' ? t.settings.textSizeSmall : size === 'large' ? t.settings.textSizeLarge : t.settings.textSizeNormal;
      onShowToast(`${t.toasts.textSizeChanged} ${label}`);
    }
  };

  const handleSpeedChange = (speed) => {
    onUpdateSettings({ animationSpeed: speed });
    if (onShowToast) {
      const label = speed === 'fast' ? t.settings.animFast : speed === 'relaxed' ? t.settings.animRelaxed : t.settings.animNormal;
      onShowToast(`${t.settings.animSpeedTitle}: ${label}`);
    }
  };

  const handleCornerChange = (corner) => {
    onUpdateSettings({ cornerStyle: corner });
    if (onShowToast) {
      const label = corner === 'sharp' ? t.settings.cornerSharp : corner === 'soft' ? t.settings.cornerSoft : t.settings.cornerRounded;
      onShowToast(`${t.toasts.cornerChanged} ${label}`);
    }
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-start px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto w-full">
      <div className="w-full flex flex-col gap-5">
        
        {/* Navigasi Atas & Kembali */}
        <div className="w-full flex items-center justify-between">
          <CosmicBackButton onClick={onBack} label={t.nav.backToHome} />
          
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded border-2 border-black bg-neutral-100 text-black uppercase">
            Kuro Studio Settings
          </span>
        </div>

        {/* Banner Judul Layar */}
        <div className="w-full rounded-xl border-2 border-black p-5 sm:p-6 bg-white shadow-[4px_4px_0px_#000000] flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg border-2 border-black bg-black text-white flex items-center justify-center shrink-0">
              <SettingsIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-black tracking-tight font-display">
                {t.settings.title}
              </h1>
              <p className="text-xs text-neutral-600 mt-0.5">
                {t.settings.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selector (GENERAL / THEME / ABOUT & HELP) */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl border-2 border-black bg-neutral-100 shadow-[3px_3px_0px_#000000]">
          {[
            { id: 'general', label: t.settings.tabGeneral, icon: Globe },
            { id: 'theme', label: t.settings.tabTheme, icon: Palette },
            { id: 'about', label: t.settings.tabAbout, icon: Info }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-2 sm:px-4 rounded-lg font-mono font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'border-2 border-black bg-black text-white shadow-[2px_2px_0px_#000000] -translate-x-0.5 -translate-y-0.5'
                    : 'text-black hover:bg-white/60'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── TAB A: GENERAL ─── */}
        {activeTab === 'general' && (
          <div className="w-full flex flex-col gap-4">
            
            {/* 1. Bahasa (Language) */}
            <div className="rounded-xl border-2 border-black p-4 sm:p-5 bg-white shadow-[3px_3px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg border-2 border-black bg-neutral-100 flex items-center justify-center text-black shrink-0 mt-0.5">
                  <Globe className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-black">
                    {t.settings.languageTitle}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {t.settings.languageDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('id')}
                  className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-bold transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5 ${
                    lang === 'id'
                      ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                      : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  <span>🇮🇩 ID</span>
                  {lang === 'id' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-bold transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5 ${
                    lang === 'en'
                      ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                      : 'bg-white text-black hover:bg-neutral-100'
                  }`}
                >
                  <span>🇺🇸 EN</span>
                  {lang === 'en' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              </div>
            </div>

            {/* 2. Otomasi Input URL */}
            <div className="rounded-xl border-2 border-black p-4 sm:p-5 bg-white shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg border-2 border-black bg-neutral-100 flex items-center justify-center text-black shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-black">
                    {t.settings.inputAutoTitle}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {t.settings.inputAutoDesc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('inputAutomation', t.toasts.inputAutoToggled, t.toasts.inputAutoToggled)}
                className={`w-12 h-7 rounded-full border-2 border-black transition-colors p-0.5 flex items-center cursor-pointer shrink-0 ${
                  settings.inputAutomation ? 'bg-black justify-end' : 'bg-neutral-200 justify-start'
                }`}
                aria-label={t.settings.inputAutoTitle}
              >
                <div className={`w-5 h-5 rounded-full border border-black transition-all ${
                  settings.inputAutomation ? 'bg-white' : 'bg-white'
                }`} />
              </button>
            </div>

            {/* 3. Keamanan Sesi & Privasi */}
            <div className="rounded-xl border-2 border-black p-4 sm:p-5 bg-white shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg border-2 border-black bg-neutral-100 flex items-center justify-center text-black shrink-0 mt-0.5">
                  <Shield className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-black">
                    {t.settings.appSecurityTitle}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {t.settings.appSecurityDesc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggle('appSecurity', t.toasts.securityToggled, t.toasts.securityToggled)}
                className={`w-12 h-7 rounded-full border-2 border-black transition-colors p-0.5 flex items-center cursor-pointer shrink-0 ${
                  settings.appSecurity ? 'bg-black justify-end' : 'bg-neutral-200 justify-start'
                }`}
                aria-label={t.settings.appSecurityTitle}
              >
                <div className="w-5 h-5 rounded-full border border-black bg-white" />
              </button>
            </div>

          </div>
        )}

        {/* ─── TAB B: THEME ─── */}
        {activeTab === 'theme' && (
          <div className="w-full flex flex-col gap-4">
            
            {/* 1. Font Aplikasi */}
            <div className="rounded-xl border-2 border-black p-4 sm:p-5 bg-white shadow-[3px_3px_0px_#000000] flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg border-2 border-black bg-neutral-100 flex items-center justify-center text-black shrink-0">
                  <Type className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-black">
                    {t.settings.fontTitle}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {t.settings.fontDesc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'Inter', label: 'Inter (Clean Sans)', fontClass: 'font-sans' },
                  { id: 'Outfit', label: 'Outfit (Trendy Display)', fontClass: "font-['Outfit',sans-serif]" },
                  { id: 'JetBrains Mono', label: 'JetBrains (Tech Mono)', fontClass: 'font-mono' }
                ].map(f => {
                  const isSelected = (settings.fontFamily || 'Inter') === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleFontChange(f.id)}
                      className={`p-2.5 rounded-lg border-2 border-black text-xs font-bold flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${f.fontClass} ${
                        isSelected
                          ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                          : 'bg-white text-black hover:bg-neutral-100'
                      }`}
                    >
                      <span>{f.label}</span>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Text Size */}
            <div className="rounded-xl border-2 border-black p-4 sm:p-5 bg-white shadow-[3px_3px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg border-2 border-black bg-neutral-100 flex items-center justify-center text-black shrink-0">
                  <Sliders className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-black">
                    {t.settings.textSizeTitle}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {t.settings.textSizeDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                {[
                  { id: 'small', label: t.settings.textSizeSmall },
                  { id: 'normal', label: t.settings.textSizeNormal },
                  { id: 'large', label: t.settings.textSizeLarge }
                ].map(s => {
                  const isSelected = (settings.textSize || 'normal') === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleTextSizeChange(s.id)}
                      className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                        isSelected
                          ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                          : 'bg-white text-black hover:bg-neutral-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Animation Speed & Corner Style Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Kecepatan Animasi */}
              <div className="rounded-xl border-2 border-black p-4 bg-white shadow-[3px_3px_0px_#000000] flex flex-col gap-2.5">
                <h3 className="font-extrabold text-sm text-black">
                  {t.settings.animSpeedTitle}
                </h3>
                <p className="text-xs text-neutral-600">
                  {t.settings.animSpeedDesc}
                </p>
                <div className="flex items-center gap-1.5 mt-auto pt-1">
                  {[
                    { id: 'fast', label: t.settings.animFast },
                    { id: 'normal', label: t.settings.animNormal },
                    { id: 'relaxed', label: t.settings.animRelaxed }
                  ].map(sp => {
                    const isSelected = (settings.animationSpeed || 'normal') === sp.id;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => handleSpeedChange(sp.id)}
                        className={`flex-1 py-1.5 px-2 rounded-lg border-2 border-black text-[11px] font-bold text-center transition-all cursor-pointer min-h-[44px] ${
                          isSelected
                            ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                            : 'bg-white text-black hover:bg-neutral-100'
                        }`}
                      >
                        {sp.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gaya Sudut Card (Corner Style) */}
              <div className="rounded-xl border-2 border-black p-4 bg-white shadow-[3px_3px_0px_#000000] flex flex-col gap-2.5">
                <h3 className="font-extrabold text-sm text-black">
                  {t.settings.cornerStyleTitle}
                </h3>
                <p className="text-xs text-neutral-600">
                  {t.settings.cornerStyleDesc}
                </p>
                <div className="flex items-center gap-1.5 mt-auto pt-1">
                  {[
                    { id: 'rounded', label: t.settings.cornerRounded },
                    { id: 'sharp', label: t.settings.cornerSharp },
                    { id: 'soft', label: t.settings.cornerSoft }
                  ].map(c => {
                    const isSelected = (settings.cornerStyle || 'rounded') === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCornerChange(c.id)}
                        className={`flex-1 py-1.5 px-2 rounded-lg border-2 border-black text-[11px] font-bold text-center transition-all cursor-pointer min-h-[44px] ${
                          isSelected
                            ? 'bg-black text-white shadow-[2px_2px_0px_#000000]'
                            : 'bg-white text-black hover:bg-neutral-100'
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 4. Daftar Sakelar Opsi & Notifikasi Feedback Instan */}
            <div className="rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] divide-y-2 divide-black overflow-hidden">
              
              {/* Opsi Dark Mode */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {settings.darkMode ? <Moon className="w-4 h-4 stroke-[2.2]" /> : <Sun className="w-4 h-4 stroke-[2.2]" />}
                  <div>
                    <h4 className="font-extrabold text-sm text-black">
                      {t.settings.darkModeTitle}
                    </h4>
                    <p className="text-xs text-neutral-600">
                      {t.settings.darkModeDesc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('darkMode', t.toasts.darkModeOn, t.toasts.darkModeOff)}
                  className={`w-12 h-7 rounded-full border-2 border-black transition-colors p-0.5 flex items-center cursor-pointer shrink-0 ${
                    settings.darkMode ? 'bg-black justify-end' : 'bg-neutral-200 justify-start'
                  }`}
                  aria-label={t.settings.darkModeTitle}
                >
                  <div className="w-5 h-5 rounded-full border border-black bg-white" />
                </button>
              </div>

              {/* Opsi Compact Mode */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 stroke-[2.2]" />
                  <div>
                    <h4 className="font-extrabold text-sm text-black">
                      {t.settings.compactModeTitle}
                    </h4>
                    <p className="text-xs text-neutral-600">
                      {t.settings.compactModeDesc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('compactMode', t.toasts.compactModeOn, t.toasts.compactModeOff)}
                  className={`w-12 h-7 rounded-full border-2 border-black transition-colors p-0.5 flex items-center cursor-pointer shrink-0 ${
                    settings.compactMode ? 'bg-black justify-end' : 'bg-neutral-200 justify-start'
                  }`}
                  aria-label={t.settings.compactModeTitle}
                >
                  <div className="w-5 h-5 rounded-full border border-black bg-white" />
                </button>
              </div>

              {/* Opsi Show Gallery Tab */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 stroke-[2.2]" />
                  <div>
                    <h4 className="font-extrabold text-sm text-black">
                      {t.settings.showGalleryTitle}
                    </h4>
                    <p className="text-xs text-neutral-600">
                      {t.settings.showGalleryDesc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('showGallery', t.toasts.galleryVisible, t.toasts.galleryHidden)}
                  className={`w-12 h-7 rounded-full border-2 border-black transition-colors p-0.5 flex items-center cursor-pointer shrink-0 ${
                    settings.showGallery ? 'bg-black justify-end' : 'bg-neutral-200 justify-start'
                  }`}
                  aria-label={t.settings.showGalleryTitle}
                >
                  <div className="w-5 h-5 rounded-full border border-black bg-white" />
                </button>
              </div>

              {/* Opsi Show History Tab */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Eye className="w-4 h-4 stroke-[2.2]" />
                  <div>
                    <h4 className="font-extrabold text-sm text-black">
                      {t.settings.showHistoryTitle}
                    </h4>
                    <p className="text-xs text-neutral-600">
                      {t.settings.showHistoryDesc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('showHistory', t.toasts.historyVisible, t.toasts.historyHidden)}
                  className={`w-12 h-7 rounded-full border-2 border-black transition-colors p-0.5 flex items-center cursor-pointer shrink-0 ${
                    settings.showHistory ? 'bg-black justify-end' : 'bg-neutral-200 justify-start'
                  }`}
                  aria-label={t.settings.showHistoryTitle}
                >
                  <div className="w-5 h-5 rounded-full border border-black bg-white" />
                </button>
              </div>

              {/* Opsi Hide Animations (Hemat Performa) */}
              <div className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <EyeOff className="w-4 h-4 stroke-[2.2]" />
                  <div>
                    <h4 className="font-extrabold text-sm text-black">
                      {t.settings.hideAnimationsTitle}
                    </h4>
                    <p className="text-xs text-neutral-600">
                      {t.settings.hideAnimationsDesc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('hideAnimations', t.toasts.animationsOff, t.toasts.animationsOn)}
                  className={`w-12 h-7 rounded-full border-2 border-black transition-colors p-0.5 flex items-center cursor-pointer shrink-0 ${
                    settings.hideAnimations ? 'bg-black justify-end' : 'bg-neutral-200 justify-start'
                  }`}
                  aria-label={t.settings.hideAnimationsTitle}
                >
                  <div className="w-5 h-5 rounded-full border border-black bg-white" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ─── TAB C: ABOUT & HELP ─── */}
        {activeTab === 'about' && (
          <div className="w-full flex flex-col gap-4">
            
            {/* Version Badge */}
            <div className="rounded-xl border-2 border-black p-4 sm:p-5 bg-white shadow-[3px_3px_0px_#000000] flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
                  {t.settings.versionTitle}
                </span>
                <h3 className="font-extrabold text-base text-black mt-0.5">
                  Kuro Studio Platform
                </h3>
                <p className="text-xs text-neutral-600 mt-0.5">
                  {t.settings.versionDesc}
                </p>
              </div>

              <span className="text-xs font-mono font-black px-2.5 py-1 rounded-lg border-2 border-black bg-black text-white shrink-0">
                {t.settings.versionBadge}
              </span>
            </div>

            {/* Help & FAQ Accordion */}
            <div className="rounded-xl border-2 border-black bg-white shadow-[3px_3px_0px_#000000] overflow-hidden">
              <div className="p-4 border-b-2 border-black bg-neutral-50 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 stroke-[2.2]" />
                <h3 className="font-extrabold text-sm text-black">
                  {t.settings.helpTitle}
                </h3>
              </div>

              <div className="divide-y-2 divide-black">
                {[
                  { q: t.settings.help1Q, a: t.settings.help1A },
                  { q: t.settings.help2Q, a: t.settings.help2A }
                ].map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className="p-4">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full text-left font-bold text-xs sm:text-sm text-black flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isOpen && (
                        <p className="text-xs text-neutral-600 mt-2 leading-relaxed bg-neutral-50 p-2.5 rounded-lg border border-black/20">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Developer Links (Sesuai Link di Halaman Utama) */}
            <div className="rounded-xl border-2 border-black p-4 sm:p-5 bg-white shadow-[3px_3px_0px_#000000] flex flex-col gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-black">
                  {t.settings.devLinksTitle}
                </h3>
                <p className="text-xs text-neutral-600 mt-0.5">
                  {t.settings.devLinksDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <a
                  href="https://whatsapp.com/channel/0029VbDfI32EAKWIfTviOv3I"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-lg border-2 border-black bg-white hover:bg-neutral-50 text-black font-bold text-xs flex items-center justify-between shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>WhatsApp</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://www.tiktok.com/@kazexy1?_r=1&_t=ZS-9AI327NzPvw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-lg border-2 border-black bg-white hover:bg-neutral-50 text-black font-bold text-xs flex items-center justify-between shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs">TT</span>
                    <span>@kazexy1</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://github.com/itsvin-debug/AllToolsKuro.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-lg border-2 border-black bg-white hover:bg-neutral-50 text-black font-bold text-xs flex items-center justify-between shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 stroke-[2.5]" />
                    <span>GitHub Repo</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
