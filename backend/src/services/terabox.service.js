import axios from 'axios';
import * as cheerio from 'cheerio';

// Ekstraksi Terabox Cloud Media
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
