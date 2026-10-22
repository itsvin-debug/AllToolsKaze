/**
 * Kuro Studio - Bilingual Translations (ID / EN)
 * Kamus teks lengkap untuk antarmuka dwibahasa (Bahasa Indonesia & English).
 * Mencakup seluruh halaman, kartu identitas, alat utilitas, dan menu pengaturan Photo 2.
 */

export const translations = {
  id: {
    nav: {
      home: 'Beranda',
      gallery: 'Galeri',
      history: 'Riwayat',
      settings: 'Pengaturan',
      search: 'Cari',
      backToHome: 'Kembali ke Beranda',
      switchTool: 'Beralih Alat',
      tagline: 'Multi-Tool Platform'
    },
    identity: {
      creatorName: 'Nama Kreator',
      deviceUser: 'Pengguna Perangkat',
      enterUsername: 'Ketik nama Anda di sini...',
      inputUsername: 'MASUKKAN NAMA PENGGUNA',
      deviceDetected: '1 Perangkat Terdeteksi',
      save: 'Simpan',
      saved: 'Tersimpan',
      edit: 'Ubah',
      status: 'Status',
      online: 'ONLINE',
      region: 'Region',
      device: 'Perangkat',
      battery: 'Baterai',
      charging: 'CAS',
      batteryActive: 'AKTIF',
      network: 'Network',
      detecting: 'Mendeteksi...',
      deviceTime: 'Jam',
      role: 'Role',
      member: 'MEMBER',
      admin: 'ADMIN',
      login: 'Login',
      searchPlaceholder: 'Cari alat di Kuro Studio (Media Downloader, PDF, QR Code, Kompres...)',
      whatsappChannel: 'Saluran WhatsApp',
      tiktokChannel: 'TT @kazexy1 (TikTok)',
      githubRepo: 'GitHub Repo',
      adminModalTitle: 'Masuk Role Admin',
      adminModalDesc: 'Masukkan kata sandi admin untuk mengelola izin akses khusus.',
      adminPasswordPlaceholder: 'Ketik kata sandi admin...',
      adminCancel: 'Batal',
      adminSubmit: 'Verifikasi Sandi',
      adminWrongPass: 'Kata sandi admin salah. Akses role Admin ditolak.'
    },
    welcome: {
      mainTools: 'DAFTAR ALAT UTAMA',
      toolsCount: 'ALAT',
      subtitle: 'Pilih alat utilitas yang ingin digunakan. Setiap alat membuka halaman kerja khusus.',
      resetSearch: 'Reset Pencarian',
      catAll: 'Semua Alat',
      catDownloader: 'Downloader',
      catFile: 'Konversi & File',
      catCreative: 'Studio & Kreatif',
      catUtility: 'Utilitas & WA',
      tools: {
        downloader: {
          name: 'Media Downloader',
          desc: 'Unduh video HD, foto slide, dan audio tanpa watermark dari 16 platform medsos.',
          tag: '16 PLATFORM'
        },
        jjFinder: {
          name: 'Cari Link JJ',
          desc: 'Template XML dan preset 5MB TikTok jedag-jedug untuk Alight Motion.',
          tag: 'SOSMED'
        },
        pngToPdf: {
          name: 'PNG to PDF',
          desc: 'Satukan multi-foto menjadi dokumen PDF dengan kustomisasi teks dan layout tipografi.',
          tag: 'MULTI-IMG'
        },
        linkToDoc: {
          name: 'Link to PDF & PPT',
          desc: 'Konversi tautan dokumen web menjadi dokumen PDF dan presentasi PPTX terstruktur.',
          tag: 'DOC & PPTX'
        },
        imageToLink: {
          name: 'File ke Link',
          desc: 'Unggah foto, video, dan PDF untuk dijadikan tautan URL publik yang dapat diakses langsung.',
          tag: 'UNIVERSAL'
        },
        compressor: {
          name: 'Kompres Media HD',
          desc: 'Optimasi ukuran file gambar dan video hingga kilobyte tanpa merusak ketajaman visual.',
          tag: 'MB + KB'
        },
        qrStudio: {
          name: 'QR Code Studio',
          desc: 'Desain kode QR kustom dengan logo dan frame panggilan aksi untuk berbagai kebutuhan.',
          tag: 'CUSTOM QR'
        },
        audioMerger: {
          name: 'Audio Merger',
          desc: 'Satukan dan potong menit atau detik beberapa lagu audio dalam satu linimasa.',
          tag: 'TIMELINE'
        },
        photoStudio: {
          name: 'Photo Studio',
          desc: 'Pertajam foto, atur kontras hitam putih, dan sesuaikan resolusi gambar.',
          tag: 'STUDIO HD'
        },
        videoStudio: {
          name: 'Video Studio',
          desc: 'Editor filter visual video untuk penyesuaian kecerahan, saturasi, dan efek gerak.',
          tag: 'FX STUDIO'
        },
        videoTrimmer: {
          name: 'Video Trimmer',
          desc: 'Potong durasi video dari titik awal ke akhir tanpa kompresi ulang kualitas.',
          tag: 'LOSSLESS'
        },
        bgRemover: {
          name: 'Hapus Background',
          desc: 'Ekstraksi subjek foto dan logo untuk menghasilkan gambar transparan format PNG.',
          tag: 'PNG HD'
        }
      }
    },
    gallery: {
      title: 'Galeri Hasil Karya',
      subtitle: 'Semua berkas, hasil unduhan, dan kreasi Anda tersimpan secara lokal di sini.',
      filterAll: 'Semua Berkas',
      filterImage: 'Gambar & QR',
      filterVideo: 'Video & JJ',
      filterDoc: 'Dokumen',
      filterAudio: 'Audio',
      emptyTitle: 'Belum Ada Berkas di Galeri',
      emptyDesc: 'Kreasi seperti unduhan media, QR Code, dan dokumen yang Anda buat akan muncul di sini secara otomatis.',
      exploreTools: 'Jelajahi Alat Sekarang',
      redownload: 'Unduh Ulang',
      delete: 'Hapus',
      downloadSuccess: 'Mulai mengunduh berkas...',
      itemDeleted: 'Berkas dihapus dari galeri.',
      itemsCount: 'berkas tersimpan'
    },
    history: {
      title: 'Riwayat Penggunaan',
      subtitle: 'Pantau alat dan fitur yang pernah Anda gunakan di perangkat ini.',
      filterAll: 'Semua',
      filterToday: 'Hari Ini',
      filterOlder: 'Sebelumnya',
      emptyTitle: 'Belum Ada Riwayat',
      emptyDesc: 'Aktivitas penggunaan alat utilitas Kuro Studio akan tercatat secara otomatis di sini.',
      clearAll: 'Bersihkan Riwayat',
      clearConfirm: 'Apakah Anda yakin ingin menghapus seluruh riwayat?',
      cleared: 'Riwayat aktivitas telah dibersihkan.',
      reopenTool: 'Buka Alat Ini',
      justNow: 'Baru saja',
      minutesAgo: 'menit lalu',
      hoursAgo: 'jam lalu',
      daysAgo: 'hari lalu'
    },
    settings: {
      title: 'SETTINGS',
      subtitle: 'Configure your experience',
      searchPlaceholder: 'Temukan konten terkait & preferensi...',
      
      // 6 Kartu Kategori Utama (Terinspirasi Foto 2)
      secGeneral: {
        title: 'GENERAL',
        subtitle: 'Language, Input Automation & App Security'
      },
      secLookFeel: {
        title: 'LOOK & FEEL',
        subtitle: 'Theme, Fonts, Animations & Visual FX'
      },
      secStorage: {
        title: 'STORAGE & DOWNLOAD',
        subtitle: 'Save Paths, Filenames & Data Isolation'
      },
      secNetwork: {
        title: 'NETWORK & PERFORMANCE',
        subtitle: 'Servers, Connections, Latency & Retries'
      },
      secAdvanced: {
        title: 'ADVANCED',
        subtitle: 'History Retention, Media Player & Reset'
      },
      secAbout: {
        title: 'ABOUT & HELP',
        subtitle: 'Version, Help, Developer links'
      },

      // Konten General
      languageTitle: 'Bahasa Antarmuka (Language)',
      languageDesc: 'Pilih bahasa tampilan yang Anda sukai untuk seluruh halaman Kuro Studio.',
      langIndonesian: 'Bahasa Indonesia',
      langEnglish: 'English (US)',
      inputAutoTitle: 'Otomasi Input URL',
      inputAutoDesc: 'Otomatis fokus pada kolom input dan mempermudah penempelan tautan.',
      appSecurityTitle: 'Keamanan Sesi & Privasi',
      appSecurityDesc: 'Enkripsi data sesi lokal dan lindungi riwayat unduhan pada perangkat publik.',

      // Konten Look & Feel
      darkModeTitle: 'Mode Gelap (Dark Mode)',
      darkModeDesc: 'Tampilan kontras tinggi bertema gelap monokrom.',
      compactModeTitle: 'Mode Ringkas (Compact Mode)',
      compactModeDesc: 'Rapatkan jarak spasi antar-card untuk layar kecil.',
      fontTitle: 'Font Aplikasi',
      fontDesc: 'Pilih tipografi utama untuk tampilan antarmuka web.',
      textSizeTitle: 'Ukuran Teks Antarmuka',
      textSizeDesc: 'Sesuaikan skala keterbacaan teks agar nyaman di mata Anda.',
      textSizeSmall: 'Kecil',
      textSizeNormal: 'Default',
      textSizeLarge: 'Besar',
      animSpeedTitle: 'Kecepatan Animasi',
      animSpeedDesc: 'Atur ritme transisi antarmuka dan interaksi elemen.',
      animFast: 'Cepat (0.5x)',
      animNormal: 'Normal (1x)',
      animRelaxed: 'Santai (1.5x)',
      cornerStyleTitle: 'Gaya Sudut Card (Border Radius)',
      cornerStyleDesc: 'Pilih bentuk kelengkungan sudut card dan tombol neobrutalism.',
      cornerRounded: 'Modern (Bulat)',
      cornerSharp: 'Brutalist (Lancip)',
      cornerSoft: 'Soft (Halus)',
      hideAnimationsTitle: 'Matikan Animasi Latar (Hemat Baterai)',
      hideAnimationsDesc: 'Sembunyikan animasi sakura gugur & partikel agar performa super ringan.',

      // Konten Storage & Download
      deviceIdTitle: 'ID Klien Perangkat Ini',
      deviceIdDesc: 'ID unik permanen ini mengisolasi galeri dan riwayat khusus untuk perangkat Anda.',
      showGalleryTitle: 'Tampilkan Tab Galeri di Navbar',
      showGalleryDesc: 'Tampilkan atau sembunyikan pintasan tab Galeri pada navigasi.',
      showHistoryTitle: 'Tampilkan Tab Riwayat di Navbar',
      showHistoryDesc: 'Tampilkan atau sembunyikan pintasan tab Riwayat pada navigasi.',
      clearGalleryTitle: 'Bersihkan Galeri Perangkat',
      clearGalleryDesc: 'Hapus seluruh kreasi dan berkas yang tersimpan di memori perangkat ini.',
      clearGalleryBtn: 'Bersihkan Galeri',
      clearGalleryConfirm: 'Apakah Anda yakin ingin menghapus semua berkas galeri lokal pada perangkat ini?',
      galleryClearedMsg: 'Galeri perangkat telah dibersihkan.',

      // Konten Network & Performance
      currentLatencyTitle: 'Latensi Jaringan Saat Ini',
      currentLatencyDesc: 'Metrik kecepatan transmisi paket data antara perangkat Anda dan server.',
      engineTitle: 'Dual Engine Processing',
      engineDesc: 'Pemrosesan otomatis menggunakan Backend FFmpeg dengan fallback Client-Side Browser.',
      offlineModeTitle: 'Kesiapan Mode Luring',
      offlineModeDesc: 'Alat seperti pemotong video, studio foto, dan QR dapat berjalan mandiri di browser.',

      // Konten Advanced
      historyLimitTitle: 'Batas Retensi Riwayat',
      historyLimitDesc: 'Menyimpan hingga 50 entri aktivitas terakhir pada perangkat ini secara otomatis.',
      mediaAutoplayTitle: 'Putar Otomatis Media di Galeri',
      mediaAutoplayDesc: 'Putar otomatis video dan audio saat modal pratinjau dibuka.',
      factoryResetTitle: 'Kembalikan Pengaturan ke Bawaan Pabrik',
      factoryResetDesc: 'Pulihkan seluruh tema, font, dan preferensi ke setelan standar Kuro Studio.',
      factoryResetBtn: 'Reset Pengaturan',
      factoryResetConfirm: 'Apakah Anda yakin ingin mereset semua pengaturan ke setelan bawaan pabrik?',
      factoryResetSuccessMsg: 'Semua pengaturan berhasil dipulihkan ke bawaan.',

      // Konten About & Help
      versionTitle: 'Versi Web',
      versionBadge: 'v2.5.0 (Stable Release)',
      versionDesc: 'Kuro Studio Multi-Tool Suite edisi produksi dengan arsitektur modular.',
      helpTitle: 'Bantuan & FAQ Singkat',
      help1Q: 'Bagaimana cara mengunduh media tanpa watermark?',
      help1A: 'Salin tautan dari aplikasi TikTok/Instagram, buka Media Downloader, tempel tautan, lalu klik Unduh HD.',
      help2Q: 'Apakah data saya bisa dilihat oleh perangkat lain?',
      help2A: 'Tidak bisa. Sistem Kuro Studio menggunakan isolasi Device ID mandiri, data setiap HP atau komputer terpisah 100%.',
      devLinksTitle: 'Tautan Pengembang & Komunitas',
      devLinksDesc: 'Terhubung langsung dengan kreator dan repositori sumber terbuka Kuro Studio.',
      linkWhatsapp: 'Saluran WhatsApp Resmi',
      linkTiktok: 'TikTok (@kazexy1)',
      linkGithub: 'Repositori GitHub (Source Code)'
    },
    toasts: {
      galleryHidden: 'Tab Galeri disembunyikan',
      galleryVisible: 'Tab Galeri ditampilkan',
      historyHidden: 'Tab Riwayat disembunyikan',
      historyVisible: 'Tab Riwayat ditampilkan',
      darkModeOn: 'Mode gelap diaktifkan',
      darkModeOff: 'Mode terang diaktifkan',
      compactModeOn: 'Mode ringkas diaktifkan',
      compactModeOff: 'Mode normal diaktifkan',
      animationsOff: 'Animasi latar dimatikan untuk performa hemat',
      animationsOn: 'Animasi diaktifkan kembali',
      fontChanged: 'Font aplikasi diubah ke',
      textSizeChanged: 'Ukuran teks diatur ke',
      cornerChanged: 'Gaya sudut diubah ke',
      langSwitched: 'Bahasa berhasil diubah ke Bahasa Indonesia',
      inputAutoToggled: 'Pengaturan otomasi input diperbarui',
      securityToggled: 'Pengaturan keamanan sesi diperbarui'
    },
    footer: {
      suite: 'UTILITY SUITE',
      text: 'Platform utilitas all-in-one untuk media, dokumen, audio, dan alat kreatif digital.'
    }
  },

  en: {
    nav: {
      home: 'Home',
      gallery: 'Gallery',
      history: 'History',
      settings: 'Settings',
      search: 'Search',
      backToHome: 'Back to Home',
      switchTool: 'Switch Tool',
      tagline: 'Multi-Tool Platform'
    },
    identity: {
      creatorName: 'Creator Name',
      deviceUser: 'Device User',
      enterUsername: 'Enter your username here...',
      inputUsername: 'ENTER USERNAME',
      deviceDetected: '1 Device Detected',
      save: 'Save',
      saved: 'Saved',
      edit: 'Edit',
      status: 'Status',
      online: 'ONLINE',
      region: 'Region',
      device: 'Device',
      battery: 'Battery',
      charging: 'CHARGING',
      batteryActive: 'ACTIVE',
      network: 'Network',
      detecting: 'Detecting...',
      deviceTime: 'Time',
      role: 'Role',
      member: 'MEMBER',
      admin: 'ADMIN',
      login: 'Login',
      searchPlaceholder: 'Search tools in Kuro Studio (Media Downloader, PDF, QR Code, Compress...)',
      whatsappChannel: 'WhatsApp Channel',
      tiktokChannel: 'TT @kazexy1 (TikTok)',
      githubRepo: 'GitHub Repo',
      adminModalTitle: 'Admin Role Login',
      adminModalDesc: 'Enter administrator credentials to unlock special administrative permissions.',
      adminPasswordPlaceholder: 'Enter admin password...',
      adminCancel: 'Cancel',
      adminSubmit: 'Verify Password',
      adminWrongPass: 'Incorrect admin password. Access denied.'
    },
    welcome: {
      mainTools: 'MAIN UTILITY TOOLS',
      toolsCount: 'TOOLS',
      subtitle: 'Select utility tool to use. Each tool opens a dedicated workspace.',
      resetSearch: 'Reset Search',
      catAll: 'All Tools',
      catDownloader: 'Downloader',
      catFile: 'Convert & Files',
      catCreative: 'Studio & Creative',
      catUtility: 'Utility & WA',
      tools: {
        downloader: {
          name: 'Media Downloader',
          desc: 'Download HD videos, photo slides, and audio without watermarks from 16 social platforms.',
          tag: '16 PLATFORMS'
        },
        jjFinder: {
          name: 'JJ Preset Finder',
          desc: 'Alight Motion XML templates and 5MB TikTok jedag-jedug presets.',
          tag: 'SOCIAL'
        },
        pngToPdf: {
          name: 'PNG to PDF',
          desc: 'Merge multiple images into formatted PDF documents with custom typography.',
          tag: 'MULTI-IMG'
        },
        linkToDoc: {
          name: 'Link to PDF & PPT',
          desc: 'Convert web document links into structured PDF and PPTX slide presentations.',
          tag: 'DOC & PPTX'
        },
        imageToLink: {
          name: 'File to Link',
          desc: 'Upload photos, videos, and PDFs to generate instant public CDN links.',
          tag: 'UNIVERSAL'
        },
        compressor: {
          name: 'HD Media Compressor',
          desc: 'Optimize image and video file sizes down to kilobytes without sacrificing clarity.',
          tag: 'MB + KB'
        },
        qrStudio: {
          name: 'QR Code Studio',
          desc: 'Design custom QR codes with branding logos, stylized dot patterns, and frames.',
          tag: 'CUSTOM QR'
        },
        audioMerger: {
          name: 'Audio Merger',
          desc: 'Trim and merge multiple audio/video audio tracks into a master MP3 track.',
          tag: 'TIMELINE'
        },
        photoStudio: {
          name: 'Photo Studio',
          desc: 'Enhance photo sharpness, adjust monochromatic contrast, and upscale resolution.',
          tag: 'STUDIO HD'
        },
        videoStudio: {
          name: 'Video Studio',
          desc: 'Video visual filter suite for brightness, saturation, and cinematic motion effects.',
          tag: 'FX STUDIO'
        },
        videoTrimmer: {
          name: 'Video Trimmer',
          desc: 'Lossless video trimming with millisecond precision without re-encoding.',
          tag: 'LOSSLESS'
        },
        bgRemover: {
          name: 'Background Remover',
          desc: 'Extract subjects and logos into clean, high-resolution transparent PNG images.',
          tag: 'PNG HD'
        }
      }
    },
    gallery: {
      title: 'Creation Gallery',
      subtitle: 'All files, downloads, and creations you produced are stored locally here.',
      filterAll: 'All Files',
      filterImage: 'Images & QR',
      filterVideo: 'Video & JJ',
      filterDoc: 'Documents',
      filterAudio: 'Audio',
      emptyTitle: 'No Files in Gallery Yet',
      emptyDesc: 'Media downloads, custom QR Codes, and converted files will appear here automatically.',
      exploreTools: 'Explore Tools Now',
      redownload: 'Re-download',
      delete: 'Delete',
      downloadSuccess: 'Starting file download...',
      itemDeleted: 'File removed from gallery.',
      itemsCount: 'saved files'
    },
    history: {
      title: 'Usage History',
      subtitle: 'Review tools and features you accessed on this device.',
      filterAll: 'All',
      filterToday: 'Today',
      filterOlder: 'Older',
      emptyTitle: 'No History Yet',
      emptyDesc: 'Your Kuro Studio utility tool activity will be recorded here automatically.',
      clearAll: 'Clear History',
      clearConfirm: 'Are you sure you want to clear all usage history?',
      cleared: 'Activity history has been cleared.',
      reopenTool: 'Open This Tool',
      justNow: 'Just now',
      minutesAgo: 'mins ago',
      hoursAgo: 'hours ago',
      daysAgo: 'days ago'
    },
    settings: {
      title: 'SETTINGS',
      subtitle: 'Configure your experience',
      searchPlaceholder: 'Search related settings & tools...',

      // 6 Main Category Cards (Inspired by Photo 2)
      secGeneral: {
        title: 'GENERAL',
        subtitle: 'Language, Input Automation & App Security'
      },
      secLookFeel: {
        title: 'LOOK & FEEL',
        subtitle: 'Theme, Fonts, Animations & Visual FX'
      },
      secStorage: {
        title: 'STORAGE & DOWNLOAD',
        subtitle: 'Save Paths, Filenames & Data Isolation'
      },
      secNetwork: {
        title: 'NETWORK & PERFORMANCE',
        subtitle: 'Servers, Connections, Latency & Retries'
      },
      secAdvanced: {
        title: 'ADVANCED',
        subtitle: 'History Retention, Media Player & Reset'
      },
      secAbout: {
        title: 'ABOUT & HELP',
        subtitle: 'Version, Help, Developer links'
      },

      // General Content
      languageTitle: 'Interface Language',
      languageDesc: 'Select your preferred language across Kuro Studio pages.',
      langIndonesian: 'Bahasa Indonesia',
      langEnglish: 'English (US)',
      inputAutoTitle: 'Input URL Automation',
      inputAutoDesc: 'Automatically focus input fields and simplify pasting links.',
      appSecurityTitle: 'Session Security & Privacy',
      appSecurityDesc: 'Encrypt local session data and protect download history on shared devices.',

      // Look & Feel Content
      darkModeTitle: 'Dark Mode',
      darkModeDesc: 'High-contrast monochrome dark aesthetic.',
      compactModeTitle: 'Compact Mode',
      compactModeDesc: 'Tighter card spacing and margins for smaller displays.',
      fontTitle: 'Application Font',
      fontDesc: 'Choose the primary typography for the user interface.',
      textSizeTitle: 'Interface Text Size',
      textSizeDesc: 'Scale text sizing for optimal eye comfort and readability.',
      textSizeSmall: 'Small',
      textSizeNormal: 'Default',
      textSizeLarge: 'Large',
      animSpeedTitle: 'Animation Rhythm',
      animSpeedDesc: 'Adjust transition speed and element interactions.',
      animFast: 'Fast (0.5x)',
      animNormal: 'Normal (1x)',
      animRelaxed: 'Relaxed (1.5x)',
      cornerStyleTitle: 'Card Corner Style (Border Radius)',
      cornerStyleDesc: 'Choose the curvature style of Neo-Brutalist cards and buttons.',
      cornerRounded: 'Modern (Rounded)',
      cornerSharp: 'Brutalist (Sharp)',
      cornerSoft: 'Soft (Subtle)',
      hideAnimationsTitle: 'Hide Background Animations (Eco Mode)',
      hideAnimationsDesc: 'Hide falling sakura leaves and particle effects for maximum battery performance.',

      // Storage & Download Content
      deviceIdTitle: 'Current Device Client ID',
      deviceIdDesc: 'This unique permanent ID isolates gallery and history specifically to this device.',
      showGalleryTitle: 'Show Gallery Tab in Navbar',
      showGalleryDesc: 'Toggle visibility of the Gallery shortcut on the navigation bar.',
      showHistoryTitle: 'Show History Tab in Navbar',
      showHistoryDesc: 'Toggle visibility of the History shortcut on the navigation bar.',
      clearGalleryTitle: 'Clear Device Gallery',
      clearGalleryDesc: 'Delete all locally stored creations and files from this device memory.',
      clearGalleryBtn: 'Clear Gallery',
      clearGalleryConfirm: 'Are you sure you want to delete all local gallery files on this device?',
      galleryClearedMsg: 'Device gallery has been cleared.',

      // Network & Performance Content
      currentLatencyTitle: 'Current Network Latency',
      currentLatencyDesc: 'Packet transmission speed metric between your device and the server.',
      engineTitle: 'Dual Engine Processing',
      engineDesc: 'Automatic processing using FFmpeg backend with client-side browser fallback.',
      offlineModeTitle: 'Offline Mode Readiness',
      offlineModeDesc: 'Tools like video trimmer, photo studio, and QR code run independently in the browser.',

      // Advanced Content
      historyLimitTitle: 'History Retention Limit',
      historyLimitDesc: 'Stores up to the latest 50 activity entries on this device automatically.',
      mediaAutoplayTitle: 'Autoplay Media in Gallery',
      mediaAutoplayDesc: 'Automatically play video and audio when opening the preview modal.',
      factoryResetTitle: 'Reset Settings to Factory Defaults',
      factoryResetDesc: 'Restore all themes, fonts, and preferences to Kuro Studio default configuration.',
      factoryResetBtn: 'Reset Settings',
      factoryResetConfirm: 'Are you sure you want to reset all settings to factory defaults?',
      factoryResetSuccessMsg: 'All settings have been restored to factory defaults.',

      // About & Help Content
      versionTitle: 'Web Version',
      versionBadge: 'v2.5.0 (Stable Release)',
      versionDesc: 'Kuro Studio production multi-tool suite with modular architecture.',
      helpTitle: 'Quick Help & FAQ',
      help1Q: 'How do I download media without watermark?',
      help1A: 'Copy the link from TikTok or Instagram, open Media Downloader, paste it, and click Download HD.',
      help2Q: 'Can my data be seen by other devices or users?',
      help2A: 'No. Kuro Studio uses isolated Device ID sandboxing. Every phone or computer is 100% separate.',
      devLinksTitle: 'Developer & Community Links',
      devLinksDesc: 'Connect directly with the creator and official Kuro Studio open-source repos.',
      linkWhatsapp: 'Official WhatsApp Channel',
      linkTiktok: 'TikTok (@kazexy1)',
      linkGithub: 'GitHub Repository (Source Code)'
    },
    toasts: {
      galleryHidden: 'Gallery tab hidden',
      galleryVisible: 'Gallery tab visible',
      historyHidden: 'History tab hidden',
      historyVisible: 'History tab visible',
      darkModeOn: 'Dark mode enabled',
      darkModeOff: 'Light mode enabled',
      compactModeOn: 'Compact mode enabled',
      compactModeOff: 'Default mode enabled',
      animationsOff: 'Animations hidden for performance',
      animationsOn: 'Animations re-enabled',
      fontChanged: 'Application font changed to',
      textSizeChanged: 'Text size set to',
      cornerChanged: 'Corner style changed to',
      langSwitched: 'Language switched to English',
      inputAutoToggled: 'Input automation setting updated',
      securityToggled: 'Session security setting updated'
    },
    footer: {
      suite: 'UTILITY SUITE',
      text: 'All-in-one utility suite for media, documents, audio, and digital creative tools.'
    }
  }
};
