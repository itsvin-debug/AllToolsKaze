import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import axios from 'axios';
import { extractScribdDocument, extractWebDocument } from '../services/scribd.service.js';
import { findJjTemplates } from '../services/jj.service.js';
import { 
  compressVideoService, 
  mergeAudiosService, 
  uploadUniversalFileService,
  trimVideoService
} from '../services/mediaProcessing.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

// Buat folder uploads jika belum ada
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = express.Router();

/**
 * 1. POST /api/link-to-doc
 * Mengubah URL Scribd / Canva / Web menjadi data dokumen PDF / PPT
 */
router.post('/link-to-doc', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Mohon masukkan tautan/link dokumen yang ingin dikonversi.'
      });
    }

    const cleanUrl = url.trim();
    let result = null;

    if (cleanUrl.includes('scribd.com')) {
      result = await extractScribdDocument(cleanUrl);
    } else {
      result = await extractWebDocument(cleanUrl);
    }

    return res.json({
      success: true,
      message: 'Berhasil mengekstrak konten dokumen.',
      data: result
    });
  } catch (err) {
    console.error('Error link-to-doc:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal memproses dokumen dari link tersebut.'
    });
  }
});

/**
 * 1.5 GET /api/proxy-doc-image
 * Proxy gambar dokumen Scribd/web agar tidak terkena CORS di browser saat render PDF/PPTX
 */
router.get('/proxy-doc-image', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL gambar diperlukan.');
    
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.from(response.data));
  } catch (err) {
    return res.status(500).send('Gagal memuat gambar: ' + err.message);
  }
});

/**
 * 2. GET /api/view-image/:filename
 * Endpoint langsung untuk melihat/mengunduh gambar lokal
 */
router.get('/view-image/:filename', (req, res) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const filePath = path.join(uploadsDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Gambar tidak ditemukan.');
  }

  const ext = path.extname(safeFilename).toLowerCase();
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };

  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
  res.sendFile(filePath);
});

/**
 * 3. POST /api/upload-file & POST /api/upload-image
 * Menerima file foto, video, atau dokumen PDF -> simpan lokal & sediakan link langsung + CDN
 */
router.post(['/upload-file', '/upload-image'], async (req, res) => {
  try {
    const fileBase64 = req.body.fileBase64 || req.body.imageBase64;
    const originalName = req.body.originalName || 'file';
    const mimeType = req.body.mimeType || '';

    if (!fileBase64) {
      return res.status(400).json({
        success: false,
        message: 'File tidak boleh kosong (Foto, Video, atau PDF).'
      });
    }

    const result = await uploadUniversalFileService({
      fileBase64,
      originalName,
      mimeType
    });

    return res.json({
      success: true,
      message: `${result.category.toUpperCase()} berhasil diubah menjadi tautan aktif!`,
      data: result
    });
  } catch (err) {
    console.error('Error upload-file:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengunggah file menjadi link: ' + err.message
    });
  }
});

/**
 * 3.5 POST /api/compress-video
 * Mengompres video resolusi HD dengan FFmpeg (H.264/AAC CRF tinggi)
 */
router.post('/compress-video', async (req, res) => {
  try {
    const { videoBase64, originalName, crf, qualityPreset, scale } = req.body;

    if (!videoBase64) {
      return res.status(400).json({
        success: false,
        message: 'File video tidak boleh kosong.'
      });
    }

    const result = await compressVideoService({
      videoBase64,
      originalName: originalName || 'video.mp4',
      crf: crf || 28,
      qualityPreset: qualityPreset || 'balanced',
      scale: scale || 'original'
    });

    return res.json({
      success: true,
      message: `Video berhasil dikompres hemat ${result.savingsPercent}!`,
      data: result
    });
  } catch (err) {
    console.error('Error compress-video:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengompres video: ' + err.message
    });
  }
});

/**
 * 3.8 POST /api/merge-audio
 * Menggabungkan multi-track audio dengan pemotongan menit & detik presisi via FFmpeg
 */
