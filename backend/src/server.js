import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import downloadRoutes from './routes/download.route.js';
import toolsRoutes from './routes/tools.route.js';

// load konfigurasi env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// settingan CORS biar frontend React kita bisa leluasa nembak API
app.use(cors({
  origin: '*', // ijinin akses dari domain/port mana aja (termasuk localhost vite)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// middleware parsing json dan form-urlencoded dengan batas 150mb untuk upload video/foto/audio kompresi
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ extended: true, limit: '150mb' }));

// sajikan file static uploads untuk direct image link
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// pasang rute API
app.use('/api', downloadRoutes);
app.use('/api', toolsRoutes);

// Endpoint real-time ping untuk telemetri jaringan
app.get('/api/ping', (req, res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.json({ ok: true, timestamp: Date.now() });
});

// Endpoint verifikasi login admin
app.post('/api/verify-admin', (req, res) => {
  const { password } = req.body || {};
  const correctPassword = (process.env.ADMIN_PASSWORD || 'VINZ6767').trim();
  
  if (password && password.trim() === correctPassword) {
    return res.json({
      success: true,
      message: 'Autentikasi admin berhasil! Selamat datang Admin Kuro.',
      role: 'Admin'
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Kata sandi admin salah! Akses ditolak.'
  });
});

// rute dasar buat ngecek server idup atau kagak
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Backend Kuro Studio siap meluncur! 🚀',
    endpoints: {
      download: 'POST /api/download',
      proxyStream: 'GET /api/proxy-download'
    }
  });
});

// penanganan error global biar server gak gampang crash
app.use((err, req, res, next) => {
  console.error('Ada unhandled error nih:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Ups! Terjadi kesalahan internal pada server kami.',
    error: err.toString()
  });
});

// nyalain server express di 0.0.0.0 agar kompatibel dengan 127.0.0.1 dan localhost
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================`);
  console.log(`🚀 Kuro Studio Fullstack Suite Aktif!`);
  console.log(`🌐 Frontend (Web UI)  : http://localhost:5173`);
  console.log(`⚙️  Backend (API Server): http://localhost:${PORT}`);
  console.log(`=============================================`);
});
