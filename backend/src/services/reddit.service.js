import axios from 'axios';
import * as cheerio from 'cheerio';
import { downloadWithYtDlp } from './ytdlp.service.js';

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
