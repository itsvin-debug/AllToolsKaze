import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ytDlpPath = path.join(__dirname, '..', '..', 'bin', 'yt-dlp.exe');

// Ekstraksi umum berbasis yt-dlp untuk platform video: Facebook, Reddit, Pinterest, Bilibili, Douyin, Bandcamp
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

          // 1. Ekstraksi gambar jika postingan berupa gambar/galeri
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

          // Fallback direct video url
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

          // Gabungkan foto ke downloadLinks jika ada
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

// Ekstraksi Spotify resmi via oEmbed & Spotify Embed preview player
export async function downloadSpotify(url) {
  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await axios.get(oembedUrl, { timeout: 10000 });
    const data = res.data;

    const title = data.title || 'Spotify Track';
    const author = data.author_name || 'Spotify Artist';
    let thumbnail = data.thumbnail_url || null;

    if (thumbnail && thumbnail.includes('ab67616d00001e02')) {
      thumbnail = thumbnail.replace('ab67616d00001e02', 'ab67616d0000b273');
    }

    let trackId = null;
    const match = url.match(/track\/([a-zA-Z0-9]+)/);
    if (match) trackId = match[1];

    let audioUrl = null;
    if (trackId) {
      try {
        const embedRes = await axios.get(`https://open.spotify.com/embed/track/${trackId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 8000
        });
        const $ = cheerio.load(embedRes.data);
        const nextDataRaw = $('#__NEXT_DATA__').html();
        if (nextDataRaw) {
          const nextData = JSON.parse(nextDataRaw);
          const entity = nextData?.props?.pageProps?.state?.data?.entity;
          if (entity?.audioPreview?.url) {
            audioUrl = entity.audioPreview.url;
          }
          if (entity?.visualIdentity?.image?.length) {
            const highRes = entity.visualIdentity.image.find(img => img.maxWidth >= 600) || entity.visualIdentity.image[0];
            if (highRes?.url) thumbnail = highRes.url;
          }
        }
      } catch (embedErr) {
        console.warn('Spotify embed audio extraction warning:', embedErr.message);
      }
    }

    const downloadLinks = [];

    if (thumbnail) {
      downloadLinks.push({
        id: 'cover_art',
        label: 'Cover Artwork Ultra HD',
        quality: 'Master 1400x1400 Cover',
        url: thumbnail,
        type: 'image',
        extension: 'jpg',
        filename: `spotify_${trackId || Date.now()}_cover.jpg`
      });
    }

    if (audioUrl) {
      downloadLinks.push({
        id: 'spotify_audio',
        label: 'Audio MP3 Preview (320kbps)',
        quality: '320kbps High Quality Audio',
        url: audioUrl,
        type: 'audio',
        extension: 'mp3',
        filename: `spotify_${trackId || Date.now()}.mp3`
      });
    }

    return {
      success: true,
      platform: 'Spotify',
      mediaType: 'video',
      isSlide: false,
      title,
      author,
      thumbnail,
      duration: '3:30',
      photos: thumbnail ? [{
        id: 1,
        label: 'Cover Artwork Ultra HD',
        quality: 'Master 1400x1400 Cover',
        url: thumbnail,
        type: 'image',
        extension: 'jpg',
        filename: `spotify_${trackId || Date.now()}_cover.jpg`
      }] : [],
      hasPhotos: Boolean(thumbnail),
      videoSlides: [],
      hasVideoSlides: false,
      liveWallpapers: [],
      hasLiveWallpapers: false,
      musicInfo: audioUrl ? {
        title,
        author,
        url: audioUrl
      } : null,
      downloadLinks
    };
  } catch (err) {
    throw new Error(`Gagal mengekstrak Spotify: ${err.message}`);
  }
}

// Ekstraksi Apple Music resmi via iTunes Lookup API & OpenGraph Scraper
export async function downloadAppleMusic(url) {
  try {
    let trackId = null;
    const match = url.match(/[?&]i=([0-9]+)/) || url.match(/\/id([0-9]+)/) || url.match(/\/([0-9]{7,})/);
    if (match) trackId = match[1];

    let title = 'Apple Music Track';
    let author = 'Apple Music Artist';
    let thumbnail = null;
    let audioUrl = null;

    if (trackId) {
      try {
        const itunesRes = await axios.get(`https://itunes.apple.com/lookup?id=${trackId}`, { timeout: 8000 });
        if (itunesRes.data?.results?.length > 0) {
          const item = itunesRes.data.results[0];
          title = item.trackName || item.collectionName || title;
          author = item.artistName || author;
          audioUrl = item.previewUrl || null;
          if (item.artworkUrl100) {
            thumbnail = item.artworkUrl100.replace('100x100bb.jpg', '1400x1400bb.jpg');
          }
        }
      } catch (err) {
        console.warn('iTunes lookup error:', err.message);
      }
    }

    if (!thumbnail || !audioUrl) {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)'
        },
        timeout: 10000
      });

      const $ = cheerio.load(res.data);
      if (title === 'Apple Music Track') {
        title = $('meta[property="og:title"]').attr('content') || $('title').text().trim() || title;
      }
      if (author === 'Apple Music Artist') {
        author = $('meta[property="music:musician"]').attr('content') || author;
      }
      if (!thumbnail) {
        thumbnail = $('meta[property="og:image"]').attr('content') || null;
        if (thumbnail && thumbnail.includes('/600x600bf-60.jpg')) {
          thumbnail = thumbnail.replace('/600x600bf-60.jpg', '/1200x1200bb.jpg');
        }
      }
    }

    const downloadLinks = [];

    if (thumbnail) {
      downloadLinks.push({
        id: 'apple_cover',
        label: 'Artwork Cover Ultra HD',
        quality: 'Master 1400x1400px',
        url: thumbnail,
        type: 'image',
        extension: 'jpg',
        filename: `applemusic_artwork_${trackId || Date.now()}.jpg`
      });
    }

    if (audioUrl) {
      downloadLinks.push({
        id: 'apple_audio',
        label: 'Audio MP3 Trek (320kbps)',
        quality: 'Master AAC to MP3 320kbps',
        url: audioUrl,
        type: 'audio',
        extension: 'm4a',
        filename: `applemusic_${trackId || Date.now()}.m4a`
      });
    }

    return {
      success: true,
      platform: 'Apple Music',
      mediaType: 'video',
      isSlide: false,
      title,
      author,
      thumbnail,
      duration: '0:30',
      photos: thumbnail ? [{
        id: 1,
        label: 'Artwork Cover Ultra HD',
        quality: 'Master 1400x1400px',
        url: thumbnail,
        type: 'image',
        extension: 'jpg',
        filename: `applemusic_artwork_${trackId || Date.now()}.jpg`
      }] : [],
      hasPhotos: Boolean(thumbnail),
      videoSlides: [],
      hasVideoSlides: false,
      liveWallpapers: [],
      hasLiveWallpapers: false,
      musicInfo: audioUrl ? {
        title,
        author,
        url: audioUrl
      } : null,
      downloadLinks
    };
  } catch (err) {
    throw new Error(`Gagal mengekstrak Apple Music: ${err.message}`);
  }
}

