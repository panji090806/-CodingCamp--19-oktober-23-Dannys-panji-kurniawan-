# Requirements Document

## Introduction

To-Do List Life Dashboard adalah aplikasi web berbasis browser yang dibangun menggunakan HTML, CSS, dan Vanilla JavaScript (tanpa framework). Aplikasi ini berfungsi sebagai dasbor personal yang menggabungkan tampilan waktu real-time, timer fokus bergaya Pomodoro, pengelolaan daftar tugas, dan pintasan tautan cepat ke situs favorit. Semua data pengguna disimpan secara lokal menggunakan browser Local Storage API. Tampilan dirancang bersih, minimalis, dan responsif.

## Glossary

- **Dashboard**: Halaman utama aplikasi yang menampilkan semua widget sekaligus.
- **Greeting_Widget**: Komponen yang menampilkan jam, tanggal, dan sapaan dinamis kepada pengguna.
- **Focus_Timer**: Komponen timer hitung mundur 25 menit bergaya Pomodoro.
- **Todo_Manager**: Komponen pengelolaan daftar tugas harian.
- **QuickLinks_Manager**: Komponen pengelolaan tautan pintasan ke situs favorit.
- **Local_Storage**: Browser Local Storage API yang digunakan untuk menyimpan semua data pengguna secara permanen di sisi klien.
- **Theme_Switcher**: Komponen tombol untuk beralih antara mode terang dan mode gelap.
- **Greeting_Name**: Nama pengguna yang digunakan untuk mempersonalisasi sapaan di Greeting_Widget.
- **Tugas**: Satu entri pekerjaan dalam Todo_Manager, berisi teks deskripsi dan status penyelesaian.
- **Tautan**: Satu entri pintasan URL di QuickLinks_Manager, berisi label dan URL tujuan.

## Requirements

### Requirement 1: Tampilan Waktu dan Sapaan Real-Time

**User Story:** Sebagai pengguna, saya ingin melihat jam, tanggal, dan sapaan yang diperbarui secara real-time, agar saya selalu tahu konteks waktu saat menggunakan dasbor.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL menampilkan jam berdasarkan jam lokal perangkat pengguna dalam format HH:MM:SS yang diperbarui setiap detik tepat (interval 1000 milidetik).
2. THE Greeting_Widget SHALL menampilkan tanggal lengkap berdasarkan tanggal lokal perangkat pengguna dalam format nama hari, tanggal, nama bulan, dan tahun — contoh: "Senin, 19 Oktober 2023".
3. IF jam lokal perangkat berada antara pukul 00:00 hingga 11:59, THEN THE Greeting_Widget SHALL menampilkan sapaan "Selamat Pagi".
4. IF jam lokal perangkat berada antara pukul 12:00 hingga 14:59, THEN THE Greeting_Widget SHALL menampilkan sapaan "Selamat Siang".
5. IF jam lokal perangkat berada antara pukul 15:00 hingga 17:59, THEN THE Greeting_Widget SHALL menampilkan sapaan "Selamat Sore".
6. IF jam lokal perangkat berada antara pukul 18:00 hingga 23:59, THEN THE Greeting_Widget SHALL menampilkan sapaan "Selamat Malam".

### Requirement 2: Sapaan Personal dengan Nama Pengguna

**User Story:** Sebagai pengguna, saya ingin memasukkan nama saya agar sapaan di dasbor terasa lebih personal.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL menyediakan kolom input teks untuk memasukkan Greeting_Name dengan panjang maksimum 50 karakter.
2. WHEN pengguna memasukkan Greeting_Name (1–50 karakter) dan menekan tombol simpan, THE Greeting_Widget SHALL menampilkan sapaan dalam format "[Sapaan Waktu], [Greeting_Name]!".
3. IF Greeting_Name kosong atau belum pernah disimpan, THEN THE Greeting_Widget SHALL menampilkan sapaan dalam format "[Sapaan Waktu]!" tanpa nama.
4. WHEN pengguna menyimpan Greeting_Name, THE Local_Storage SHALL menyimpan nilai Greeting_Name sehingga tetap tersedia setelah halaman dimuat ulang.
5. WHEN halaman dimuat ulang, THE Greeting_Widget SHALL memuat Greeting_Name dari Local_Storage dan langsung menampilkan sapaan personal.
6. IF Local_Storage tidak tersedia, THEN THE Greeting_Widget SHALL menampilkan sapaan berdasarkan Greeting_Name yang aktif di sesi saat ini tanpa menyimpan secara persisten.

### Requirement 3: Focus Timer

**User Story:** Sebagai pengguna, saya ingin menggunakan timer hitung mundur 25 menit, agar saya bisa bekerja dengan sesi fokus terstruktur.

#### Acceptance Criteria

