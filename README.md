# Kamus Bahasa Daerah

Aplikasi web kamus kosakata bahasa daerah yang mengelompokkan padanan kata berdasarkan **tingkat kesopanan**: halus, sedang, dan akrab. Proyek ini dibuat untuk UTS COMP6991031 (kategori: **Web**).

## Masalah dan target pengguna

Kamus daring bahasa daerah masih sangat terbatas dan umumnya hanya menerjemahkan kata, sehingga penutur muda sering bingung memilih kata yang pantas untuk orang tua atau orang yang dihormati. Target pengguna: generasi muda yang kurang fasih berbahasa daerah, pembelajar bahasa daerah, dan pengelola konten budaya.

## Fitur inti (MVP)

**Pencarian padanan kata berdasarkan tingkat kesopanan.** Pengguna mengetik satu kata (Indonesia atau kata daerah), lalu aplikasi menampilkan padanannya di tiga tingkat beserta contoh kalimat dan catatan penggunaan. Hasil bisa difilter per tingkat.

Data kamus dikelola dengan CRUD penuh:

| Operasi | Endpoint | Perlu token admin |
|---|---|---|
| Create | `POST /api/kata` | Ya |
| Read (daftar + cari) | `GET /api/kata?q=&tingkat=` | Tidak |
| Read (satu kata) | `GET /api/kata/:id` | Tidak |
| Update | `PUT /api/kata/:id` | Ya |
| Delete | `DELETE /api/kata/:id` | Ya |
| Cek kesehatan | `GET /health` (juga tersedia di `/api/health`) | Tidak |

Token admin dikirim lewat header `x-admin-token`. Nilainya diatur di file `.env`.

## Teknologi

- Node.js 22 + Express (backend dan REST API)
- MySQL 8.4 (database; tabel `kata` berelasi satu-ke-banyak dengan `padanan`)
- HTML, CSS, dan JavaScript murni (frontend, tanpa framework)
- Docker dan Docker Compose (dua layanan: `app` dan `db`)

## Struktur folder

```
.
├── Dockerfile              # resep image aplikasi
├── docker-compose.yml      # layanan app + db + volume
├── .env.example            # contoh konfigurasi (salin menjadi .env)
├── db/init.sql             # skema tabel + data contoh
├── server.js               # titik masuk Express
├── src/
│   ├── db.js               # koneksi MySQL + helper transaksi
│   ├── auth.js             # middleware token admin
│   ├── validate.js         # validasi input
│   └── routes/kata.js      # endpoint CRUD
└── public/                 # halaman web (index.html, style.css, app.js)
```

## Cara menjalankan (localhost, Docker Compose)

Prasyarat: Docker dan Docker Compose terpasang.

```bash
# 1. Salin konfigurasi lalu ganti semua nilai "ganti_..." di .env
cp .env.example .env

# 2. Bangun image dan jalankan semua layanan di latar belakang
docker compose up -d --build

# 3. Buka di browser
# http://localhost:3000
```

Untuk menambah, mengubah, atau menghapus kata, isi kolom **Token admin** di halaman dengan nilai `ADMIN_TOKEN` dari file `.env`.

Uji endpoint dengan curl:

```bash
curl -i http://localhost:3000/health                       # 200 OK
curl -i "http://localhost:3000/api/kata?q=makan"           # 200 OK
curl -i -X POST http://localhost:3000/api/kata \
  -H "Content-Type: application/json" \
  -H "x-admin-token: ISI_ADMIN_TOKEN" \
  -d '{"kata_indonesia":"bertanya","padanan":[{"tingkat":"halus","kata_daerah":"naros"},{"tingkat":"sedang","kata_daerah":"nanya"}]}'   # 201 Created
```

Adminer (opsional, untuk melihat isi database) dipisahkan dalam profile `tools`:

```bash
docker compose --profile tools up -d    # lalu buka http://localhost:8080 (server: db)
```

Perintah berguna:

```bash
docker compose down        # hentikan layanan (data tetap tersimpan di volume)
docker compose down -v     # hentikan dan hapus data (database dibuat ulang dari db/init.sql)
docker compose logs -f app # lihat log aplikasi
```

## Keamanan dan data pribadi

- Aplikasi **tidak menyimpan data pribadi** apa pun. Isi database hanya kosakata, contoh kalimat, dan catatan penggunaan, sehingga selaras dengan prinsip minimisasi data dalam UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
- Semua rahasia (password database dan token admin) disimpan di `.env` yang di-ignore Git. Hanya `.env.example` berisi nilai dummy yang di-commit.
- Query ke database memakai parameter (prepared statement) untuk mencegah SQL injection, dan tampilan web memakai `textContent` untuk mencegah XSS.
- Port database tidak dibuka ke luar container; hanya aplikasi yang dapat mengaksesnya.

## Sumber data kosakata

Data awal di `db/init.sql` berisi 64 kata Indonesia dengan padanan bahasa Sunda dalam tiga tingkat: **halus** (lemes), **sedang** (loma), dan **akrab** (kasar/akrab antarteman). Kosakata disusun dari pengetahuan umum *undak-usuk basa Sunda* dan sebagian dicocokkan dengan [artikel detikJabar tentang kosakata bahasa Sunda lemes](https://www.detik.com/jabar/budaya/d-6374874/30-kosakata-bahasa-sunda-lemes-atau-halus-disertai-arti-dan-contohnya/amp). Contoh kalimat dan catatan penggunaan ditulis sendiri untuk proyek ini.

Kamus ini bersifat terus berkembang: kata baru dapat ditambahkan lewat fitur CRUD di aplikasi. Verifikasi oleh penutur asli atau kamus resmi: [ISI, mis. nama/sumber verifikasi].

## Sumber dan atribusi

- [Express](https://expressjs.com/) (lisensi MIT)
- [mysql2](https://github.com/sidorares/node-mysql2) (lisensi MIT)
- Image resmi [Node.js](https://hub.docker.com/_/node) dan [MySQL](https://hub.docker.com/_/mysql) dari Docker Hub
- Tidak memakai starter framework; struktur proyek dibuat manual.

## AI Usage Declaration

Tipe penggunaan AI pada UTS ini: **Partial** (maksimal 50%).

- **Alat yang dipakai:** Claude (Anthropic).
- **Bagian yang dibantu AI:** [ISI DENGAN JUJUR. Misalnya: ide dan pemilihan topik; kerangka awal kode backend, frontend, Dockerfile, docker-compose.yml, dan skema SQL; draf README; draf jawaban Soal 2.]
- **Bagian yang saya kerjakan sendiri:** [ISI DENGAN JUJUR. Misalnya: pengujian dan perbaikan bug, penyesuaian kode, pengisian dan verifikasi data bahasa daerah, pengaturan konfigurasi, penulisan artikel dan skrip video, serta riwayat commit.]
- **Perkiraan porsi bantuan AI:** [ISI, mis. xx%]
- **Contoh prompt utama:**
  1. "Berikan ide topik proyek yang tidak mainstream tetapi tetap menerapkan CRUD."
  2. "Apa fitur inti untuk ide Kamus Bahasa Daerah?"
  3. "Bantu menyusun jawaban profil dan alasan pemilihan projek."
  4. "Bantu kerjakan proyeknya (kerangka kode, Docker Compose, dan README)."

## Lisensi

MIT
