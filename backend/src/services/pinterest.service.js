import { downloadWithYtDlp } from './ytdlp.service.js';

// Ekstraksi Pinterest Pins & Videos
export async function downloadPinterest(url) {
  return await downloadWithYtDlp(url, 'Pinterest');
}
