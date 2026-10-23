# Implementation Plan: To-Do Life Dashboard

## Overview

Implementasi dilakukan secara bertahap dalam satu file HTML, satu file CSS, dan satu file JavaScript menggunakan Module Pattern. Setiap tahap membangun di atas tahap sebelumnya, dimulai dari fondasi struktur dan utilitas, kemudian widget satu per satu, diakhiri dengan pengujian dan integrasi penuh.

## Tasks

- [x] 1. Buat struktur proyek dan file fondasi
  - Buat `index.html` dengan struktur HTML semantik: `<header>`, `<main class="dashboard-grid">`, dan empat `<section>` untuk setiap widget (`#greeting-widget`, `#focus-timer`, `#todo-manager`, `#quicklinks-manager`)
  - Buat `css/style.css` dengan CSS custom properties untuk tema terang/gelap (`data-theme` pada `<body>`), layout grid responsif mobile-first, dan transition warna ≤ 300ms
  - Buat `js/script.js` dengan kerangka IIFE Module Pattern dan `DOMContentLoaded` listener sebagai entry point
  - _Requirements: 8.4_

- [x] 2. Implementasi StorageUtil dan ThemeSwitcher
  - [x] 2.1 Implementasi `StorageUtil`
    - Tulis modul `StorageUtil` dengan metode `get(key)`, `set(key, value)`, `remove(key)`, dan `isAvailable()` menggunakan try/catch untuk menangani kasus Local Storage tidak tersedia
    - Pastikan `get` melakukan `JSON.parse` dan `set` melakukan `JSON.stringify`
    - _Requirements: 2.6, 7.6_

  - [x] 2.2 Implementasi `ThemeSwitcher`
    - Tulis modul `ThemeSwitcher` dengan metode `init()`, `toggle()`, dan `applyTheme(theme)`
    - `init()` membaca `dashboard_theme` dari `StorageUtil`; jika tidak ada, terapkan `'light'` sebagai default
    - `toggle()` membalik tema aktif dan menyimpannya ke storage
    - `applyTheme()` mengubah atribut `data-theme` pada `<body>` dan memperbarui label/ikon tombol
    - Panggil `ThemeSwitcher.init()` pertama kali di `AppInit.init()` untuk mencegah FOUC
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 2.3 Tulis unit tests untuk `ThemeSwitcher` dan `StorageUtil`
    - Test `StorageUtil.get` dan `set` round-trip dengan mock localStorage
    - Test `ThemeSwitcher` menerapkan tema default `'light'` jika storage kosong
    - Test toggle mengubah tema dan menyimpan ke storage
    - _Requirements: 7.3, 7.4, 7.5_

- [x] 3. Implementasi GreetingWidget
  - [x] 3.1 Implementasi pure function `getTimeGreeting(hour)`
    - Tulis fungsi yang memetakan jam (0–23) ke salah satu dari empat string sapaan: "Selamat Pagi" (0–11), "Selamat Siang" (12–14), "Selamat Sore" (15–17), "Selamat Malam" (18–23)
    - Ekspor fungsi agar dapat diuji secara terpisah
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

  - [x] 3.2 Tulis property test untuk `getTimeGreeting` (Property 6)
    - **Property 6: Fungsi sapaan mencakup seluruh jam dalam sehari**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
    - Gunakan `fc.integer({ min: 0, max: 23 })` sebagai generator input
    - Verifikasi hasil selalu merupakan salah satu dari empat string sapaan yang valid
    - Tag komentar: `// Feature: todo-life-dashboard, Property 6: Fungsi sapaan mencakup seluruh jam dalam sehari`
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

  - [x] 3.3 Implementasi `GreetingWidget` lengkap
    - Tulis modul `GreetingWidget` dengan `init()`, `updateClock()`, `saveName(name)`, dan `getTimeGreeting(hour)`
    - `init()` memuat `dashboard_greeting_name` dari `StorageUtil`, mulai `setInterval` 1000ms memanggil `updateClock()`
    - `updateClock()` memperbarui tampilan jam HH:MM:SS, tanggal lengkap (format: "Senin, 19 Oktober 2023"), dan teks sapaan
    - `saveName()` memvalidasi panjang (1–50 karakter), simpan ke storage, perbarui tampilan sapaan
    - Format sapaan: "[Sapaan Waktu], [Nama]!" jika ada nama; "[Sapaan Waktu]!" jika tidak ada nama
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 3.4 Tulis unit tests untuk `GreetingWidget`
    - Test format jam HH:MM:SS
    - Test format tanggal lengkap dalam Bahasa Indonesia
    - Test `saveName` dengan input kosong dan valid
    - Test sapaan personal tampil setelah reload (mock storage)
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_

