// src/validate.js: validasi dan pembersihan input untuk data kata.
const TINGKAT = ['halus', 'sedang', 'akrab'];

function cleanText(value, max) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return undefined; // undefined = tipe salah
  const trimmed = value.trim();
  if (trimmed === '') return null;
  if (trimmed.length > max) return undefined;
  return trimmed;
}

// Mengembalikan { errors: [...], data: {...} }. Bila errors kosong, data siap disimpan.
function validateKata(body) {
  const errors = [];
  const data = { kata_indonesia: null, kategori: null, padanan: [] };

  if (!body || typeof body !== 'object') {
    return { errors: ['Body request harus berupa JSON.'], data };
  }

  const kata = cleanText(body.kata_indonesia, 100);
  if (!kata) errors.push('kata_indonesia wajib diisi (maksimal 100 karakter).');
  else data.kata_indonesia = kata;

  const kategori = cleanText(body.kategori, 50);
  if (kategori === undefined) errors.push('kategori maksimal 50 karakter.');
  else data.kategori = kategori;

  if (!Array.isArray(body.padanan) || body.padanan.length === 0) {
    errors.push('Minimal satu padanan harus diisi.');
    return { errors, data };
  }
  if (body.padanan.length > TINGKAT.length) {
    errors.push('Padanan maksimal satu per tingkat (halus, sedang, akrab).');
    return { errors, data };
  }

  const dipakai = new Set();
  body.padanan.forEach((p, i) => {
    const label = `padanan[${i + 1}]`;
    if (!p || typeof p !== 'object') {
      errors.push(`${label} tidak valid.`);
      return;
    }
    if (!TINGKAT.includes(p.tingkat)) {
      errors.push(`${label}: tingkat harus salah satu dari ${TINGKAT.join(', ')}.`);
      return;
    }
    if (dipakai.has(p.tingkat)) {
      errors.push(`${label}: tingkat "${p.tingkat}" sudah dipakai.`);
      return;
    }
    dipakai.add(p.tingkat);

    const daerah = cleanText(p.kata_daerah, 100);
    const contoh = cleanText(p.contoh_kalimat, 500);
    const catatan = cleanText(p.catatan, 500);
    if (!daerah) errors.push(`${label}: kata_daerah wajib diisi (maksimal 100 karakter).`);
    if (contoh === undefined) errors.push(`${label}: contoh_kalimat maksimal 500 karakter.`);
    if (catatan === undefined) errors.push(`${label}: catatan maksimal 500 karakter.`);

    data.padanan.push({
      tingkat: p.tingkat,
      kata_daerah: daerah,
      contoh_kalimat: contoh || null,
      catatan: catatan || null,
    });
  });

  return { errors, data };
}

module.exports = { TINGKAT, validateKata };
