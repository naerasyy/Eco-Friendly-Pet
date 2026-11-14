#Identitas Tim
nama tim: Da Divas
Ketua Tim: Najma Rasyid Khadeja
Anggota 1: Naila Nawfa Assegaf
Anggota 2: Angela Margareth Marbun

Nama Aplikasi: Pixel Eco-Pet
Kategori: Web App Development
Subtema: Green Environment & Sustainability
Masalah & Solusi
Masalah yang diangkat: 
Kesadaran masyarakat untuk menerapkan gaya hidup rendah karbon sering kali terhambat karena dampak dari tindakan ramah lingkungan terasa abstrak dan tidak memberikan umpan balik langsung dalam kehidupan sehari-hari.
Solusi yang diberikan: 
Pixel Eco-Pet adalah aplikasi web gamifikasi berbasis virtual pet yang menghubungkan kelangsungan hidup serta perkembangan hewan peliharaan virtual dengan aksi nyata ramah lingkungan dari pengguna. Setiap misi dilengkapi mekanisme verifikasi berbasis sensor perangkat dan kecerdasan buatan—seperti Kamera, GPS, dan kalkulasi jejak karbon otomatis—sehingga XP, token, dan kesehatan pet hanya akan meningkat apabila pengguna benar-benar melakukan aksi hijau di dunia nyata.
Target Pengguna: 
Pelajar (SMP/SMA) dan mahasiswa yang membutuhkan media edukasi pelestarian lingkungan yang interaktif dan menyenangkan.
Masyarakat umum yang ingin membangun kebiasaan harian rendah karbon secara bertahap dan terukur.

Daftar Fitur Utama Yang Diimplementasikan:
1. Verifikasi Botol Minum Reusable (Computer Vision): Menggunakan kamera perangkat dan model deteksi objek untuk memvalidasi keberadaan botol minum guna ulang sebelum memberikan hadiah XP dan menghitung penghematan emisi plastik.
2. Pelacakan Jalan Kaki & Transportasi Umum (Real-time GPS): Memanfaatkan Geolocation API dengan perhitungan jarak serta filter kecepatan untuk memvalidasi jarak tempuh, durasi perjalanan, jumlah langkah, dan estimasi pengurangan emisi karbon.
3. Kalkulator Dampak Karbon & Aksi Harian: Menghitung pengurangan emisi karbon, penghematan biaya listrik/BBM, serta manfaat kesehatan dari pemilahan sampah (plastik, kertas, logam, kaca, organik), konsumsi menu nabati, dan mematikan perangkat elektronik siaga.
4. Chat Interaktif dengan Eco-Pet (Hybrid AI): Fitur dialog interaktif bersama Slink (Eco-Pet) yang mampu merespons pertanyaan pengguna dan menghitung estimasi dampak lingkungan (seperti berat sampah plastik dalam kilogram) secara real-time.
5. Sistem Perawatan & Progresi Virtual Pet:** Manajemen statistik kesehatan, kebahagiaan, level, XP, dan koleksi *eco-quests* yang tersimpan otomatis di browser pengguna.

Teknologi Yang Digunakan:
* Frontend & UI/UX Design: HTML5 (`<template>` modular), CSS3 (Retro Pixel-Art Responsive UI), Vanilla JavaScript (ES6+), dan Figma (digunakan untuk perancangan awal wireframe, alur pengguna, dan tata letak modal interaktif).
* AI & Machine Learning: TensorFlow.js (`@tensorflow-models/coco-ssd`) untuk deteksi objek visual di sisi klien, serta arsitektur Hybrid Rule-Based NLP untuk interaksi percakapan pet.
* Web APIs: MediaDevices Camera API (`getUserMedia`), HTML5 Geolocation API (`watchPosition`), Web Storage API (`localStorage`).
* Hosting & Deployment: GitHub Pages.

Diagram Arsitektur Sistem & Alur Data
Aplikasi ini mengusung arsitektur Client-Side First yang ringan, aman terhadap privasi pengguna (foto kamera dan titik koordinat GPS diproses langsung di browser tanpa disimpan ke server eksternal), dan memiliki ketahanan tinggi offline-resilient:

