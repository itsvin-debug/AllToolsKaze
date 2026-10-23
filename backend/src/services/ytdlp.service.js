import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ytDlpPath = path.join(__dirname, '..', '..', 'bin', 'yt-dlp.exe');

// Ekstraksi umum berbasis yt-dlp untuk platform media video & audio
export async function downloadWithYtDlp(url, platformName = 'Media') {
  return new Promise((resolve, reject) => {
    execFile(
      ytDlpPath,
      ['-J', '--no-warnings', '--no-playlist', url],
      { maxBuffer: 15 * 1024 * 1024, timeout: 35000 },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`yt-dlp error (${platformName}):`, stderr || error.message);
          return reject(new Error(`Gagal mengekstrak media ${platformName}. Pastikan link publik dan dapat diakses.`));
        }

        try {
          const info = JSON.parse(stdout);
          const title = info.title || `${platformName} Media`;
          const author = info.uploader || info.creator || info.channel || info.artist || `${platformName} Creator`;
          const thumbnail = info.thumbnail || (info.thumbnails && info.thumbnails[0]?.url) || null;
          const duration = info.duration ? `${info.duration}s` : null;

          const downloadLinks = [];
          const photos = [];
          const formats = info.formats || [];

          // 1. Ekstraksi gambar jika postingan berupa galeri/gambar
          if (info._type === 'playlist' && info.entries && info.entries.length > 0) {
            info.entries.forEach((entry, idx) => {
              if (entry.url) {
                const isImg = entry.ext === 'jpg' || entry.ext === 'png' || entry.ext === 'webp';
                if (isImg) {
                  photos.push({
                    id: idx + 1,
                    label: `Foto #${idx + 1}`,
                    quality: 'HD Image',
                    url: entry.url,
                    type: 'image',
                    extension: entry.ext || 'jpg',
                    filename: `${platformName.toLowerCase()}_slide_${idx + 1}.${entry.ext || 'jpg'}`
                  });
                }
              }
            });
          }

          // 2. Ekstraksi format video MP4
          const videoFormats = formats.filter(f => f.url && (f.ext === 'mp4' || f.container === 'mp4' || f.vcodec !== 'none'));
          const hd1080 = videoFormats.find(f => f.height >= 1080) || videoFormats[0] || (info.url ? { url: info.url } : null);
          const hd720 = videoFormats.find(f => f.height >= 720 && f.height < 1080) || videoFormats[1] || hd1080;

          if (hd1080 && hd1080.url) {
            downloadLinks.push({
              id: '1080p',
              label: 'Resolusi HD 1080p',
              quality: '1080p (Full HD)',
              url: hd1080.url,
              type: 'video',
              extension: 'mp4',
              filename: `${platformName.toLowerCase()}_${info.id || Date.now()}_1080p.mp4`
            });
          }

          if (hd720 && hd720.url && hd720.url !== hd1080?.url) {
            downloadLinks.push({
              id: '720p',
              label: 'Resolusi HD 720p',
              quality: '720p (Standard HD)',
              url: hd720.url,
              type: 'video',
              extension: 'mp4',
              filename: `${platformName.toLowerCase()}_${info.id || Date.now()}_720p.mp4`
            });
          }

          // Direct fallback video
          if (downloadLinks.length === 0 && info.url && !photos.length) {
            downloadLinks.push({
              id: 'default_video',
              label: 'Resolusi HD (Master)',
              quality: 'HD Video',
              url: info.url,
              type: 'video',
              extension: 'mp4',
              filename: `${platformName.toLowerCase()}_${info.id || Date.now()}.mp4`
            });
          }

          // 3. Ekstraksi audio jika ada
          const audioFormat = formats.find(f => f.url && (f.acodec !== 'none' || f.audio_ext === 'mp3' || f.ext === 'mp3' || f.url.includes('.mp3')));
          let audioUrl = audioFormat ? audioFormat.url : null;
          if (!audioUrl && info.url && (info.ext === 'mp3' || platformName === 'Bandcamp')) {
            audioUrl = info.url;
          }

          if (audioUrl) {
            downloadLinks.push({
              id: 'audio',
              label: 'Audio MP3',
              quality: '128kbps',
              url: audioUrl,
              type: 'audio',
              extension: 'mp3',
              filename: `${platformName.toLowerCase()}_audio_${info.id || Date.now()}.mp3`
            });
          }

          if (photos.length > 0) {
            downloadLinks.unshift(...photos);
          }

          if (downloadLinks.length > 0) {
            return resolve({
              success: true,
              platform: platformName,
              mediaType: photos.length > 0 ? 'slide' : 'video',
              isSlide: photos.length > 0,
              title,
              author,
              thumbnail,
              duration,
              photos,
              hasPhotos: photos.length > 0,
              videoSlides: [],
              hasVideoSlides: false,
              liveWallpapers: [],
              hasLiveWallpapers: false,
              musicInfo: audioUrl ? {
                title: info.track || title,
                author: info.artist || author,
                url: audioUrl
              } : null,
              downloadLinks
            });
          }

          reject(new Error(`Tidak ditemukan stream media yang dapat diunduh untuk ${platformName}.`));
        } catch (err) {
          reject(new Error(`Gagal memproses data media ${platformName}: ${err.message}`));
        }
      }
    );
  });
}