1. THE Focus_Timer SHALL menampilkan waktu hitung mundur dengan format MM:SS, diinisialisasi pada 25:00.
2. WHEN pengguna menekan tombol Start, THE Focus_Timer SHALL memulai hitung mundur setiap detik.
3. WHILE Focus_Timer sedang berjalan, THE Focus_Timer SHALL menonaktifkan tombol Start dan mengaktifkan tombol Stop.
4. IF Focus_Timer tidak sedang berjalan, THEN THE Focus_Timer SHALL menonaktifkan tombol Stop.
5. WHEN pengguna menekan tombol Stop, THE Focus_Timer SHALL menghentikan hitung mundur pada waktu saat itu dan mengaktifkan kembali tombol Start.
6. WHEN pengguna menekan tombol Reset, THE Focus_Timer SHALL menghentikan hitung mundur (jika sedang berjalan), mengembalikan tampilan ke 25:00, dan mengaktifkan kembali tombol Start.
7. WHEN hitung mundur mencapai 00:00, THE Focus_Timer SHALL berhenti secara otomatis dan menampilkan notifikasi visual kepada pengguna bahwa sesi fokus telah selesai selama minimal 3 detik.

### Requirement 4: Pengelolaan Daftar Tugas

**User Story:** Sebagai pengguna, saya ingin menambah, mengedit, menandai selesai, dan menghapus tugas, agar saya bisa melacak pekerjaan harian saya.

#### Acceptance Criteria

1. THE Todo_Manager SHALL menyediakan kolom input teks (maksimum 200 karakter) dan tombol tambah untuk memasukkan Tugas baru.
2. WHEN pengguna memasukkan teks Tugas dan menekan tombol tambah atau menekan tombol Enter, THE Todo_Manager SHALL menambahkan Tugas ke dalam daftar.
3. IF teks input Tugas kosong atau hanya berisi spasi saat pengguna menekan tombol tambah atau Enter, THEN THE Todo_Manager SHALL tidak menambahkan Tugas dan menampilkan pesan validasi.
4. WHEN pengguna menekan tombol tandai selesai pada sebuah Tugas, THE Todo_Manager SHALL mengubah status Tugas menjadi selesai dan menampilkan dekorasi coret (strikethrough) pada teks Tugas.
5. WHEN pengguna menekan kembali tombol tandai selesai pada Tugas yang sudah selesai, THE Todo_Manager SHALL mengubah status Tugas kembali menjadi belum selesai dan menghapus dekorasi coret.
6. WHEN pengguna menekan tombol edit pada sebuah Tugas, THE Todo_Manager SHALL menampilkan kolom input yang dapat diedit dengan teks Tugas saat ini.
7. IF teks hasil edit Tugas tidak kosong dan tidak hanya berisi spasi, THEN THE Todo_Manager SHALL memperbarui teks Tugas dengan nilai baru tersebut saat pengguna menyimpan.
8. IF teks hasil edit Tugas kosong atau hanya berisi spasi saat pengguna menyimpan, THEN THE Todo_Manager SHALL tidak menyimpan perubahan dan tetap menampilkan teks Tugas sebelumnya.
9. WHEN pengguna menekan tombol hapus pada sebuah Tugas, THE Todo_Manager SHALL menghapus Tugas tersebut dari daftar secara permanen.
10. WHEN daftar Tugas mengalami perubahan (tambah, edit, selesai, atau hapus), THE Todo_Manager SHALL menyimpan seluruh daftar Tugas terbaru ke Local_Storage.
11. WHEN halaman dimuat ulang, THE Todo_Manager SHALL memuat daftar Tugas dari Local_Storage dan menampilkan seluruh Tugas yang tersimpan.

### Requirement 5: Pencegahan Tugas Duplikat

**User Story:** Sebagai pengguna, saya ingin dicegah dari memasukkan tugas dengan nama yang sama, agar daftar tugas saya tetap bersih dan tidak redundan.

#### Acceptance Criteria

1. WHEN pengguna mencoba menambahkan Tugas baru, THE Todo_Manager SHALL membandingkan teks input yang sudah dinormalisasi (dipangkas spasi terdepan/terekoran dan dikonversi ke huruf kecil) dengan seluruh teks Tugas yang sudah ada dalam daftar menggunakan perbandingan yang sama.
2. IF teks Tugas yang akan ditambahkan — setelah normalisasi — sama dengan Tugas yang sudah ada, THEN THE Todo_Manager SHALL menolak penambahan, menampilkan pesan peringatan yang menyebutkan bahwa nama tugas sudah ada, dan mempertahankan teks input agar pengguna dapat mengeditnya.
3. WHEN pengguna menyimpan hasil edit Tugas, THE Todo_Manager SHALL memeriksa apakah teks baru — setelah normalisasi — sudah ada pada Tugas lain selain Tugas yang sedang diedit.
4. IF teks hasil edit Tugas — setelah normalisasi — sama dengan Tugas lain yang sudah ada (bukan Tugas yang sedang diedit), THEN THE Todo_Manager SHALL menolak perubahan, menampilkan pesan peringatan yang menyebutkan bahwa nama tugas sudah ada, dan mempertahankan isi kolom edit agar pengguna dapat memperbaikinya.

