// frontend/src/pages/Terms.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
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
          <span className="text-gray-600">Syarat & Ketentuan</span>
        </div>

        {/* Card Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-12">
          {/* Header dengan ikon */}
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-primary/10 p-3 rounded-xl">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Syarat & Ketentuan
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <p className="text-sm text-yellow-800 flex items-start gap-2">
              <span className="text-yellow-600 font-bold">📋</span>
              <span>
                <strong>Ringkasan:</strong> Dengan menggunakan DesaMart, Anda menyetujui 
                syarat dan ketentuan yang berlaku. Harap baca dengan seksama sebelum 
                menggunakan layanan kami.
              </span>
            </p>
          </div>

          {/* Konten Terms & Conditions */}
          <div className="prose prose-green max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">1.</span> Penerimaan Syarat
              </h2>
              <p>
                Dengan mengakses dan menggunakan platform DesaMart, Anda menyetujui untuk 
                terikat dengan syarat dan ketentuan ini. Jika Anda tidak setuju dengan 
                bagian mana pun dari syarat ini, Anda tidak diperbolehkan menggunakan 
                platform kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">2.</span> Akun Pengguna
              </h2>
              <p>Untuk menggunakan layanan kami, Anda harus:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Berusia minimal 18 tahun atau memiliki izin orang tua</li>
                <li>Memberikan informasi yang akurat dan lengkap saat mendaftar</li>
                <li>Bertanggung jawab penuh atas aktivitas di akun Anda</li>
                <li>Menjaga kerahasiaan password dan informasi login</li>
                <li>Segera melaporkan jika terjadi akses tidak sah ke akun Anda</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">3.</span> Transaksi dan Pembayaran
              </h2>
              <p>Semua transaksi di DesaMart tunduk pada:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>💳 Pembayaran harus dilakukan sesuai dengan metode yang tersedia</li>
                <li>📦 Pengiriman barang sesuai dengan kebijakan toko masing-masing</li>
                <li>🔄 Pengembalian barang mengikuti kebijakan retur yang berlaku</li>
                <li>💰 Harga produk sesuai dengan yang tertera di platform</li>
                <li>📝 Bukti transaksi akan dikirim melalui email</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">4.</span> Hak Kekayaan Intelektual
              </h2>
              <p>
                Semua konten di DesaMart, termasuk teks, gambar, logo, dan desain, 
                adalah milik DesaMart dan dilindungi oleh hak cipta. Anda tidak 
                diperbolehkan:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Menyalin atau mendistribusikan konten tanpa izin</li>
                <li>Menggunakan logo atau merek dagang DesaMart</li>
                <li>Memodifikasi atau membuat karya turunan</li>
                <li>Menggunakan konten untuk tujuan komersial tanpa izin</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">5.</span> Perilaku Pengguna
              </h2>
              <p>Pengguna dilarang melakukan:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>🚫 Menyalahgunakan platform untuk aktivitas ilegal</li>
                <li>🚫 Mengirim spam atau konten berbahaya</li>
                <li>🚫 Meniru atau mengaku sebagai orang lain</li>
                <li>🚫 Menjual produk terlarang atau berbahaya</li>
                <li>🚫 Mengganggu pengguna lain atau mengganggu operasional platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">6.</span> Penghentian Akun
              </h2>
              <p>
                DesaMart berhak untuk menghentikan atau menangguhkan akun Anda jika:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Anda melanggar syarat dan ketentuan ini</li>
                <li>Anda melakukan aktivitas yang merugikan pengguna lain</li>
                <li>Anda memberikan informasi yang tidak akurat</li>
                <li>Anda menggunakan platform untuk tujuan ilegal</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">7.</span> Pembatasan Tanggung Jawab
              </h2>
              <p>
                DesaMart tidak bertanggung jawab atas:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Kerugian atau kerusakan akibat penggunaan platform</li>
                <li>Keterlambatan atau kegagalan dalam pengiriman</li>
                <li>Kualitas produk yang dijual oleh penjual pihak ketiga</li>
                <li>Gangguan teknis yang berada di luar kendali kami</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">8.</span> Perubahan Syarat
              </h2>
              <p>
                DesaMart berhak untuk mengubah syarat dan ketentuan ini setiap saat. 
                Perubahan akan diumumkan melalui platform dan akan berlaku segera 
                setelah dipublikasikan. Penggunaan berkelanjutan Anda terhadap platform 
                berarti Anda menerima perubahan tersebut.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">9.</span> Hukum yang Berlaku
              </h2>
              <p>
                Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia. 
                Setiap sengketa yang timbul akan diselesaikan melalui pengadilan 
                yang berwenang di Indonesia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">10.</span> Kontak Kami
              </h2>
              <p>
                Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini, 
                silakan hubungi kami:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-2 space-y-2">
                <p className="flex items-center gap-2">
                  <span>📧</span>
                  <a 
                    href="mailto:legal@desamart.com" 
                    className="text-primary hover:underline"
                  >
                    legal@desamart.com
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
                  <span>DesaMart , Bandung, Indonesia</span>
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
            Dengan menggunakan DesaMart, Anda menyetujui syarat dan ketentuan ini.
            <br />
            <Link to="/privacy" className="text-primary hover:underline ml-1">
              Lihat juga Kebijakan Privasi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;