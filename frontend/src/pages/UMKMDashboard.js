import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  StoreIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  TagIcon,
  MegaphoneIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const UMKMDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [umkmStatus, setUmkmStatus] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    rating: 0,
    pendingOrders: 0
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cek status UMKM
        const statusRes = await api.get('/umkm/status').catch(() => ({ data: { data: null } }));
        setUmkmStatus(statusRes.data?.data || null);

        // Jika sudah terverifikasi, ambil data lainnya
        if (statusRes.data?.data?.isVerified) {
          const [statsRes, stockRes] = await Promise.all([
            api.get('/seller/stats'),
            api.get('/umkm/products/low-stock?threshold=10')
          ]);
          setStats(statsRes.data.data || {});
          setLowStockProducts(stockRes.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching UMKM data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition">
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

  // Jika UMKM belum terdaftar
  if (!umkmStatus) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <span className="text-6xl block mb-4">🏪</span>
        <h1 className="text-3xl font-bold text-gray-800">Daftar sebagai UMKM</h1>
        <p className="text-gray-500 mt-2">
          Dapatkan akses ke fitur khusus UMKM di DesaMart
        </p>
        <Link to="/umkm/register" className="btn-primary inline-block mt-6">
          📝 Daftar UMKM Sekarang
        </Link>
      </div>
    );
  }

  // Jika UMKM pending verifikasi
  if (umkmStatus.status === 'PENDING') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <span className="text-6xl block mb-4">⏳</span>
        <h1 className="text-3xl font-bold text-gray-800">Menunggu Verifikasi</h1>
        <p className="text-gray-500 mt-2">
          Data UMKM Anda sedang dalam proses verifikasi oleh tim kami.
          Mohon tunggu 1-3 hari kerja.
        </p>
        <div className="mt-6 bg-gray-50 rounded-xl p-6 text-left">
          <p className="font-semibold">📋 Data yang dikirim:</p>
          <ul className="mt-2 text-sm text-gray-600 space-y-1">
            <li>🏪 Nama: {umkmStatus.name}</li>
            <li>📧 Email: {umkmStatus.email}</li>
            <li>📞 Telepon: {umkmStatus.phone}</li>
            <li>📍 Alamat: {umkmStatus.address}</li>
          </ul>
        </div>
      </div>
    );
  }

  // Jika UMKM terverifikasi
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏪 Dashboard UMKM</h1>
            <p className="text-gray-500 mt-1">
              Selamat datang, <span className="font-semibold text-gray-700">{user?.name}</span>
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/products/new" className="btn-primary text-sm">
              + Tambah Produk
            </Link>
          </div>
        </div>

        {/* Status UMKM */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-900">UMKM Terverifikasi</p>
              <p className="text-sm text-green-700">Toko Anda sudah terverifikasi sebagai UMKM</p>
            </div>
          </div>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            ✅ Verified
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={ShoppingBagIcon}
          label="Total Produk"
          value={stats.totalProducts || 0}
          bgColor="bg-blue-50"
          color="text-blue-500"
        />
        <StatCard
          icon={ChartBarIcon}
          label="Total Pesanan"
          value={stats.totalOrders || 0}
          bgColor="bg-purple-50"
          color="text-purple-500"
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label="Pendapatan"
          value={`Rp${(stats.totalRevenue || 0).toLocaleString()}`}
          bgColor="bg-green-50"
          color="text-green-500"
        />
        <StatCard
          icon={UsersIcon}
          label="Pelanggan"
          value={stats.totalCustomers || 0}
          bgColor="bg-yellow-50"
          color="text-yellow-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/products" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-blue-100 transition">
            <span className="text-2xl">📦</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-2">Kelola Produk</h4>
          <p className="text-xs text-gray-500">Tambah, edit, hapus</p>
        </Link>

        <Link to="/umkm/promotions" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group text-center">
          <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-pink-100 transition">
            <span className="text-2xl">🏷️</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-2">Promosi</h4>
          <p className="text-xs text-gray-500">Flash sale, diskon</p>
        </Link>

        <Link to="/umkm/financial" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group text-center">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-green-100 transition">
            <span className="text-2xl">💰</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-2">Keuangan</h4>
          <p className="text-xs text-gray-500">Catatan & laporan</p>
        </Link>

        <Link to="/umkm/community" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group text-center">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-orange-100 transition">
            <span className="text-2xl">💬</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-2">Komunitas</h4>
          <p className="text-xs text-gray-500">Diskusi UMKM</p>
        </Link>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-red-800">⚠️ Stok Menipis</h3>
            <Link to="/products" className="text-sm text-red-600 hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.map(product => (
              <span key={product.id} className="bg-white px-3 py-1 rounded-lg text-sm shadow-sm">
                {product.name} ({product.stock} tersisa)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UMKMDashboard;