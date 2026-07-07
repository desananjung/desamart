// frontend/src/pages/Privacy.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  // Scroll ke atas saat halaman dimuat
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Tombol Kembali - Mobile Friendly */}
        <Link 
          to="/" 
          className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-6 group"
        >
          <svg 
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Kembali ke Beranda</span>
        </Link>

        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4">
          <Link to="/" className="hover:text-primary">Beranda</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">Kebijakan Privasi</span>
        </div>

        {/* Card Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-12">
          {/* Header dengan ikon */}
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-primary/10 p-3 rounded-xl">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Kebijakan Privasi
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Ringkasan */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
            <p className="text-sm text-blue-700 flex items-start gap-2">
              <span className="text-blue-500 font-bold">🔒</span>
              <span>
                <strong>Komitmen Privasi:</strong> DesaMart berkomitmen untuk melindungi 
                data pribadi Anda. Kami hanya mengumpulkan informasi yang diperlukan untuk 
                memberikan layanan terbaik.
              </span>
            </p>
          </div>

          {/* Konten Privacy Policy */}
          <div className="prose prose-green max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">1.</span> Informasi yang Kami Kumpulkan
              </h2>
              <p>
                DesaMart mengumpulkan informasi yang Anda berikan secara langsung, 
                seperti:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Data Identitas:</strong> Nama lengkap, alamat email, nomor telepon</li>
                <li><strong>Data Akun:</strong> Username, password (dienkripsi), dan preferensi</li>
                <li><strong>Data Transaksi:</strong> Riwayat pembelian, produk favorit, dan ulasan</li>
                <li><strong>Data Lokasi:</strong> Alamat pengiriman dan lokasi desa</li>
                <li><strong>Data Penggunaan:</strong> Aktivitas di platform, waktu akses, dan perangkat</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">2.</span> Penggunaan Informasi
              </h2>
              <p>Informasi yang kami kumpulkan digunakan untuk:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>✅ Menyediakan dan meningkatkan layanan kami</li>
                <li>✅ Memproses transaksi dan pengiriman</li>
                <li>✅ Mengirim notifikasi dan pembaruan</li>
                <li>✅ Menganalisis penggunaan platform</li>
                <li>✅ Personalisasi rekomendasi produk</li>
                <li>✅ Keamanan dan pencegahan penipuan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">3.</span> Perlindungan Data
              </h2>
              <p>
                Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi 
                informasi pribadi Anda:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>🔐 Enkripsi data sensitif (password, informasi pembayaran)</li>
                <li>🛡️ Firewall dan proteksi DDoS</li>
                <li>📋 Akses terbatas hanya untuk karyawan yang berwenang</li>
                <li>🔄 Backup data secara teratur</li>
                <li>🔍 Audit keamanan berkala</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">4.</span> Cookies
              </h2>
              <p>
                Kami menggunakan cookies untuk meningkatkan pengalaman Anda di platform kami. 
                Cookies membantu kami:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>🍪 Menyimpan preferensi login Anda</li>
                <li>🛒 Mengingat isi keranjang belanja</li>
                <li>📊 Menganalisis traffic dan performa website</li>
                <li>🎯 Memberikan rekomendasi yang relevan</li>
              </ul>
              <p className="mt-2">
                Anda dapat mengontrol pengaturan cookies melalui browser Anda kapan saja.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">5.</span> Hak Anda
              </h2>
              <p>Sebagai pengguna, Anda memiliki hak untuk:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>👤 <strong>Mengakses</strong> data pribadi Anda</li>
                <li>✏️ <strong>Memperbarui</strong> informasi yang tidak akurat</li>
                <li>🗑️ <strong>Menghapus</strong> akun dan data Anda</li>
                <li>📤 <strong>Ekspor</strong> data Anda dalam format yang dapat dibaca</li>
                <li>🚫 <strong>Menolak</strong> penggunaan data untuk pemasaran</li>
              </ul>
              <p className="mt-2">
                Untuk menggunakan hak-hak ini, silakan kunjungi <strong>Pengaturan Akun</strong> 
                atau hubungi tim dukungan kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">6.</span> Kontak
              </h2>
              <p>
                Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, 
                silakan hubungi kami:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-2 space-y-2">
                <p className="flex items-center gap-2">
                  <span>📧</span>
                  <a 
                    href="mailto:privacy@desamart.com" 
                    className="text-primary hover:underline"
                  >
                    privacy@desamart.com
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span>📞</span>
                  <a 
                    href="tel:+628123456789" 
                    className="text-primary hover:underline"
                  >
                    +62 812 3456 789
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  <span>DesaMart HQ, Jakarta, Indonesia</span>
                </p>
              </div>
            </section>
          </div>

          {/* Tombol Kembali ke Bawah */}
          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link 
              to="/" 
              className="inline-flex items-center text-primary hover:text-primary-dark transition-colors group"
            >
              <svg 
                className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Beranda DesaMart
            </Link>
            
            {/* Tombol Setuju */}
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Saya Setuju & Lanjutkan
            </button>
          </div>
        </div>

        {/* Footer mini */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            Dengan menggunakan DesaMart, Anda menyetujui kebijakan privasi ini.
            <br />
            <Link to="/terms" className="text-primary hover:underline ml-1">
              Lihat juga Syarat & Ketentuan
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;