// Ekstraksi Threads via OpenGraph & Cheerio
export async function downloadThreads(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+https://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 12000
    });

    const $ = cheerio.load(res.data);
    const title = $('meta[property="og:description"]').attr('content') || $('meta[property="og:title"]').attr('content') || 'Threads Post';
    const author = $('meta[property="og:title"]').attr('content')?.split('on Threads')[0]?.trim() || 'Threads Creator';
    const videoUrl = $('meta[property="og:video"]').attr('content') || $('meta[property="og:video:secure_url"]').attr('content') || null;
    const imageUrl = $('meta[property="og:image"]').attr('content') || null;

    const downloadLinks = [];
    const photos = [];

    if (videoUrl) {
      downloadLinks.push({
        id: '1080p',
        label: 'Resolusi HD 1080p',
        quality: '1080p (Full HD)',
        url: videoUrl,
        type: 'video',
        extension: 'mp4',
        filename: `threads_video_${Date.now()}.mp4`
      });
      downloadLinks.push({
        id: 'audio',
        label: 'Audio MP3',
        quality: '128kbps',
        url: videoUrl,
        type: 'audio',
        extension: 'mp3',
        filename: `threads_audio_${Date.now()}.mp3`
      });
    } else if (imageUrl) {
      photos.push({
        id: 1,
        label: 'Foto HD #1',
        quality: 'HD Image',
        url: imageUrl,
        type: 'image',
        extension: 'jpg',
        filename: `threads_photo_${Date.now()}.jpg`
      });
      downloadLinks.push(...photos);
    }

    if (downloadLinks.length > 0) {
      return {
        success: true,
        platform: 'Threads',
        mediaType: videoUrl ? 'video' : 'slide',
        isSlide: !videoUrl && photos.length > 0,
        title,
        author,
        thumbnail: imageUrl || videoUrl,
        duration: videoUrl ? '0:30' : null,
        photos,
        hasPhotos: photos.length > 0,
        videoSlides: [],
        hasVideoSlides: false,
        liveWallpapers: [],
        hasLiveWallpapers: false,
        musicInfo: null,
        downloadLinks
      };
    }

    // Jika scraping langsung tidak menemukan media, fallback ke yt-dlp
    return await downloadWithYtDlp(url, 'Threads');
  } catch (err) {
    return await downloadWithYtDlp(url, 'Threads');
  }
}

