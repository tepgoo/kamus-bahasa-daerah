# Kamus Bahasa Daerah

Aplikasi web Kamus Bahasa Daerah merupakan aplikasi yang membantu pengguna mencari padanan kata bahasa Indonesia ke dalam bahasa daerah berdasarkan tiga tingkat kesopanan, yaitu **halus, sedang, dan akrab**.

Project ini dibuat sebagai implementasi aplikasi multi-tier menggunakan Docker dan Docker Compose. Aplikasi memiliki fitur pencarian kata, penampilan padanan bahasa daerah, serta pengelolaan data kamus melalui API.

## 1. Latar Belakang dan Tujuan Project

Bahasa daerah memiliki variasi penggunaan kata yang dapat berbeda berdasarkan tingkat kesopanan dan situasi komunikasi. Hal ini terkadang membuat pengguna kesulitan menentukan padanan kata yang sesuai.

Oleh karena itu, dibuat aplikasi Kamus Bahasa Daerah yang dapat membantu pengguna menemukan padanan kata berdasarkan tingkat kesopanan secara lebih mudah.

Project ini juga bertujuan untuk menerapkan konsep containerization menggunakan Docker, sehingga aplikasi dan database dapat dijalankan secara terpisah, lebih terstruktur, dan mudah dipindahkan ke lingkungan lain.

## 2. Fitur Aplikasi

- Menampilkan daftar kata bahasa Indonesia dan padanannya.
- Mencari kata berdasarkan kata Indonesia atau kata daerah.
- Memfilter padanan berdasarkan tingkat kesopanan.
- Menampilkan detail kata beserta contoh kalimat dan catatan.
- Menambahkan, mengubah, dan menghapus data melalui API dengan autentikasi admin.
- Menyediakan endpoint health check untuk memeriksa kondisi aplikasi dan database.

## 3. Teknologi yang Digunakan

| Komponen | Teknologi |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js 22 dan Express.js |
| Database | MySQL 8.4 |
| Database Driver | mysql2 |
| Containerization | Docker |
| Container Orchestration | Docker Compose |

## 4. Arsitektur Aplikasi

Aplikasi menggunakan arsitektur multi-tier yang terdiri dari frontend, backend, dan database.

- **Frontend:** Menampilkan halaman aplikasi melalui HTML, CSS, dan JavaScript.
- **Backend:** Menggunakan Node.js dan Express.js untuk menangani request serta menyediakan REST API.
- **Database:** Menggunakan MySQL 8.4 untuk menyimpan data kata dan padanan bahasa daerah.

Frontend dan backend berjalan dalam satu container aplikasi, sedangkan database berjalan dalam container terpisah.

Docker Compose menghubungkan kedua container melalui user-defined network `kamus_net`. Data MySQL disimpan menggunakan named volume `db_data` agar tetap tersedia meskipun container dihentikan atau dibuat ulang.

## 5. Cara Menjalankan Project

### Prasyarat

Pastikan perangkat sudah memiliki:
- Git
- Docker Desktop
- Docker Compose

### Langkah 1: Clone Repository

```bash
git clone https://github.com/USERNAME/kamus-bahasa-daerah.git
```

Masuk ke folder project:

```bash
cd kamus-bahasa-daerah
```

### Langkah 2: Membuat File Environment

Salin file contoh konfigurasi:

```bash
cp .env.example .env
```

Sesuaikan nilai konfigurasi di file `.env`, termasuk token admin dan kredensial database. Gunakan nilai lokal yang aman dan jangan membagikan file `.env`.

### Langkah 3: Menjalankan Aplikasi

Jalankan perintah:

```bash
docker compose up -d --build
```

Perintah tersebut akan membangun image aplikasi dan menjalankan container aplikasi beserta database.

### Langkah 4: Memeriksa Container

```bash
docker compose ps
```

Pastikan container aplikasi berjalan dan database menunjukkan status `healthy`.

### Langkah 5: Membuka Aplikasi

Buka browser dan akses:

```text
http://localhost:3000
```

Untuk memeriksa kesehatan aplikasi:

```text
http://localhost:3000/health
```

Respons yang diharapkan:

```json
{
  "status": "ok"
}
```

### Menjalankan Adminer (Opsional)

Adminer tersedia melalui Docker Compose profile `tools`.

```bash
docker compose --profile tools up -d
```

Adminer dapat diakses melalui:

```text
http://localhost:8080
```

