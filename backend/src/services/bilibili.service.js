import { downloadWithYtDlp } from './ytdlp.service.js';

// Ekstraksi Bilibili Anime & Video HD
export async function downloadBilibili(url) {
  return await downloadWithYtDlp(url, 'Bilibili');
}
