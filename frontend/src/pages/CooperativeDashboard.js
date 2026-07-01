import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  MegaphoneIcon,
  CalendarIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const CooperativeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cooperative, setCooperative] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeLoans: 0,
    totalSavings: 0,
    totalRevenue: 0,
    pendingApplications: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cek status koperasi
        const statusRes = await api.get('/koperasi/status');
        setCooperative(statusRes.data.data);

        if (statusRes.data.data) {
          // Ambil data dashboard
          const statsRes = await api.get('/koperasi/dashboard', {
            params: { cooperativeId: statusRes.data.data.id }
          });
          setStats(statsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching cooperative data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, bgColor, subtitle }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
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

  // Jika belum mendaftar koperasi
  if (!cooperative) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <span className="text-6xl block mb-4">🏛️</span>
        <h1 className="text-3xl font-bold text-gray-800">Koperasi Digital</h1>
        <p className="text-gray-500 mt-2">
          Daftarkan koperasi Anda untuk mulai menggunakan fitur koperasi digital
        </p>
        <Link to="/koperasi/register" className="btn-primary inline-block mt-6">
          📝 Daftar Koperasi
        </Link>
      </div>
    );
  }

  // Jika pending verifikasi
  if (cooperative.status === 'PENDING') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <span className="text-6xl block mb-4">⏳</span>
        <h1 className="text-3xl font-bold text-gray-800">Menunggu Verifikasi</h1>
        <p className="text-gray-500 mt-2">
          Koperasi Anda sedang dalam proses verifikasi oleh admin.
          Mohon tunggu 1-3 hari kerja.
        </p>
        <div className="mt-6 bg-gray-50 rounded-xl p-6 text-left">
          <p className="font-semibold">📋 Data Koperasi:</p>
          <ul className="mt-2 text-sm text-gray-600 space-y-1">
            <li>🏛️ Nama: {cooperative.name}</li>
            <li>📧 Email: {cooperative.email}</li>
            <li>📞 Telepon: {cooperative.phone}</li>
            <li>📍 Alamat: {cooperative.address}</li>
            <li>📋 No. Registrasi: {cooperative.registrationNumber}</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏛️ Koperasi Digital</h1>
            <p className="text-gray-500 mt-1">
              {cooperative.name} • <span className="text-green-600 font-medium">✅ Terverifikasi</span>
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/koperasi/members" className="btn-secondary text-sm">
              👥 Kelola Anggota
            </Link>
            <Link to="/koperasi/loans" className="btn-primary text-sm">
              + Pinjaman Baru
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={UsersIcon}
          label="Total Anggota"
          value={stats.totalMembers || 0}
          bgColor="bg-blue-50"
          color="text-blue-500"
          subtitle="Aktif: 95%"
        />
        <StatCard
          icon={BanknotesIcon}
          label="Total Simpanan"
          value={`Rp${(stats.totalSavings || 0).toLocaleString()}`}
          bgColor="bg-green-50"
          color="text-green-500"
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label="Pinjaman Aktif"
          value={stats.activeLoans || 0}
          bgColor="bg-purple-50"
          color="text-purple-500"
        />
        <StatCard
          icon={ChartBarIcon}
          label="Pendapatan"
          value={`Rp${(stats.totalRevenue || 0).toLocaleString()}`}
          bgColor="bg-primary/10"
          color="text-primary"
          subtitle="Bulan ini"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/koperasi/members" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-blue-100 transition">
            <span className="text-2xl">👥</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-2">Anggota</h4>
          <p className="text-xs text-gray-500">Tambah & kelola</p>
        </Link>

        <Link to="/koperasi/loans" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group text-center">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-purple-100 transition">
            <span className="text-2xl">💰</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-2">Pinjaman</h4>
          <p className="text-xs text-gray-500">Ajukan & setujui</p>
        </Link>

        <Link to="/koperasi/savings" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group text-center">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-green-100 transition">
            <span className="text-2xl">🏦</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-2">Simpanan</h4>
          <p className="text-xs text-gray-500">Kelola simpanan</p>
        </Link>

        <Link to="/koperasi/shu" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group text-center">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-yellow-100 transition">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-2">SHU</h4>
          <p className="text-xs text-gray-500">Bagikan hasil</p>
        </Link>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-800">📋 Aktivitas Terbaru</h3>
            <Link to="/koperasi/transactions" className="text-sm text-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada aktivitas</div>
            ) : (
              recentActivities.map((activity, idx) => (
                <div key={idx} className="px-6 py-3 hover:bg-gray-50 transition flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{activity.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    activity.type === 'credit' ? 'text-green-600' :
                    activity.type === 'debit' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {activity.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-800">📢 Pengumuman</h3>
            <Link to="/koperasi/announcements" className="text-sm text-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-6 py-4">
              <div className="flex items-center space-x-2">
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Urgent</span>
                <span className="text-xs text-gray-500">2 jam lalu</span>
              </div>
              <p className="font-medium mt-1">Rapat Anggota Tahunan</p>
              <p className="text-sm text-gray-500">Akan dilaksanakan pada 15 Desember 2024</p>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">Info</span>
                <span className="text-xs text-gray-500">5 jam lalu</span>
              </div>
              <p className="font-medium mt-1">Pembagian SHU 2024</p>
              <p className="text-sm text-gray-500">SHU akan dibagikan pada Januari 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CooperativeDashboard;