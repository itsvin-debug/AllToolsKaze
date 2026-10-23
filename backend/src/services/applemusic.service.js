import axios from 'axios';
import * as cheerio from 'cheerio';

// Ekstraksi Apple Music via iTunes Lookup API & OpenGraph Scraper
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
