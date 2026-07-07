import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  TruckIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Help = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'Bagaimana cara mendaftar akun di DesaMart?',
      answer: 'Klik tombol "Daftar" di pojok kanan atas, isi data diri Anda, lalu klik "Daftar". Anda akan menerima email verifikasi. Setelah verifikasi, Anda bisa langsung login.'
    },
    {
      id: 2,
      question: 'Bagaimana cara menjadi seller di DesaMart?',
      answer: 'Setelah login, buka halaman "UMKM" atau "Dashboard Penjual", lalu klik "Daftar UMKM" atau "Buat Toko". Ikuti panduan pendaftaran yang disediakan.'
    },
    {
      id: 3,
      question: 'Apa saja metode pembayaran yang tersedia?',
      answer: 'DesaMart mendukung pembayaran melalui Transfer Bank (BCA, Mandiri, BNI, BRI), QRIS, dan COD (Cash on Delivery) untuk area tertentu.'
    },
    {
      id: 4,
      question: 'Bagaimana cara melacak pesanan saya?',
      answer: 'Buka menu "Pesanan Saya" di dashboard Anda. Setiap pesanan memiliki status yang bisa dilihat: Menunggu, Diproses, Dikirim, atau Selesai.'
    },
    {
      id: 5,
      question: 'Apa itu fitur Live Shopping?',
      answer: 'Live Shopping adalah fitur belanja langsung melalui streaming video. Anda bisa melihat produk secara langsung, bertanya ke host, dan membeli produk yang ditampilkan.'
    },
    {
      id: 6,
      question: 'Bagaimana cara menggunakan Kurir Desa?',
      answer: 'Buka menu "Layanan Desa" → "Kurir Desa". Pilih kurir yang tersedia, isi alamat pickup dan delivery, lalu pesan. Anda akan mendapatkan notifikasi status pengiriman.'
    },
    {
      id: 7,
      question: 'Apa itu PPOB di DesaMart?',
      answer: 'PPOB (Payment Point Online Bank) adalah layanan pembayaran tagihan seperti listrik, air, telepon, internet, BPJS, dan PBB langsung dari aplikasi DesaMart.'
    },
    {
      id: 8,
      question: 'Bagaimana cara mengajukan pengaduan?',
      answer: 'Buka "Layanan Desa" → "Pengaduan". Klik "Buat Pengaduan", isi judul, deskripsi, kategori, dan lokasi. Pengaduan akan diproses oleh admin desa.'
    }
  ];

  const helpCategories = [
    {
      icon: UserGroupIcon,
      title: 'Akun & Profil',
      desc: 'Registrasi, login, verifikasi akun',
      link: '/help/account'
    },
    {
      icon: ShoppingBagIcon,
      title: 'Belanja & Produk',
      desc: 'Cari produk, keranjang, checkout',
      link: '/help/shopping'
    },
    {
      icon: CreditCardIcon,
      title: 'Pembayaran',
      desc: 'Metode pembayaran, refund, invoice',
      link: '/help/payment'
    },
    {
      icon: TruckIcon,
      title: 'Pengiriman',
      desc: 'Ongkir, kurir, tracking pesanan',
      link: '/help/shipping'
    },
    {
      icon: BuildingStorefrontIcon,
      title: 'Menjual',
      desc: 'Daftar toko, kelola produk, promosi',
      link: '/help/selling'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Layanan Desa',
      desc: 'Pengaduan, donasi, administrasi',
      link: '/help/village'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-red-500 rounded-3xl p-8 md:p-12 text-white mb-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">🆘 Pusat Bantuan</h1>
          <p className="text-lg md:text-xl text-white/90">
            Temukan jawaban untuk pertanyaan Anda tentang DesaMart
          </p>
          <div className="relative mt-6 max-w-xl">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari bantuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Quick Help Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {helpCategories.map((category) => (
          <Link
            key={category.title}
            to={category.link}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <category.icon className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-semibold">{category.title}</p>
            <p className="text-xs text-gray-400 mt-1">{category.desc}</p>
          </Link>
        ))}
      </div>

      {/* Hubungi Kami */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-12">
        <h3 className="font-bold text-lg mb-4">📞 Hubungi Kami</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <PhoneIcon className="w-6 h-6 text-primary" />
            <div>
              <p className="text-sm font-medium">Telepon</p>
              <p className="text-sm text-gray-500">(021) 1234-5678</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <EnvelopeIcon className="w-6 h-6 text-primary" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-gray-500">support@desamart.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" />
            <div>
              <p className="text-sm font-medium">Live Chat</p>
              <p className="text-sm text-gray-500">24/7 Customer Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <h2 className="text-2xl font-bold mb-6">❓ Pertanyaan Umum (FAQ)</h2>
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Tidak ada hasil untuk "{searchTerm}"</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
              >
                <span className="font-medium">{faq.question}</span>
                {openFaq === faq.id ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openFaq === faq.id && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* CTA */}
      <div className="mt-12 bg-gradient-to-r from-primary to-red-500 rounded-2xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Masih Butuh Bantuan?</h3>
        <p className="text-white/80 mb-4">
          Tim support kami siap membantu Anda 24/7
        </p>
        <button className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition">
          💬 Hubungi Support
        </button>
      </div>
    </div>
  );
};

export default Help;