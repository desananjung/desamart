import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { HeartIcon, PlusIcon } from '@heroicons/react/24/outline';

const VillageDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    targetAmount: '',
    category: 'SOSIAL',
    startDate: '',
    endDate: '',
    imageUrl: ''
  });

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await api.get('/village/donations');
        setDonations(res.data.data || []);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/village/donations', form);
      alert('✅ Donasi berhasil dibuat!');
      setShowForm(false);
      setForm({ title: '', description: '', targetAmount: '', category: 'SOSIAL', startDate: '', endDate: '', imageUrl: '' });
      const res = await api.get('/village/donations');
      setDonations(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membuat donasi');
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
          <h1 className="text-2xl font-bold">❤️ Donasi & Bantuan</h1>
          <p className="text-gray-500">Bantu sesama warga desa</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Buat Donasi</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold mb-4">Form Donasi</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Judul Donasi"
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
              rows="3"
              required
            />
            <input
              type="number"
              placeholder="Target Donasi"
              value={form.targetAmount}
              onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              className="input-field"
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field"
            >
              <option value="BENCANA">Bencana</option>
              <option value="KESEHATAN">Kesehatan</option>
              <option value="PENDIDIKAN">Pendidikan</option>
              <option value="SOSIAL">Sosial</option>
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                placeholder="Tanggal Mulai"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="input-field"
                required
              />
              <input
                type="date"
                placeholder="Tanggal Selesai"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <input
              type="url"
              placeholder="URL Gambar"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="input-field"
            />
            <div className="flex space-x-2">
              <button type="submit" className="btn-primary">Buat Donasi</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {donations.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Belum ada donasi</p>
          </div>
        ) : (
          donations.map(donation => {
            const progress = donation.targetAmount > 0 
              ? (donation.collectedAmount / donation.targetAmount) * 100 
              : 0;
            return (
              <div key={donation.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-pink-50 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <HeartIcon className="w-8 h-8 text-pink-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-gray-500">{donation.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${donation.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {donation.isActive ? 'Aktif' : 'Selesai'}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{donation.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{donation.description}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Terkumpul: Rp{donation.collectedAmount?.toLocaleString()}</span>
                        <span className="text-gray-500">Target: Rp{donation.targetAmount?.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-pink-500 h-2 rounded-full transition-all" 
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      <p>📅 {new Date(donation.startDate).toLocaleDateString('id-ID')} - {new Date(donation.endDate).toLocaleDateString('id-ID')}</p>
                      <p>👤 {donation.organizer?.name}</p>
                    </div>
                    <button className="mt-3 btn-primary text-sm px-4 py-1.5">Donasi Sekarang</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VillageDonations;