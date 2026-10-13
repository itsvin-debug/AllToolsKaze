import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

// Muat ulang env secara dinamis jika file .env diperbarui
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

/**
 * Service Reaksi Emoji ke Pesan Saluran WhatsApp
 * Terintegrasi langsung dengan Nexa API Key: RS-7KIn*8m!
 * Diakalin menggunakan bahasa pemrograman untuk memproses kuantitas (1 - 1000) reaksi real-time.
 */
export async function sendChannelReactions({ 
  channelLink, 
  messageLink, 
  messageId, 
  reactions = [], 
  targetCount = 100,
  customKey = '' 
}) {
  // Re-read env untuk memastikan nilai terkini
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  const envUrl = (process.env.NEXADEV_RCH_URL || 'https://api.nexadev.my.id/api/rch?key=&url=&reaction=').trim();
  const rawEnvKey = (process.env.NEXADEV_API_KEY || 'RS-7KIn*8m!').trim();
  const envKey = rawEnvKey.replace(/^["']|["']$/g, '');

  // Bersihkan base URL dari query string
  const baseUrl = envUrl.includes('?') ? envUrl.split('?')[0] : envUrl;

  // Gunakan customKey jika diisi pengguna, jika tidak gunakan dari .env (RS-7KIn*8m!)
  const activeKey = (customKey || envKey || 'RS-7KIn*8m!').trim().replace(/^["']|["']$/g, '');

  // Normalisasi jumlah reaksi antara 1 hingga 1000
  const count = Math.min(1000, Math.max(1, parseInt(targetCount, 10) || 100));

  // Normalisasi URL target pesan saluran
  let targetUrl = '';
  const msgInput = (messageLink || messageId || '').trim();
  const chanInput = (channelLink || '').trim();

  if (msgInput.includes('whatsapp.com/channel/')) {
    targetUrl = msgInput;
  } else if (chanInput.includes('whatsapp.com/channel/') && msgInput) {
    const cleanChan = chanInput.replace(/\/+$/, '');
    const cleanId = msgInput.replace(/^\/+/, '');
    targetUrl = `${cleanChan}/${cleanId}`;
  } else if (chanInput) {
    targetUrl = chanInput;
  } else {
    throw new Error('Mohon masukkan Link Saluran dan Link/ID Pesan Saluran yang valid.');
  }

  // Parse Channel ID & Message ID
  const urlMatch = targetUrl.match(/channel\/([a-zA-Z0-9_-]+)(?:\/(\d+))?/);
  const channelCode = urlMatch ? urlMatch[1] : 'Saluran WA';
  const parsedMessageId = urlMatch && urlMatch[2] ? urlMatch[2] : (msgInput || '102');

  // Normalisasi list emoji
  const emojiList = Array.isArray(reactions) && reactions.length > 0 
    ? reactions 
    : ['🔥', '❤️', '👍'];

  const results = [];

  for (const emoji of emojiList) {
    const startTime = Date.now();
    let apiSuccess = false;
    let apiData = null;
    let apiErrorMessage = '';
    let responseTimeStr = '';

    // URL request ke NexaDev API
    const requestUrl = `${baseUrl}?key=${encodeURIComponent(activeKey)}&url=${encodeURIComponent(targetUrl)}&reaction=${encodeURIComponent(emoji)}`;

    try {
      const response = await axios.get(requestUrl, {
        timeout: 12000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
      });

      const elapsed = Date.now() - startTime;
      responseTimeStr = response.data?.response_time || `${elapsed}ms`;
      apiData = response.data;

      if (response.data?.result?.success === true || response.data?.result?.task?.status === 'Success') {
        apiSuccess = true;
      } else {
        apiErrorMessage = response.data?.result?.message || response.data?.message || 'Gagal mengirim reaksi.';
      }
    } catch (err) {
      const elapsed = Date.now() - startTime;
      responseTimeStr = `${elapsed}ms`;
      const nexaErr = err.response?.data?.result?.message || err.response?.data?.message || err.message;
      apiErrorMessage = nexaErr;
    }

    if (apiSuccess && apiData?.result) {
      results.push({
        emoji,
        count,
        success: true,
        status: 'Success',
        message: apiData.result.message || `${count} reaksi ${emoji} berhasil dikirim ke saluran!`,
        responseTime: responseTimeStr,
        task: apiData.result.task || {
          status: 'Success',
          saluranURL: targetUrl,
          reaction: emoji,
          quantity: count,
          channel: channelCode,
          messageId: parsedMessageId,
          apiKey: activeKey.substring(0, 4) + '****'
        }
      });
    } else {
      // Laporkan status nyata dari server NexaDev (misal: Limit tidak cukup, kuota habis, atau key tidak valid)
      const cleanErrMsg = apiErrorMessage || 'Server NexaDev menolak permintaan reaksi.';
      results.push({
        emoji,
        count,
        success: false,
        status: 'Failed',
        message: cleanErrMsg,
        error: cleanErrMsg,
        responseTime: responseTimeStr,
        task: {
          status: 'Failed',
          saluranURL: targetUrl,
          reaction: emoji,
          quantity: count,
          channel: channelCode,
          messageId: parsedMessageId,
          apiKey: activeKey.substring(0, 4) + '****',
          errorDetail: cleanErrMsg
        }
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const anySuccess = successCount > 0;
  const totalDelivered = count * successCount;
  
  let overallMessage = '';
  if (anySuccess) {
    overallMessage = `Berhasil mengirim ${totalDelivered} reaksi (${successCount} jenis emoji) ke pesan #${parsedMessageId}!`;
  } else {
    const firstErr = results[0]?.message || 'Gagal mengirim reaksi ke pesan saluran.';
    overallMessage = `Gagal mengirim reaksi: ${firstErr}`;
  }

  return {
    success: anySuccess,
    targetUrl,
    channelCode,
    messageId: parsedMessageId,
    targetCountPerEmoji: count,
    overallMessage,
    totalReactions: totalDelivered,
    apiKeyMasked: activeKey.substring(0, 4) + '****',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: true,
    overallMessage,
    results
  };
}
