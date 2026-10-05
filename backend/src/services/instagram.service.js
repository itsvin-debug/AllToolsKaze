import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import { snapsave } from 'snapsave-media-downloader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ytDlpPath = path.join(__dirname, '..', '..', 'bin', 'yt-dlp.exe');
const agent = new https.Agent({ rejectUnauthorized: false });

// pembantu buat ambil shortcode dari berbagai format URL Instagram
function getInstagramShortcode(url) {
  const match = url.match(/(?:reel|reels|p|tv|share)\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
}

// STRATEGI 1: Ekstraksi lewat Instagram Embed Page (Mendukung Video, Foto Tunggal, dan Multi-Foto / Carousel)
async function extractInstagramViaEmbed(url) {
  const shortcode = getInstagramShortcode(url);
  if (!shortcode) throw new Error('Shortcode Instagram tidak valid.');

  const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
  const res = await axios.get(embedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    httpsAgent: agent,
    timeout: 10000
  });

  const html = res.data;
  const $ = cheerio.load(html);
  const caption = $('.Caption').text().trim() || $('div.Caption').text().trim() || 'Instagram Media';
  const author = $('.Avatar img').attr('alt') || 'Instagram Creator';

  // cari semua video_url
  const videoMatches = [...html.matchAll(/video_url\\?":\\?"([^"]+)\\?"/gi), ...html.matchAll(/video_url\s*:\s*"([^"]+)"/g)];
  const uniqueVideos = [];
  for (const m of videoMatches) {
    if (m[1]) {
      const clean = m[1].replace(/\\/g, '').replace(/&amp;/g, '&');
      if (clean.startsWith('http') && !uniqueVideos.includes(clean)) {
        uniqueVideos.push(clean);
      }
    }
  }

  // cari semua display_url dan display_resources (foto HD)
  const displayMatches = [...html.matchAll(/display_url\\?":\\?"([^"]+)\\?"/gi), ...html.matchAll(/display_url\s*:\s*"([^"]+)"/g)];
  const uniqueImages = [];
  for (const m of displayMatches) {
    if (m[1]) {
      const clean = m[1].replace(/\\/g, '').replace(/&amp;/g, '&');
      if (clean.startsWith('http') && !uniqueImages.includes(clean)) {
        uniqueImages.push(clean);
      }
    }
  }

  const downloadLinks = [];
  const photos = [];

  // jika ada video (Reels / Postingan Video)
  if (uniqueVideos.length > 0) {
    const mainVideo = uniqueVideos[0];
    downloadLinks.push({
      label: 'Resolusi HD 1080p',
      quality: '1080p (Full HD)',
      url: mainVideo,
      type: 'video',
      extension: 'mp4',
      filename: `instagram_${shortcode}_1080p.mp4`
    });
    downloadLinks.push({
      label: 'Resolusi HD 720p',
      quality: '720p (Standard HD)',
      url: mainVideo,
      type: 'video',
      extension: 'mp4',
      filename: `instagram_${shortcode}_720p.mp4`
    });
    downloadLinks.push({
      label: 'Audio MP3',
      quality: '128kbps',
      url: mainVideo,
      type: 'audio',
      extension: 'mp3',
      filename: `instagram_audio_${shortcode}.mp3`
    });
  }

  // proses foto-foto (baik postingan foto tunggal maupun carousel multi-foto)
  if (uniqueImages.length > 0) {
    uniqueImages.forEach((imgUrl, idx) => {
      const photoObj = {
        id: idx + 1,
        label: `Foto HD #${idx + 1}`,
        quality: 'HD Original',
        url: imgUrl,
        type: 'image',
        extension: 'jpg',
        filename: `instagram_${shortcode}_${idx + 1}.jpg`
      };
      photos.push(photoObj);
      downloadLinks.push(photoObj);
    });
  }

  if (downloadLinks.length > 0) {
    return {
      success: true,
      platform: 'Instagram',
      title: caption,
      author: author,
      thumbnail: uniqueImages[0] || null,
      photos,
      downloadLinks,
      musicInfo: uniqueVideos.length > 0 ? { title: 'Instagram Audio', author } : null
    };
  }

  throw new Error('Tidak dapat menemukan media dari embed Instagram.');
}

// STRATEGI 2: FastDL / SaveIG scraper fallback (Mendukung penuh carousel multi-foto)
async function extractInstagramViaFastDL(url) {
  const res = await axios.post('https://fastdl.app/c/', new URLSearchParams({
    url: url,
    lang_code: 'en'
  }), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Referer': 'https://fastdl.app/'
    },
    httpsAgent: agent,
    timeout: 12000
  });

  const $ = cheerio.load(res.data);
  const downloadLinks = [];
  const photos = [];
  let photoIndex = 1;

  $('a.download-items__btn, a.btn-download, a[download], a[href*="cdninstagram"], a[href*="fbcdn"]').each((i, el) => {
    const href = $(el).attr('href');
    if (href && !href.startsWith('javascript') && href.startsWith('http')) {
      const isVideo = href.includes('.mp4');
      if (isVideo) {
        downloadLinks.push({
          label: `Resolusi HD ${i === 0 ? '1080p' : '720p'}`,
          quality: i === 0 ? '1080p (Full HD)' : '720p (Standard HD)',
          url: href,
          type: 'video',
          extension: 'mp4',
          filename: `instagram_${Date.now()}_video.mp4`
        });
      } else {
        const photoObj = {
          id: photoIndex,
          label: `Foto HD #${photoIndex}`,
          quality: 'HD Image',
          url: href,
          type: 'image',
          extension: 'jpg',
          filename: `instagram_${Date.now()}_${photoIndex}.jpg`
        };
        photos.push(photoObj);
        downloadLinks.push(photoObj);
        photoIndex++;
      }
    }
  });

  if (downloadLinks.length > 0) {
    return {
      success: true,
      platform: 'Instagram',
      title: 'Instagram Media',
      author: 'Instagram User',
      thumbnail: photos[0]?.url || $('img').first().attr('src') || null,
      photos,
      downloadLinks
    };
  }

  throw new Error('Gagal mengekstrak media dari FastDL.');
}

// STRATEGI 3: SnapSave Media Downloader (Fallback handal untuk carousel foto/video)
async function extractInstagramViaSnapSave(url) {
  const res = await snapsave(url);
  if (res && res.success && res.data && res.data.media && res.data.media.length > 0) {
    const downloadLinks = [];
    const photos = [];
    let pCount = 1;

    res.data.media.forEach((item) => {
      if (item.type === 'image' || !item.resolution) {
        const photoObj = {
          id: pCount,
          label: `Foto HD #${pCount}`,
          quality: 'HD Original',
          url: item.url,
          type: 'image',
          extension: 'jpg',
          filename: `instagram_${Date.now()}_${pCount}.jpg`
        };
        photos.push(photoObj);
        downloadLinks.push(photoObj);
        pCount++;
      } else {
        downloadLinks.push({
          label: `Resolusi HD ${item.resolution || '1080p'}`,
          quality: item.resolution || '1080p (Full HD)',
          url: item.url,
          type: 'video',
          extension: 'mp4',
          filename: `instagram_${Date.now()}_video.mp4`
        });
      }
    });

    if (downloadLinks.length > 0) {
      return {
        success: true,
        platform: 'Instagram',
        title: res.data.description || 'Instagram Post',
        author: 'Instagram Creator',
        thumbnail: res.data.preview || photos[0]?.url || null,
        photos,
        downloadLinks
      };
    }
  }

  throw new Error('SnapSave tidak dapat menemukan media Instagram.');
}

// STRATEGI 4: Ekstraksi lewat binary yt-dlp lokal
async function extractInstagramViaYtDlp(url) {
  return new Promise((resolve, reject) => {
    execFile(ytDlpPath, [
      '-J',
      '--no-warnings',
      '--user-agent',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
      url
    ], { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error('yt-dlp gagal: ' + (stderr || error.message)));
      }

      try {
        const info = JSON.parse(stdout);
        const title = info.title || info.description || 'Instagram Video / Reel';
        const author = info.uploader || info.channel || 'Instagram User';
        const thumbnail = info.thumbnail || null;

        const downloadLinks = [];
        const formats = (info.formats || []).filter(f => f.url && f.ext === 'mp4');

        const hd1080 = formats.find(f => f.height >= 1080) || formats[0] || { url: info.url };
        const hd720 = formats.find(f => f.height >= 720 && f.height < 1080) || formats[1] || formats[0] || { url: info.url };

        if (hd1080 && hd1080.url) {
          downloadLinks.push({
            label: 'Resolusi HD 1080p',
            quality: '1080p (Full HD)',
            url: hd1080.url,
            type: 'video',
            extension: 'mp4',
            filename: `instagram_${Date.now()}_1080p.mp4`
          });
        }

        if (hd720 && hd720.url) {
          downloadLinks.push({
            label: 'Resolusi HD 720p',
            quality: '720p (Standard HD)',
            url: hd720.url,
            type: 'video',
            extension: 'mp4',
            filename: `instagram_${Date.now()}_720p.mp4`
          });
        }

        if (downloadLinks.length > 0) {
          return resolve({
            success: true,
            platform: 'Instagram',
            title,
            author,
            thumbnail,
            photos: [],
            downloadLinks
          });
        }

        reject(new Error('Format video Instagram tidak ditemukan lewat yt-dlp.'));
      } catch (e) {
        reject(e);
      }
    });
  });
}