```text
+-------------------------------------------------------------------+
|                        USER / BROWSER CLIENT                      |
|                                                                   |
|  [UI Layer: index.html & style.css]                               |
|         │                                                         |
|         ▼                                                         |
|  [Game Core: script.js] ◄───► [Browser LocalStorage]              |
|         │                     (Menyimpan XP, Level, & Riwayat)    |
|         │ (Event Capture Interception)                            |
|         ▼                                                         |
|  [Verification & AI Engine: quest-verification.js]                |
|    ├──► Camera API ──► TensorFlow.js (COCO-SSD) ──► Validasi Botol|
|    ├──► Geolocation API ──► Rumus Haversine ──────► Validasi GPS  |
|    ├──► Emission Calculator ──────────────────────► Hitung CO₂e   |
|    └──► Hybrid Chat Engine ───────────────────────► Respons Pet   |
+-------------------------------------------------------------------+
Alur Data Singkat:
1. Pengguna memilih misi (quest) pada antarmuka utama (script.js).
2. Modul quest-verification.js mencegat aksi klaim instan (event capture) dan membuka modal verifikasi sesuai jenis misi.
3. Data input (gambar kamera, koordinat GPS, berat sampah, atau teks chat) diproses secara lokal di browser.
4. Jika lolos validasi, sistem menghitung pengurangan emisi karbon, memperbarui status pet di localStorage, dan menampilkan ringkasan dampak di gelembung percakapan (speech bubble).

Panduan Instalasi, Konfigurasi, dan Menjalankan Aplikasi
Secara Online: Buka tautan https://naerasyy.github.io/Eco-Friendly-Pet/ melalui browser modern (Chrome/Edge/Safari). Izinkan akses Kamera dan Lokasi (GPS) saat diminta oleh browser agar seluruh fitur verifikasi berjalan optimal.
Localhost:
1.  Clone Repositori: git clone [https://github.com/naerasyy/Eco-Friendly-Pet.git](https://github.com/naerasyy/Eco-Friendly-Pet.git)
cd Eco-Friendly-Pet
2. Local Server: 
Catatan: Browser mewajibkan protokol HTTPS atau http://localhost untuk mengaktifkan Kamera dan GPS. Jangan membuka index.html langsung via file://.
* Menggunakan VS Code: Klik kanan index.html → pilih Open with Live Server.
* Menggunakan python: python -m http.server 8000
Akses di browser melalui http://localhost:8000.

Konfigurasi Tambahan & Variabel Lingkungan
Aplikasi ini berjalan secara client-side murni tanpa memerlukan kredensial rahasia atau backend wajib agar dapat langsung diuji secara publik. Jika ingin menghubungkan klasifikasi botol tingkat lanjut ke backend AI eksternal, konfigurasi tersedia pada objek window.QV_CONFIG di quest-verification.js:

QV_BOTTLE_ENDPOINT: URL endpoint backend untuk klasifikasi VLM (kosong secara default untuk mode lokal/client-side).

QV_DEMO_MODE: Set true untuk mengaktifkan simulasi sensor saat pengujian di perangkat tanpa kamera/GPS.

Akun Demonstrasi
Aplikasi ini dilengkapi dengan fitur registrasi terbuka. Dewan juri dapat langsung melakukan pendaftaran akun baru menggunakan email pribadi atau langsung masuk ke dalam aplikasi pada halaman login yang tersedia.

Dokumentasi Penggunaan AI:
* Computer Vision (@tensorflow-models/coco-ssd): Digunakan pada fitur Verifikasi Botol Minum (findBottle di quest-verification.js) untuk mendeteksi objek kelas bottle dan cup secara real-time dari tangkapan kamera pengguna.

* Conversational Pet (setupChat / getAIResponse): Menggunakan pemrosesan bahasa alami berbasis aturan (Rule-Based NLP & Regex) yang berjalan lokal di browser untuk mengekstrak angka (berat sampah dalam kg) dan topik lingkungan guna memberikan respons edukatif instan tanpa ketergantungan jaringan eksternal.

* AI Coding Assistant: Dimanfaatkan selama tahap pengembangan untuk konsultasi arsitektur modular JavaScript, penulisan ekspresi reguler (regex), serta penyusunan dokumentasi teknis, dengan seluruh logika inti dan integrasi telah diuji serta diverifikasi oleh tim.

Atribusi Sumber Daya & Pihak Ketiga
TensorFlow.js & COCO-SSD Model: Oleh Google TensorFlow Team (Lisensi Apache 2.0) — digunakan untuk deteksi objek botol minum pada browser.

* Faktor Emisi Karbon: Angka perkiraan edukatif diadaptasi dari standar faktor emisi transportasi, limbah, dan kelistrikan rata-rata (Kementerian ESDM & referensi jejak karbon umum).

* UI/UX Wireframe: Perancangan tata letak dan alur antarmuka menggunakan Figma.

* Aset Visual & Kode Aplikasi: Seluruh tata letak, karakter pixel-art Eco-Pet, logika permainan, dan modul verifikasi dikembangkan secara orisinal oleh tim untuk LOGICODIX 2026.