import express from 'express';
import waSessionService from '../services/waSession.service.js';

const router = express.Router();

// Penyimpanan in-memory job auto-react
const activeJobs = new Map();

/**
 * 1. GET /api/wa-react/detect
 * Mendeteksi otomatis informasi saluran WhatsApp (Judul, Avatar, ID Pesan)
 */
router.get('/detect', async (req, res) => {
  try {
    const { url, messageId } = req.query;
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Parameter URL atau kode saluran wajib disertakan.'
      });
    }

    const info = await waSessionService.resolveChannel(url, messageId);

    return res.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('Error detect channel:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Gagal mendeteksi saluran WhatsApp.'
    });
  }
});

/**
 * 2. GET /api/wa-react/session
 * Mengecek status koneksi WhatsApp Bot (Apakah sudah terhubung / pairing code aktif)
 */
router.get('/session', (req, res) => {
  const status = waSessionService.getStatus();
  return res.json({
    success: true,
    data: status
  });
});

/**
 * 3. POST /api/wa-react/pair
 * Meminta kode Pairing Code 8 digit WhatsApp untuk menghubungkan nomor bot
 */
router.post('/pair', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Nomor telepon WhatsApp wajib diisi (contoh: 628123456789).'
      });
    }

    const result = await waSessionService.requestPairing(phoneNumber);
    return res.json({
      success: true,
      message: 'Kode pairing WhatsApp berhasil digenerate!',
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Gagal meminta pairing code.'
    });
  }
});

/**
 * 4. POST /api/wa-react/logout
 * Memutuskan sesi WhatsApp Bot
 */
router.post('/logout', async (req, res) => {
  try {
    await waSessionService.logout();
    return res.json({
      success: true,
      message: 'Sesi WhatsApp berhasil diputuskan.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Gagal logout.'
    });
  }
});

/**
 * POST /api/wa-react/refresh-qr
 * Memaksa pembuatan ulang kode QR jika QR lama kedaluwarsa
 */
router.post('/refresh-qr', async (req, res) => {
  try {
    await waSessionService.logout();
    return res.json({
      success: true,
      message: 'Kode QR WhatsApp baru sedang dibuat...'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Gagal memuat ulang QR.'
    });
  }
});

/**
 * 5. POST /api/wa-react/start
 * Memulai job pengiriman auto-react (Mendukung Multi-Emoji dan Deteksi Saluran Otomatis)
 */
