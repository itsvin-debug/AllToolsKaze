import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { snapsave } from 'snapsave-media-downloader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ytDlpPath = path.join(__dirname, '..', '..', 'bin', 'yt-dlp.exe');

function getTweetId(url) {
  const match = url.match(/(?:status|statuses)\/(\d+)/i);
  return match ? match[1] : null;
}

// STRATEGI 1: FxTwitter & Syndication API (Mendukung Foto HD uncompressed & Video)
async function extractTwitterViaFxAndSyndication(url) {
  const tweetId = getTweetId(url);
  if (!tweetId) throw new Error('ID Tweet tidak valid.');

  // Coba FxTwitter API terlebih dahulu
  try {
    const fxRes = await axios.get(`https://api.fxtwitter.com/status/${tweetId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      },
      timeout: 8000
    });

    const tweet = fxRes.data?.tweet;
    if (tweet) {
      const downloadLinks = [];
      const photos = [];
      const title = tweet.text || 'Postingan X (Twitter)';
      const author = tweet.author?.screen_name || tweet.author?.name || 'X User';

      // Ekstraksi Foto HD
      if (tweet.media?.photos && Array.isArray(tweet.media.photos) && tweet.media.photos.length > 0) {
        tweet.media.photos.forEach((photo, idx) => {
          let hdUrl = photo.url;
          if (hdUrl.includes('pbs.twimg.com')) {
            hdUrl = hdUrl.replace(/name=\w+/, 'name=orig');
            if (!hdUrl.includes('name=')) {
              hdUrl += (hdUrl.includes('?') ? '&' : '?') + 'name=orig';
            }
          }
          const photoObj = {
            id: idx + 1,
            label: `Foto HD #${idx + 1}`,
            quality: 'HD Original (Master)',
            url: hdUrl,
            type: 'image',
            extension: 'jpg',
            filename: `twitter_${tweetId}_${idx + 1}.jpg`
          };
          photos.push(photoObj);
          downloadLinks.push(photoObj);
        });
      }

      // Ekstraksi Video HD
      if (tweet.media?.videos && Array.isArray(tweet.media.videos) && tweet.media.videos.length > 0) {
        const vid = tweet.media.videos[0];
        downloadLinks.push({
          label: 'Resolusi HD 1080p',
          quality: '1080p (Full HD)',
          url: vid.url,
          type: 'video',
          extension: 'mp4',
          filename: `twitter_${tweetId}_1080p.mp4`
        });
        downloadLinks.push({
          label: 'Resolusi HD 720p',
          quality: '720p (Standard HD)',
          url: vid.url,
          type: 'video',
          extension: 'mp4',
          filename: `twitter_${tweetId}_720p.mp4`
        });
      }

      if (downloadLinks.length > 0) {
        return {
          success: true,
          platform: 'X (Twitter)',
          title,
          author,
          thumbnail: photos[0]?.url || tweet.media?.videos?.[0]?.thumbnail_url || null,
          photos,
          downloadLinks
        };
      }
    }
  } catch (err) {
    console.warn('FxTwitter gagal, mencoba syndication fallback... Detail:', err.message);
  }

  // Coba Syndication API
  const syndRes = await axios.get(`https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=4`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    },
    timeout: 8000
  });

  const data = syndRes.data;
  if (data && (data.photos || data.video || data.entities?.media)) {
    const downloadLinks = [];
    const photos = [];
    const title = data.text || 'Postingan X (Twitter)';
    const author = data.user?.screen_name || data.user?.name || 'X User';

    if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
      data.photos.forEach((photo, idx) => {
        let hdUrl = photo.url;
        if (hdUrl.includes('pbs.twimg.com')) {
          hdUrl = hdUrl.replace(/name=\w+/, 'name=orig');
          if (!hdUrl.includes('name=')) {
            hdUrl += (hdUrl.includes('?') ? '&' : '?') + 'name=orig';
          }
        }
        const photoObj = {
          id: idx + 1,
          label: `Foto HD #${idx + 1}`,
          quality: 'HD Original (Master)',
          url: hdUrl,
          type: 'image',
          extension: 'jpg',
          filename: `twitter_${tweetId}_${idx + 1}.jpg`
        };
        photos.push(photoObj);
        downloadLinks.push(photoObj);
      });
    }

    if (data.video && data.video.variants) {
      const mp4s = data.video.variants.filter(v => v.type === 'video/mp4' && v.src);
      if (mp4s.length > 0) {
        const sorted = mp4s.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
        downloadLinks.push({
          label: 'Resolusi HD 1080p',
          quality: '1080p (Full HD)',
          url: sorted[0].src,
          type: 'video',
          extension: 'mp4',
          filename: `twitter_${tweetId}_1080p.mp4`
        });
        if (sorted[1]) {
          downloadLinks.push({
            label: 'Resolusi HD 720p',
            quality: '720p (Standard HD)',
            url: sorted[1].src,
            type: 'video',
            extension: 'mp4',
            filename: `twitter_${tweetId}_720p.mp4`
          });
        }
      }
    }

    if (downloadLinks.length > 0) {
      return {
        success: true,
        platform: 'X (Twitter)',
        title,
        author,
        thumbnail: photos[0]?.url || data.video?.poster || null,
        photos,
        downloadLinks
      };
    }
  }

  throw new Error('Tidak dapat menemukan media X lewat Syndication.');
}

