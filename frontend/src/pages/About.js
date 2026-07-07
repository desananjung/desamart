import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const About = () => {
  const { user } = useAuth();

  const teamMembers = [
    { name: 'Desa Nanjung', role: 'Founder & CEO', avatar: '🌾' },
    { name: 'Tim Pengembang', role: 'Full Stack Developer', avatar: '💻' },
    { name: 'Tim Desa', role: 'Community Manager', avatar: '🏘️' },
    { name: 'Tim UMKM', role: 'Business Development', avatar: '🏪' }
  ];

  const features = [
    { icon: '🛒', title: 'Marketplace', desc: 'Jual beli produk dari seluruh desa' },
    { icon: '🏪', title: 'UMKM Digital', desc: 'Platform untuk usaha mikro dan kecil' },
    { icon: '🏛️', title: 'Koperasi Digital', desc: 'Simpan pinjam dan manajemen koperasi' },
    { icon: '🏘️', title: 'Layanan Desa', desc: 'Informasi dan layanan masyarakat desa' },
    { icon: '🏢', title: 'Enterprise', desc: 'Manajemen bisnis terintegrasi' },
    { icon: '🌾', title: 'Pasar Tani', desc: 'Jual beli hasil pertanian' },
    { icon: '📚', title: 'Ebook Desa', desc: 'Panduan dan resep desa' },
    { icon: '🚚', title: 'Kurir Desa', desc: 'Layanan antar-jemput barang' }
  ];

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-red-500 rounded-3xl p-8 md:p-12 text-white mb-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">🌾 Tentang DesaMart</h1>
          <p className="text-lg md:text-xl text-white/90">
            Super App Desa Digital yang menghubungkan seluruh ekosistem desa 
            dalam satu platform terintegrasi.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              🚀 10.000+ Pengguna
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              🏪 500+ UMKM
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              🌾 100+ Desa
            </span>
          </div>
        </div>
      </div>

      {/* Visi Misi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold mb-3">🎯 Visi</h3>
          <p className="text-gray-600">
            Menjadi ekosistem digital terdepan yang menggerakkan ekonomi desa 
            dan memberdayakan masyarakat pedesaan secara mandiri dan berkelanjutan.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold mb-3">🚀 Misi</h3>
          <ul className="space-y-2 text-gray-600">
            <li>✅ Menyediakan platform marketplace yang mudah dan aman</li>
            <li>✅ Memberdayakan UMKM desa melalui teknologi digital</li>
            <li>✅ Menghubungkan seluruh layanan desa dalam satu aplikasi</li>
            <li>✅ Mendorong pertumbuhan ekonomi desa secara berkelanjutan</li>
          </ul>
        </div>
      </div>

      {/* Fitur */}
      <h2 className="text-2xl font-bold mb-6">✨ Fitur Unggulan</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {features.map((feature, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition">
            <div className="text-3xl mb-2">{feature.icon}</div>
            <h4 className="font-semibold text-sm">{feature.title}</h4>
            <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Tim */}
      <h2 className="text-2xl font-bold mb-6">👥 Tim Kami</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {teamMembers.map((member, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md transition">
            <div className="text-4xl mb-2">{member.avatar}</div>
            <h4 className="font-semibold">{member.name}</h4>
            <p className="text-xs text-gray-500">{member.role}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
        <h3 className="text-2xl font-bold mb-2">Bergabung dengan DesaMart</h3>
        <p className="text-gray-600 mb-4">
          Mulai perjalanan digital desa Anda sekarang juga!
        </p>
        {user ? (
          <Link to="/dashboard" className="btn-primary inline-block">
            🚀 Buka Dashboard
          </Link>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/register" className="btn-primary inline-block">
              📝 Daftar Sekarang
            </Link>
            <Link to="/login" className="btn-secondary inline-block">
              🔑 Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;