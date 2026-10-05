import makeWASocket, { 
  useMultiFileAuthState, 
  fetchLatestBaileysVersion, 
  DisconnectReason, 
  makeCacheableSignalKeyStore,
  Browsers
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import axios from 'axios';
import * as cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.resolve(__dirname, '../../auth_wa_channel');

const logger = pino({ level: 'silent' });

class WaSessionService {
  constructor() {
    this.sock = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.qrCode = null;
    this.qrTimestamp = 0;
    this.pairingCode = null;
    this.userData = null;
    this.connectionState = 'disconnected'; // 'disconnected' | 'connecting' | 'qr_ready' | 'connected'
    this.init();
  }

  async init() {
    try {
      if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
      const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

      this.isConnecting = true;
      this.connectionState = 'connecting';

      this.sock = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        printQRInTerminal: false,
        logger,
        browser: Browsers.ubuntu('Chrome'),
        syncFullHistory: false,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            // Generate QR Code dengan kontras tinggi, margin aman 4 unit (quiet zone),
            // dan tanpa overlay agar 100% terbaca oleh kamera WhatsApp
            this.qrCode = await QRCode.toDataURL(qr, {
              errorCorrectionLevel: 'M',
              margin: 4,
              width: 380,
              color: {
                dark: '#000000',
                light: '#ffffff'
              }
            });
            this.qrTimestamp = Date.now();
            this.connectionState = 'qr_ready';
            console.log('[WA-SESSION] ✓ Kode QR WhatsApp baru siap di-scan (Margin 4, High Contrast).');
          } catch (qrErr) {
            console.error('[WA-SESSION] Error generate QR data URL:', qrErr);
          }
        }

        if (connection === 'connecting') {
          this.connectionState = this.qrCode ? 'qr_ready' : 'connecting';
          this.isConnecting = true;
        } else if (connection === 'open') {
          this.isConnected = true;
          this.isConnecting = false;
          this.connectionState = 'connected';
          this.qrCode = null;
          this.pairingCode = null;
          this.userData = this.sock.user || null;
          console.log('[WA-SESSION] 🎉 WhatsApp Berhasil Terhubung!', this.sock.user?.id || 'Connected');
        } else if (connection === 'close') {
          this.isConnected = false;
          this.isConnecting = false;
          this.connectionState = 'disconnected';
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          console.log('[WA-SESSION] Koneksi terputus. Status code:', statusCode);

          if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
            this.qrCode = null;
            this.userData = null;
            if (fs.existsSync(AUTH_DIR)) {
              fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            }
            setTimeout(() => this.init(), 1500);
          } else {
            setTimeout(() => this.init(), 3000);
          }
        }
      });

    } catch (err) {
      console.error('[WA-SESSION] Gagal inisialisasi socket:', err);
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      isConnecting: this.isConnecting,
      state: this.connectionState,
      qrCode: this.qrCode || null,
      qrTimestamp: this.qrTimestamp,
      pairingCode: this.pairingCode || null,
      user: this.userData ? {
        id: this.userData.id,
        name: this.userData.name || this.userData.notify || this.userData.id
      } : null
    };
  }

  async requestPairing(phoneNumber) {
    if (!phoneNumber) throw new Error('Nomor telepon WhatsApp wajib diisi.');
    
    let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '62' + cleanNumber.substring(1);
    }

    if (!this.sock) {
      await this.init();
    }

    if (this.sock?.authState?.creds?.registered) {
      return {
        alreadyRegistered: true,
        user: this.sock.user
      };
    }

    try {
      this.isConnecting = true;
      const code = await this.sock.requestPairingCode(cleanNumber);
      this.pairingCode = code;
      return {
        pairingCode: code,
        phoneNumber: cleanNumber
      };
    } catch (err) {
      this.isConnecting = false;
      throw new Error('Gagal meminta kode pairing WhatsApp: ' + err.message);
    }
  }

  async logout() {
    try {
      if (this.sock) {
        await this.sock.logout().catch(() => {});
      }
      this.isConnected = false;
      this.userData = null;
      this.pairingCode = null;
      this.qrCode = null;
      this.connectionState = 'disconnected';
      
      if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      }
      setTimeout(() => this.init(), 1000);
      return { success: true };
    } catch (err) {
      throw new Error('Gagal logout: ' + err.message);
    }
  }

  /**
   * Mengurai link / JID channel WhatsApp dan mengambil metadata resmi
   */
  async resolveChannel(input, messageInput) {
    if (!input && !messageInput) throw new Error('Link saluran atau link pesan WhatsApp tidak boleh kosong.');

    let raw = String(input || messageInput).trim();
    let detectedMessageId = null;

    const postMatch = raw.match(/channel\/([a-zA-Z0-9_-]+)\/([0-9]+)/);
    let inviteCode = null;

    if (postMatch) {
      inviteCode = postMatch[1];
      detectedMessageId = postMatch[2];
    } else {
      const channelMatch = raw.match(/channel\/([a-zA-Z0-9_-]+)/);
      if (channelMatch) {
        inviteCode = channelMatch[1];
      } else if (raw.includes('@newsletter')) {
        inviteCode = raw;
      } else {
        inviteCode = raw.replace(/[^a-zA-Z0-9_-]/g, '');
      }
    }

    if (messageInput) {
      const msgStr = String(messageInput).trim();
      const postLinkMatch = msgStr.match(/channel\/([a-zA-Z0-9_-]+)\/([0-9]+)/);
      if (postLinkMatch) {
        if (!inviteCode || !inviteCode.includes('@newsletter')) {
          inviteCode = postLinkMatch[1];
        }
        detectedMessageId = postLinkMatch[2];
      } else {
        const mMatch = msgStr.match(/\/([0-9]+)(?:\?.*)?$/) || msgStr.match(/([0-9]+)$/);
        if (mMatch) {
          detectedMessageId = mMatch[1];
        } else {
          detectedMessageId = msgStr.replace(/[^0-9]/g, '');
        }
      }
    }

    let channelInfo = {
      title: 'WhatsApp Channel',
      description: '',
      avatar: '',
      inviteCode: inviteCode || '',
      newsletterJid: inviteCode?.includes('@newsletter') ? inviteCode : null,
      detectedMessageId: detectedMessageId || null,
      verified: false
    };

    if (inviteCode && !inviteCode.includes('@newsletter')) {
      const channelUrl = `https://whatsapp.com/channel/${inviteCode}`;
      try {
        const res = await axios.get(channelUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'id,en;q=0.9'
          },
          timeout: 6000
        });

        const $ = cheerio.load(res.data);
        const ogTitle = $('meta[property="og:title"]').attr('content') || $('title').text();
        const ogDesc = $('meta[property="og:description"]').attr('content') || '';
        const ogImage = $('meta[property="og:image"]').attr('content') || '';

        if (ogTitle && !ogTitle.toLowerCase().includes('tidak ditemukan')) {
          channelInfo.title = ogTitle;
          channelInfo.description = ogDesc;
          channelInfo.avatar = ogImage;
          channelInfo.verified = true;
        }
      } catch (err) {
        console.warn('[WA-SESSION] Web scraper warning:', err.message);
      }

      if (this.sock && this.isConnected) {
        try {
          const meta = await this.sock.newsletterMetadata('invite', inviteCode);
          if (meta) {
            channelInfo.title = meta.name || channelInfo.title;
            channelInfo.newsletterJid = meta.id;
            channelInfo.description = meta.description || channelInfo.description;
            channelInfo.verified = true;
          }
        } catch (sockErr) {
          console.warn('[WA-SESSION] Socket newsletterMetadata warning:', sockErr.message);
        }
      }
    }

    return channelInfo;
  }

  /**
   * Mengirim reaksi nyata ke WhatsApp channel via Baileys socket
   */
  async sendReaction(channelJidOrInvite, messageId, emoji) {
    if (!this.sock || !this.isConnected) {
      return {
        sent: false,
        reason: 'WhatsApp socket belum terhubung. Scan QR Code atau gunakan Pairing Code untuk menghubungkan akun.'
      };
    }

    try {
      let rawChannel = String(channelJidOrInvite).trim();
      let targetJid = rawChannel;

      const urlMatch = rawChannel.match(/channel\/([a-zA-Z0-9_-]+)/);
      if (urlMatch) {
        targetJid = urlMatch[1];
      }

      let serverId = String(messageId).trim();
      const mMatch = serverId.match(/\/([0-9]+)(?:\?.*)?$/) || serverId.match(/([0-9]+)$/);
      if (mMatch) {
        serverId = mMatch[1];
      }

      if (!targetJid.includes('@newsletter')) {
        const cleanInvite = targetJid.replace(/[^a-zA-Z0-9_-]/g, '');
        const meta = await this.sock.newsletterMetadata('invite', cleanInvite);
        if (meta?.id) {
          targetJid = meta.id;
        } else {
          throw new Error('Gagal menemukan JID saluran dari invite code: ' + cleanInvite);
        }
      }

      console.log(`[WA-SESSION] -> Mengirim reaksi nyata ke WhatsApp: JID=${targetJid}, MsgID=${serverId}, Emoji=${emoji}`);
      
      await this.sock.newsletterReactMessage(targetJid, serverId, emoji);

      return {
        sent: true,
        targetJid,
        serverId,
        emoji
      };
    } catch (err) {
      console.error('[WA-SESSION] Error kirim reaksi:', err.message);
      return {
        sent: false,
        error: err.message
      };
    }
  }
}

export const waSessionService = new WaSessionService();
export default waSessionService;