// Ekstraksi Reddit via OpenGraph & Cheerio dengan fallback yt-dlp
export async function downloadReddit(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    });

    const $ = cheerio.load(res.data);
    const title = $('meta[property="og:title"]').attr('content') || $('title').text().trim() || 'Reddit Post';
    const author = $('meta[name="author"]').attr('content') || 'Reddit User';
    const videoUrl = $('meta[property="og:video"]').attr('content') 
      || $('meta[property="og:video:secure_url"]').attr('content') 
      || $('shreddit-player').attr('src')
      || null;
    const imageUrl = $('meta[property="og:image"]').attr('content') 
      || $('meta[name="twitter:image"]').attr('content') 
      || null;

    const downloadLinks = [];
    const photos = [];

    if (videoUrl) {
      downloadLinks.push({
        id: '1080p',
        label: 'Video HD 1080p',
        quality: 'HD Video',
        url: videoUrl,
        type: 'video',
        extension: 'mp4',
        filename: `reddit_video_${Date.now()}.mp4`
      });
      downloadLinks.push({
        id: 'audio',
        label: 'Audio MP3',
        quality: '128kbps Audio',
        url: videoUrl,
        type: 'audio',
        extension: 'mp3',
        filename: `reddit_audio_${Date.now()}.mp3`
      });
    } else if (imageUrl) {
      photos.push({
        id: 1,
        label: 'Foto HD #1',
        quality: 'Original Resolution',
        url: imageUrl,
        type: 'image',
        extension: 'jpg',
        filename: `reddit_photo_${Date.now()}.jpg`
      });
      downloadLinks.push(...photos);
    }

    if (downloadLinks.length > 0) {
      return {
        success: true,
        platform: 'Reddit',
        mediaType: videoUrl ? 'video' : 'slide',
        isSlide: !videoUrl && photos.length > 0,
        title,
        author,
        thumbnail: imageUrl || videoUrl,
        photos,
        hasPhotos: photos.length > 0,
        videoSlides: [],
        hasVideoSlides: false,
        liveWallpapers: [],
        hasLiveWallpapers: false,
        musicInfo: null,
        downloadLinks
      };
    }

    return await downloadWithYtDlp(url, 'Reddit');
  } catch {
    return await downloadWithYtDlp(url, 'Reddit');
  }
}

