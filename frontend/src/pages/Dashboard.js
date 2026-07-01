import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBagIcon,
  BuildingOfficeIcon,
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    revenue: 0,
    customers: 0
  });

  const quickActions = [
    { icon: ShoppingBagIcon, label: 'Marketplace', path: '/marketplace', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: BuildingOfficeIcon, label: 'Enterprise', path: '/enterprise', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: HomeIcon, label: 'Layanan Desa', path: '/layanan-desa', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: UserGroupIcon, label: 'UMKM', path: '/umkm', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: ChartBarIcon, label: 'Koperasi', path: '/koperasi', color: 'text-pink-500', bg: 'bg-pink-50' },
    { icon: TruckIcon, label: 'Pertanian', path: '/pertanian', color: 'text-emerald-500', bg: 'bg-emerald-50' }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">👋 Selamat Datang, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">Kelola semua bisnis dan layanan Anda dari satu dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Pesanan</p>
          <p className="text-2xl font-bold">{stats.orders}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Produk</p>
          <p className="text-2xl font-bold">{stats.products}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Pendapatan</p>
          <p className="text-2xl font-bold">Rp{stats.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Pelanggan</p>
          <p className="text-2xl font-bold">{stats.customers}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            to={action.path}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition text-center group"
          >
            <div className={`w-12 h-12 ${action.bg} rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition`}>
              <action.icon className={`w-6 h-6 ${action.color}`} />
            </div>
            <p className="text-sm font-medium mt-2">{action.label}</p>
          </Link>
        ))}
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-red-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">🚀 Mulai Jualan Sekarang!</h3>
            <p className="text-white/80 text-sm mt-1">
              Tambahkan produk pertama Anda dan mulai berjualan di DesaMart
            </p>
          </div>
          <Link to="/marketplace" className="bg-white text-primary px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition">
            + Tambah Produk
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;