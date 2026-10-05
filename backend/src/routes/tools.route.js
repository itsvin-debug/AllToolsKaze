import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { extractScribdDocument, extractWebDocument } from '../services/scribd.service.js';

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
 * 3. POST /api/upload-image
 * Menerima foto (base64 / data URL) -> simpan lokal & unggah ke hosting publik instan
 */
router.post('/upload-image', async (req, res) => {
  try {
    const { imageBase64, originalName } = req.body;
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'Foto tidak boleh kosong.'
      });
    }

    // Ekstrak tipe dan data base64
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let ext = 'png';
    let buffer;

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('gif')) ext = 'gif';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }

    const uniqueId = Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const fileName = `kaze_img_${uniqueId}.${ext}`;
    const filePath = path.join(uploadsDir, fileName);

    // 1. Simpan selalu ke storage lokal server
    fs.writeFileSync(filePath, buffer);

    const host = req.get('host') || 'localhost:5001';
    const protocol = req.protocol || 'http';
    const localDirectUrl = `${protocol}://${host}/uploads/${fileName}`;
    const localApiUrl = `${protocol}://${host}/api/view-image/${fileName}`;

    let publicDirectUrl = localDirectUrl;

    // 2. Coba unggah ke cloud hosting publik (uguu.se) agar bisa diakses seluruh dunia
    try {
      const formData = new FormData();
      const blob = new Blob([buffer], { type: `image/${ext}` });
      formData.append('files[]', blob, fileName);

      const cloudRes = await axios.post('https://uguu.se/upload.php', formData, {
        timeout: 6000
      });

      if (cloudRes.data && cloudRes.data.success && Array.isArray(cloudRes.data.files) && cloudRes.data.files[0]?.url) {
        publicDirectUrl = cloudRes.data.files[0].url;
      }
    } catch (e) {
      console.log('Upload cloud tidak merespon, menggunakan URL lokal:', e.message);
      publicDirectUrl = localDirectUrl;
    }

    return res.json({
      success: true,
      message: 'Foto berhasil diubah menjadi tautan!',
      data: {
        url: publicDirectUrl,
        localUrl: localDirectUrl,
        apiUrl: localApiUrl,
        fileName: originalName || fileName,
        sizeBytes: buffer.length,
        sizeFormatted: (buffer.length / 1024).toFixed(1) + ' KB',
        markdown: `![${originalName || 'image'}](${publicDirectUrl})`,
        html: `<img src="${publicDirectUrl}" alt="${originalName || 'image'}" />`
      }
    });
  } catch (err) {
    console.error('Error upload-image:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengunggah foto menjadi link: ' + err.message
    });
  }
});

export default router;
