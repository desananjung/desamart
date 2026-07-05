import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  BuildingOfficeIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const Enterprise = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enterprise, setEnterprise] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
  const [submitting, setSubmitting] = useState(false);

   useEffect(() => {
    const fetchEnterprise = async () => {
      try {
        const [enterpriseRes, statsRes] = await Promise.all([
          api.get('/enterprise'),
          api.get('/enterprise/stats')
        ]);
        setEnterprise(enterpriseRes.data.data);
        setStats(statsRes.data.data);
      } catch (error) {
        console.error('Error fetching enterprise:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnterprise();
  }, []);
  const handleCreateEnterprise = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/enterprise/create', form);
      alert('✅ Enterprise berhasil dibuat!');
      setShowForm(false);
      // Refresh
      const [enterpriseRes, statsRes] = await Promise.all([
        api.get('/enterprise'),
        api.get('/enterprise/stats')
      ]);
      setEnterprise(enterpriseRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membuat enterprise');
    } finally {
      setSubmitting(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Jika belum punya enterprise
  if (!enterprise) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-12">
          <span className="text-6xl block mb-4">🏢</span>
          <h1 className="text-3xl font-bold text-gray-800">Enterprise Dashboard</h1>
          <p className="text-gray-500 mt-2">Daftarkan bisnis Anda untuk mengakses fitur enterprise</p>
        </div>

        {!showForm ? (
          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-lg px-8 py-3"
            >
              📝 Buat Enterprise
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateEnterprise} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-xl font-bold mb-4">📝 Buat Enterprise</h2>
            
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe *</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Telepon *</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat *</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-field"
                required
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo</label>
                <input
                  type="url"
                  value={form.logo}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Banner</label>
                <input
                  type="url"
                  value={form.banner}
                  onChange={(e) => setForm({ ...form, banner: e.target.value })}
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
                {submitting ? 'Membuat...' : '💾 Buat Enterprise'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary px-8 py-2.5"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // Jika sudah punya enterprise
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏢 {enterprise.name}</h1>
            <p className="text-gray-500 mt-1">
              {enterprise.type} • {enterprise.status}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/enterprise/members" className="btn-secondary text-sm">
              <UserPlusIcon className="w-4 h-4 inline mr-1" />
              Anggota
            </Link>
            <Link to="/enterprise/edit" className="btn-primary text-sm">
              ⚙️ Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={UsersIcon}
          label="Anggota"
          value={stats?.stats?.totalMembers || 0}
          bgColor="bg-blue-50"
          color="text-blue-500"
        />
        <StatCard
          icon={BuildingOfficeIcon}
          label="Toko"
          value={stats?.stats?.totalStores || 0}
          bgColor="bg-purple-50"
          color="text-purple-500"
        />
        <StatCard
          icon={ShoppingBagIcon}
          label="Produk"
          value={stats?.stats?.totalProducts || 0}
          bgColor="bg-green-50"
          color="text-green-500"
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label="Pendapatan"
          value={`Rp${(stats?.stats?.totalRevenue || 0).toLocaleString()}`}
          bgColor="bg-primary/10"
          color="text-primary"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/enterprise/products" className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Kelola Produk</h4>
              <p className="text-sm text-gray-500">Tambah, edit, hapus</p>
            </div>
          </div>
        </Link>

        <Link to="/enterprise/stores" className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition">
              <span className="text-2xl">🏪</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Kelola Toko</h4>
              <p className="text-sm text-gray-500">Atur toko dalam enterprise</p>
            </div>
          </div>
        </Link>

        <Link to="/enterprise/orders" className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Kelola Pesanan</h4>
              <p className="text-sm text-gray-500">Lihat semua pesanan</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Informasi Enterprise */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4">📋 Informasi Enterprise</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nama</p>
            <p className="font-medium">{enterprise.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tipe</p>
            <p className="font-medium">{enterprise.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Alamat</p>
            <p className="font-medium">{enterprise.address}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Telepon</p>
            <p className="font-medium">{enterprise.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{enterprise.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Website</p>
            <p className="font-medium">{enterprise.website || '-'}</p>
          </div>
        </div>
        {enterprise.description && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Deskripsi</p>
            <p className="font-medium">{enterprise.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enterprise;