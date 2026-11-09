// server.js: titik masuk aplikasi Express.
const express = require('express');
const path = require('path');
const { pool } = require('./src/db');
const kataRouter = require('./src/routes/kata');

const app = express();

// Membaca body JSON dari request (dibatasi 100 KB).
app.use(express.json({ limit: '100kb' }));

// Menyajikan halaman web statis dari folder public/.
app.use(express.static(path.join(__dirname, 'public')));

// Cek kesehatan aplikasi dan koneksi database (200 bila sehat, 503 bila database tidak terjangkau).
async function cekKesehatan(req, res) {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', error: 'Database belum bisa dihubungi.' });
  }
}
app.get('/health', cekKesehatan);
app.get('/api/health', cekKesehatan);

// Endpoint CRUD kata.
app.use('/api/kata', kataRouter);

// Endpoint /api/* lain yang tidak dikenal.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
});

// Penanganan error terpusat (harus punya 4 parameter agar dikenali Express).
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON tidak valid.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Kamus Bahasa Daerah berjalan di port ${PORT}`);
});
