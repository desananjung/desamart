import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const EnterpriseEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'UMKM',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    banner: ''
  });

  useEffect(() => {
    const fetchEnterprise = async () => {
      try {
        const res = await api.get('/enterprise');
        const enterprise = res.data.data;
        if (enterprise) {
          setForm({
            name: enterprise.name || '',
            description: enterprise.description || '',
            type: enterprise.type || 'UMKM',
            address: enterprise.address || '',
            phone: enterprise.phone || '',
            email: enterprise.email || '',
            website: enterprise.website || '',
            logo: enterprise.logo || '',
            banner: enterprise.banner || ''
          });
        }
      } catch (error) {
        console.error('Error fetching enterprise:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnterprise();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put('/enterprise/update', form);
      alert('✅ Enterprise berhasil diperbarui!');
      navigate('/enterprise');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memperbarui enterprise');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">✏️ Edit Enterprise</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Enterprise *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
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
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="input-field"
            >
              <option value="UMKM">UMKM</option>
              <option value="KOPERASI">Koperasi</option>
              <option value="TOKO">Toko</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="MANUFAKTUR">Manufaktur</option>
              <option value="JASA">Jasa</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary px-8 py-2.5"
          >
            {submitting ? 'Menyimpan...' : '💾 Simpan Perubahan'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/enterprise')}
            className="btn-secondary px-8 py-2.5"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnterpriseEdit;