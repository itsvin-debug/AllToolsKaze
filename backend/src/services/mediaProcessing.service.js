  import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';
import axios from 'axios';

const execPromise = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');
const tempDir = path.join(uploadsDir, 'temp');

// Pastikan direktori uploads dan temp ada
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

/**
 * Format bytes ke string yang manusiawi (KB / MB)
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 1. Kompresi Video Menggunakan FFmpeg
 * Mengurangi ukuran video drastis (bisa dari MB menjadi ratusan KB)
 * tanpa merusak ketajaman resolusi HD
 */
export async function compressVideoService({
  videoBase64,
  originalName = 'video.mp4',
  crf = 28,
  qualityPreset = 'balanced', // 'ultra_kb' | 'balanced' | 'high_hd'
  scale = 'original'         // 'original' | '720p' | '480p'
}) {
  const uid = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const inputPath = path.join(tempDir, `input_${uid}.mp4`);
  const outputPath = path.join(uploadsDir, `kaze_compressed_${uid}.mp4`);

  try {
    // Ekstrak buffer dari base64
    const base64Data = videoBase64.replace(/^data:video\/[a-zA-Z0-9.-]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(inputPath, buffer);

    const originalSize = buffer.length;

    // Tentukan CRF dan bitrate sesuai preset
    let targetCrf = 28;
    let audioBitrate = '96k';
    let scaleFilter = '';

    if (qualityPreset === 'ultra_kb') {
      // Kompresi Ekstrem (Target ukuran sekecil mungkin sampai ratusan KB)
      targetCrf = 33;
      audioBitrate = '64k';
      if (scale === 'original') {
        scaleFilter = '-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2"';
      }
    } else if (qualityPreset === 'high_hd') {
      // Kualitas HD Maksimum dengan kompresi efisien
      targetCrf = 23;
      audioBitrate = '128k';
    } else {
      // Balanced (Preset Standar: Pengurangan 60-80% dengan ketajaman jernih)
      targetCrf = Number(crf) || 28;
      audioBitrate = '96k';
    }

    if (scale === '720p') {
      scaleFilter = '-vf "scale=-2:720"';
    } else if (scale === '480p') {
      scaleFilter = '-vf "scale=-2:480"';
    } else if (!scaleFilter) {
      scaleFilter = '-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2"';
    }

    // Jalankan perintah kompresi FFmpeg
    const ffmpegCmd = `ffmpeg -y -i "${inputPath}" -c:v libx264 -crf ${targetCrf} -preset veryfast ${scaleFilter} -c:a aac -b:a ${audioBitrate} -pix_fmt yuv420p -movflags +faststart "${outputPath}"`;
    
    await execPromise(ffmpegCmd, { timeout: 120000 });

    if (!fs.existsSync(outputPath)) {
      throw new Error('Gagal menghasilkan file video hasil kompresi.');
    }

    const compressedStat = fs.statSync(outputPath);
    const compressedSize = compressedStat.size;
    const savingsBytes = originalSize - compressedSize;
    const savingsPercent = originalSize > 0 
      ? Math.max(0, Math.round((savingsBytes / originalSize) * 100)) 
      : 0;

    const fileName = path.basename(outputPath);
    const relativeUrl = `/uploads/${fileName}`;

    return {
      success: true,
      fileName,
      originalName,
      url: relativeUrl,
      originalSize,
      originalSizeFormatted: formatBytes(originalSize),
      compressedSize,
      compressedSizeFormatted: formatBytes(compressedSize),
      savingsPercent: `${savingsPercent}%`,
      savedFormatted: formatBytes(savingsBytes)
    };
  } finally {
    // Bersihkan file input sementara
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    } catch {
      // ignore
    }
  }
}

/**
 * 2. Penggabungan Audio (Audio Merger) Menggunakan FFmpeg
 * Mengatur detik & menit setiap track (start & end), lalu menggabungkan semuanya jadi satu track master
 */
