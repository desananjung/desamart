import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FeatureCards = () => {
  const { user } = useAuth();

  const features = [
    {
      id: 'marketplace',
      icon: '🛒',
      title: 'Marketplace Core',
      description: 'Jual beli produk dengan mudah dan aman',
      color: 'from-blue-500 to-blue-600',
      path: '/marketplace'
    },
    {
      id: 'payment',
      icon: '💳',
      title: 'Payment & Shipping',
      description: 'Pembayaran digital & pengiriman terintegrasi',
      color: 'from-green-500 to-green-600',
      path: '/payment'
    },
    {
      id: 'umkm',
      icon: '🏪',
      title: 'UMKM Digital',
      description: 'Platform khusus untuk usaha mikro & kecil',
      color: 'from-orange-500 to-orange-600',
      path: '/umkm'
    },
    {
      id: 'koperasi',
      icon: '🏛️',
      title: 'Koperasi Digital',
      description: 'Simpan pinjam & manajemen koperasi',
      color: 'from-purple-500 to-purple-600',
      path: '/koperasi'
    },
    {
      id: 'layanan',
      icon: '🏘️',
      title: 'Layanan Desa',
      description: 'Pengaduan, informasi, & donasi desa',
      color: 'from-pink-500 to-pink-600',
      path: '/layanan-desa'
    },
    {
      id: 'enterprise',
      icon: '🏢',
      title: 'Dashboard Enterprise',
      description: 'Manajemen bisnis terintegrasi',
      color: 'from-indigo-500 to-indigo-600',
      path: '/enterprise'
    },
    {
      id: 'pertanian',
      icon: '🌾',
      title: 'Pasar Tani Digital',
      description: 'Jual beli hasil pertanian & perkebunan',
      color: 'from-emerald-500 to-emerald-600',
      path: '/pertanian'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">🚀 Semua Fitur DesaMart</h2>
          <p className="text-gray-500 mt-2">Pilih fitur yang Anda butuhkan, semuanya dalam satu platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.id}
              to={user ? feature.path : '/login'}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition">
                {feature.title}
              </h3>
              <p className="text-gray-500 mt-2 text-sm">{feature.description}</p>
              <div className="mt-4 text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                {user ? 'Buka Sekarang →' : 'Login untuk Akses →'}
              </div>
            </Link>
          ))}
        </div>

        {!user && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
              <span className="text-4xl block mb-4">🔐</span>
              <h3 className="text-xl font-bold text-gray-800">Daftar Sekarang Gratis!</h3>
              <p className="text-gray-500 mt-2">
                Akses semua fitur DesaMart dengan mendaftar satu akun.
                Mulai dari marketplace, UMKM, koperasi, hingga layanan desa.
              </p>
              <button 
                onClick={() => document.getElementById('auth-modal').showModal()}
                className="btn-primary mt-6 inline-block"
              >
                🚀 Daftar Sekarang
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeatureCards;