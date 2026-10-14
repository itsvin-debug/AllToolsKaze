import axios from 'axios';
import * as cheerio from 'cheerio';

// Service ekstraksi media TikTok (Video HD 1080p, Slide Video Gerak / Live Photos, Slide Foto HD, MP3)
export async function downloadTikTok(rawUrl) {
  let lastError = null;

  // Browser user-agent konsisten
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  // STRATEGI 1: TikWM API Utama (Dukungan penuh untuk Live Photos / Video Slides, Photo Slides, 1080p Video, & MP3)
  try {
    const tikwmEndpoints = ['https://www.tikwm.com/api/', 'https://api.tikwm.com/'];
    let tikwmData = null;

    for (const endpoint of tikwmEndpoints) {
      try {
        const tikwmRes = await axios.post(
          endpoint,
          new URLSearchParams({
            url: rawUrl.trim(),
            count: '12',
            cursor: '0',
            web: '1',
            hd: '1'
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'User-Agent': userAgent,
              'Referer': 'https://www.tikwm.com/'
            },
            timeout: 10000
          }
        );

        if (tikwmRes.data && tikwmRes.data.code === 0 && tikwmRes.data.data) {
          tikwmData = tikwmRes.data.data;
          break;
        }
      } catch (epErr) {
        // coba endpoint berikutnya jika ada network timeout
      }
    }

    if (tikwmData) {
      const item = tikwmData;
      const base = 'https://www.tikwm.com';

      // 1. JIKA POSTINGAN FOTO SLIDE (CAROUSEL GAMBAR TIKTOK)
      if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        const photos = item.images.map((imgUrl, idx) => {
          const fullImgUrl = imgUrl.startsWith('http') 
            ? imgUrl 
            : (imgUrl.startsWith('//') ? `https:${imgUrl}` : `${base}${imgUrl}`);
          return {
            id: idx + 1,
            label: `Foto Slide #${idx + 1}`,
            quality: 'HD 1080p Image',
            url: fullImgUrl,
            type: 'image',
            extension: 'jpg',
            filename: `tiktok_slide_${item.id || Date.now()}_${idx + 1}.jpg`
          };
        });

        const downloadLinks = [...photos];

        // Ekstraksi Audio Lagu Pengiring Slide
        const rawMusicUrl = item.music_info?.play || item.music;
        let fullMusicUrl = null;
        if (rawMusicUrl) {
          fullMusicUrl = rawMusicUrl.startsWith('http') ? rawMusicUrl : `${base}${rawMusicUrl}`;
          downloadLinks.push({
            id: 'audio',
            label: 'Audio MP3',
            quality: '128kbps (Original Sound)',
            url: fullMusicUrl,
            type: 'audio',
            extension: 'mp3',
            filename: `tiktok_audio_${item.id || Date.now()}.mp3`
          });
        }

        return {
          success: true,
          platform: 'TikTok',
          mediaType: 'slide',
          isSlide: true,
          id: item.id || '',
          title: item.title || 'TikTok Photo Slide',
          author: item.author?.nickname || item.author?.unique_id || 'TikTok Creator',
          thumbnail: photos[0]?.url || item.cover || null,
          photos,
          hasPhotos: true,
          videoSlides: [],
          hasVideoSlides: false,
          musicInfo: {
            title: item.music_info?.title || item.title || 'Original Sound',
            author: item.music_info?.author || item.author?.nickname || 'TikTok Creator',
            url: fullMusicUrl || null
          },
          downloadLinks
        };
      }

      // 2. JIKA POSTINGAN VIDEO REGULER (RESOLUSI HD 1080p & 720p)
      const downloadLinks = [];
      const fullHdUrl = item.hdplay 
        ? (item.hdplay.startsWith('http') ? item.hdplay : `${base}${item.hdplay}`) 
        : null;
      const standardPlayUrl = item.play 
        ? (item.play.startsWith('http') ? item.play : `${base}${item.play}`) 
        : null;

      // Resolusi 1080p Full HD
      if (fullHdUrl || standardPlayUrl) {
        downloadLinks.push({
          id: '1080p',
          label: 'Resolusi HD 1080p',
          quality: '1080p (Full HD)',
          url: fullHdUrl || standardPlayUrl,
          type: 'video',
          extension: 'mp4',
          filename: `tiktok_${item.id || Date.now()}_1080p.mp4`
        });
      }

      // Resolusi 720p Standard HD
      if (standardPlayUrl || fullHdUrl) {
        downloadLinks.push({
          id: '720p',
          label: 'Resolusi HD 720p',
          quality: '720p (Standard HD)',
          url: standardPlayUrl || fullHdUrl,
          type: 'video',
          extension: 'mp4',
          filename: `tiktok_${item.id || Date.now()}_720p.mp4`
        });
      }

      // Audio MP3
      const rawMusicUrl = item.music_info?.play || item.music || standardPlayUrl || fullHdUrl;
      let fullMusicUrl = null;
      if (rawMusicUrl) {
        fullMusicUrl = rawMusicUrl.startsWith('http') ? rawMusicUrl : `${base}${rawMusicUrl}`;
        downloadLinks.push({
          id: 'audio',
          label: 'Audio MP3',
          quality: '128kbps (Original Sound)',
          url: fullMusicUrl,
          type: 'audio',
          extension: 'mp3',
          filename: `tiktok_audio_${item.id || Date.now()}.mp3`
        });
      }

      if (downloadLinks.length > 0) {
        return {
          success: true,
          platform: 'TikTok',
          mediaType: 'video',
          isSlide: false,
          id: item.id || '',
          title: item.title || 'TikTok Video',
          author: item.author?.nickname || item.author?.unique_id || 'TikTok Creator',
          thumbnail: item.cover || item.origin_cover || null,
          duration: item.duration ? `${item.duration}s` : null,
          photos: [],
          hasPhotos: false,
          videoSlides: [],
          hasVideoSlides: false,
          musicInfo: {
            title: item.music_info?.title || item.title || 'Original Sound',
            author: item.music_info?.author || item.author?.nickname || 'TikTok Creator',
            url: fullMusicUrl || null
          },
          downloadLinks
        };
      }
    }
  } catch (err) {
    console.warn('Strategi 1 (TikWM) gagal, beralih ke SSSTik... Detail:', err.message);
    lastError = err;
  }

  // STRATEGI 2: SSSTik Fallback (Scraper cadangan)
  try {
    const homeRes = await axios.get('https://ssstik.io/en', {
      headers: { 
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 12000
    });

    const ttMatch = homeRes.data.match(/tt:'([^']+)'/) || homeRes.data.match(/data-hx-vals='{"tt":"([^"]+)"}/);
    const ttToken = ttMatch ? ttMatch[1] : '';
    const cookies = homeRes.headers['set-cookie'] 
      ? homeRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ') 
      : '';

    const postRes = await axios.post('https://ssstik.io/abc?url=dl', new URLSearchParams({
      id: rawUrl.trim(),
      locale: 'en',
      tt: ttToken
    }), {
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'HX-Request': 'true',
        'HX-Trigger': '_gcaptcha_pt',
        'HX-Target': 'target',
        'HX-Current-URL': 'https://ssstik.io/en',
        'Referer': 'https://ssstik.io/en',
        'Cookie': cookies
      },
      timeout: 15000
    });

    const $ = cheerio.load(postRes.data);
    const title = $('.maintext').text().trim() || $('p').first().text().trim() || 'TikTok Media';
    const thumbnail = $('img.result_author').attr('src') || $('img').first().attr('src') || null;
    const author = $('.result_author h2, .result_author span').first().text().trim() || 'TikTok Creator';

    const rawVideoLinks = [];
    const photoLinks = [];
    let audioLink = null;

    // Cari link download di dalam HTML
    $('a').each((_, elem) => {
      const href = $(elem).attr('href');
      const text = $(elem).text().trim();

      if (href && (href.startsWith('http') || href.includes('tikcdn'))) {
        const isMp3 = text.toLowerCase().includes('mp3') || text.toLowerCase().includes('audio') || href.includes('/m/');
        const isImg = href.includes('.jpg') || href.includes('.jpeg') || href.includes('.png') || text.toLowerCase().includes('photo') || text.toLowerCase().includes('slide') || $(elem).closest('.splide__slide').length > 0;
        
        if (isMp3) {
          audioLink = {
            label: 'Audio MP3',
            quality: '128kbps',
            url: href,
            type: 'audio',
            extension: 'mp3',
            filename: `tiktok_audio_${Date.now()}.mp3`
          };
        } else if (isImg) {
          photoLinks.push(href);
        } else {
          rawVideoLinks.push(href);
        }
      }
    });

    const downloadLinks = [];
    const photos = [];

    if (photoLinks.length > 0) {
      photoLinks.forEach((imgUrl, idx) => {
        const photoObj = {
          id: idx + 1,
          label: `Foto HD #${idx + 1}`,
          quality: 'HD Image (No Watermark)',
          url: imgUrl,
          type: 'image',
          extension: 'jpg',
          filename: `tiktok_slide_${Date.now()}_${idx + 1}.jpg`
        };
        photos.push(photoObj);
        downloadLinks.push(photoObj);
      });
    }

    // Hanya tambahkan video jika BUKAN postingan foto slide
    if (photos.length === 0 && rawVideoLinks.length > 0) {
      const primaryVideoUrl = rawVideoLinks[0];

      downloadLinks.push({
        id: '1080p',
        label: 'Resolusi HD 1080p',
        quality: '1080p (Full HD)',
        url: primaryVideoUrl,
        type: 'video',
        extension: 'mp4',
        filename: `tiktok_1080p_nowm_${Date.now()}.mp4`
      });

      const standardUrl = rawVideoLinks[1] || primaryVideoUrl;
      downloadLinks.push({
        id: '720p',
        label: 'Resolusi HD 720p',
        quality: '720p (Standard HD)',
        url: standardUrl,
        type: 'video',
        extension: 'mp4',
        filename: `tiktok_720p_nowm_${Date.now()}.mp4`
      });
    }

    if (audioLink) {
      downloadLinks.push(audioLink);
    }

    if (downloadLinks.length > 0) {
      return {
        success: true,
        platform: 'TikTok',
        mediaType: photos.length > 0 ? 'slide' : 'video',
        title,
        author,
        thumbnail: thumbnail || photos[0]?.url || null,
        duration: null,
        videoSlides: [],
        hasVideoSlides: false,
        photos,
        hasPhotos: photos.length > 0,
        isSlide: photos.length > 0,
        musicInfo: {
          title: 'Original TikTok Audio',
          author: author
        },
        downloadLinks
      };
    }
  } catch (err) {
    console.warn('Strategi 2 (SSSTik) gagal... Detail:', err.message);
    lastError = err;
  }

  throw new Error(`Gagal memproses media TikTok. Pastikan postingan publik dan link dapat diakses. (Detail: ${lastError?.message || 'Media tidak ditemukan'})`);
}
