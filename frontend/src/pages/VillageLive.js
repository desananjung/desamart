import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  VideoCameraIcon, 
  PlayIcon, 
  HeartIcon, 
  UserIcon,
  PlusIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const VillageLive = () => {
  const { user } = useAuth();
  const [lives, setLives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    streamUrl: '',
    thumbnail: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    const fetchLives = async () => {
      try {
        const res = await api.get('/village-services/live');
        setLives(res.data.data || []);
      } catch (error) {
        console.error('Error fetching live shopping:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLives();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/village-services/live', form);
      alert('✅ Live Shopping berhasil dibuat!');
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        streamUrl: '',
        thumbnail: '',
        startTime: '',
        endTime: ''
      });
      const res = await api.get('/village-services/live');
      setLives(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membuat live shopping');
    }
  };

  const getStatusBadge = (live) => {
    const now = new Date();
    const start = new Date(live.startTime);
    const end = new Date(live.endTime);
    
    if (now >= start && now <= end) return { label: '🟢 LIVE', color: 'bg-green-500' };
    if (now < start) return { label: '⏳ Akan Datang', color: 'bg-blue-500' };
    return { label: '🔴 Selesai', color: 'bg-gray-500' };
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
          <h1 className="text-2xl font-bold">🎥 Live Shopping Desa</h1>
          <p className="text-gray-500">Belanja live streaming dari desa</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'SELLER') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Buat Live
          </button>
        )}
      </div>

      {/* Form Buat Live */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold mb-4">📝 Buat Live Shopping</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Live *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder="Contoh: Live Jualan Hasil Panen"
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
                placeholder="Deskripsi live shopping..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Stream *</label>
              <input
                type="url"
                value={form.streamUrl}
                onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
                className="input-field"
                placeholder="https://youtube.com/live/xxx"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Gunakan URL YouTube Live atau platform streaming lainnya
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Thumbnail</label>
              <input
                type="url"
                value={form.thumbnail}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                className="input-field"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Jam Mulai *</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Jam Selesai *</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Buat Live</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* List Live Shopping */}
      {lives.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <VideoCameraIcon className="w-20 h-20 text-gray-300 mx-auto" />
          <h3 className="text-xl font-semibold mt-4">Belum Ada Live Shopping</h3>
          <p className="text-gray-500 mt-2">Mulai live shopping pertama Anda!</p>
          {(user?.role === 'ADMIN' || user?.role === 'SELLER') && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary mt-4 inline-block"
            >
              Buat Live
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lives.map((live) => {
            const status = getStatusBadge(live);
            return (
              <div key={live.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gray-200">
                  {live.thumbnail ? (
                    <img 
                      src={live.thumbnail} 
                      alt={live.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x200?text=Live+Shopping';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                      <VideoCameraIcon className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-medium ${status.color}`}>
                    {status.label}
                  </div>
                  <button className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition group">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                      <PlayIcon className="w-8 h-8 text-white" />
                    </div>
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{live.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{live.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <EyeIcon className="w-4 h-4" />
                      <span>{live.viewers || 0}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <UserIcon className="w-4 h-4" />
                      <span>{live.host?.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HeartIcon className="w-4 h-4" />
                      <span>{live.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{new Date(live.startTime).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>

                  {live.products?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">🛍️ {live.products.length} produk</p>
                    </div>
                  )}

                  {status.label === '🟢 LIVE' && (
                    <button className="mt-3 w-full btn-primary text-sm py-2">
                      Tonton Live →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VillageLive;