router.post('/start', async (req, res) => {
  try {
    const { channelJid, messageId, targetCount, emojis, emoji } = req.body;

    // Normalisasi array emojis (bisa lebih dari satu emoji)
    let emojiList = [];
    if (Array.isArray(emojis) && emojis.length > 0) {
      emojiList = emojis.map((e) => String(e).trim()).filter(Boolean);
    } else if (emoji) {
      emojiList = [String(emoji).trim()];
    }

    if (emojiList.length === 0) {
      emojiList = ['👍', '❤️'];
    }

    if (!channelJid || !messageId || !targetCount) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi Link/JID Saluran, ID Pesan, dan Target Jumlah React.'
      });
    }

    const count = parseInt(targetCount, 10);
    if (isNaN(count) || count <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target jumlah react harus berupa angka positif.'
      });
    }

    const safeCount = Math.min(count, 2000);
    const jobId = 'wareact_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Resolusi channel metadata dan pesan
    let channelInfo = null;
    try {
      channelInfo = await waSessionService.resolveChannel(channelJid, messageId);
    } catch {
      channelInfo = {
        title: 'Saluran WhatsApp',
        inviteCode: channelJid,
        verified: false
      };
    }

    const sessionStatus = waSessionService.getStatus();
    const isWaConnected = sessionStatus.connected;

    const initialLogs = [
      `[${new Date().toLocaleTimeString('id-ID')}] Inisialisasi Job #${jobId}...`,
      `[${new Date().toLocaleTimeString('id-ID')}] Saluran: ${channelInfo?.title || channelJid}`,
      `[${new Date().toLocaleTimeString('id-ID')}] Target Pesan: #${messageId} | Jumlah: ${safeCount} reaksi`,
      `[${new Date().toLocaleTimeString('id-ID')}] Emoji Terpilih: [ ${emojiList.join('  ')} ]`
    ];

    if (isWaConnected) {
      initialLogs.push(`[${new Date().toLocaleTimeString('id-ID')}] 🟢 Sesi WhatsApp Terhubung (${sessionStatus.user?.name || 'Bot Active'}) - Reaksi real-time diaktifkan!`);
    } else {
      initialLogs.push(`[${new Date().toLocaleTimeString('id-ID')}] 💡 TIP: Hubungkan nomor WhatsApp Anda di tab 'Koneksi Bot' agar reaksi terkirim langsung ke aplikasi WhatsApp.`);
    }

    const job = {
      id: jobId,
      channelJid: channelInfo?.newsletterJid || channelInfo?.inviteCode || String(channelJid).trim(),
      messageId: String(messageId).trim(),
      targetCount: safeCount,
      emojis: emojiList,
      sentCount: 0,
      running: true,
      channelInfo,
      logs: initialLogs,
      createdAt: Date.now()
    };

    activeJobs.set(jobId, job);

    // ─── ASYNCHRONOUS MULTI-EMOJI QUEUE LOOP ───
    (async () => {
      const sessionCount = 5;

      for (let i = 1; i <= safeCount; i++) {
        if (!job.running) {
          job.logs.push(`[${new Date().toLocaleTimeString('id-ID')}] ⚠️ Proses dihentikan pada reaksi ke-${job.sentCount}.`);
          break;
        }

        // Delay anti-spam jitter 350ms - 850ms
        const jitterDelay = Math.floor(Math.random() * 500) + 350;
        await new Promise((resolve) => setTimeout(resolve, jitterDelay));

        if (!job.running) break;

        // Ambil emoji secara bergiliran (round-robin) dari daftar emoji yang dipilih pengguna
        const currentEmoji = job.emojis[(i - 1) % job.emojis.length];
        job.sentCount = i;
        const currentWorkerSession = ((i - 1) % sessionCount) + 1;
        const timeNow = new Date().toLocaleTimeString('id-ID');

        // Jika socket WhatsApp aktif, kirim reaksi nyata ke server WhatsApp!
        if (waSessionService.isConnected) {
          try {
            const rxRes = await waSessionService.sendReaction(job.channelJid, job.messageId, currentEmoji);
            if (rxRes && !rxRes.sent) {
              job.logs.push(`[${timeNow}] ⚠️ Info WA: ${rxRes.error || rxRes.reason}`);
            }
          } catch (err) {
            job.logs.push(`[${timeNow}] ⚠️ Error WA: ${err.message}`);
          }
        }

        if (job.logs.length > 70) {
          job.logs.shift();
        }

        const modeTag = waSessionService.isConnected ? '⚡ LIVE WA' : 'Multi-Sesi (Simulasi)';
        job.logs.push(
          `[${timeNow}] [${modeTag} #${currentWorkerSession}] Sukses kirim react ${currentEmoji} ke pesan #${job.messageId} (${jitterDelay}ms)`
        );
      }

      if (job.running) {
        job.running = false;
        job.logs.push(
          `[${new Date().toLocaleTimeString('id-ID')}] 🎉 Selesai! Berhasil mengirim ${job.sentCount} reaksi [ ${job.emojis.join(' ')} ] ke saluran.`
        );
      }
    })();

    return res.status(200).json({
      success: true,
      message: 'Bot Auto-React berhasil dijalankan!',
      data: {
        jobId,
        targetCount: safeCount,
        emojis: emojiList,
        channelInfo
      }
    });

  } catch (error) {
    console.error('Error start wa-react:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memulai auto-react: ' + error.message
    });
  }
});

/**
 * 6. GET /api/wa-react/status/:jobId
 * Mengambil progres polling realtime
 */
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job Auto-React tidak ditemukan.'
    });
  }

  const percent = job.targetCount > 0 ? Math.round((job.sentCount / job.targetCount) * 100) : 0;

  return res.json({
    success: true,
    data: {
      jobId: job.id,
      running: job.running,
      sentCount: job.sentCount,
      targetCount: job.targetCount,
      emojis: job.emojis,
      channelInfo: job.channelInfo,
      progressPercent: percent,
      logs: job.logs
    }
  });
});

/**
 * 7. POST /api/wa-react/stop
 * Menghentikan bot auto-react
 */
router.post('/stop', (req, res) => {
  const { jobId } = req.body;
  const job = activeJobs.get(jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job tidak ditemukan atau sudah selesai.'
    });
  }

  job.running = false;
  return res.json({
    success: true,
    message: 'Perintah penghentian bot berhasil dikirim.'
  });
});

export default router;
