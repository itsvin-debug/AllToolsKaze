import { downloadWithYtDlp } from './ytdlp.service.js';

// Ekstraksi Facebook Video & Reels
export async function downloadFacebook(url) {
  return await downloadWithYtDlp(url, 'Facebook');
}