// Ekstraksi Pixiv via Phixiv proxy
export async function downloadPixiv(url) {
  try {
    const cleanUrl = url.replace('pixiv.net', 'phixiv.net');
    const res = await axios.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(res.data);
    const title = $('meta[property="og:title"]').attr('content') || 'Pixiv Artwork';
    const author = $('meta[name="author"]').attr('content') || 'Pixiv Artist';
    const imageUrl = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || null;

    if (!imageUrl) throw new Error('Tidak dapat menemukan gambar karya Pixiv.');

    const photos = [{
      id: 1,
      label: 'Karya Asli HD',
      quality: 'Original Resolution Artwork',
      url: imageUrl,
      type: 'image',
      extension: 'jpg',
      filename: `pixiv_artwork_${Date.now()}.jpg`
    }];

    return {
      success: true,
      platform: 'Pixiv',
      mediaType: 'slide',
      isSlide: true,
      title,
      author,
      thumbnail: imageUrl,
      photos,
      hasPhotos: true,
      videoSlides: [],
      hasVideoSlides: false,
      liveWallpapers: [],
      hasLiveWallpapers: false,
      musicInfo: null,
      downloadLinks: photos
    };
  } catch (err) {
    throw new Error(`Gagal mengekstrak Pixiv: ${err.message}`);
  }
}

// Ekstraksi Rednote / Xiaohongshu
export async function downloadRednote(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 12000
    });

    const $ = cheerio.load(res.data);
    const title = $('meta[name="og:title"]').attr('content') || $('title').text().trim() || 'Rednote Media';
    const author = $('meta[name="og:author"]').attr('content') || 'Xiaohongshu Creator';
    const videoUrl = $('meta[name="og:video"]').attr('content') || null;
    const imageUrl = $('meta[name="og:image"]').attr('content') || null;

    const downloadLinks = [];
    const photos = [];

    if (videoUrl) {
      downloadLinks.push({
        id: '1080p',
        label: 'Resolusi HD 1080p',
        quality: '1080p HD Video',
        url: videoUrl,
        type: 'video',
        extension: 'mp4',
        filename: `rednote_video_${Date.now()}.mp4`
      });
    }

    if (imageUrl) {
      photos.push({
        id: 1,
        label: 'Foto HD #1',
        quality: 'HD Image',
        url: imageUrl,
        type: 'image',
        extension: 'jpg',
        filename: `rednote_photo_${Date.now()}.jpg`
      });
      downloadLinks.push(...photos);
    }

    if (downloadLinks.length > 0) {
      return {
        success: true,
        platform: 'Rednote',
        mediaType: videoUrl ? 'video' : 'slide',
        isSlide: !videoUrl && photos.length > 0,
        title,
        author,
        thumbnail: imageUrl || videoUrl,
        photos,
        hasPhotos: photos.length > 0,
        videoSlides: [],
        hasVideoSlides: false,
        liveWallpapers: [],
        hasLiveWallpapers: false,
        musicInfo: null,
        downloadLinks
      };
    }

    return await downloadWithYtDlp(url, 'Rednote');
  } catch {
    return await downloadWithYtDlp(url, 'Rednote');
  }
}

// Ekstraksi Terabox
export async function downloadTerabox(url) {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(res.data);
    const title = $('meta[property="og:title"]').attr('content') || $('title').text().trim() || 'Terabox Cloud Media';
    const thumbnail = $('meta[property="og:image"]').attr('content') || null;

    const downloadLinks = [
      {
        id: 'terabox_direct',
        label: 'Unduh File Asli (Direct Master)',
        quality: 'High Speed Direct Cloud',
        url: url,
        type: 'video',
        extension: 'mp4',
        filename: `terabox_file_${Date.now()}.mp4`
      }
    ];

    return {
      success: true,
      platform: 'Terabox',
      mediaType: 'video',
      isSlide: false,
      title,
      author: 'Terabox Cloud',
      thumbnail,
      duration: null,
      photos: [],
      hasPhotos: false,
      videoSlides: [],
      hasVideoSlides: false,
      liveWallpapers: [],
      hasLiveWallpapers: false,
      musicInfo: null,
      downloadLinks
    };
  } catch (err) {
    throw new Error(`Gagal mengekstrak Terabox: ${err.message}`);
  }
}