- [x] 4. Checkpoint — pastikan struktur, tema, dan greeting berjalan
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implementasi FocusTimer
  - [x] 5.1 Implementasi pure function `formatTime(seconds)`
    - Tulis fungsi yang mengonversi jumlah detik (0–1500) ke string format "MM:SS" dengan zero-padding dua digit
    - Ekspor fungsi agar dapat diuji secara terpisah
    - _Requirements: 3.1_

  - [x] 5.2 Tulis property test untuk `formatTime` (Property 5)
    - **Property 5: Format waktu Focus Timer selalu MM:SS**
    - **Validates: Requirements 3.1**
    - Gunakan `fc.integer({ min: 0, max: 1500 })` sebagai generator input
    - Verifikasi hasil selalu cocok dengan pola `/^\d{2}:\d{2}$/`
    - Tag komentar: `// Feature: todo-life-dashboard, Property 5: Format waktu Focus Timer selalu MM:SS`
    - _Requirements: 3.1_

  - [x] 5.3 Implementasi `FocusTimer` lengkap
    - Tulis modul `FocusTimer` dengan `init()`, `start()`, `stop()`, `reset()`, `tick()`, dan `formatTime(seconds)`
    - `start()` memulai `setInterval` 1000ms, menonaktifkan tombol Start, mengaktifkan tombol Stop
    - `stop()` memanggil `clearInterval`, mengaktifkan kembali tombol Start, menonaktifkan tombol Stop
    - `reset()` memanggil `stop()` lalu mengembalikan `timeLeft` ke 1500 dan memperbarui tampilan
    - `tick()` mengurangi `timeLeft` satu detik; ketika mencapai 0, panggil `stop()` dan tampilkan notifikasi visual di `#timer-notification` selama minimal 3 detik kemudian sembunyikan secara otomatis
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 5.4 Tulis unit tests untuk `FocusTimer`
    - Test `formatTime` dengan nilai batas (0, 1500)
    - Test state `isRunning` berubah setelah `start()` dan `stop()`
    - Test `reset()` mengembalikan `timeLeft` ke 1500
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

