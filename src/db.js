// src/db.js: membuat connection pool ke MySQL dan helper transaksi.
const mysql = require('mysql2/promise');

// Pool = kumpulan koneksi yang dipakai ulang, lebih efisien daripada membuka koneksi tiap request.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'UTF8MB4_UNICODE_CI',
});

// Menjalankan beberapa query sebagai satu kesatuan: semua berhasil (commit) atau semua dibatalkan (rollback).
async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release(); // kembalikan koneksi ke pool
  }
}

module.exports = { pool, withTransaction };