export async function mergeAudiosService({ tracks = [] }) {
  if (!tracks || tracks.length === 0) {
    throw new Error('Tidak ada track audio yang diberikan untuk digabungkan.');
  }

  const uid = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const trimmedFiles = [];
  const outputPath = path.join(uploadsDir, `kaze_merged_audio_${uid}.mp3`);
  const listFilePath = path.join(tempDir, `concat_list_${uid}.txt`);

  try {
    // 1. Potong (trim) dan sesuaikan volume setiap track audio
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const trackInPath = path.join(tempDir, `track_in_${uid}_${i}.mp3`);
      const trackOutPath = path.join(tempDir, `track_trimmed_${uid}_${i}.mp3`);

      // Ekstrak buffer
      const base64Data = (track.base64 || '').replace(/^data:[a-zA-Z0-9.-]+\/[a-zA-Z0-9.-]+;base64,/, '');
      fs.writeFileSync(trackInPath, Buffer.from(base64Data, 'base64'));

      const startTime = Number(track.startTime) || 0;
      const endTime = Number(track.endTime) || 0;
      const volume = Number(track.volume) || 1.0;

      let timeFilter = `-ss ${startTime}`;
      if (endTime > startTime) {
        timeFilter += ` -to ${endTime}`;
      }

      // Potong dan normalisasi audio ke format seragam MP3 44.1kHz stereo
      const trimCmd = `ffmpeg -y ${timeFilter} -i "${trackInPath}" -filter:a "volume=${volume}" -vn -ar 44100 -ac 2 -b:a 192k "${trackOutPath}"`;
      await execPromise(trimCmd, { timeout: 45000 });

      if (fs.existsSync(trackOutPath)) {
        trimmedFiles.push(trackOutPath);
      }

      // Hapus file track input sementara
      try { if (fs.existsSync(trackInPath)) fs.unlinkSync(trackInPath); } catch {}
    }

    if (trimmedFiles.length === 0) {
      throw new Error('Tidak ada potongan audio yang berhasil diproses.');
    }

    // 2. Buat daftar file untuk FFmpeg concat demuxer
    const listContent = trimmedFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(listFilePath, listContent, 'utf8');

    // 3. Gabungkan seluruh potongan audio menjadi satu file master
    const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${listFilePath}" -c copy "${outputPath}"`;
    await execPromise(concatCmd, { timeout: 60000 });

    if (!fs.existsSync(outputPath)) {
      throw new Error('Gagal menggabungkan seluruh track audio.');
    }

    const stat = fs.statSync(outputPath);
    const fileName = path.basename(outputPath);
    const relativeUrl = `/uploads/${fileName}`;

    return {
      success: true,
      fileName,
      url: relativeUrl,
      size: stat.size,
      sizeFormatted: formatBytes(stat.size),
      totalTracksMerged: trimmedFiles.length
    };
  } finally {
    // Bersihkan file sementara
    trimmedFiles.forEach(f => {
      try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
    });
    try { if (fs.existsSync(listFilePath)) fs.unlinkSync(listFilePath); } catch {}
  }
}

/**
 * 3. Upload File Universal (Foto, Video, dan PDF ke Link)
 * Menyimpan secara lokal di server dan mengunggah ke CDN publik jika memungkinkan
 */
