# Dockerfile multi-stage: tahap "builder" memasang dependency, tahap "runtime" hanya membawa
# hasil yang dibutuhkan untuk menjalankan aplikasi.

# ============ TAHAP 1: BUILDER ============
# 1) Image dasar dengan tag versi (Node.js 22), BUKAN "latest", agar build selalu konsisten.
#    Untuk mengunci versi lebih spesifik: jalankan `docker run --rm node:22-alpine node -v`,
#    lalu pakai tag lengkapnya (mis. node:22.x.y-alpine).
FROM node:22-alpine AS builder

# 2) Folder kerja di dalam container.
WORKDIR /app

# 3) Salin file daftar dependency SEBELUM source code. Selama package.json tidak berubah,
#    Docker memakai ulang layer cache sehingga build berikutnya jauh lebih cepat.
COPY package*.json ./

# 4) Pasang dependency produksi saja, lalu bersihkan cache npm.
RUN npm install --omit=dev && npm cache clean --force

# ============ TAHAP 2: RUNTIME ============
# 5) Mulai dari image bersih lagi. Semua sisa tahap builder (cache, file sementara) tidak ikut,
#    sehingga image akhir tetap kecil.
FROM node:22-alpine AS runtime

# 6) Mode production dan folder kerja.
ENV NODE_ENV=production
WORKDIR /app

# 7) Ambil HANYA folder node_modules hasil tahap builder.
COPY --from=builder /app/node_modules ./node_modules

# 8) Salin file aplikasi secara eksplisit. Kita memakai COPY, bukan ADD:
#    ADD punya perilaku tambahan (mengunduh URL dan mengekstrak arsip tar otomatis) yang bisa
#    mengejutkan dan kurang aman. COPY hanya menyalin file apa adanya, jadi lebih jelas dan dapat diprediksi.
COPY package*.json ./
COPY server.js ./
COPY src ./src
COPY public ./public

# 9) Dokumentasi port yang didengarkan aplikasi (port ke luar diatur di docker-compose.yml).
EXPOSE 3000

# 10) Jalankan sebagai user 'node' (bukan root) demi keamanan.
USER node

# 11) Perintah start dalam exec form (array JSON): proses Node menjadi PID 1 dan menerima sinyal
#     berhenti (SIGTERM) langsung, tidak lewat shell.
CMD ["node", "server.js"]