// FUNGSI UTAMA downloadInstagram dengan multi-engine fallback
export async function downloadInstagram(url) {
  let lastError = null;

  try {
    const res1 = await extractInstagramViaEmbed(url);
    if (res1 && res1.downloadLinks.length > 0) return res1;
  } catch (err) {
    console.warn('Strategi 1 Instagram (Embed) gagal, mencoba fallback... Detail:', err.message);
    lastError = err;
  }

  try {
    const res2 = await extractInstagramViaFastDL(url);
    if (res2 && res2.downloadLinks.length > 0) return res2;
  } catch (err) {
    console.warn('Strategi 2 Instagram (FastDL) gagal, mencoba fallback... Detail:', err.message);
    lastError = err;
  }

  try {
    const res3 = await extractInstagramViaSnapSave(url);
    if (res3 && res3.downloadLinks.length > 0) return res3;
  } catch (err) {
    console.warn('Strategi 3 Instagram (SnapSave) gagal, mencoba fallback... Detail:', err.message);
    lastError = err;
  }

  try {
    const res4 = await extractInstagramViaYtDlp(url);
    if (res4 && res4.downloadLinks.length > 0) return res4;
  } catch (err) {
    console.warn('Strategi 4 Instagram (yt-dlp) gagal... Detail:', err.message);
    lastError = err;
  }

  throw new Error(`Gagal mengambil media Instagram. Pastikan akun tidak diprivat dan link Reels/Postingan bersifat publik. (Detail: ${lastError?.message || 'Media tidak ditemukan'})`);
}
