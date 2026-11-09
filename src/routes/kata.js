// src/routes/kata.js: endpoint CRUD untuk /api/kata
const express = require('express');
const { pool, withTransaction } = require('../db');
const { requireAdmin } = require('../auth');
const { TINGKAT, validateKata } = require('../validate');

const router = express.Router();

// Mengambil padanan untuk sekumpulan kata, lalu menempelkannya ke tiap kata.
async function attachPadanan(kataRows, tingkat) {
  if (kataRows.length === 0) return [];

  let sql =
    'SELECT id, kata_id, tingkat, kata_daerah, contoh_kalimat, catatan FROM padanan WHERE kata_id IN (?)';
  const params = [kataRows.map((k) => k.id)];
  if (tingkat) {
    sql += ' AND tingkat = ?';
    params.push(tingkat);
  }
  sql += " ORDER BY FIELD(tingkat, 'halus', 'sedang', 'akrab')";

  const [padanan] = await pool.query(sql, params);
  return kataRows.map((k) => ({
    ...k,
    padanan: padanan.filter((p) => p.kata_id === k.id),
  }));
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getKataById(id) {
  const [rows] = await pool.query(
    'SELECT id, kata_indonesia, kategori, created_at, updated_at FROM kata WHERE id = ?',
    [id]
  );
  if (rows.length === 0) return null;
  const [lengkap] = await attachPadanan(rows, null);
  return lengkap;
}

async function insertPadanan(conn, kataId, daftar) {
  const values = daftar.map((p) => [kataId, p.tingkat, p.kata_daerah, p.contoh_kalimat, p.catatan]);
  await conn.query(
    'INSERT INTO padanan (kata_id, tingkat, kata_daerah, contoh_kalimat, catatan) VALUES ?',
    [values]
  );
}

// READ (daftar + pencarian): GET /api/kata?q=makan&tingkat=halus
router.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const tingkat = String(req.query.tingkat || '');
    if (tingkat && !TINGKAT.includes(tingkat)) {
      return res.status(400).json({ error: 'Parameter tingkat harus halus, sedang, atau akrab.' });
    }

    // Escape karakter wildcard LIKE agar input "%" atau "_" dianggap huruf biasa.
    const like = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
    const [rows] = await pool.query(
      `SELECT DISTINCT k.id, k.kata_indonesia, k.kategori
         FROM kata k
         LEFT JOIN padanan p ON p.kata_id = k.id
        WHERE k.kata_indonesia LIKE ? OR p.kata_daerah LIKE ?
        ORDER BY k.kata_indonesia
        LIMIT 200`,
      [like, like]
    );

    let hasil = await attachPadanan(rows, tingkat || null);
    // Bila filter tingkat dipakai, sembunyikan kata yang tidak punya padanan di tingkat itu.
    if (tingkat) hasil = hasil.filter((k) => k.padanan.length > 0);
    res.json(hasil);
  } catch (err) {
    next(err);
  }
});

// READ (satu kata): GET /api/kata/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID tidak valid.' });
    const kata = await getKataById(id);
    if (!kata) return res.status(404).json({ error: 'Kata tidak ditemukan.' });
    res.json(kata);
  } catch (err) {
    next(err);
  }
});

// CREATE: POST /api/kata
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { errors, data } = validateKata(req.body);
    if (errors.length) return res.status(400).json({ error: 'Validasi gagal.', details: errors });

    const newId = await withTransaction(async (conn) => {
      const [result] = await conn.query('INSERT INTO kata (kata_indonesia, kategori) VALUES (?, ?)', [
        data.kata_indonesia,
        data.kategori,
      ]);
      await insertPadanan(conn, result.insertId, data.padanan);
      return result.insertId;
    });

    res.status(201).json(await getKataById(newId));
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Kata tersebut sudah ada di kamus.' });
    }
    next(err);
  }
});

// UPDATE: PUT /api/kata/:id (mengganti data kata beserta seluruh padanannya)
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID tidak valid.' });

    const { errors, data } = validateKata(req.body);
    if (errors.length) return res.status(400).json({ error: 'Validasi gagal.', details: errors });

    const ditemukan = await withTransaction(async (conn) => {
      const [result] = await conn.query(
        'UPDATE kata SET kata_indonesia = ?, kategori = ? WHERE id = ?',
        [data.kata_indonesia, data.kategori, id]
      );
      if (result.affectedRows === 0) return false;
      await conn.query('DELETE FROM padanan WHERE kata_id = ?', [id]);
      await insertPadanan(conn, id, data.padanan);
      return true;
    });

    if (!ditemukan) return res.status(404).json({ error: 'Kata tidak ditemukan.' });
    res.json(await getKataById(id));
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Kata tersebut sudah ada di kamus.' });
    }
    next(err);
  }
});

// DELETE: DELETE /api/kata/:id
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID tidak valid.' });

    const [result] = await pool.query('DELETE FROM kata WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Kata tidak ditemukan.' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
