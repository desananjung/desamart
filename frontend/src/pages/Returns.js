// frontend/src/pages/Returns.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Returns = () => {
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
          <span className="text-gray-600">Kebijakan Pengembalian</span>
        </div>

        {/* Card Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-12">
          {/* Header dengan ikon */}
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-primary/10 p-3 rounded-xl">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Kebijakan Pengembalian & Refund
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
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
            <p className="text-sm text-green-800 flex items-start gap-2">
              <span className="text-green-600 font-bold">🔄</span>
              <span>
                <strong>Kebijakan Pengembalian:</strong> DesaMart memberikan garansi 
                kepuasan pelanggan. Anda dapat mengembalikan produk dalam waktu 14 hari 
                dengan syarat dan ketentuan yang berlaku.
              </span>
            </p>
          </div>

          {/* Konten Returns & Refunds Policy */}
          <div className="prose prose-green max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-li:text-gray-600">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">1.</span> Kebijakan Pengembalian
              </h2>
              <p>
                Kami ingin Anda sepenuhnya puas dengan pembelian Anda di DesaMart. 
                Jika Anda tidak puas dengan produk yang Anda terima, Anda dapat 
                mengembalikannya dalam waktu 14 hari setelah menerima pesanan.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mt-3">
                <p className="text-sm text-blue-700">
                  ⏰ <strong>Periode Pengembalian:</strong> 14 hari sejak tanggal penerimaan
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">2.</span> Syarat & Ketentuan Pengembalian
              </h2>
              <p>Produk dapat dikembalikan jika memenuhi syarat berikut:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>✅ Produk dalam kondisi asli, belum digunakan, dan tidak rusak</li>
                <li>✅ Kemasan produk masih utuh dan tidak rusak</li>
                <li>✅ Label dan tag produk masih terpasang</li>
                <li>✅ Menyertakan bukti pembelian (nomor pesanan)</li>
                <li>✅ Produk bukan termasuk kategori yang tidak dapat dikembalikan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">3.</span> Produk yang Tidak Dapat Dikembalikan
              </h2>
              <p>Produk berikut tidak dapat dikembalikan:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>🚫 Produk makanan dan minuman yang sudah dibuka</li>
                <li>🚫 Produk kesehatan dan kebersihan pribadi</li>
                <li>🚫 Produk digital (software, game, voucher)</li>
                <li>🚫 Pakaian dalam dan produk intim</li>
                <li>🚫 Produk yang sudah dipesan khusus (custom order)</li>
                <li>🚫 Produk yang sudah rusak akibat penggunaan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">4.</span> Proses Pengembalian
              </h2>
              <p>Ikuti langkah-langkah berikut untuk mengembalikan produk:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <strong>Hubungi Tim Kami</strong>
                  <p className="text-sm text-gray-500 mt-1">
                    Kirim email ke <a href="mailto:returns@desamart.com" className="text-primary hover:underline">returns@desamart.com</a> 
                    dengan subjek "Pengembalian Produk - [Nomor Pesanan]"
                  </p>
                </li>
                <li>
                  <strong>Konfirmasi Pengembalian</strong>
                  <p className="text-sm text-gray-500 mt-1">
                    Tim kami akan mengirimkan instruksi pengembalian dan alamat tujuan
                  </p>
                </li>
                <li>
                  <strong>Kirim Produk</strong>
                  <p className="text-sm text-gray-500 mt-1">
                    Kemas produk dengan aman dan kirim ke alamat yang diberikan
                  </p>
                </li>
                <li>
                  <strong>Verifikasi Produk</strong>
                  <p className="text-sm text-gray-500 mt-1">
                    Kami akan memeriksa kondisi produk dalam 2-3 hari kerja
                  </p>
                </li>
                <li>
                  <strong>Proses Refund</strong>
                  <p className="text-sm text-gray-500 mt-1">
                    Refund akan diproses dalam 5-7 hari kerja setelah verifikasi
                  </p>
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">5.</span> Biaya Pengembalian
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-700">Gratis</h3>
                  <p className="text-sm text-gray-600">
                    Jika produk rusak, cacat, atau salah kirim
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-700">Ditanggung Pembeli</h3>
                  <p className="text-sm text-gray-600">
                    Jika pembeli berubah pikiran atau kesalahan pemesanan
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">6.</span> Metode Refund
              </h2>
              <p>Refund akan diberikan melalui metode berikut:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>💳 <strong>Kembali ke Kartu Kredit/Debit</strong> - 5-7 hari kerja</li>
                <li>🏦 <strong>Transfer Bank</strong> - 3-5 hari kerja</li>
                <li>🔄 <strong>Saldo DesaMart Wallet</strong> - Instan (dapat digunakan untuk pembelian berikutnya)</li>
                <li>📱 <strong>E-Wallet</strong> - 1-3 hari kerja (OVO, GoPay, DANA)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">7.</span> Pengembalian Rusak di Pengiriman
              </h2>
              <p>
                Jika produk Anda tiba dalam kondisi rusak:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>📸 Dokumentasikan kondisi produk dengan foto</li>
                <li>✉️ Laporkan dalam 24 jam setelah menerima</li>
                <li>🤝 Kami akan mengganti produk atau memberikan refund penuh</li>
                <li>🚚 Biaya pengiriman akan ditanggung oleh kami</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">8.</span> Pengembalian untuk Produk dari Toko Berbeda
              </h2>
              <p>
                <strong>Penting:</strong> Setiap toko di DesaMart mungkin memiliki 
                kebijakan pengembalian yang berbeda. Harap periksa kebijakan masing-masing 
                toko sebelum membeli.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <span>ℹ️</span>
                  <span>
                    Untuk produk dari toko yang berbeda, hubungi langsung toko tersebut 
                    melalui fitur chat atau halaman toko.
                  </span>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">9.</span> FAQ Pengembalian
              </h2>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800">❓ Berapa lama proses refund?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Proses refund memakan waktu 5-7 hari kerja setelah produk diterima dan diverifikasi.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800">❓ Apakah biaya pengiriman dikembalikan?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Biaya pengiriman akan dikembalikan jika produk rusak atau salah kirim. 
                    Untuk pengembalian karena perubahan pikiran, biaya pengiriman tidak dikembalikan.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800">❓ Bagaimana jika produk saya hilang di pengiriman?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Kami akan bertanggung jawab penuh jika produk hilang dalam pengiriman. 
                    Kami akan mengganti produk atau memberikan refund penuh.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-primary">10.</span> Hubungi Tim Pengembalian
              </h2>
              <p>
                Jika Anda memiliki pertanyaan atau ingin mengajukan pengembalian, 
                silakan hubungi tim kami:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-2 space-y-2">
                <p className="flex items-center gap-2">
                  <span>📧</span>
                  <a 
                    href="mailto:returns@desamart.com" 
                    className="text-primary hover:underline"
                  >
                    returns@desamart.com
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
                  <span>💬</span>
                  <span>Chat Live di website (Jam Kerja: 08:00 - 20:00 WIB)</span>
                </p>
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  <span>DesaMart Returns Center, Jakarta, Indonesia</span>
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
            
            {/* Tombol Ajukan Pengembalian */}
            <button 
              onClick={() => window.location.href = '/help'}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Ajukan Pengembalian →
            </button>
          </div>
        </div>

        {/* Footer mini */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            Kebijakan pengembalian ini berlaku untuk semua transaksi di DesaMart.
            <br />
            <Link to="/privacy" className="text-primary hover:underline ml-1">
              Lihat Kebijakan Privasi
            </Link>
            <span className="mx-2">•</span>
            <Link to="/terms" className="text-primary hover:underline ml-1">
              Syarat & Ketentuan
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Returns;