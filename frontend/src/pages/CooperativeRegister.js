import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CooperativeRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'KUD',
    description: '',
    registrationNumber: '',
    establishmentDate: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    certificateUrl: '',
    logo: '',
    banner: ''
  });

  const types = ['KUD', 'KSP', 'KPRI', 'KOPKAR', 'LAINNYA'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi
      if (!form.name) {
        alert('Nama koperasi wajib diisi');
        setLoading(false);
        return;
      }
      if (!form.registrationNumber) {
        alert('Nomor registrasi wajib diisi');
        setLoading(false);
        return;
      }
      if (!form.establishmentDate) {
        alert('Tanggal pendirian wajib diisi');
        setLoading(false);
        return;
      }
      if (!form.address) {
        alert('Alamat koperasi wajib diisi');
        setLoading(false);
        return;
      }

      const res = await api.post('/koperasi/register', form);
      alert('✅ Koperasi berhasil didaftarkan! Silakan tunggu verifikasi dari admin.');
      navigate('/koperasi');
    } catch (error) {
      console.error('Error registering cooperative:', error);
      alert(error.response?.data?.message || 'Gagal registrasi koperasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📝 Daftar Koperasi</h1>
        <p className="text-gray-500 mt-1">Daftarkan koperasi Anda untuk mengakses fitur koperasi digital</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Koperasi *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input-field"
            placeholder="Masukkan nama koperasi"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Koperasi *</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="input-field"
            required
          >
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input-field"
            rows="4"
            placeholder="Deskripsikan koperasi Anda..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Registrasi *</label>
            <input
              type="text"
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={handleChange}
              className="input-field"
              placeholder="Nomor registrasi koperasi"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Pendirian *</label>
            <input
              type="date"
              name="establishmentDate"
              value={form.establishmentDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat *</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="input-field"
            placeholder="Alamat lengkap koperasi"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="email@koperasi.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
          <input
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
            className="input-field"
            placeholder="https://koperasi.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Dokumen Pendukung</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Sertifikat (URL)</p>
              <input
                type="url"
                name="certificateUrl"
                value={form.certificateUrl}
                onChange={handleChange}
                className="input-field"
                placeholder="URL sertifikat"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Logo (URL)</p>
              <input
                type="url"
                name="logo"
                value={form.logo}
                onChange={handleChange}
                className="input-field"
                placeholder="URL logo"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Banner (URL)</p>
              <input
                type="url"
                name="banner"
                value={form.banner}
                onChange={handleChange}
                className="input-field"
                placeholder="URL banner"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            💡 Upload dokumen ke cloud storage dan masukkan URL-nya
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-lg"
        >
          {loading ? '📤 Mendaftar...' : '📝 Daftar Koperasi'}
        </button>
      </form>
    </div>
  );
};

export default CooperativeRegister;