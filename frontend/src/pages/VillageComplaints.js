import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const VillageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'LAINNYA',
    location: '',
    imageUrl: ''
  });

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/village/complaints');
        setComplaints(res.data.data || []);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/village/complaints', form);
      alert('✅ Pengaduan berhasil dikirim!');
      setShowForm(false);
      setForm({ title: '', description: '', category: 'LAINNYA', location: '', imageUrl: '' });
      const res = await api.get('/village/complaints');
      setComplaints(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengirim pengaduan');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      RESOLVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold">📢 Pengaduan Masyarakat</h1>
          <p className="text-gray-500">Laporkan masalah di desa</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Buat Pengaduan</span>
        </button>
      </div>

      {/* Form Pengaduan */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold mb-4">Form Pengaduan</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Judul Pengaduan"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field"
              required
            />
            <textarea
              placeholder="Deskripsi"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
              rows="4"
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              <option value="INFRASTRUKTUR">Infrastruktur</option>
              <option value="LINGKUNGAN">Lingkungan</option>
              <option value="PELAYANAN">Pelayanan</option>
              <option value="SOSIAL">Sosial</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
            <input
              type="text"
              placeholder="Lokasi"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input-field"
            />
            <input
              type="url"
              placeholder="URL Gambar (opsional)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="input-field"
            />
            <div className="flex space-x-2">
              <button type="submit" className="btn-primary">Kirim</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* List Pengaduan */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Belum ada pengaduan</p>
          </div>
        ) : (
          complaints.map(complaint => (
            <div key={complaint.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className="text-xs text-gray-500">{complaint.category}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(complaint.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{complaint.title}</h3>
                  <p className="text-gray-700 mt-2">{complaint.description}</p>
                  {complaint.location && (
                    <p className="text-sm text-gray-500 mt-1">📍 {complaint.location}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">👤 {complaint.reporter?.name}</p>
                </div>
                {complaint.imageUrl && (
                  <img src={complaint.imageUrl} alt={complaint.title} className="w-32 h-32 object-cover rounded-lg ml-4" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VillageComplaints;