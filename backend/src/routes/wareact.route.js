import express from 'express';

const router = express.Router();

// In-Memory store untuk memanajemen multi-sesi pengiriman auto-react
const activeJobs = new Map();

/**
 * 1. POST /api/wa-react/start
 * Endpoint penerima payload dari WaReactCard:
 * { channelJid, messageId, targetCount, emoji }
 */
router.post('/start', (req, res) => {
  try {
    const { channelJid, messageId, targetCount, emoji } = req.body;

    // Validasi parameter wajib
    if (!channelJid || !messageId || !targetCount || !emoji) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi Channel JID, Message ID, Target Jumlah React, dan Emoji.'
      });
    }

    const count = parseInt(targetCount, 10);
    if (isNaN(count) || count <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target jumlah react harus berupa angka positif.'
      });
    }

    // Batas aman demonstrasi maksimal 2000 react per job
    const safeCount = Math.min(count, 2000);

    const jobId = 'wareact_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const job = {
      id: jobId,
      channelJid: String(channelJid).trim(),
      messageId: String(messageId).trim(),
      targetCount: safeCount,
      emoji: String(emoji).trim(),
      sentCount: 0,
      running: true,
      logs: [
        `[${new Date().toLocaleTimeString('id-ID')}] Inisialisasi worker pool multi-sesi...`,
        `[${new Date().toLocaleTimeString('id-ID')}] Target Channel: ${channelJid}`,
        `[${new Date().toLocaleTimeString('id-ID')}] Message ID: #${messageId} | Target: ${safeCount}x ${emoji}`
      ],
      createdAt: Date.now()
    };

    activeJobs.set(jobId, job);

    // ─── ASYNCHRONOUS MULTI-SESSION QUEUE LOOP ───
    // Di sinilah fungsi looping delay untuk rotasi multi-akun diletakkan
    (async () => {
      // Simulasi rotasi pool multi-akun sesi WhatsApp (misal 5 worker sesi)
      const sessionCount = 5;

      for (let i = 1; i <= safeCount; i++) {
        // Cek jika proses dibatalkan oleh pengguna
        if (!job.running) {
          job.logs.push(`[${new Date().toLocaleTimeString('id-ID')}] ⚠️ Proses dihentikan oleh pengguna pada reaksi ke-${job.sentCount}.`);
          break;
        }

        // Delay dinamis (350ms - 850ms) untuk mencegah rate-limit dan spam flag WA
        const jitterDelay = Math.floor(Math.random() * 500) + 350;
        await new Promise((resolve) => setTimeout(resolve, jitterDelay));

        if (!job.running) break;

        job.sentCount = i;
        const currentWorkerSession = ((i - 1) % sessionCount) + 1;
        const timeNow = new Date().toLocaleTimeString('id-ID');

        // Batasi log maksimal 60 baris agar browser client tidak lag
        if (job.logs.length > 60) {
          job.logs.shift();
        }

        job.logs.push(
          `[${timeNow}] Sesi-WA#${currentWorkerSession} -> Sukses kirim react ${job.emoji} ke msg #${job.messageId} (${jitterDelay}ms)`
        );
      }

      if (job.running) {
        job.running = false;
        job.logs.push(`[${new Date().toLocaleTimeString('id-ID')}] 🎉 Selesai! Sukses mengirim ${job.sentCount} reaksi ${job.emoji}.`);
      }
    })();

    return res.status(200).json({
      success: true,
      message: 'Bot WhatsApp Auto-React berhasil dijalankan!',
      data: {
        jobId,
        targetCount: safeCount,
        emoji
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
 * 2. GET /api/wa-react/status/:jobId
 * Mengambil progres terkini (polling interval)
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
      emoji: job.emoji,
      progressPercent: percent,
      logs: job.logs
    }
  });
});

/**
 * 3. POST /api/wa-react/stop
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
    message: 'Bot Auto-React berhasil dihentikan.',
    data: {
      jobId: job.id,
      sentCount: job.sentCount
    }
  });
});

export default router;
