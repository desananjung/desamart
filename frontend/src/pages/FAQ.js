import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  HomeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const FAQ = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [openFaq, setOpenFaq] = useState(null);

  const categories = ['Semua', 'Akun', 'Belanja', 'Pembayaran', 'Pengiriman', 'Menjual', 'Layanan Desa'];

  const faqs = [
    // Akun & Profil
    {
      id: 1,
      category: 'Akun',
      question: 'Bagaimana cara mendaftar akun di DesaMart?',
      answer: 'Klik tombol "Daftar" di pojok kanan atas. Isi data diri (Nama, Email, Password, Role). Klik "Daftar" dan verifikasi email Anda. Setelah verifikasi, Anda bisa langsung login.'
    },
    {
      id: 2,
      category: 'Akun',
      question: 'Apa perbedaan role di DesaMart?',
      answer: 'Ada 3 role: BUYER (pembeli), SELLER (penjual), dan ADMIN (pengelola). BUYER bisa membeli produk, SELLER bisa menjual produk, ADMIN mengelola semua data dan pengguna.'
    },
    {
      id: 3,
      category: 'Akun',
      question: 'Bagaimana cara mengganti password?',
      answer: 'Login ke akun Anda, buka halaman Profil, klik "Edit Profil", lalu pilih "Ganti Password". Masukkan password lama dan password baru, lalu simpan.'
    },

    // Belanja
    {
      id: 4,
      category: 'Belanja',
      question: 'Bagaimana cara mencari produk di DesaMart?',
      answer: 'Gunakan fitur pencarian di navbar. Anda bisa mencari berdasarkan nama produk, kategori, atau seller. Anda juga bisa menggunakan filter harga dan kategori.'
    },
    {
      id: 5,
      category: 'Belanja',
      question: 'Bagaimana cara menambahkan produk ke keranjang?',
      answer: 'Buka halaman produk, pilih jumlah yang diinginkan, lalu klik "Tambah ke Keranjang". Anda bisa melihat keranjang di icon keranjang di navbar.'
    },
    {
      id: 6,
      category: 'Belanja',
      question: 'Bagaimana proses checkout?',
      answer: 'Buka keranjang, periksa produk, klik "Checkout". Isi alamat pengiriman dan nomor telepon, lalu klik "Buat Pesanan". Selanjutnya lakukan pembayaran.'
    },

    // Pembayaran
    {
      id: 7,
      category: 'Pembayaran',
      question: 'Metode pembayaran apa saja yang tersedia?',
      answer: 'DesaMart mendukung Transfer Bank (BCA, Mandiri, BNI, BRI), QRIS, dan COD (Cash on Delivery) untuk area tertentu.'
    },
    {
      id: 8,
      category: 'Pembayaran',
      question: 'Bagaimana cara upload bukti transfer?',
      answer: 'Setelah transfer, buka detail pesanan di "Pesanan Saya". Klik "Upload Bukti Transfer" dan masukkan URL bukti transfer dari Google Drive atau platform lainnya.'
    },
    {
      id: 9,
      category: 'Pembayaran',
      question: 'Apa itu QRIS?',
      answer: 'QRIS adalah standar QR Code pembayaran yang terintegrasi. Anda bisa scan QR Code menggunakan aplikasi mobile banking atau e-wallet untuk melakukan pembayaran.'
    },

    // Pengiriman
    {
      id: 10,
      category: 'Pengiriman',
      question: 'Bagaimana cara melacak pesanan?',
      answer: 'Buka "Pesanan Saya" di dashboard. Setiap pesanan memiliki status yang menunjukkan posisi pengiriman: Menunggu, Diproses, Dikirim, atau Selesai.'
    },
    {
      id: 11,
      category: 'Pengiriman',
      question: 'Berapa biaya pengiriman?',
      answer: 'Biaya pengiriman tergantung pada metode pengiriman yang dipilih: JNE (Rp25.000), POS Indonesia (Rp15.000), atau GrabExpress (Rp35.000).'
    },
    {
      id: 12,
      category: 'Pengiriman',
      question: 'Apa itu Kurir Desa?',
      answer: 'Kurir Desa adalah layanan pengiriman antar desa yang dikelola oleh warga desa. Anda bisa memesan kurir untuk mengirim barang dari satu desa ke desa lain.'
    },

    // Menjual
    {
      id: 13,
      category: 'Menjual',
      question: 'Bagaimana cara menjadi penjual di DesaMart?',
      answer: 'Login sebagai SELLER atau ADMIN. Buka "UMKM Dashboard" atau "Dashboard Penjual". Klik "Daftar UMKM" dan ikuti proses pendaftaran.'
    },
    {
      id: 14,
      category: 'Menjual',
      question: 'Bagaimana cara menambah produk?',
      answer: 'Buka "Produk" → "Tambah Produk". Isi nama, deskripsi, harga, stok, kategori, dan URL gambar. Klik "Simpan" untuk menambahkan produk.'
    },
    {
      id: 15,
      category: 'Menjual',
      question: 'Bagaimana cara mengelola pesanan sebagai seller?',
      answer: 'Buka "Pesanan Masuk" di dashboard penjual. Anda bisa melihat pesanan, mengubah status (Proses, Kirim, Selesai), dan mengelola pesanan.'
    },

    // Layanan Desa
    {
      id: 16,
      category: 'Layanan Desa',
      question: 'Apa itu Layanan Desa?',
      answer: 'Layanan Desa adalah fitur yang menghubungkan masyarakat desa dengan berbagai layanan seperti informasi desa, pengaduan, kegiatan, donasi, dan administrasi.'
    },
    {
      id: 17,
      category: 'Layanan Desa',
      question: 'Bagaimana cara membuat pengaduan?',
      answer: 'Buka "Layanan Desa" → "Pengaduan". Klik "Buat Pengaduan", isi judul, deskripsi, kategori, dan lokasi. Pengaduan akan diproses oleh admin desa.'
    },
    {
      id: 18,
      category: 'Layanan Desa',
      question: 'Apa itu E-Government Desa?',
      answer: 'E-Government Desa adalah layanan digital pemerintahan desa seperti pembuatan KTP, KK, Surat Keterangan Usaha, dan pengaduan online masyarakat.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchCategory = activeCategory === 'Semua' || faq.category === activeCategory;
    const matchSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-red-500 rounded-3xl p-8 md:p-12 text-white mb-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">❓ FAQ</h1>
          <p className="text-lg md:text-xl text-white/90">
            Pertanyaan yang paling sering ditanyakan tentang DesaMart
          </p>
          <div className="relative mt-6 max-w-xl">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pertanyaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      {filteredFaqs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500">Tidak ada hasil untuk "{searchTerm}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
              >
                <span className="font-medium">{faq.question}</span>
                <span className="ml-4 flex-shrink-0">
                  {openFaq === faq.id ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  )}
                </span>
              </button>
              {openFaq === faq.id && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Still Need Help */}
      <div className="mt-12 bg-gradient-to-r from-primary to-red-500 rounded-2xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Masih Ada Pertanyaan?</h3>
        <p className="text-white/80 mb-4">
          Tim support kami siap membantu Anda
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/help" className="bg-white text-primary px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition">
            📚 Pusat Bantuan
          </Link>
          <button className="bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-2.5 rounded-xl font-semibold hover:bg-white/30 transition">
            💬 Live Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;