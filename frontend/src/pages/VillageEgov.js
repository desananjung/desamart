import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  HomeIcon,
  DocumentIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const VillageEgov = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [egovServices, setEgovServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'PELAYANAN',
    requirements: '',
    fee: '',
    processingTime: '',
    contact: ''
  });

  useEffect(() => {
    const fetchEgov = async () => {
      try {
        // Untuk demo, kita gunakan data statis dulu
        // Nanti bisa diintegrasikan dengan database
        setEgovServices([
          {
            id: 1,
            title: 'Pembuatan KTP',
            description: 'Pembuatan Kartu Tanda Penduduk baru',
            category: 'KEPENDUDUKAN',
            requirements: 'KK, Surat Pengantar RT/RW, Pas photo',
            fee: 0,
            processingTime: '3-5 hari kerja',
            contact: '08123456789',
            status: 'ACTIVE'
          },
          {
            id: 2,
            title: 'Pembuatan KK',
            description: 'Kartu Keluarga baru',
            category: 'KEPENDUDUKAN',
            requirements: 'KTP, Surat Nikah, Akta Kelahiran',
            fee: 0,
            processingTime: '3-5 hari kerja',
            contact: '08123456789',
            status: 'ACTIVE'
          },
          {
            id: 3,
            title: 'Surat Keterangan Usaha',
            description: 'Surat keterangan untuk usaha',
            category: 'SURAT',
            requirements: 'KTP, Nama Usaha, Alamat Usaha',
            fee: 5000,
            processingTime: '1-2 hari kerja',
            contact: '08123456789',
            status: 'ACTIVE'
          },
          {
            id: 4,
            title: 'Layanan Pengaduan Online',
            description: 'Sistem pengaduan masyarakat desa',
            category: 'PELAYANAN',
            requirements: 'KTP, Deskripsi pengaduan',
            fee: 0,
            processingTime: '7 hari kerja',
            contact: '08123456789',
            status: 'ACTIVE'
          }
        ]);
      } catch (error) {
        console.error('Error fetching egov services:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEgov();
  }, []);

  const getCategoryBadge = (category) => {
    const styles = {
      'KEPENDUDUKAN': 'bg-blue-100 text-blue-700',
      'SURAT': 'bg-green-100 text-green-700',
      'PELAYANAN': 'bg-purple-100 text-purple-700',
      'PUBLIK': 'bg-orange-100 text-orange-700'
    };
    return styles[category] || 'bg-gray-100 text-gray-700';
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
          <h1 className="text-2xl font-bold">🏛️ E-Government Desa</h1>
          <p className="text-gray-500">Layanan pemerintah desa digital</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Tambah Layanan
          </button>
        )}
      </div>

      {/* Form Tambah Layanan */}
      {showForm && user?.role === 'ADMIN' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold mb-4">📝 Tambah Layanan E-Government</h3>
          <form onSubmit={(e) => { e.preventDefault(); alert('Fitur sedang dikembangkan'); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Layanan *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field"
                >
                  <option value="KEPENDUDUKAN">Kependudukan</option>
                  <option value="SURAT">Surat</option>
                  <option value="PELAYANAN">Pelayanan</option>
                  <option value="PUBLIK">Publik</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biaya</label>
                <input
                  type="number"
                  value={form.fee}
                  onChange={(e) => setForm({ ...form, fee: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Persyaratan</label>
              <textarea
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                className="input-field"
                rows="2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Proses</label>
                <input
                  type="text"
                  value={form.processingTime}
                  onChange={(e) => setForm({ ...form, processingTime: e.target.value })}
                  className="input-field"
                  placeholder="3-5 hari kerja"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kontak</label>
                <input
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="input-field"
                  placeholder="08123456789"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* List Layanan E-Government */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {egovServices.map(service => (
          <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold">{service.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadge(service.category)}`}>
                    {service.category}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                service.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {service.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 mt-2">{service.description}</p>

            <div className="mt-3 space-y-1 text-sm text-gray-500">
              <p>📋 Persyaratan: {service.requirements}</p>
              <p>💰 Biaya: {service.fee > 0 ? `Rp${service.fee.toLocaleString()}` : 'Gratis'}</p>
              <p>⏱️ Proses: {service.processingTime}</p>
              <p>📞 Kontak: {service.contact}</p>
            </div>

            <button className="mt-4 btn-primary text-sm py-1.5 px-4">
              Ajukan Layanan
            </button>
          </div>
        ))}
      </div>

      {/* Quick Access */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/village/documents" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:shadow-lg transition">
          <DocumentIcon className="w-8 h-8 mb-2" />
          <p className="font-semibold">Dokumen</p>
          <p className="text-xs text-blue-100">Pengurusan surat</p>
        </Link>
        <Link to="/village/complaints" className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-xl hover:shadow-lg transition">
          <ChatBubbleLeftRightIcon className="w-8 h-8 mb-2" />
          <p className="font-semibold">Pengaduan</p>
          <p className="text-xs text-red-100">Laporan warga</p>
        </Link>
        <Link to="/village/events" className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl hover:shadow-lg transition">
          <CalendarIcon className="w-8 h-8 mb-2" />
          <p className="font-semibold">Kegiatan</p>
          <p className="text-xs text-green-100">Jadwal desa</p>
        </Link>
        <Link to="/village/info" className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:shadow-lg transition">
          <HomeIcon className="w-8 h-8 mb-2" />
          <p className="font-semibold">Info Desa</p>
          <p className="text-xs text-purple-100">Berita terbaru</p>
        </Link>
      </div>
    </div>
  );
};

export default VillageEgov;