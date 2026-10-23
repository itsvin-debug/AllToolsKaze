// Handler serverless Vercel untuk telemetri baterai
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Pada lingkungan serverless cloud (Vercel container), kembalikan status cloud aman
  return res.status(200).json({
    success: true,
    level: 100,
    isCharging: true,
    hasBattery: false,
    source: 'cloud'
  });
}
