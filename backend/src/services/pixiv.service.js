import axios from 'axios';
import * as cheerio from 'cheerio';

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
