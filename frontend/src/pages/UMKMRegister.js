import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UMKMRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'MAKANAN',
    subCategory: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    socialMedia: { instagram: '', facebook: '', tiktok: '' },
    businessLicense: '',
    idCard: '',
    photo: ''
  });

  // Redirect jika belum login
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/umkm/register', action: 'register-umkm' } });
    }
  }, [user, navigate]);

  const categories = [
    'MAKANAN', 'FASHION', 'KERAJINAN', 'PERTANIAN', 
    'MINUMAN', 'KOSMETIK', 'ELEKTRONIK', 'LAINNYA'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialMedia.')) {
      const platform = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, [platform]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!form.name) {
        setError('Nama UMKM wajib diisi');
        setLoading(false);
        return;
      }
      if (!form.address) {
        setError('Alamat UMKM wajib diisi');
        setLoading(false);
        return;
      }
      if (!form.phone) {
        setError('Nomor telepon wajib diisi');
        setLoading(false);
        return;
      }

      const payload = {
        ...form,
        socialMedia: JSON.stringify(form.socialMedia)
      };

      const res = await api.post('/umkm/register', payload);
      alert('✅ Registrasi UMKM berhasil! Silakan tunggu verifikasi dari admin.');
      navigate('/umkm');
    } catch (error) {
      console.error('Error registering UMKM:', error);
      setError(error.response?.data?.message || 'Gagal registrasi UMKM. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Jika belum login, tampilkan loading
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📝 Daftar UMKM</h1>
        <p className="text-gray-500 mt-1">Daftarkan usaha Anda untuk mendapatkan akses fitur UMKM</p>
        <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg inline-block">
          ✅ Login sebagai: {user?.name} ({user?.email})
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama UMKM *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input-field"
            placeholder="Masukkan nama usaha Anda"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori UMKM *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input-field"
            required
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Sub Kategori</label>
          <input
            type="text"
            name="subCategory"
            value={form.subCategory}
            onChange={handleChange}
            className="input-field"
            placeholder="Contoh: Makanan Ringan, Batik, Keramik, dll"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input-field"
            rows="4"
            placeholder="Ceritakan tentang usaha Anda..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat *</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="input-field"
              placeholder="Alamat lengkap"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Telepon *</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="08xx-xxxx-xxxx"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="email@usaha.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              className="input-field"
              placeholder="https://usaha.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Media Sosial</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              name="socialMedia.instagram"
              value={form.socialMedia.instagram}
              onChange={handleChange}
              className="input-field"
              placeholder="📸 @instagram"
            />
            <input
              type="text"
              name="socialMedia.facebook"
              value={form.socialMedia.facebook}
              onChange={handleChange}
              className="input-field"
              placeholder="📘 /facebook"
            />
            <input
              type="text"
              name="socialMedia.tiktok"
              value={form.socialMedia.tiktok}
              onChange={handleChange}
              className="input-field"
              placeholder="🎵 @tiktok"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Dokumen Pendukung</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Izin Usaha (URL)</p>
              <input
                type="url"
                name="businessLicense"
                value={form.businessLicense}
                onChange={handleChange}
                className="input-field"
                placeholder="URL izin usaha"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">KTP (URL)</p>
              <input
                type="url"
                name="idCard"
                value={form.idCard}
                onChange={handleChange}
                className="input-field"
                placeholder="URL foto KTP"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Foto Toko (URL)</p>
              <input
                type="url"
                name="photo"
                value={form.photo}
                onChange={handleChange}
                className="input-field"
                placeholder="URL foto toko"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            💡 Upload dokumen ke cloud storage (Google Drive, imgur, dll) dan masukkan URL-nya
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 py-3 text-lg"
          >
            {loading ? '📤 Mendaftar...' : '📝 Daftar UMKM'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/umkm')}
            className="btn-secondary px-6"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default UMKMRegister;