- [x] 6. Implementasi TodoManager
  - [x] 6.1 Implementasi pure functions `normalize(text)` dan `isDuplicate(text, excludeId?)`
    - `normalize(text)` melakukan `text.trim().toLowerCase()`
    - `isDuplicate(text, excludeId?)` membandingkan teks yang dinormalisasi dengan seluruh item dalam array `todos`; jika `excludeId` diberikan, item dengan ID tersebut dilewati
    - Ekspor fungsi agar dapat diuji secara terpisah
    - _Requirements: 5.1, 5.3_

  - [x] 6.2 Tulis property test untuk pencegahan duplikat saat `addTodo` (Property 1)
    - **Property 1: Normalisasi tugas mencegah duplikat**
    - **Validates: Requirements 5.1, 5.2**
    - Gunakan `fc.string()` yang dimodifikasi untuk menghasilkan pasangan string yang setelah `normalize()` identik
    - Verifikasi bahwa `addTodo` menolak entri kedua dan panjang `todos` tidak bertambah
    - Tag komentar: `// Feature: todo-life-dashboard, Property 1: Normalisasi tugas mencegah duplikat`
    - _Requirements: 5.1, 5.2_

  - [x] 6.3 Tulis property test untuk penolakan edit duplikat (Property 2)
    - **Property 2: Penolakan edit duplikat**
    - **Validates: Requirements 5.3, 5.4**
    - Buat daftar tugas acak berisi minimal dua item, lalu coba edit satu item dengan teks yang sama dengan item lain setelah normalisasi
    - Verifikasi `editTodo` mengembalikan `{ success: false }` dan teks asli tetap tidak berubah
    - Tag komentar: `// Feature: todo-life-dashboard, Property 2: Penolakan edit duplikat`
    - _Requirements: 5.3, 5.4_

  - [x] 6.4 Implementasi `TodoManager` — operasi CRUD
    - Tulis modul `TodoManager` dengan `init()`, `loadFromStorage()`, `saveToStorage()`, `addTodo(text)`, `editTodo(id, newText)`, `toggleTodo(id)`, `deleteTodo(id)`, `normalize(text)`, `isDuplicate(text, excludeId?)`, dan `renderList()`
    - `addTodo` validasi: tidak kosong/hanya spasi, ≤ 200 karakter, tidak duplikat (setelah normalisasi); kembalikan `{ success: boolean, error?: string }`
    - `editTodo` validasi: tidak kosong/hanya spasi, tidak duplikat dengan item lain; kembalikan `{ success: boolean, error?: string }`
    - `toggleTodo` membalik status `completed` item yang bersangkutan
    - `deleteTodo` menghapus item dari array `todos`
    - Setiap perubahan state memanggil `saveToStorage()` kemudian `renderList()`
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 4.7, 4.8, 4.9, 4.10, 5.1, 5.2, 5.3, 5.4_

  - [x] 6.5 Tulis property test untuk toggle round-trip (Property 3)
    - **Property 3: Toggle completed adalah idempoten ganda (round-trip)**
    - **Validates: Requirements 4.4, 4.5**
    - Gunakan `fc.boolean()` untuk status awal `completed` dan buat todo sementara
    - Verifikasi `toggle(toggle(todo)).completed === todo.completed`
    - Tag komentar: `// Feature: todo-life-dashboard, Property 3: Toggle completed adalah idempoten ganda (round-trip)`
    - _Requirements: 4.4, 4.5_

  - [x] 6.6 Tulis property test untuk persistensi tugas di storage (Property 4)
    - **Property 4: Tugas yang ditambahkan tersimpan di Local Storage**
    - **Validates: Requirements 4.2, 4.10**
    - Gunakan `fc.string({ minLength: 1, maxLength: 200 })` untuk teks tugas yang valid
    - Setelah `addTodo`, verifikasi `StorageUtil.get('dashboard_todos')` mengandung objek Todo dengan teks yang dinormalisasi
    - Tag komentar: `// Feature: todo-life-dashboard, Property 4: Tugas yang ditambahkan tersimpan di Local Storage`
    - _Requirements: 4.2, 4.10_

  - [x] 6.7 Tulis unit tests untuk `TodoManager`
    - Test tambah tugas valid → panjang daftar bertambah 1
    - Test tambah tugas kosong → ditolak, pesan validasi
    - Test edit tugas dengan teks valid → teks diperbarui
    - Test edit tugas dengan teks kosong → ditolak, teks asli dipertahankan
    - Test hapus tugas → item hilang dari daftar
    - Test reload halaman → data dimuat dari storage mock
    - _Requirements: 4.1–4.11, 5.1–5.4_

- [x] 7. Checkpoint — pastikan TodoManager berfungsi penuh
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implementasi QuickLinksManager
  - [x] 8.1 Implementasi pure function `validateUrl(url)`
    - Tulis fungsi yang mengembalikan `true` jika dan hanya jika `url` dimulai dengan `http://` atau `https://`; kembalikan `false` untuk string kosong, URL relatif, atau protokol lain
    - Ekspor fungsi agar dapat diuji secara terpisah
    - _Requirements: 6.4_

  - [x] 8.2 Tulis property test untuk `validateUrl` (Property 7)
    - **Property 7: Validasi URL QuickLinks**
    - **Validates: Requirements 6.4**
    - Gunakan `fc.string()` untuk kasus negatif dan `fc.oneof(fc.constant('http://'), fc.constant('https://'))` digabung `fc.string()` untuk kasus positif
    - Verifikasi `validateUrl` mengembalikan `true` hanya untuk URL yang dimulai dengan `http://` atau `https://`
    - Tag komentar: `// Feature: todo-life-dashboard, Property 7: Validasi URL QuickLinks`
    - _Requirements: 6.4_

  - [x] 8.3 Implementasi `QuickLinksManager` lengkap
    - Tulis modul `QuickLinksManager` dengan `init()`, `loadFromStorage()`, `saveToStorage()`, `addLink(label, url)`, `deleteLink(id)`, `validateUrl(url)`, dan `renderList()`
    - `addLink` validasi: label tidak kosong (≤ 50 karakter), URL valid (`validateUrl`), dan total tautan < 20; kembalikan `{ success: boolean, error?: string }`
    - Setiap tautan di-render sebagai `<a target="_blank">` agar terbuka di tab baru
    - Setiap perubahan state memanggil `saveToStorage()` kemudian `renderList()`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

  - [x] 8.4 Tulis property test untuk persistensi tautan di storage (Property 8)
    - **Property 8: Tautan yang ditambahkan tersimpan di Local Storage**
    - **Validates: Requirements 6.2, 6.5, 6.8**
    - Gunakan `fc.string({ minLength: 1, maxLength: 50 })` untuk label dan gabungkan `fc.constant('https://')` + `fc.string()` untuk URL valid
    - Setelah `addLink`, verifikasi `StorageUtil.get('dashboard_links')` mengandung objek QuickLink dan total entri ≤ 20
    - Tag komentar: `// Feature: todo-life-dashboard, Property 8: Tautan yang ditambahkan tersimpan di Local Storage`
    - _Requirements: 6.2, 6.5, 6.8_

  - [x] 8.5 Tulis unit tests untuk `QuickLinksManager`
    - Test tambah tautan valid → tautan muncul di daftar
    - Test tambah tautan ke-21 → ditolak dengan pesan batas
    - Test hapus tautan → item hilang dari daftar
    - Test reload halaman → data dimuat dari storage mock
    - _Requirements: 6.1–6.9_

