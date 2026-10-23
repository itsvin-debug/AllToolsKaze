import axios from 'axios';
import * as cheerio from 'cheerio';
import { downloadWithYtDlp } from './ytdlp.service.js';

// Ekstraksi Threads via OpenGraph & Cheerio dengan fallback yt-dlp
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

    return await downloadWithYtDlp(url, 'Threads');
  } catch {
    return await downloadWithYtDlp(url, 'Threads');
  }
}