export async function uploadUniversalFileService({
  fileBase64,
  originalName = 'file',
  mimeType = ''
}) {
  if (!fileBase64) {
    throw new Error('File tidak boleh kosong.');
  }

  // Tentukan MIME dan ekstensi
  let detectedMime = mimeType;
  let ext = 'bin';

  const matches = fileBase64.match(/^data:([a-zA-Z0-9.-]+\/[a-zA-Z0-9.-]+);base64,(.+)$/);
  let buffer;

  if (matches && matches.length === 3) {
    detectedMime = matches[1];
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(fileBase64, 'base64');
  }

  const mimeLower = (detectedMime || '').toLowerCase();
  const nameExt = path.extname(originalName).toLowerCase().replace('.', '');

  if (mimeLower.includes('pdf') || nameExt === 'pdf') {
    ext = 'pdf';
    detectedMime = 'application/pdf';
  } else if (mimeLower.includes('mp4') || nameExt === 'mp4') {
    ext = 'mp4';
    detectedMime = 'video/mp4';
  } else if (mimeLower.includes('webm') || nameExt === 'webm') {
    ext = 'webm';
    detectedMime = 'video/webm';
  } else if (mimeLower.includes('png') || nameExt === 'png') {
    ext = 'png';
    detectedMime = 'image/png';
  } else if (mimeLower.includes('jpeg') || mimeLower.includes('jpg') || nameExt === 'jpg' || nameExt === 'jpeg') {
    ext = 'jpg';
    detectedMime = 'image/jpeg';
  } else if (mimeLower.includes('webp') || nameExt === 'webp') {
    ext = 'webp';
    detectedMime = 'image/webp';
  } else if (mimeLower.includes('gif') || nameExt === 'gif') {
    ext = 'gif';
    detectedMime = 'image/gif';
  } else if (nameExt) {
    ext = nameExt;
  }

  const uniqueId = Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const cleanBaseName = path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  const fileName = `kaze_${cleanBaseName}_${uniqueId}.${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  // Simpan ke direktori uploads lokal
  fs.writeFileSync(filePath, buffer);

  const localRelativeUrl = `/uploads/${fileName}`;
  let publicUrl = localRelativeUrl;

  // Coba unggah ke CDN publik Uguu agar bisa diakses internet
  try {
    const formData = new FormData();
    const blob = new Blob([buffer], { type: detectedMime || 'application/octet-stream' });
    formData.append('files[]', blob, fileName);

    const cloudRes = await axios.post('https://uguu.se/upload.php', formData, {
      timeout: 8000
    });

    if (cloudRes.data && cloudRes.data.success && Array.isArray(cloudRes.data.files) && cloudRes.data.files[0]?.url) {
      publicUrl = cloudRes.data.files[0].url;
    }
  } catch (err) {
    // Tetap gunakan localRelativeUrl jika CDN eksternal timeout
    publicUrl = localRelativeUrl;
  }

  // Tipe kategori untuk UI
  let category = 'image';
  if (ext === 'pdf') category = 'pdf';
  else if (['mp4', 'webm', 'mov', 'mkv'].includes(ext)) category = 'video';
  else if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) category = 'audio';

  // Embed tags
  let markdownTag = `[${originalName}](${publicUrl})`;
  let htmlTag = `<a href="${publicUrl}" target="_blank" rel="noopener noreferrer">${originalName}</a>`;

  if (category === 'image') {
    markdownTag = `![${originalName}](${publicUrl})`;
    htmlTag = `<img src="${publicUrl}" alt="${originalName}" />`;
  } else if (category === 'video') {
    htmlTag = `<video src="${publicUrl}" controls width="640"></video>`;
  } else if (category === 'pdf') {
    htmlTag = `<iframe src="${publicUrl}" width="100%" height="600"></iframe>`;
  }

  return {
    success: true,
    category,
    fileName,
    originalName,
    ext,
    mimeType: detectedMime,
    url: publicUrl,
    localUrl: localRelativeUrl,
    sizeBytes: buffer.length,
    sizeFormatted: formatBytes(buffer.length),
    markdown: markdownTag,
    html: htmlTag
  };
}

/**
 * 4. Pemotong Durasi Video (Video Trimmer / Cutter) Menggunakan FFmpeg Stream Copy (-c copy)
 * Memotong video secara presisi tanpa menurunkan kualitas, resolusi, FPS, atau bitrate (lossless encoding)
 */
export async function trimVideoService({
  videoBase64,
  startTime = 0,
  endTime = 0,
  originalName = 'video.mp4'
}) {
  if (!videoBase64) {
    throw new Error('File video tidak boleh kosong.');
  }

  const startSec = Math.max(0, parseFloat(startTime) || 0);
  const endSec = parseFloat(endTime) || 0;

  if (endSec <= startSec) {
    throw new Error('Waktu selesai (End Time) harus lebih besar dari waktu mulai (Start Time).');
  }

  const durationSec = endSec - startSec;
  const uid = Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const ext = path.extname(originalName).toLowerCase() || '.mp4';
  const cleanBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 25);
  
  const inputPath = path.join(tempDir, `trim_in_${uid}${ext}`);
  const outputPath = path.join(uploadsDir, `kaze_trimmed_${cleanBase}_${uid}.mp4`);

  try {
    // Ekstrak buffer video dari Base64
    const base64Data = videoBase64.replace(/^data:[a-zA-Z0-9.-]+\/[a-zA-Z0-9.-]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(inputPath, buffer);

    const originalSize = buffer.length;

    // STRATEGI 1: Lossless Stream Copy (-c copy) untuk kecepatan instan dan kualitas 100% utuh tanpa re-encoding
    let trimCmd = `ffmpeg -y -ss ${startSec} -to ${endSec} -i "${inputPath}" -c copy -avoid_negative_ts make_zero -movflags +faststart "${outputPath}"`;
    
    let execSuccess = false;
    try {
      await execPromise(trimCmd, { timeout: 60000 });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        execSuccess = true;
      }
    } catch (errCopy) {
      console.warn('Stream copy gagal pada potongan ini, beralih ke exact frame cut fallback... Detail:', errCopy.message);
    }

    // STRATEGI 2: Fallback Exact Frame Accurate Cut jika -c copy gagal pada batas keyframe / format container
    if (!execSuccess) {
      const fallbackCmd = `ffmpeg -y -ss ${startSec} -to ${endSec} -i "${inputPath}" -c:v libx264 -crf 18 -preset ultrafast -c:a aac -b:a 192k -movflags +faststart "${outputPath}"`;
      await execPromise(fallbackCmd, { timeout: 90000 });
    }

    if (!fs.existsSync(outputPath)) {
      throw new Error('Gagal menghasilkan file video hasil potongan.');
    }

    const stat = fs.statSync(outputPath);
    const fileName = path.basename(outputPath);
    const relativeUrl = `/uploads/${fileName}`;

    return {
      success: true,
      fileName,
      originalName,
      url: relativeUrl,
      duration: durationSec.toFixed(2),
      startTime: startSec,
      endTime: endSec,
      size: stat.size,
      sizeFormatted: formatBytes(stat.size),
      originalSizeFormatted: formatBytes(originalSize)
    };
  } finally {
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    } catch {}
  }
}
