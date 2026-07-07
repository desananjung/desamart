import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CalendarIcon,
  UserIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  ClockIcon  // ← TAMBAHKAN INI
} from '@heroicons/react/24/outline';

const Blog = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const blogPosts = [
    {
      id: 1,
      title: '5 Strategi Jitu Meningkatkan Penjualan UMKM di Era Digital',
      excerpt: 'Pelajari strategi efektif untuk mengembangkan bisnis UMKM Anda di era digital dengan memanfaatkan teknologi dan marketplace.',
      content: '...',
      date: '2026-07-03',
      category: 'UMKM',
      author: 'Tim DesaMart',
      authorAvatar: '👨‍💼',
      readTime: '5 menit',
      views: 1200,
      likes: 45,
      comments: 12,
      image: 'https://via.placeholder.com/800x400?text=UMKM+Digital',
      tags: ['UMKM', 'Digital', 'Tips']
    },
    {
      id: 2,
      title: 'Panduan Lengkap Membuat Aplikasi Desa Digital',
      excerpt: 'Tutorial step-by-step membangun aplikasi desa digital yang terintegrasi dengan berbagai layanan masyarakat.',
      content: '...',
      date: '2026-06-28',
      category: 'Teknologi',
      author: 'Tim Pengembang',
      authorAvatar: '👨‍💻',
      readTime: '10 menit',
      views: 850,
      likes: 32,
      comments: 8,
      image: 'https://via.placeholder.com/800x400?text=Aplikasi+Desa',
      tags: ['Teknologi', 'Tutorial', 'Desa Digital']
    },
    {
      id: 3,
      title: 'Koperasi Digital: Masa Depan Keuangan Desa',
      excerpt: 'Bagaimana koperasi digital dapat mengubah lanskap keuangan di pedesaan dan memberdayakan ekonomi lokal.',
      content: '...',
      date: '2026-06-20',
      category: 'Keuangan',
      author: 'Tim Koperasi',
      authorAvatar: '👩‍💼',
      readTime: '7 menit',
      views: 950,
      likes: 38,
      comments: 15,
      image: 'https://via.placeholder.com/800x400?text=Koperasi+Digital',
      tags: ['Koperasi', 'Keuangan', 'Desa']
    },
    {
      id: 4,
      title: 'Pertanian Modern: Teknologi untuk Petani Desa',
      excerpt: 'Inovasi teknologi pertanian yang membantu petani desa meningkatkan produktivitas dan hasil panen.',
      content: '...',
      date: '2026-06-15',
      category: 'Pertanian',
      author: 'Tim Pertanian',
      authorAvatar: '👨‍🌾',
      readTime: '6 menit',
      views: 1100,
      likes: 56,
      comments: 20,
      image: 'https://via.placeholder.com/800x400?text=Pertanian+Modern',
      tags: ['Pertanian', 'Teknologi', 'Petani']
    },
    {
      id: 5,
      title: 'Tips Sukses Berjualan di Marketplace Desa',
      excerpt: 'Strategi dan tips untuk sukses menjual produk di marketplace desa agar laris manis.',
      content: '...',
      date: '2026-06-10',
      category: 'Bisnis',
      author: 'Tim Marketplace',
      authorAvatar: '👩‍💻',
      readTime: '4 menit',
      views: 780,
      likes: 28,
      comments: 9,
      image: 'https://via.placeholder.com/800x400?text=Marketplace',
      tags: ['Marketplace', 'Tips', 'Bisnis']
    }
  ];

  const categories = ['Semua', 'UMKM', 'Teknologi', 'Keuangan', 'Pertanian', 'Bisnis'];

  const filteredPosts = blogPosts.filter(post => {
    const matchCategory = selectedCategory === 'Semua' || post.category === selectedCategory;
    const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
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
          <h1 className="text-3xl md:text-5xl font-bold mb-4">📝 Blog DesaMart</h1>
          <p className="text-lg md:text-xl text-white/90">
            Artikel, tips, dan inspirasi untuk membangun desa digital
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              📝 {blogPosts.length} Artikel
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              👥 5.000+ Pembaca
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              ⭐ 4.8 Rating
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari artikel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Blog Posts */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold">Tidak Ada Artikel</h3>
          <p className="text-gray-500 mt-2">Coba filter atau cari kata kunci lain</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
              {post.image && (
                <div className="h-48 bg-gray-100 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/800x400?text=Blog+DesaMart';
                    }}
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {new Date(post.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-xl font-bold hover:text-primary transition">
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="text-gray-600 mt-2 line-clamp-2">{post.excerpt}</p>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="text-lg">{post.authorAvatar}</span>
                    {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    {post.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <HeartIcon className="w-4 h-4" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    {post.comments}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex gap-3">
                  <Link 
                    to={`/blog/${post.id}`} 
                    className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    Baca Selengkapnya <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Newsletter */}
      <div className="mt-12 bg-gray-50 rounded-2xl p-8 border border-gray-200 text-center">
        <h3 className="text-2xl font-bold mb-2">📬 Berlangganan Newsletter</h3>
        <p className="text-gray-600 mb-4">
          Dapatkan artikel terbaru langsung ke email Anda
        </p>
        <div className="flex flex-wrap gap-3 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Masukkan email Anda"
            className="input-field flex-1 min-w-[200px]"
          />
          <button className="btn-primary">
            Berlangganan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blog;