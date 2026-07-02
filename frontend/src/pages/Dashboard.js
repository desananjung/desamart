import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ShoppingBagIcon,
  BuildingOfficeIcon,
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  SparklesIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    revenue: 0,
    customers: 0
  });
  const [village, setVillage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data.data);

        // Fetch user's village data
        try {
          const villageRes = await api.get('/village/user-village');
          setVillage(villageRes.data.data);
        } catch (err) {
          console.log('No village data available');
        }

        // Fetch recent orders
        try {
          const ordersRes = await api.get('/orders?limit=5');
          setRecentOrders(ordersRes.data.data || []);
        } catch (err) {
          console.log('No orders available');
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { icon: ShoppingBagIcon, label: 'Marketplace', path: '/marketplace', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: BuildingOfficeIcon, label: 'Enterprise', path: '/enterprise', color: 'text-purple-500', bg: 'bg-purple-50' },
    { icon: HomeIcon, label: 'Layanan Desa', path: '/layanan-desa', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: UserGroupIcon, label: 'UMKM', path: '/umkm', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: ChartBarIcon, label: 'Koperasi', path: '/koperasi', color: 'text-pink-500', bg: 'bg-pink-50' },
    { icon: TruckIcon, label: 'Pertanian', path: '/pertanian', color: 'text-emerald-500', bg: 'bg-emerald-50' }
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
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">👋 Selamat Datang, {user?.name}!</h1>
            <p className="text-gray-500 mt-1">Kelola semua bisnis dan layanan Anda dari satu dashboard</p>
          </div>
          
          {/* Badge Desa */}
          {village && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
              <MapPinIcon className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Desa: {village.name}
              </span>
              <span className="text-xs text-green-500 bg-green-100 px-2 py-0.5 rounded-full">
                {village.district}
              </span>
            </div>
          )}
        </div>

        {/* Info Desa */}
        {village && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <p className="text-xs text-gray-500">UMKM</p>
              <p className="text-lg font-bold">{village._count?.umkm || village.umkm?.length || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <p className="text-xs text-gray-500">Produk</p>
              <p className="text-lg font-bold">{village._count?.products || village.products?.length || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <p className="text-xs text-gray-500">Penduduk</p>
              <p className="text-lg font-bold">{village.population?.toLocaleString() || '-'}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <p className="text-xs text-gray-500">Pendapatan</p>
              <p className="text-lg font-bold text-green-600">
                Rp{(village.economy?.[0]?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards - Data Real */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pesanan</p>
              <p className="text-2xl font-bold">{stats.orders}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShoppingBagIcon className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Produk</p>
              <p className="text-2xl font-bold">{stats.products}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendapatan</p>
              <p className="text-2xl font-bold">Rp{stats.revenue.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pelanggan</p>
              <p className="text-2xl font-bold">{stats.customers}</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-purple-500" />
            </div>
          </div>
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

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-800">📋 Pesanan Terbaru</h3>
            <Link to="/orders" className="text-sm text-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.slice(0, 5).map(order => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between">
                <div>
                  <p className="font-medium">Pesanan #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-400">{order.items?.length || 0} item</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">Rp{order.total?.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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