# 🌸 Kenang Kurinji

Web-Based Disposable Camera — dibangun berdasarkan Kenang Kurinji Blueprint v2.0.

Progress saat ini: **fitur inti lengkap** — landing page marketing, kamera guest,
dashboard host, gallery & albums, analytics, guest management, hingga subscription
& payment gateway sudah berjalan.

## Yang sudah dibangun

- ✅ **Landing page marketing**: Navbar, Hero, How It Works, Film Showcase, Pricing, CTA, Footer
  (`src/app/page.tsx`), plus halaman publik Features, About, FAQ, Contact
- ✅ Struktur Next.js App Router + TypeScript + Tailwind (Volume 9 & 10)
- ✅ Prisma schema lengkap sesuai Volume 6 (User, Event, Guest, Photo, Album, QRCode, Subscription, PaymentOrder, Analytics)
- ✅ Auth.js (Credentials + Google opsional) — Volume 2 & 10
- ✅ **Kenang Camera** (`/e/[eventCode]`) — fitur inti sesuai Volume 5:
  - Alur guest: Cover acara → **Isi Nama** (memicu `POST /join`, wajib) → Izin kamera →
    fullscreen viewfinder, one-tap capture
  - 6 Film preset dengan karakter visual berbeda (Sunny Roll, Daylight Classic,
    Golden Portrait, Vivid Bloom, Silver Grain, Neon Night)
  - Flash toggle, flip kamera, shot counter, film selector
  - State machine lengkap: permission → loading → ready → capturing →
    uploading → success/failed/offline → roll-finished
  - Signature experience: animasi bunga Neelakurinji saat film habis
  - Upload API dengan validasi tipe file, ukuran, dan shot limit per device
- ✅ **Auth pages**: `/login`, `/register` dengan React Hook Form + Zod
- ✅ **Dashboard Host**: overview statistik, `/dashboard/events` (daftar),
  `/dashboard/events/new` (create event), `/dashboard/events/[id]` (detail + QR)
- ✅ **QR Code**: generate otomatis saat event dibuat, download PNG, share link,
  regenerasi QR (`/api/v1/events/[id]/qr`)
- ✅ Event API lengkap: list, create, detail, update, soft-delete (`/api/v1/events`)
- ✅ **Gallery** (`/dashboard/events/[id]/gallery`): masonry grid, filter favorit & album,
  fullscreen viewer dengan navigasi keyboard, toggle favorite, hapus foto, search nickname/film
  (`/api/v1/events/[id]/gallery`, `/api/v1/photos/[photoId]`)
- ✅ **Albums**: create/rename/delete album, assign/unassign foto ke album
  (`/api/v1/events/[id]/albums`, `/api/v1/albums/[albumId]`)
- ✅ **Guest management**: daftar guest, ban/unban, jumlah foto per guest
  (`/dashboard/events/[id]/guests`, `/api/v1/events/[id]/guests`, `/api/v1/guests/[guestId]`)
- ✅ **Analytics dashboard**: timeline upload, breakdown film favorit, storage usage
  (`/dashboard/events/[id]/analytics`, `/api/v1/events/[id]/analytics`)
- ✅ **Export ZIP gallery** (`/api/v1/events/[id]/export`) pakai `yazl`
- ✅ **Subscription & payment**: halaman `/dashboard/subscription`, integrasi Midtrans Snap
  penuh (checkout, webhook, cek status order) — `/api/v1/payments/checkout|webhook|status`
- ✅ **Cloudflare R2**: upload foto & thumbnail langsung ke R2 (`src/lib/r2.ts`), bukan lagi disk lokal
- ✅ Watermark otomatis untuk foto plan Free + generate thumbnail
- ✅ **Forgot/Reset password**: request link lewat email (Resend), token sekali-pakai
  berlaku 1 jam (`/forgot-password`, `/reset-password`, `/api/v1/auth/forgot-password|reset-password`)
- ✅ Design tokens (warna, tipografi, radius, shadow, motion) sesuai Volume 4
- ✅ **Kuota plan anti race-condition**: `maxGuests`, `maxPhotos` (per event), dan
  `shotLimit` (per tamu) ditegakkan lewat counter atomic (`Event.guestCount`,
  `Event.photoCount`, `Guest.shotCount`) yang direservasi dalam satu database
  transaction bareng insert-nya — bukan `count()` lalu `create()` terpisah —
  supaya banyak tamu yang join/upload bersamaan tidak bisa kebobolan melewati
  kuota paket. Lihat `src/app/api/v1/e/[eventCode]/join/route.ts` dan
  `src/app/api/v1/uploads/route.ts`.
