import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { PlusIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const VillageEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    category: 'KEGIATAN',
    imageUrl: '',
    organizer: '',
    contact: ''
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/village/events');
        setEvents(res.data.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/village/events', form);
      alert('✅ Kegiatan berhasil ditambahkan!');
      setShowForm(false);
      setForm({
        title: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
        category: 'KEGIATAN',
        imageUrl: '',
        organizer: '',
        contact: ''
      });
      const res = await api.get('/village/events');
      setEvents(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan kegiatan');
    }
  };

  const categories = [
    'RAPAT',
    'KEGIATAN',
    'PERAYAAN',
    'PELATIHAN',
    'OLAHRAGA',
    'SENI_BUDAYA',
    'LAINNYA'
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
          <h1 className="text-2xl font-bold">📅 Kegiatan Desa</h1>
          <p className="text-gray-500">Jadwal kegiatan warga</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'SELLER') && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Kegiatan
          </button>
        )}
      </div>

      {/* Form Tambah Kegiatan */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold mb-4">📝 Tambah Kegiatan Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Kegiatan *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder="Contoh: Gotong Royong"
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
                placeholder="Deskripsi kegiatan..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi *</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="input-field"
                placeholder="Contoh: Balai Desa"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai *</label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai *</label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/event.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penyelenggara</label>
                <input
                  type="text"
                  value={form.organizer}
                  onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                  className="input-field"
                  placeholder="Nama penyelenggara"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontak</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="input-field"
                  placeholder="Nomor telepon"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button type="submit" className="btn-primary">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* List Kegiatan */}
      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">📅</span>
          <h3 className="text-xl font-semibold">Belum Ada Kegiatan</h3>
          <p className="text-gray-500 mt-2">Tambahkan kegiatan desa pertama</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-start">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <CalendarIcon className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">{event.category?.replace('_', ' ')}</span>
                    {event.isFeatured && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">Featured</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                  <div className="mt-3 space-y-1 text-sm text-gray-500">
                    <p>📅 {new Date(event.startDate).toLocaleDateString('id-ID')} - {new Date(event.endDate).toLocaleDateString('id-ID')}</p>
                    <p>📍 {event.location}</p>
                    {event.organizer && <p>👤 {event.organizer}</p>}
                    {event.contact && <p>📞 {event.contact}</p>}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <UserGroupIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{event.participants?.length || 0} peserta</span>
                    <button className="ml-auto text-sm text-primary hover:underline">
                      Ikuti
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

export default VillageEvents;