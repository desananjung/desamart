import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { PlusIcon } from '@heroicons/react/24/outline';

const VillageInfo = () => {
  const { user } = useAuth();
  const [infos, setInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'BERITA',
    imageUrl: '',
    isPinned: false,
    isUrgent: false
  });

  useEffect(() => {
    const fetchInfos = async () => {
      try {
        const res = await api.get('/village/info');
        setInfos(res.data.data || []);
      } catch (error) {
        console.error('Error fetching village info:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/village/info', form);
      alert('✅ Informasi berhasil ditambahkan!');
      setShowForm(false);
      setForm({ title: '', content: '', category: 'BERITA', imageUrl: '', isPinned: false, isUrgent: false });
      const res = await api.get('/village/info');
      setInfos(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan informasi');
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📰 Informasi Desa</h1>
          <p className="text-gray-500">Berita dan pengumuman terbaru</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Info
          </button>
        )}
      </div>

      {/* Form Tambah Info - Hanya Admin */}
      {showForm && user?.role === 'ADMIN' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold mb-4">Tambah Informasi Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Judul"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              required
            />
            <textarea
              placeholder="Konten"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="input-field"
              rows="4"
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              <option value="BERITA">Berita</option>
              <option value="PENGUMUMAN">Pengumuman</option>
              <option value="INFO_PENTING">Info Penting</option>
            </select>
            <input
              type="url"
              placeholder="URL Gambar"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="input-field"
            />
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                />
                <span>Pin</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isUrgent}
                  onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
                />
                <span>Urgent</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* List Informasi */}
      <div className="space-y-4">
        {infos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Belum ada informasi</p>
          </div>
        ) : (
          infos.map(info => (
            <div key={info.id} className={`bg-white rounded-2xl shadow-sm border p-6 ${
              info.isUrgent ? 'border-red-300 bg-red-50' :
              info.isPinned ? 'border-yellow-300 bg-yellow-50' :
              'border-gray-100'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {info.isUrgent && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">URGENT</span>
                    )}
                    {info.isPinned && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">PINNED</span>
                    )}
                    <span className="text-xs text-gray-500">{info.category}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(info.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{info.title}</h3>
                  <p className="text-gray-700 mt-2">{info.content}</p>
                  <p className="text-sm text-gray-500 mt-2">👤 {info.author?.name}</p>
                </div>
                {info.imageUrl && (
                  <img src={info.imageUrl} alt={info.title} className="w-32 h-32 object-cover rounded-lg ml-4" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VillageInfo;