- ✅ **Pricing card responsive**: di mobile & tablet jadi horizontal scroll
  dengan snap (`src/components/landing/pricing.tsx`), balik ke grid 4 kolom
  di desktop (`lg:` ke atas).

## Setup email (untuk fitur reset password)

1. Daftar gratis di [resend.com](https://resend.com)
2. Ambil API key di dashboard → **API Keys**, isi ke `.env` sebagai `RESEND_API_KEY`
3. Tanpa domain sendiri, biarkan `EMAIL_FROM="Kenang Kurinji <onboarding@resend.dev>"`
   — tapi email cuma bisa terkirim ke alamat yang dipakai daftar akun Resend kamu (mode testing)
4. Untuk kirim ke email siapa saja, verifikasi domain sendiri di Resend lalu ganti `EMAIL_FROM`
5. Kalau `RESEND_API_KEY` dikosongkan, sistem tetap jalan tapi email cuma ditulis ke
   console log (mode development) — link reset-nya tetap bisa dicopy dari situ

## Menjalankan project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Siapkan database PostgreSQL, lalu salin env:
   ```bash
   cp .env.example .env
   # isi DATABASE_URL, AUTH_SECRET (generate: npx auth secret)
   ```

3. Migrate & seed database (seed membuat 1 event demo agar kamera bisa langsung dicoba):
   ```bash
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```

4. Jalankan dev server:
   ```bash
   npm run dev
   ```

5. Buka kamera demo (dari HP atau browser dengan akses kamera):
   ```
   http://localhost:3000/e/pernikahan-demo
   ```

## Catatan penting sebelum production

- **Storage**: sudah pakai Cloudflare R2 (`src/lib/r2.ts`), bukan disk lokal lagi —
  aman untuk deploy ke Vercel/platform apapun. Pastikan env `R2_*` di `.env` terisi benar.
- **Thumbnail**: sudah di-generate otomatis pakai `sharp` saat upload.
- **Guest identity**: memakai `deviceId` (UUID di localStorage) sesuai prinsip
  "Guest tidak wajib login". Sejak layar Isi Nama ditambahkan, `POST /join`
  **selalu** dipanggil sebelum guest masuk kamera, jadi baris `Guest` sekarang
  konsisten selalu ada — beda dari sebelumnya yang cuma dibuat kalau endpoint
  `/join` dipanggil manual (sempat tidak terpakai sama sekali oleh frontend).
  Pertimbangkan tetap menambahkan compound unique index `(eventId, deviceId)`
  di `schema.prisma` untuk guest lookup yang lebih rapi.
- **Kamera di iOS Safari**: butuh HTTPS (kecuali localhost) agar
  `getUserMedia` berfungsi — pastikan preview/production pakai HTTPS.

## Struktur folder

```
src/
├── app/
│   ├── (auth)/login, register/        # Halaman login & register
│   ├── dashboard/                     # Dashboard host (overview, events, QR)
│   ├── e/[eventCode]/page.tsx         # Guest camera entry point
│   ├── api/v1/uploads/route.ts        # Upload foto
│   ├── api/v1/events/                 # CRUD event + QR
│   ├── api/v1/e/[eventCode]/join/     # Guest join event
│   └── api/auth/[...nextauth]/        # Auth.js
├── components/
│   ├── camera/                        # Semua komponen Kenang Camera
│   │   └── guest-name-screen.tsx      # Layar isi nama tamu (memicu POST /join)
│   ├── dashboard/                     # Sidebar, EventCard, QrCard, form
│   ├── auth/                          # Form login & register
│   └── ui/                            # Button, Input, Card
├── hooks/use-camera.ts                # State machine + logika kamera
├── lib/films.ts                       # Definisi 6 film preset
├── lib/auth.ts                        # Konfigurasi Auth.js
├── lib/slug.ts                        # Generator slug unik untuk event
├── lib/prisma.ts                      # Prisma client singleton
└── types/                             # Shared TypeScript types
prisma/
├── schema.prisma                      # Skema database lengkap
└── seed.ts                            # Data demo
```
