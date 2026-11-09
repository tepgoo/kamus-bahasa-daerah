// public/app.js: logika halaman (pencarian + CRUD lewat REST API).
const TINGKAT = ['halus', 'sedang', 'akrab'];
const LABEL = { halus: 'Halus', sedang: 'Sedang', akrab: 'Akrab' };
const el = (id) => document.getElementById(id);

let adminToken = sessionStorage.getItem('adminToken') || '';
let permintaanTerakhir = 0; // penanda agar respons lama tidak menimpa hasil terbaru

// Membuat elemen dengan textContent (aman dari XSS karena tidak memakai innerHTML).
function node(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined && text !== null) n.textContent = text;
  return n;
}

async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (adminToken && method !== 'GET') headers['x-admin-token'] = adminToken;

  const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Terjadi kesalahan.');
    err.details = data.details || [];
    throw err;
  }
  return data;
}

let toastTimer;
function toast(pesan, galat = false) {
  const t = el('toast');
  t.textContent = pesan;
  t.className = galat ? 'toast galat' : 'toast';
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 3500);
}

// ---------- Tampilan hasil ----------
function buatTingkat(tingkat, padanan) {
  const box = node('div', `tingkat ${tingkat}${padanan ? '' : ' kosong-tier'}`);
  box.append(node('div', 'label', LABEL[tingkat]));
  if (!padanan) {
    box.append(node('div', 'kata', 'Belum ada padanan'));
    return box;
  }
  box.append(node('div', 'kata', padanan.kata_daerah));
  if (padanan.contoh_kalimat) box.append(node('p', 'contoh', padanan.contoh_kalimat));
  if (padanan.catatan) box.append(node('p', 'catatan', padanan.catatan));
  return box;
}

function buatKartu(kata, tingkatTerpilih) {
  const kartu = node('article', 'kartu');
  const head = node('header', 'kartu-head');
  head.append(node('h2', null, kata.kata_indonesia));
  if (kata.kategori) head.append(node('span', 'badge', kata.kategori));

  const aksi = node('div', 'aksi-admin');
  const ubah = node('button', 'btn kecil', 'Ubah');
  ubah.type = 'button';
  ubah.addEventListener('click', () => bukaForm(kata));
  const hapus = node('button', 'btn kecil bahaya', 'Hapus');
  hapus.type = 'button';
  hapus.addEventListener('click', () => hapusKata(kata));
  aksi.append(ubah, hapus);
  head.append(aksi);
  kartu.append(head);

  const grid = node('div', 'tingkat-grid');
  const tampil = tingkatTerpilih ? [tingkatTerpilih] : TINGKAT;
  tampil.forEach((t) => grid.append(buatTingkat(t, kata.padanan.find((p) => p.tingkat === t))));
  kartu.append(grid);
  return kartu;
}

function tampilkanHasil(daftar, tingkatTerpilih) {
  const box = el('hasil');
  box.replaceChildren();
  el('jumlah').textContent = daftar.length ? `${daftar.length} kata ditemukan` : '';
  if (daftar.length === 0) {
    box.append(node('p', 'kosong', 'Tidak ada kata yang cocok.'));
    return;
  }
  daftar.forEach((k) => box.append(buatKartu(k, tingkatTerpilih)));
}

async function muatKata() {
  const id = ++permintaanTerakhir;
  const params = new URLSearchParams();
  const q = el('q').value.trim();
  const tingkat = el('tingkat').value;
  if (q) params.set('q', q);
  if (tingkat) params.set('tingkat', tingkat);

  try {
    const data = await api('/api/kata?' + params.toString());
    if (id !== permintaanTerakhir) return; // abaikan respons usang
    tampilkanHasil(data, tingkat);
  } catch (err) {
    if (id !== permintaanTerakhir) return;
    el('hasil').replaceChildren(node('p', 'kosong', 'Gagal memuat data: ' + err.message));
  }
}

