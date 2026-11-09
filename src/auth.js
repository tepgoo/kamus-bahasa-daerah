// src/auth.js: middleware sederhana untuk melindungi operasi tulis (tambah, ubah, hapus).
const crypto = require('crypto');

function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return res.status(503).json({ error: 'ADMIN_TOKEN belum diatur di server.' });
  }

  const given = req.get('x-admin-token') || '';
  const a = Buffer.from(given);
  const b = Buffer.from(expected);

  // timingSafeEqual mencegah serangan timing; panjang harus sama lebih dulu.
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Token admin salah atau belum diisi.' });
  }
  next();
}

module.exports = { requireAdmin };