## 6. API Endpoint

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/health` | Memeriksa kesehatan aplikasi dan database |
| GET | `/api/health` | Memeriksa kesehatan aplikasi dan database |
| GET | `/api/kata` | Mengambil daftar kata |
| GET | `/api/kata?q=makan` | Mencari kata |
| GET | `/api/kata/:id` | Mengambil detail kata |
| POST | `/api/kata` | Menambahkan data kata |
| PUT | `/api/kata/:id` | Mengubah data kata |
| DELETE | `/api/kata/:id` | Menghapus data kata |

Operasi POST, PUT, dan DELETE membutuhkan autentikasi menggunakan header `x-admin-token`.

Contoh pengujian endpoint GET:

```bash
curl -i http://localhost:3000/api/kata
```

Contoh pengujian endpoint POST:

```bash
curl -i -X POST http://localhost:3000/api/kata \
-H "Content-Type: application/json" \
-H "x-admin-token: TOKEN_ADMIN_KAMU" \
-d '{
  "kata_indonesia": "contoh kata",
  "kategori": "pengujian",
  "padanan": [
    {
      "tingkat": "akrab",
      "kata_daerah": "contoh padanan",
      "contoh_kalimat": "Contoh kalimat penggunaan.",
      "catatan": "Data pengujian."
    }
  ]
}'
```

## 7. Pengujian Docker dan Persistensi

Pengujian dilakukan untuk memastikan aplikasi dan database dapat berjalan serta data tetap tersimpan setelah container dibuat ulang.

Pemeriksaan container:

```bash
docker compose ps
```

Menghentikan container:

```bash
docker compose down
```

Menjalankan kembali container:

```bash
docker compose up -d
```

Data database disimpan menggunakan named volume `db_data`. Oleh karena itu, data tetap tersedia setelah menjalankan `docker compose down` dan `docker compose up -d`.

Berbeda dengan perintah berikut:

```bash
docker compose down -v
```

Perintah tersebut juga menghapus named volume sehingga data database yang tersimpan di dalamnya ikut terhapus.

## 8. Screenshot Aplikasi dan Pengujian

### Tampilan Aplikasi
<img width="1512" height="982" alt="Tangkapan Layar 2026-11-09 pukul 23 05 37" src="https://github.com/user-attachments/assets/f0617287-4f9e-401b-a2b5-9775d04455f4" />

### Docker Compose
<img width="386" height="94" alt="image" src="https://github.com/user-attachments/assets/ff6b2d61-73fc-4707-a37a-3edb66e6a3ef" />


### Pengujian API

**GET Request — HTTP 200 OK**

<img width="386" height="190" alt="image" src="https://github.com/user-attachments/assets/395cf9cf-093f-4cb8-80a8-d7b0a6eb94bb" />

**POST Request — HTTP 201 Created**

<img width="441" height="257" alt="image" src="https://github.com/user-attachments/assets/4f1d0b51-7951-483e-a522-a24bb218d9b4" />

### Pengujian Persistensi Database

<img width="323" height="188" alt="image" src="https://github.com/user-attachments/assets/acfe2757-a8cd-4388-8088-8fca938cdb55" />
<img width="336" height="183" alt="image" src="https://github.com/user-attachments/assets/b242699a-3693-45cd-a589-f4aad171c4bf" />


## 9. Artikel dan Video Demo

- **GitHub Repository:** [Link Repository](https://github.com/tepgoo/kamus-bahasa-daerah)
- **Artikel Project:** https://medium.com/@stefanygo666/building-a-regional-language-dictionary-web-application-with-docker-compose-fbe9da0213e9
- **Video Demo YouTube:** https://youtu.be/qP_L7s_vLCQ

## 10. AI Usage Declaration

Dalam proses pengerjaan project ini, AI digunakan sebagai alat bantu dengan kategori penggunaan **Partial**.

**AI Tool:** Claude (Anthropic).

**Bagian yang dibantu oleh AI:**
- Brainstorming ide topik proyek
- Kerangka awal kode: backend Express (endpoint CRUD, validasi input, token admin), frontend web, skema database SQL, Dockerfile multi-stage, dan docker-compose.yml beserta komentarnya.
- Penyusunan data awal kosakata bahasa Sunda (disusun AI, sebagian dicocokkan dengan rujukan di bagian "Sumber data").
- Membantu menyusun perintah pengujian API menggunakan curl.

**Contoh prompt yang digunakan:**
- "Berikan ide topik proyek yang tidak mainstream tetapi tetap menerapkan CRUD."
- "Bantu saya mengerjakan kerangka kode, Docker Compose, dan README."
- "Bantu saya menyesuaikan Dockerfile dan docker-compose.yml dengan soal (multi-stage build, network, profile, endpoint /health)."
- "Bantu saya menguji endpoint GET dan POST menggunakan curl pada project Node.js dan Express."

AI digunakan sebagai pendamping dalam proses pembelajaran dan dokumentasi. Implementasi, penyesuaian konfigurasi, pengujian aplikasi, serta verifikasi hasil dilakukan oleh pengembang. Penggunaan AI tidak dimaksudkan untuk menggantikan pemahaman terhadap kode dan konfigurasi yang digunakan.

## 11. Keamanan dan Pengelolaan Environment

Project ini menggunakan file `.env` untuk menyimpan konfigurasi lokal seperti kredensial database dan token admin.

Untuk menjaga keamanan:
- File `.env` tidak disertakan dalam repository.
- File `.env.example` disediakan sebagai template konfigurasi.
- File `.env` dimasukkan ke `.gitignore`.
- Jangan mengunggah password, token, atau informasi rahasia ke GitHub.

## 12. License

Project ini menggunakan lisensi MIT.
