import express from 'express';
import axios from 'axios';
import { detectPlatform } from '../services/detector.service.js';
import { downloadTikTok } from '../services/tiktok.service.js';
import { downloadInstagram } from '../services/instagram.service.js';
import { downloadTwitter } from '../services/twitter.service.js';
import { downloadYouTube } from '../services/youtube.service.js';

const router = express.Router();

const PLATFORM_NAMES = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  youtube: 'YouTube'
};

// Endpoint Utama: POST /api/download
router.post('/download', async (req, res) => {
  try {
    const { url, expectedPlatform } = req.body;

    // validasi apakah url dikirim
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mohon masukkan URL video yang ingin diunduh.'
      });
    }

    // deteksi platform asal link
    const detection = detectPlatform(url);

    if (!detection.valid || detection.platform === 'unknown') {
      return res.status(400).json({
        success: false,
        message: 'URL tidak dikenali. Layanan ini hanya mendukung link dari TikTok, Instagram, X (Twitter), dan YouTube.'
      });
    }

    // validasi kecocokan platform jika user berada di menu spesifik
    if (expectedPlatform && expectedPlatform !== detection.platform) {
      const currentMenu = PLATFORM_NAMES[expectedPlatform] || expectedPlatform;
      const detectedMenu = PLATFORM_NAMES[detection.platform] || detection.platform;
      return res.status(400).json({
        success: false,
        message: `Link yang kamu masukkan berasal dari ${detectedMenu}, bukan ${currentMenu}. Silakan masukkan link ${currentMenu} yang valid atau beralih ke tab menu ${detectedMenu}.`
      });
    }

    let mediaData = null;

    // routing ke service masing-masing platform
    switch (detection.platform) {
      case 'tiktok':
        mediaData = await downloadTikTok(detection.cleanedUrl);
        break;

      case 'instagram':
        mediaData = await downloadInstagram(detection.cleanedUrl);
        break;

      case 'twitter':
        mediaData = await downloadTwitter(detection.cleanedUrl);
        break;

      case 'youtube':
        mediaData = await downloadYouTube(detection.cleanedUrl);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Platform belum didukung.'
        });
    }

    // tambahkan proxyUrl ke setiap link agar download otomatis aman dari blokir CORS
    if (mediaData && mediaData.downloadLinks) {
      mediaData.downloadLinks = mediaData.downloadLinks.map((item) => ({
        ...item,
        proxyUrl: `/api/proxy-download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(item.filename || 'kaze_download.mp4')}`
      }));
    }

    // tambahkan juga proxyUrl ke setiap foto di mediaData.photos
    if (mediaData && mediaData.photos && Array.isArray(mediaData.photos)) {
      mediaData.photos = mediaData.photos.map((item, idx) => ({
        ...item,
        proxyUrl: `/api/proxy-download?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(item.filename || `kaze_photo_${idx + 1}.jpg`)}`
      }));
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengekstrak media.',
      data: mediaData
    });

  } catch (error) {
    console.error('Error pada endpoint /api/download:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server saat memproses link video.'
    });
  }
});

// Endpoint Proxy: GET /api/proxy-download
// mengalirkan file video/foto langsung ke browser agar otomatis terdownload ke disk/galeri
router.get('/proxy-download', async (req, res) => {
  try {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).send('URL target tidak boleh kosong.');
    }

    const safeFilename = (filename || 'download_media.mp4').replace(/[^a-zA-Z0-9_.-]/g, '_');
    let targetUrl = decodeURIComponent(url);

    // Tentukan referer yang cocok sesuai domain target agar tidak kena 403 Forbidden
    let referer = undefined;
    if (targetUrl.includes('tiktok') || targetUrl.includes('tikcdn')) {
      referer = 'https://www.tiktok.com/';
    } else if (targetUrl.includes('instagram') || targetUrl.includes('cdninstagram') || targetUrl.includes('fbcdn')) {
      referer = 'https://www.instagram.com/';
    } else if (targetUrl.includes('twimg') || targetUrl.includes('twitter') || targetUrl.includes('x.com')) {
      referer = 'https://twitter.com/';
    } else if (targetUrl.includes('googlevideo') || targetUrl.includes('youtube') || targetUrl.includes('ytimg')) {
      referer = 'https://www.youtube.com/';
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };
    if (referer) headers['Referer'] = referer;

    // ambil stream file dari server sumber CDN
    const response = await axios({
      method: 'GET',
      url: targetUrl,
      responseType: 'stream',
      headers,
      timeout: 30000
    });

    // set header buat trigger download file di browser
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    // pipe stream langsung ke response client
    response.data.pipe(res);

  } catch (error) {
    console.error('Error pada proxy download:', error.message);
    if (!res.headersSent) {
      return res.redirect(decodeURIComponent(req.query.url));
    }
  }
});

export default router;
