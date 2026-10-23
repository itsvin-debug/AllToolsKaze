import axios from 'axios';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url, filename } = req.query;
  if (!url) return res.status(400).send('URL diperlukan.');

  const safeFilename = (filename || 'kaze_download.mp4').replace(/[^a-zA-Z0-9_.\-]/g, '_');

  try {
    let targetUrl = decodeURIComponent(url);

    // Jika targetUrl adalah progress_url (masih diproses di server encoder), poll hingga selesai
    if (targetUrl.includes('savenow.to/api/progress') || targetUrl.includes('/api/progress?id=')) {
      let resolved = false;
      for (let i = 0; i < 20; i++) {
        try {
          const progRes = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Referer': 'https://y2down.cc/' },
            timeout: 5000
          });
          if (progRes.data?.download_url) {
            targetUrl = progRes.data.download_url;
            resolved = true;
            break;
          }
        } catch (_) {}
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // Tentukan referer yang cocok sesuai domain target
    let referer = undefined;
    if (targetUrl.includes('tiktok') || targetUrl.includes('tikcdn')) {
      referer = 'https://www.tiktok.com/';
    } else if (targetUrl.includes('instagram') || targetUrl.includes('cdninstagram') || targetUrl.includes('fbcdn')) {
      referer = 'https://www.instagram.com/';
    } else if (targetUrl.includes('twimg') || targetUrl.includes('twitter') || targetUrl.includes('x.com')) {
      referer = 'https://twitter.com/';
    } else if (targetUrl.includes('googlevideo') || targetUrl.includes('youtube') || targetUrl.includes('ytimg')) {
      referer = 'https://www.youtube.com/';
    } else if (targetUrl.includes('savenow.to')) {
      referer = 'https://y2down.cc/';
    }

    let response = null;
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    ];

    const attempts = [
      { headers: { 'User-Agent': userAgents[0], ...(referer ? { 'Referer': referer } : {}) } },
      { headers: { 'User-Agent': userAgents[0] } },
      { headers: { 'User-Agent': userAgents[1] } }
    ];

    for (const attempt of attempts) {
      try {
        response = await axios({
          method: 'GET',
          url: targetUrl,
          responseType: 'stream',
          headers: attempt.headers,
          timeout: 25000,
          maxRedirects: 5
        });
        if (response && response.status >= 200 && response.status < 300) {
          break;
        }
      } catch (_) {}
    }

    if (!response || !response.data) {
      throw new Error('Gagal mengambil file dari server CDN sumber.');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy stream error:', error.message);
    if (!res.headersSent) {
      return res.status(502).json({
        success: false,
        message: 'Gagal mengunduh berkas media dari server sumber CDN.'
      });
    }
  }
}