router.post('/merge-audio', async (req, res) => {
  try {
    const { tracks } = req.body;

    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Daftar audio untuk digabungkan tidak boleh kosong.'
      });
    }

    const result = await mergeAudiosService({ tracks });

    return res.json({
      success: true,
      message: `Berhasil menggabungkan ${result.totalTracksMerged} audio menjadi satu track master!`,
      data: result
    });
  } catch (err) {
    console.error('Error merge-audio:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal menggabungkan audio: ' + err.message
    });
  }
});

/**
 * 3.5 POST /api/trim-video
 * Memotong durasi video secara presisi dengan FFmpeg stream copy (lossless encoding)
 */
router.post('/trim-video', async (req, res) => {
  try {
    const { videoBase64, startTime, endTime, originalName } = req.body;

    if (!videoBase64) {
      return res.status(400).json({
        success: false,
        message: 'File video untuk dipotong tidak boleh kosong.'
      });
    }

    const result = await trimVideoService({
      videoBase64,
      startTime,
      endTime,
      originalName
    });

    return res.json({
      success: true,
      message: `Video berhasil dipotong selama ${result.duration} detik secara lossless!`,
      data: result
    });
  } catch (err) {
    console.error('Error trim-video:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal memotong video: ' + err.message
    });
  }
});

/**
 * 4. POST /api/jj-finder & /api/jj/find
 * Mencari link template JJ (XML Google Drive & 5MB Alight Motion) dari link TikTok atau kata kunci
 */
router.post(['/jj-finder', '/jj/find'], async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Masukkan link TikTok atau kata kunci pencarian template JJ.'
      });
    }

    const result = await findJjTemplates(query);
    return res.json({
      success: true,
      message: 'Template JJ berhasil ditemukan!',
      data: result
    });
  } catch (err) {
    console.error('Error jj-finder:', err.message);
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal mencari template JJ.'
    });
  }
});

/**
 * 5. GET /api/system-battery
 * Deteksi telemetri baterai perangkat keras secara real-time lintas browser (Firefox, Safari, Edge, Chrome)
 */
let batteryCache = null;
let lastBatteryFetch = 0;

export function getSystemBatteryInfo() {
  const now = Date.now();
  if (batteryCache && (now - lastBatteryFetch < 4000)) {
    return Promise.resolve(batteryCache);
  }

  return new Promise((resolve) => {
    // Jalankan query CIM Win32_Battery untuk Windows
    const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Battery | Select-Object -Property EstimatedChargeRemaining, BatteryStatus | ConvertTo-Json"`;
    exec(cmd, { timeout: 3000 }, (error, stdout) => {
      if (error || !stdout || !stdout.trim()) {
        batteryCache = {
          success: true,
          level: 100,
          isCharging: true,
          hasBattery: false,
          source: 'system'
        };
        lastBatteryFetch = now;
        return resolve(batteryCache);
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        const data = Array.isArray(parsed) ? parsed[0] : parsed;
        const level = typeof data.EstimatedChargeRemaining === 'number' ? data.EstimatedChargeRemaining : 100;
        const status = data.BatteryStatus || 2;
        const isCharging = [2, 3, 6, 7, 8, 9].includes(status);

        batteryCache = {
          success: true,
          level: Math.max(0, Math.min(100, level)),
          isCharging,
          hasBattery: true,
          source: 'hardware'
        };
        lastBatteryFetch = now;
        return resolve(batteryCache);
      } catch {
        batteryCache = {
          success: true,
          level: 100,
          isCharging: true,
          hasBattery: false,
          source: 'system'
        };
        lastBatteryFetch = now;
        return resolve(batteryCache);
      }
    });
  });
}

router.get('/system-battery', async (req, res) => {
  try {
    const battery = await getSystemBatteryInfo();
    return res.json(battery);
  } catch {
    return res.json({
      success: true,
      level: 100,
      isCharging: true,
      hasBattery: false
    });
  }
});

export default router;
