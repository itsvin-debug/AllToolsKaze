import { downloadWithYtDlp } from './ytdlp.service.js';

// Ekstraksi Bandcamp Audio & Track
export async function downloadBandcamp(url) {
  return await downloadWithYtDlp(url, 'Bandcamp');
}
