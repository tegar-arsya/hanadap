# Hanadap

Aplikasi manajemen stok & permintaan barang (admin + unit kerja) berbasis Next.js (App Router), Prisma, dan PostgreSQL (Supabase).

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Chakra UI
- Tailwind CSS
- NextAuth (Credentials)
- Prisma ORM
- PostgreSQL (direkomendasikan: Supabase)

## Prasyarat

- Node.js 18.17+ (atau 20+)
- npm
- Database PostgreSQL (Supabase)

## Quick Start (Clone → Run)

1) Clone & install

```bash
git clone <repo-url>
cd hanadap
npm install
```

2) Setup environment

```bash
cp .env.example .env
```

Lalu isi nilai di `.env` (lihat bagian “Konfigurasi Supabase + Env”).

3) Migrasi database + seed

```bash
npx prisma migrate dev
npm run seed
```

4) Jalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Konfigurasi Supabase + Env

Project ini memakai `DATABASE_URL` dan `DIRECT_URL`.

- `DATABASE_URL`: koneksi yang dipakai aplikasi saat runtime.
- `DIRECT_URL`: koneksi direct yang dipakai Prisma untuk operasi yang butuh koneksi “direct” (umumnya migrasi).

Di Supabase, ambil connection string di **Project Settings → Database → Connection string**.

Rekomendasi pengisian:

- `DATABASE_URL` → gunakan URL “pooled/pgbouncer” (jika tersedia) dan tambahkan `?pgbouncer=true`.
- `DIRECT_URL` → gunakan URL “direct connection” (tanpa pgbouncer).

Contoh `.env` (lihat juga `.env.example`):

```dotenv
# Database
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ganti-dengan-random-secret"

# SMTP (opsional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASS="..."
SMTP_FROM="Hanadap <noreply@hanadap.com>"
```

Catatan:

- Kalau fitur email tidak dipakai, variabel SMTP boleh dikosongkan.
- `NEXTAUTH_SECRET` sebaiknya random kuat. Contoh generate:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Prisma: Migrasi, Fresh Reset, Tambah Kolom

Schema Prisma ada di `prisma/schema.prisma`.

### Migrasi pertama kali (dev)

Saat baru setup:

```bash
npx prisma migrate dev
```

Perintah ini akan:

- Membuat/menerapkan migrasi ke database
- Generate Prisma Client

### Migrasi fresh (reset total) — untuk development

Kalau ingin “fresh” (hapus semua data & re-apply semua migrasi):

```bash
npx prisma migrate reset
```

Opsi yang sering dipakai:

```bash
# Reset tanpa prompt interaktif
npx prisma migrate reset --force

# Reset + skip seed
npx prisma migrate reset --force --skip-seed
```

⚠️ `migrate reset` akan DROP data. Jangan dipakai untuk production.

### Menambahkan kolom / mengubah tabel

Flow yang benar (dev):

1) Ubah model di `prisma/schema.prisma`
2) Buat migrasi baru:

```bash
npx prisma migrate dev --name add_<nama_perubahan>
```

3) (Opsional) Regenerate client jika diperlukan:

```bash
npx prisma generate
```

### Deploy migrasi di production

Di environment production/CI, gunakan:

```bash
npx prisma migrate deploy
```

## Seeder

Seeder ada di `prisma/seed.ts` dan sudah diset di `package.json`.

Jalankan:

```bash
npm run seed
# atau
npx prisma db seed
```

Seeder akan membuat contoh:

- Kategori: ATK, Elektronik, Cleaning Supply
- Unit kerja: IT, HRD, FIN
- User contoh
- Barang + StockBatch demo FIFO

Credential hasil seed:

- Admin: `admin@hanadap.com` / `admin123`
- Unit IT: `it@hanadap.com` / `user123`
- Unit HRD: `hrd@hanadap.com` / `user123`

## Script yang tersedia

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run seed
```

## Troubleshooting singkat

- Migrasi error terkait PgBouncer/transaction mode: pastikan `DIRECT_URL` pakai koneksi direct (tanpa pgbouncer).
- Prisma tidak connect: cek `DATABASE_URL`/`DIRECT_URL` dan pastikan Supabase project tidak “paused”.