- [x] 9. Implementasi CSS responsif dan aksesibilitas
  - [x] 9.1 Buat layout grid responsif di `css/style.css`
    - Implementasi `display: grid` dengan `grid-template-columns: 1fr` untuk layar < 768px
    - Tambahkan media query `@media (min-width: 768px)` dengan `grid-template-columns: repeat(2, 1fr)`
    - Pastikan tidak ada horizontal overflow pada lebar 320px ke atas
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 9.2 Tambahkan label aksesibilitas pada semua elemen interaktif
    - Tambahkan atribut `aria-label` atau `<label>` yang tepat pada semua tombol dan input
    - Pastikan kontras warna mencukupi untuk teks utama di kedua tema (terang dan gelap)
    - Tambahkan `aria-live` region untuk notifikasi timer dan pesan validasi error
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 10. Wiring semua modul dan finalisasi
  - [x] 10.1 Wire semua modul dalam `AppInit`
    - Tulis `AppInit.init()` yang memanggil semua modul sesuai urutan: `ThemeSwitcher.init()`, `GreetingWidget.init()`, `FocusTimer.init()`, `TodoManager.init()`, `QuickLinksManager.init()`
    - Pastikan event listener untuk semua tombol dan input sudah terhubung ke fungsi modul yang tepat
    - Tampilkan pesan error validasi inline (bukan `alert()`) di elemen yang sudah disiapkan di HTML, bersihkan pesan saat pengguna mulai mengetik ulang
    - _Requirements: 2.2, 2.3, 4.3, 4.7, 4.8, 5.2, 5.4, 6.3, 6.4, 6.5_

  - [x] 10.2 Tulis integration tests untuk skenario end-to-end
    - Test full lifecycle: tambah tugas → tandai selesai → edit → hapus dengan jsdom mock
    - Test full lifecycle: tambah tautan → klik → hapus
    - Test reload halaman: semua data tetap ada setelah memuat ulang dari storage mock
    - _Requirements: 4.10, 4.11, 6.8, 6.9_

- [x] 11. Checkpoint akhir — pastikan semua tests lulus
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task merujuk ke requirement spesifik untuk traceability
- Pure functions (seperti `getTimeGreeting`, `formatTime`, `normalize`, `isDuplicate`, `validateUrl`) diekstrak dan dapat diuji tanpa DOM
- Property-based tests menggunakan library [fast-check](https://fast-check.dev/) dengan minimum 100 iterasi per properti
- Unit tests menggunakan [Jest](https://jestjs.io/) atau [Vitest](https://vitest.dev/) (direkomendasikan untuk ESM)
- Pesan validasi error ditampilkan inline, tidak menggunakan `alert()`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "3.1", "5.1", "6.1", "8.1"] },
    { "id": 2, "tasks": ["2.3", "3.2", "5.2", "6.2", "8.2"] },
    { "id": 3, "tasks": ["3.3", "5.3", "6.3"] },
    { "id": 4, "tasks": ["3.4", "5.4", "6.4", "8.3"] },
    { "id": 5, "tasks": ["6.5", "6.6", "8.4"] },
    { "id": 6, "tasks": ["6.7", "8.5", "9.1"] },
    { "id": 7, "tasks": ["9.2", "10.1"] },
    { "id": 8, "tasks": ["10.2"] }
  ]
}
```
