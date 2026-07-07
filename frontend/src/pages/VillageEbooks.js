import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  BookOpenIcon, 
  PlusIcon, 
  UserIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const VillageEbooks = () => {
  const { user } = useAuth();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    author: '',
    price: '',
    fileUrl: '',
    coverUrl: '',
    category: 'PANDUAN'
  });

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        const res = await api.get('/village-services/ebooks');
        setEbooks(res.data.data || []);
      } catch (error) {
        console.error('Error fetching ebooks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEbooks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/village-services/ebooks', form);
      alert('✅ Ebook berhasil ditambahkan!');
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        author: '',
        price: '',
        fileUrl: '',
        coverUrl: '',
        category: 'PANDUAN'
      });
      const res = await api.get('/village-services/ebooks');
      setEbooks(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan ebook');
    }
  };

  const categories = [
    { value: 'PANDUAN', label: '📖 Panduan' },
    { value: 'RESEP', label: '🍳 Resep' },
    { value: 'KERAJINAN', label: '🎨 Kerajinan' },
    { value: 'PERTANIAN', label: '🌾 Pertanian' },
    { value: 'LAINNYA', label: '📚 Lainnya' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📚 Ebook Desa</h1>
          <p className="text-gray-500">Kumpulan ebook panduan dan resep</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Ebook
          </button>
        )}
      </div>

      {/* Form Tambah Ebook */}
      {showForm && user?.role === 'ADMIN' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">📝 Tambah Ebook</h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder="Masukkan judul ebook"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
                rows="3"
                placeholder="Deskripsi ebook..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penulis</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="input-field"
                  placeholder="Nama penulis"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL File *</label>
              <input
                type="url"
                value={form.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                className="input-field"
                placeholder="https://drive.google.com/file/xxx"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Upload file ke cloud storage dan paste URL-nya
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Cover</label>
              <input
                type="url"
                value={form.coverUrl}
                onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                className="input-field"
                placeholder="https://example.com/cover.jpg"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* List Ebook */}
      {ebooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <BookOpenIcon className="w-20 h-20 text-gray-300 mx-auto" />
          <h3 className="text-xl font-semibold mt-4">Belum Ada Ebook</h3>
          <p className="text-gray-500 mt-2">Tambahkan ebook desa pertama</p>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary mt-4 inline-block"
            >
              Tambah Ebook
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ebooks.map(ebook => (
            <div key={ebook.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              {/* Cover */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {ebook.coverUrl ? (
                  <img 
                    src={ebook.coverUrl} 
                    alt={ebook.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x200?text=Ebook';
                    }}
                  />
                ) : (
                  <BookOpenIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold">{ebook.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{ebook.description}</p>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {ebook.category}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    <span>{ebook.author || 'DesaMart'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{ebook.downloads || 0} unduhan</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="font-bold text-primary">
                    {ebook.price > 0 ? `Rp${ebook.price.toLocaleString()}` : 'Gratis'}
                  </p>
                  <a
                    href={ebook.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-sm py-1.5 px-4 flex items-center gap-1"
                  >
                    <span>📥</span>
                    Unduh
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VillageEbooks;