// STRATEGI 2: SnapSave Twitter
async function extractTwitterViaSnapSave(url) {
  const res = await snapsave(url);
  if (res && res.success && res.data && res.data.media && res.data.media.length > 0) {
    const downloadLinks = [];
    const photos = [];
    let pCount = 1;

    res.data.media.forEach((item) => {
      if (item.type === 'image') {
        const photoObj = {
          id: pCount,
          label: `Foto HD #${pCount}`,
          quality: 'HD Image',
          url: item.url,
          type: 'image',
          extension: 'jpg',
          filename: `twitter_${Date.now()}_${pCount}.jpg`
        };
        photos.push(photoObj);
        downloadLinks.push(photoObj);
        pCount++;
      } else {
        downloadLinks.push({
          label: 'Resolusi HD Video',
          quality: 'HD Video',
          url: item.url,
          type: 'video',
          extension: 'mp4',
          filename: `twitter_${Date.now()}_video.mp4`
        });
      }
    });

    if (downloadLinks.length > 0) {
      return {
        success: true,
        platform: 'X (Twitter)',
        title: res.data.description || 'X (Twitter) Media',
        author: 'X Creator',
        thumbnail: res.data.preview || photos[0]?.url || null,
        photos,
        downloadLinks
      };
    }
  }
  throw new Error('SnapSave tidak menemukan media Twitter.');
}

// STRATEGI 3: Ekstraksi lewat binary yt-dlp lokal
async function extractTwitterViaYtDlp(url) {
  return new Promise((resolve, reject) => {
    execFile(ytDlpPath, ['-J', '--no-warnings', url], { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error('yt-dlp gagal: ' + (stderr || error.message)));
      }

      try {
        const info = JSON.parse(stdout);
        const title = info.title || info.description || 'X (Twitter) Video';
        const author = info.uploader || info.channel || 'X Creator';
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
            filename: `twitter_${info.id || Date.now()}_1080p.mp4`
          });
        }

        if (hd720 && hd720.url) {
          downloadLinks.push({
            label: 'Resolusi HD 720p',
            quality: '720p (Standard HD)',
            url: hd720.url,
            type: 'video',
            extension: 'mp4',
            filename: `twitter_${info.id || Date.now()}_720p.mp4`
          });
        }

        if (downloadLinks.length > 0) {
          return resolve({
            success: true,
            platform: 'X (Twitter)',
            title,
            author,
            thumbnail,
            photos: [],
            downloadLinks
          });
        }

        reject(new Error('Tidak ada format video Twitter yang ditemukan.'));
      } catch (e) {
        reject(e);
      }
    });
  });
}

// STRATEGI 4: TwitSave scraper fallback
async function extractTwitterViaTwitSave(url) {
  const twitSaveUrl = `https://twitsave.com/info?url=${encodeURIComponent(url)}`;
  const response = await axios.get(twitSaveUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    },
    timeout: 12000
  });

  const $ = cheerio.load(response.data);
  const title = $('div.leading-tight h2, p.text-gray-600').first().text().trim() || 'X (Twitter) Video';
  const thumbnail = $('div.aspect-w-16 img, div.w-full img').first().attr('src') || null;
  const downloadLinks = [];

  $('a[href*="download"], a.btn-primary, a[download]').each((_, el) => {
    const link = $(el).attr('href');
    const text = $(el).text().trim();

    if (link && (link.startsWith('http') || link.startsWith('/download'))) {
      const fullUrl = link.startsWith('http') ? link : `https://twitsave.com${link}`;
      const is1080 = text.includes('1080') || text.includes('HD');
      downloadLinks.push({
        label: is1080 ? 'Resolusi HD 1080p' : 'Resolusi HD 720p',
        quality: is1080 ? '1080p (Full HD)' : '720p (Standard HD)',
        url: fullUrl,
        type: 'video',
        extension: 'mp4',
        filename: `twitter_${Date.now()}_${is1080 ? '1080p' : '720p'}.mp4`
      });
    }
  });

  if (downloadLinks.length > 0) {
    return {
      success: true,
      platform: 'X (Twitter)',
      title,
      author: 'X User',
      thumbnail,
      photos: [],
      downloadLinks
    };
  }

  throw new Error('Tidak ada link video dari TwitSave.');
}

// FUNGSI UTAMA downloadTwitter dengan multi-engine fallback
export async function downloadTwitter(url) {
  let lastError = null;

  try {
    const res1 = await extractTwitterViaFxAndSyndication(url);
    if (res1 && res1.downloadLinks.length > 0) return res1;
  } catch (err) {
    console.warn('Strategi 1 Twitter (Fx/Syndication) gagal... Detail:', err.message);
    lastError = err;
  }

  try {
    const res2 = await extractTwitterViaSnapSave(url);
    if (res2 && res2.downloadLinks.length > 0) return res2;
  } catch (err) {
    console.warn('Strategi 2 Twitter (SnapSave) gagal... Detail:', err.message);
    lastError = err;
  }

  try {
    const res3 = await extractTwitterViaYtDlp(url);
    if (res3 && res3.downloadLinks.length > 0) return res3;
  } catch (err) {
    console.warn('Strategi 3 Twitter (yt-dlp) gagal... Detail:', err.message);
    lastError = err;
  }

  try {
    const res4 = await extractTwitterViaTwitSave(url);
    if (res4 && res4.downloadLinks.length > 0) return res4;
  } catch (err) {
    console.warn('Strategi 4 Twitter (TwitSave) gagal... Detail:', err.message);
    lastError = err;
  }

  throw new Error(`Gagal mengambil media dari X (Twitter). Pastikan tweet publik dan mengandung media video atau foto. (Detail: ${lastError?.message || 'Media tidak ditemukan'})`);
}
