import axios from 'axios';
import * as cheerio from 'cheerio';
import { downloadWithYtDlp } from './ytdlp.service.js';

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
