import { downloadWithYtDlp } from './ytdlp.service.js';

// Ekstraksi Douyin Video & Musik
export async function downloadDouyin(url) {
  return await downloadWithYtDlp(url, 'Douyin');
}
