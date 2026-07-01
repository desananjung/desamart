import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const StoreProfile = () => {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    logo: '',
    banner: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await api.get('/seller/store');
        const data = res.data.data;
        setStore(data);
        setForm({
          name: data.name || '',
          description: data.description || '',
          logo: data.logo || '',
          banner: data.banner || '',
          address: data.address || '',
          phone: data.phone || ''
        });
      } catch (error) {
        console.error('Error fetching store:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/seller/store', form);
      alert('✅ Profil toko berhasil diperbarui!');
    } catch (error) {
      alert('❌ Gagal memperbarui profil toko');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏪 Profil Toko</h1>
            <p className="text-gray-500 mt-1">Kelola informasi toko Anda</p>
          </div>
          <Link to="/seller" className="btn-secondary text-sm">
            ← Kembali
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview Banner */}
          {form.banner && (
            <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100">
              <img src={form.banner} alt="Banner" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Toko *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nomor Telepon
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="input-field"
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi Toko
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Ceritakan tentang toko Anda..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Alamat
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows="2"
              className="input-field"
              placeholder="Alamat lengkap toko Anda"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                URL Logo
              </label>
              <input
                type="url"
                name="logo"
                value={form.logo}
                onChange={handleChange}
                className="input-field"
                placeholder="https://example.com/logo.png"
              />
              {form.logo && (
                <img src={form.logo} alt="Logo" className="mt-2 w-20 h-20 object-cover rounded-lg" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                URL Banner
              </label>
              <input
                type="url"
                name="banner"
                value={form.banner}
                onChange={handleChange}
                className="input-field"
                placeholder="https://example.com/banner.png"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-8 py-3"
            >
              {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              🔄 Reset
            </button>
          </div>
        </form>
      </div>

      {/* Store Stats */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">📊 Statistik Toko</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{store?.products?.length || 0}</p>
            <p className="text-sm text-gray-500">Produk</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">0</p>
            <p className="text-sm text-gray-500">Pesanan</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">Rp0</p>
            <p className="text-sm text-gray-500">Pendapatan</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-500">⭐ 0</p>
            <p className="text-sm text-gray-500">Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreProfile;