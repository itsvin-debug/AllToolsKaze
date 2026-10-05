import axios from 'axios';
import * as cheerio from 'cheerio';

// Helper headers browser modern
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,id;q=0.8'
};

/**
 * Ekstrak ID dokumen dari URL Scribd
 */
export function extractScribdId(url) {
  const match = url.match(/scribd\.com\/(?:doc|document|presentation|embeds)\/(\d+)/i);
  return match ? match[1] : null;
}

/**
 * Mengakali & mengekstrak konten Scribd tanpa paywall
 */
export async function extractScribdDocument(url) {
  const docId = extractScribdId(url);
  if (!docId) {
    throw new Error('Format link Scribd tidak valid. Contoh link valid: https://www.scribd.com/document/12345678/Judul');
  }

  // Coba ambil dari embed URL Scribd (seringkali memuat seluruh halaman tanpa blur)
  const embedUrl = `https://www.scribd.com/embeds/${docId}/content?start_page=1&view_mode=scroll`;

  try {
    const embedRes = await axios.get(embedUrl, {
      headers: BROWSER_HEADERS,
      timeout: 15000
    });

    const $ = cheerio.load(embedRes.data);
    let title = $('title').text().replace('- Scribd', '').trim() || `Dokumen_Scribd_${docId}`;
    const author = $('.author, .uploader, .metadata_author').text().trim() || 'Scribd Contributor';

    // Cari seluruh container halaman
    const pages = [];
    $('.outer_page, .page, .page_missing_explanation').each((idx, el) => {
      const pageEl = $(el);
      // Ekstrak teks halaman
      const pageText = pageEl.find('.text_layer, .page_blur, .page-content, p, span')
        .map((_, p) => $(p).text().trim())
        .get()
        .filter(t => t.length > 0)
        .join('\n');

      // Ekstrak gambar halaman (jika halaman berbentuk render gambar / slide)
      let pageImg = pageEl.find('img').attr('src') || pageEl.find('image').attr('xlink:href') || '';
      if (pageImg && pageImg.startsWith('//')) pageImg = 'https:' + pageImg;

      pages.push({
        pageNumber: idx + 1,
        text: pageText || `Halaman ${idx + 1}`,
        imageUrl: pageImg || null
      });
    });

    // Jika parsing embed berhasil mendapatkan halaman
    if (pages.length > 0) {
      return {
        success: true,
        source: 'scribd',
        title,
        author,
        docId,
        totalPages: pages.length,
        pages,
        sourceUrl: url
      };
    }

    // Fallback: ambil halaman utama doc jika embed proteksi ketat
    const docRes = await axios.get(url, { headers: BROWSER_HEADERS, timeout: 15000 });
    const $doc = cheerio.load(docRes.data);
    const docTitle = $doc('h1').first().text().trim() || title;
    const docDesc = $doc('meta[name="description"]').attr('content') || '';

    // Ambil gambar cover atau slide awal
    const coverImg = $doc('meta[property="og:image"]').attr('content') || '';

    return {
      success: true,
      source: 'scribd',
      title: docTitle,
      author,
      docId,
      totalPages: 1,
      pages: [
        {
          pageNumber: 1,
          text: docDesc || 'Konten dokumen Scribd siap dikonversi ke PDF.',
          imageUrl: coverImg || null
        }
      ],
      sourceUrl: url
    };
  } catch (err) {
    console.error('Error saat bypass Scribd:', err.message);
    throw new Error('Gagal mengambil isi dokumen Scribd. Pastikan link dapat diakses publik.');
  }
}

/**
 * Ekstraksi halaman umum / Canva / Slide Web menjadi lembar dokumen
 */
export async function extractWebDocument(url) {
  try {
    const res = await axios.get(url, {
      headers: BROWSER_HEADERS,
      timeout: 15000
    });

    const $ = cheerio.load(res.data);
    const title = $('title').text().trim() || $('h1').first().text().trim() || 'Dokumen Halaman Web';
    const desc = $('meta[name="description"]').attr('content') || '';

    // Kumpulkan gambar-gambar utama beresolusi tinggi
    const images = [];
    $('img').each((_, el) => {
      let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('srcset');
      if (src && (src.startsWith('http') || src.startsWith('//'))) {
        if (src.startsWith('//')) src = 'https:' + src;
        // Filter icon kecil / tracking pixel
        if (!src.includes('avatar') && !src.includes('icon') && !src.includes('logo') && !images.includes(src)) {
          images.push(src);
        }
      }
    });

    // Kumpulkan paragraf & heading teks
    const sections = [];
    $('h1, h2, h3, p').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt.length > 25 && !sections.includes(txt)) {
        sections.push(txt);
      }
    });

    // Bagi menjadi slide/halaman dokumen (misal per 3 paragraf = 1 lembar)
    const pages = [];
    const chunkSize = 3;
    for (let i = 0; i < Math.max(sections.length, 1); i += chunkSize) {
      const pageTexts = sections.slice(i, i + chunkSize);
      const pageImg = images[Math.floor(i / chunkSize)] || null;
      pages.push({
        pageNumber: pages.length + 1,
        title: pageTexts[0] ? pageTexts[0].slice(0, 60) : `Halaman ${pages.length + 1}`,
        text: pageTexts.join('\n\n') || desc || 'Isi dokumen halaman web.',
        imageUrl: pageImg
      });
    }

    return {
      success: true,
      source: url.includes('canva.com') ? 'canva' : 'web',
      title,
      totalPages: pages.length,
      pages: pages.slice(0, 25),
      sourceUrl: url
    };
  } catch (err) {
    console.error('Error ekstraksi dokumen web:', err.message);
    throw new Error(`Gagal membuka link web: ${err.message}`);
  }
}