### Requirement 6: Pengelolaan Quick Links

**User Story:** Sebagai pengguna, saya ingin menyimpan dan mengakses tautan ke situs favorit saya dengan cepat, agar saya tidak perlu mengetik URL berulang kali.

#### Acceptance Criteria

1. THE QuickLinks_Manager SHALL menyediakan kolom input untuk label Tautan (maksimum 50 karakter), kolom input untuk URL Tautan (maksimum 2048 karakter), serta tombol tambah.
2. WHEN pengguna mengisi label dan URL Tautan yang dimulai dengan `http://` atau `https://` lalu menekan tombol tambah, THE QuickLinks_Manager SHALL menambahkan Tautan ke dalam daftar pintasan.
3. IF label Tautan kosong saat pengguna menekan tombol tambah, THEN THE QuickLinks_Manager SHALL tidak menambahkan Tautan dan menampilkan pesan validasi yang mengindikasikan bahwa label tidak boleh kosong.
4. IF URL Tautan kosong atau tidak dimulai dengan `http://` atau `https://` saat pengguna menekan tombol tambah, THEN THE QuickLinks_Manager SHALL tidak menambahkan Tautan dan menampilkan pesan validasi yang mengindikasikan bahwa URL tidak valid.
5. IF daftar Tautan telah mencapai 20 entri saat pengguna menekan tombol tambah, THEN THE QuickLinks_Manager SHALL tidak menambahkan Tautan dan menampilkan pesan validasi yang mengindikasikan bahwa batas maksimum telah tercapai.
6. WHEN pengguna mengklik sebuah Tautan di dalam daftar, THE Dashboard SHALL membuka URL Tautan tersebut di tab baru browser.
7. WHEN pengguna menekan tombol hapus pada sebuah Tautan, THE QuickLinks_Manager SHALL menghapus Tautan tersebut dari daftar secara permanen.
8. WHEN daftar Tautan mengalami perubahan (tambah atau hapus), THE Local_Storage SHALL menyimpan seluruh daftar Tautan terbaru.
9. WHEN halaman dimuat ulang, THE QuickLinks_Manager SHALL memuat daftar Tautan dari Local_Storage dan menampilkan seluruh Tautan yang tersimpan.

### Requirement 7: Mode Terang dan Mode Gelap

**User Story:** Sebagai pengguna, saya ingin beralih antara mode terang dan mode gelap, agar tampilan dasbor nyaman digunakan di berbagai kondisi pencahayaan.

#### Acceptance Criteria

1. THE Theme_Switcher SHALL menyediakan sebuah tombol yang menampilkan label atau ikon yang mencerminkan tema yang sedang aktif (mode terang atau mode gelap).
2. WHEN pengguna menekan tombol Theme_Switcher, THE Dashboard SHALL mengubah skema warna seluruh komponen antarmuka yang terlihat — termasuk latar belakang, teks, dan kartu konten — dari mode terang ke mode gelap atau sebaliknya dalam waktu tidak lebih dari 300 milidetik.
3. WHEN tema aktif berubah, THE Local_Storage SHALL menyimpan preferensi tema pengguna sebagai salah satu dari dua nilai: "light" atau "dark".
4. WHEN halaman dimuat ulang, THE Theme_Switcher SHALL membaca preferensi tema dari Local_Storage dan menerapkan tema tersebut sebelum konten halaman ditampilkan kepada pengguna.
5. IF tidak ada preferensi tema yang tersimpan di Local_Storage, THEN THE Theme_Switcher SHALL menerapkan mode terang sebagai tema default.
6. IF Local_Storage tidak tersedia saat halaman dimuat atau saat tema diubah, THEN THE Theme_Switcher SHALL menerapkan mode terang sebagai tema default dan tidak menampilkan pesan kesalahan kepada pengguna.

### Requirement 8: Tampilan Responsif

**User Story:** Sebagai pengguna, saya ingin dasbor dapat digunakan dengan nyaman di berbagai ukuran layar, agar saya bisa mengaksesnya dari desktop maupun perangkat mobile.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan seluruh widget (Greeting_Widget, Focus_Timer, Todo_Manager, QuickLinks_Manager) tanpa overflow horizontal dan tanpa memerlukan scrolling horizontal pada lebar layar minimal 320px.
2. WHEN lebar layar kurang dari 768px, THE Dashboard SHALL menyusun setiap widget secara vertikal dalam satu kolom dengan lebar 100% dari lebar viewport.
3. WHEN lebar layar 768px atau lebih, THE Dashboard SHALL menyusun widget dalam tata letak minimal 2 kolom dengan setidaknya 2 widget yang ditampilkan berdampingan.
4. THE Dashboard SHALL menggunakan satu file CSS di `css/style.css` dan satu file JavaScript di `js/script.js` untuk seluruh styling dan logika.
5. WHEN konten suatu widget melebihi tinggi viewport pada layar mobile, THE Dashboard SHALL memungkinkan scrolling vertikal pada keseluruhan halaman agar seluruh konten dapat diakses.
