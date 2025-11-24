# 🏥 Klinik Sentosa - Sistem Informasi Manajemen Klinik (SIMK) Prototype

**Klinik Sentosa** adalah prototipe *high-fidelity* berbasis web untuk sistem manajemen klinik modern. Aplikasi ini dirancang untuk mendigitalkan alur kerja operasional klinik mulai dari pendaftaran pasien, pemeriksaan medis, hingga pembayaran dan pelaporan manajerial.

Dibangun menggunakan **React** dan **Tailwind CSS**, proyek ini mensimulasikan pengalaman pengguna penuh (end-to-end) dengan penyimpanan data lokal (*local storage persistence*), memungkinkan demonstrasi alur kerja yang realistis tanpa memerlukan backend server yang kompleks.

## ✨ Fitur Utama

Aplikasi ini mencakup 4 modul pengguna dengan alur kerja yang saling terintegrasi:

### 1. 📋 Modul Resepsionis (Pendaftaran)
*   **Pendaftaran Pasien Baru & Lama**: Formulir digital dengan validasi otomatis.
*   **Manajemen Antrian**: Pasien yang didaftarkan otomatis masuk ke antrian dokter.
*   **Pencarian Pasien**: Cepat menemukan data pasien berdasarkan nama atau No. RM.

### 2. 👨‍⚕️ Modul Dokter (Pemeriksaan Medis)
*   **Antrian Real-time**: Melihat daftar pasien yang menunggu pemeriksaan.
*   **Electronic Medical Record (EMR)**: Input diagnosis, catatan dokter, dan riwayat medis.
*   **E-Resep**: Pembuatan resep obat digital yang terhubung langsung ke stok obat.
*   **Riwayat Pasien**: Akses cepat ke rekam medis kunjungan sebelumnya.

### 3. 💳 Modul Kasir (Pembayaran)
*   **Invoicing Otomatis**: Tagihan dibuat otomatis berdasarkan tindakan dokter dan obat yang diresepkan.
*   **Multi-Metode Pembayaran**: Mendukung simulasi pembayaran Tunai dan QRIS/Transfer.
*   **Cetak Struk**: Tampilan rincian biaya yang transparan.

### 4. 📊 Modul Admin (Dashboard Pemilik)
*   **Analitik Pendapatan**: Grafik visual pendapatan harian/mingguan.
*   **Laporan Operasional**: Ringkasan jumlah kunjungan pasien dan metode pembayaran.
*   **Log Aktivitas**: Pemantauan aktivitas klinik secara *real-time*.

## 🛠️ Teknologi yang Digunakan (Tech Stack)

*   **Frontend Framework**: React + TypeScript + Vite
*   **Styling**: Tailwind CSS + Shadcn/UI (Komponen UI Modern)
*   **State Management**: React Context API + LocalStorage (Data Persistence)
*   **Form Handling**: React Hook Form + Zod Validation
*   **Data Visualization**: Recharts (Grafik & Statistik)
*   **Icons**: Lucide React
*   **Routing**: Wouter

## 🚀 Cara Menjalankan

1.  Clone repositori ini
2.  Install dependencies: `npm install`
3.  Jalankan server development: `npm run dev`
4.  Akses aplikasi di `http://localhost:5000`

## 📝 Catatan Pengembang

Proyek ini dibuat sebagai **Frontend Prototype** yang mensimulasikan backend menggunakan browser storage. Data tidak akan hilang saat halaman di-refresh, memberikan pengalaman penggunaan aplikasi "nyata" untuk keperluan demonstrasi dan pengujian User Experience (UX).
