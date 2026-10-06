# Lost & Founds (ReactJS) — PABWE 2026 P4

Aplikasi Lost & Founds: React 19 + Vite 6 + Redux Toolkit + React Router + Tailwind 4 + SweetAlert2.

## Menjalankan
```bash
cp .env.example .env     # atur VITE_DELCOM_BASEURL & APP_PORT
npm install              # atau: bun install
npm run dev              # http://localhost:3000
npm test                 # vitest run
npm run test:coverage    # ambang 100%
npm run build
```

## Fitur
- Auth: register, login, logout (token di localStorage), guard rute
- Users: daftar pengguna, profil (nama/email), foto profil, ubah kata sandi
- Lost & Founds: daftar + live search + filter (status, selesai, laporan saya),
  metrik ringkas, tambah, detail, ubah data, ubah cover, hapus (konfirmasi),
  statistik harian/bulanan (sidebar → Statistik)

## Catatan
- Bentuk respons endpoint statistik tidak terdokumentasi di soal; ditampilkan
  lewat `normalizeStats` (HomePage.jsx) yang menerima array / objek berisi array.

## Catatan optimasi Lighthouse
- **Shell login pra-render**: `prerender/` merender halaman login (komponen React asli) ke
  `index.html` saat `npm run build`, sehingga LCP terjadi pada cat HTML pertama, bukan
  menunggu JavaScript. Skrip kecil di `<head>` mengarahkan pengunjung tanpa token dari `/`
  ke `/auth/login` (tanpa reload) sebelum first paint.
- **Font self-host**: Plus Jakarta Sans dari `@fontsource-variable/plus-jakarta-sans`
  (subset latin) + `preload`. Tidak ada request ke Google Fonts.
- **Badge "Powered by Netlify"**: skrip `/.netlify/scripts/hud` disuntikkan Netlify di edge,
  bukan dari kode ini. Matikan lewat Netlify → *Project configuration → General →
  Powered by Netlify badge*. Skrip itu satu-satunya sumber audit "Use efficient cache lifetimes".
