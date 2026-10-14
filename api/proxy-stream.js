import axios from 'axios';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url, type } = req.query;
  if (!url) return res.status(400).send('URL target tidak boleh kosong.');

  const targetUrl = decodeURIComponent(url);
  const range = req.headers.range;

  let referer = undefined;
  if (targetUrl.includes('tikwm.com')) {
    referer = 'https://www.tikwm.com/';
  } else if (targetUrl.includes('tiktok') || targetUrl.includes('tikcdn') || targetUrl.includes('bytegecko') || targetUrl.includes('ibytedtos')) {
    referer = 'https://www.tiktok.com/';
  } else if (targetUrl.includes('instagram') || targetUrl.includes('cdninstagram') || targetUrl.includes('fbcdn')) {
    referer = 'https://www.instagram.com/';
  } else if (targetUrl.includes('twimg') || targetUrl.includes('twitter') || targetUrl.includes('x.com')) {
    referer = 'https://twitter.com/';
  } else if (targetUrl.includes('googlevideo') || targetUrl.includes('youtube') || targetUrl.includes('ytimg')) {
    referer = 'https://www.youtube.com/';
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  };
  if (referer) headers['Referer'] = referer;
  if (range) headers['Range'] = range;

  try {
    const response = await axios({
      method: 'GET',
      url: targetUrl,
      responseType: 'stream',
      headers,
      timeout: 30000,
      validateStatus: (status) => status >= 200 && status < 400
    });

    const isAudio = type === 'audio' || targetUrl.includes('.mp3') || targetUrl.includes('/music/');
    let contentType = response.headers['content-type'];
    if (!contentType || contentType === 'application/octet-stream') {
      contentType = isAudio ? 'audio/mpeg' : 'video/mp4';
    }

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');

    if (response.headers['content-range']) {
      res.setHeader('Content-Range', response.headers['content-range']);
    }
    if (response.headers['content-length']) {
      res.setHeader('Content-Length', response.headers['content-length']);
    }

    res.status(response.status);
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy stream error:', error.message);
    if (!res.headersSent) {
      return res.redirect(302, targetUrl);
    }
  }
}
