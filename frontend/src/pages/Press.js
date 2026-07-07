import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  NewspaperIcon, 
  CalendarIcon, 
  UserIcon, 
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Press = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const pressReleases = [
    {
      id: 1,
      title: 'DesaMart Hadir sebagai Super App Desa Digital Pertama di Indonesia',
      summary: 'DesaMart meluncurkan platform terintegrasi untuk memajukan ekonomi desa melalui teknologi digital.',
      date: '2026-07-01',
      category: 'Peluncuran',
      image: 'https://via.placeholder.com/800x400?text=DesaMart+Launch',
      author: 'Tim DesaMart',
      views: 1500,
      likes: 89
    },
    {
      id: 2,
      title: 'UMKM Desa Naik Kelas dengan Marketplace Digital DesaMart',
      summary: 'Ribuan UMKM desa kini bisa menjual produknya secara online melalui platform DesaMart.',
      date: '2026-06-15',
      category: 'UMKM',
      image: 'https://via.placeholder.com/800x400?text=UMKM+Digital',
      author: 'Tim DesaMart',
      views: 2300,
      likes: 156
    },
    {
      id: 3,
      title: 'Koperasi Digital: Solusi Keuangan untuk Masyarakat Desa',
      summary: 'DesaMart menghadirkan fitur koperasi digital yang memudahkan simpan pinjam dan pengelolaan keuangan desa.',
      date: '2026-06-01',
      category: 'Keuangan',
      image: 'https://via.placeholder.com/800x400?text=Koperasi+Digital',
      author: 'Tim DesaMart',
      views: 1800,
      likes: 120
    },
    {
      id: 4,
      title: 'Pasar Tani Digital: Mempermudah Distribusi Hasil Pertanian',
      summary: 'Petani desa kini bisa menjual hasil panen langsung ke pembeli tanpa perantara dengan fitur Pasar Tani Digital.',
      date: '2026-05-20',
      category: 'Pertanian',
      image: 'https://via.placeholder.com/800x400?text=Pasar+Tani',
      author: 'Tim DesaMart',
      views: 2100,
      likes: 145
    },
    {
      id: 5,
      title: 'DesaMart Raih Penghargaan Inovasi Digital Terbaik 2026',
      summary: 'DesaMart dinobatkan sebagai inovasi digital terbaik dalam ajang Indonesia Digital Awards 2026.',
      date: '2026-05-10',
      category: 'Penghargaan',
      image: 'https://via.placeholder.com/800x400?text=Penghargaan',
      author: 'Tim DesaMart',
      views: 3500,
      likes: 230
    }
  ];

  const categories = ['Semua', 'Peluncuran', 'UMKM', 'Keuangan', 'Pertanian', 'Penghargaan'];
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPress = pressReleases.filter(item => {
    const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary to-red-500 rounded-3xl p-8 md:p-12 text-white mb-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">📰 Press & Media</h1>
          <p className="text-lg md:text-xl text-white/90">
            Berita terbaru dan liputan media tentang DesaMart
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              📰 {pressReleases.length} Artikel
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              👥 10.000+ Pembaca
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              🏆 5+ Penghargaan
            </span>
          </div>
        </div>
      </div>

      {/* Kontak Media */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold">📩 Hubungi Media</h3>
            <p className="text-sm text-gray-500">Untuk pertanyaan media dan press kit</p>
          </div>
          <div className="flex gap-3">
            <a href="mailto:press@desamart.com" className="btn-primary text-sm">
              📧 press@desamart.com
            </a>
            <button className="btn-secondary text-sm">
              📥 Download Press Kit
            </button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Cari berita..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>

      {/* Press Releases */}
      {filteredPress.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <NewspaperIcon className="w-20 h-20 text-gray-300 mx-auto" />
          <h3 className="text-xl font-semibold mt-4">Tidak Ada Berita</h3>
          <p className="text-gray-500 mt-2">Coba filter atau cari kata kunci lain</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPress.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="md:flex">
                {item.image && (
                  <div className="md:w-72 h-48 md:h-auto bg-gray-100 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=DesaMart+News';
                      }}
                    />
                  </div>
                )}
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold hover:text-primary transition">
                    <Link to={`/press/${item.id}`}>{item.title}</Link>
                  </h3>
                  <p className="text-gray-600 mt-2">{item.summary}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      {item.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      {item.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <HeartIcon className="w-4 h-4" />
                      {item.likes}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link 
                      to={`/press/${item.id}`} 
                      className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      Baca Selengkapnya <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                    <button className="text-gray-400 hover:text-primary text-sm flex items-center gap-1">
                      <ShareIcon className="w-4 h-4" />
                      Bagikan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Press;