// ---------- Form tambah/ubah ----------
function bangunFieldTingkat() {
  const wadah = el('tier-fields');
  TINGKAT.forEach((t) => {
    const fs = node('fieldset');
    fs.append(node('legend', null, LABEL[t]));

    [
      ['kata_daerah', 'Kata di bahasa daerah', 'input'],
      ['contoh_kalimat', 'Contoh kalimat', 'input'],
      ['catatan', 'Catatan penggunaan', 'input'],
    ].forEach(([nama, teks, tag]) => {
      const label = node('label', null, teks);
      const input = document.createElement(tag);
      input.name = `${t}_${nama}`;
      input.maxLength = nama === 'kata_daerah' ? 100 : 500;
      label.append(input);
      fs.append(label);
    });
    wadah.append(fs);
  });
}

function tampilkanErrorForm(err) {
  const p = el('form-error');
  const rincian = err.details && err.details.length ? '\n' + err.details.join('\n') : '';
  p.textContent = err.message + rincian;
  p.hidden = false;
}

async function bukaForm(kata) {
  const form = el('form-kata');
  form.reset();
  el('form-error').hidden = true;

  // Saat mengubah, ambil data lengkap (daftar hasil bisa saja sudah difilter per tingkat).
  let data = null;
  if (kata) {
    try {
      data = await api(`/api/kata/${kata.id}`);
    } catch (err) {
      toast(err.message, true);
      return;
    }
  }

  el('form-judul').textContent = data ? 'Ubah kata' : 'Tambah kata';
  form.elements['kata_id'].value = data ? data.id : '';
  form.elements['kata_indonesia'].value = data ? data.kata_indonesia : '';
  form.elements['kategori'].value = data && data.kategori ? data.kategori : '';
  TINGKAT.forEach((t) => {
    const p = data ? data.padanan.find((x) => x.tingkat === t) : null;
    form.elements[`${t}_kata_daerah`].value = p ? p.kata_daerah : '';
    form.elements[`${t}_contoh_kalimat`].value = p && p.contoh_kalimat ? p.contoh_kalimat : '';
    form.elements[`${t}_catatan`].value = p && p.catatan ? p.catatan : '';
  });
  el('dialog-kata').showModal();
}

async function simpanForm(e) {
  e.preventDefault();
  const f = e.target.elements;

  const padanan = [];
  TINGKAT.forEach((t) => {
    const kataDaerah = f[`${t}_kata_daerah`].value.trim();
    if (!kataDaerah) return; // tingkat kosong dilewati
    padanan.push({
      tingkat: t,
      kata_daerah: kataDaerah,
      contoh_kalimat: f[`${t}_contoh_kalimat`].value,
      catatan: f[`${t}_catatan`].value,
    });
  });

  const body = { kata_indonesia: f['kata_indonesia'].value, kategori: f['kategori'].value, padanan };
  const id = f['kata_id'].value;

  try {
    await api(id ? `/api/kata/${id}` : '/api/kata', { method: id ? 'PUT' : 'POST', body });
    el('dialog-kata').close();
    toast(id ? 'Kata berhasil diubah.' : 'Kata berhasil ditambahkan.');
    await muatKata();
  } catch (err) {
    tampilkanErrorForm(err);
  }
}

async function hapusKata(kata) {
  if (!confirm(`Hapus kata "${kata.kata_indonesia}" beserta semua padanannya?`)) return;
  try {
    await api(`/api/kata/${kata.id}`, { method: 'DELETE' });
    toast('Kata dihapus.');
    await muatKata();
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------- Inisialisasi ----------
function aturModeAdmin() {
  document.body.classList.toggle('admin', adminToken.length > 0);
}

let debounceTimer;
el('q').addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(muatKata, 250); // tunggu pengguna berhenti mengetik
});
el('tingkat').addEventListener('change', muatKata);
el('form-cari').addEventListener('submit', (e) => {
  e.preventDefault();
  muatKata();
});

el('token').value = adminToken;
el('token').addEventListener('input', (e) => {
  adminToken = e.target.value.trim();
  sessionStorage.setItem('adminToken', adminToken);
  aturModeAdmin();
});

el('btn-tambah').addEventListener('click', () => bukaForm(null));
el('btn-batal').addEventListener('click', () => el('dialog-kata').close());
el('form-kata').addEventListener('submit', simpanForm);

bangunFieldTingkat();
aturModeAdmin();
muatKata();
