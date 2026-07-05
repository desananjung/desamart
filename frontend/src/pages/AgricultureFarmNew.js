import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AgricultureFarmNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    location: '',
    area: '',
    description: '',
    imageUrl: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      alert('Nama lahan wajib diisi');
      return;
    }
    if (!form.location.trim()) {
      alert('Lokasi lahan wajib diisi');
      return;
    }
    if (!form.area || parseFloat(form.area) <= 0) {
      alert('Luas lahan harus lebih dari 0');
      return;
    }

    setLoading(true);
    try {
      await api.post('/agriculture/farms', form);
      alert('✅ Lahan berhasil ditambahkan!');
      navigate('/agriculture/farms');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan lahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/agriculture/farms')}
          className="text-gray-500 hover:text-primary"
        >
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold">🌱 Tambah Lahan</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lahan *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="Contoh: Sawah Padi"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi *</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input-field"
            placeholder="Contoh: Desa Sukamaju, Kecamatan..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Luas Lahan (Ha) *</label>
          <input
            type="number"
            step="0.01"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            className="input-field"
            placeholder="0.5"
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
            placeholder="Deskripsikan lahan Anda..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
          <input
            type="url"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="input-field"
            placeholder="https://example.com/farm.jpg"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-2.5"
          >
            {loading ? 'Menyimpan...' : '💾 Simpan Lahan'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/agriculture/farms')}
            className="btn-secondary px-8 py-2.5"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgricultureFarmNew;