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

![Tampilan aplikasi](screenshots/homepage.png)

### Docker Compose

![Docker Compose PS](screenshots/docker-compose-ps.png)

### Pengujian API

**GET Request — HTTP 200 OK**

![GET API](screenshots/api-get.png)

**POST Request — HTTP 201 Created**

![POST API](screenshots/api-post.png)

### Pengujian Persistensi Database

![Pengujian persistensi](screenshots/persistence.png)

*Catatan: Tambahkan file screenshot sesuai nama dan lokasi yang digunakan pada folder `screenshots`.*

## 9. Artikel dan Video Demo

- **GitHub Repository:** [Link Repository](https://github.com/USERNAME/kamus-bahasa-daerah)
- **Artikel Project:** [Link Artikel]
- **Video Demo YouTube:** [Link Video]

## 10. AI Usage Declaration

Dalam proses pengerjaan project ini, AI digunakan sebagai alat bantu dengan kategori penggunaan **Partial**.

**AI Tool:** ChatGPT (OpenAI)

**Bagian yang dibantu oleh AI:**
- Brainstorming dan penyusunan penjelasan konsep Docker dan Docker Compose.
- Membantu memahami serta melakukan troubleshooting konfigurasi Dockerfile dan Docker Compose.
- Membantu menyusun perintah pengujian API menggunakan curl.
- Membantu menyusun kerangka dokumentasi README dan penjelasan project.

**Contoh prompt yang digunakan:**
- "Jelaskan bagaimana multi-stage build membuat ukuran Docker image tetap kecil."
- "Bantu saya menguji endpoint GET dan POST menggunakan curl pada project Node.js dan Express."
- "Jelaskan cara menguji persistensi database menggunakan docker compose down dan docker compose up."

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