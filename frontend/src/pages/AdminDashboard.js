import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    revenue: 0,
    customers: 0,
    totalSellers: 0,
    totalBuyers: 0,
    totalUMKM: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data.data);

        // Fetch recent orders
        const ordersRes = await api.get('/orders?limit=5');
        setRecentOrders(ordersRes.data.data || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang, <span className="font-semibold text-gray-700">{user?.name}</span>
        </p>
        <p className="text-sm text-gray-400">Ringkasan seluruh platform DesaMart</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={ShoppingBagIcon}
          label="Total Pesanan"
          value={stats.orders}
          bgColor="bg-blue-50"
          color="text-blue-500"
        />
        <StatCard
          icon={ChartBarIcon}
          label="Total Produk"
          value={stats.products}
          bgColor="bg-green-50"
          color="text-green-500"
        />
        <StatCard
          icon={CurrencyDollarIcon}
          label="Pendapatan"
          value={`Rp${(stats.revenue || 0).toLocaleString()}`}
          bgColor="bg-primary/10"
          color="text-primary"
        />
        <StatCard
          icon={UsersIcon}
          label="Pelanggan"
          value={stats.customers}
          bgColor="bg-purple-50"
          color="text-purple-500"
        />
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto">
            <UserIcon className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalBuyers || 0}</p>
          <p className="text-sm text-gray-500">Pembeli</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto">
            <UserGroupIcon className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalSellers || 0}</p>
          <p className="text-sm text-gray-500">Penjual</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto">
            <BuildingStorefrontIcon className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalUMKM || 0}</p>
          <p className="text-sm text-gray-500">UMKM</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/products" className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Kelola Produk</h4>
              <p className="text-sm text-gray-500">Tambah, edit, atau hapus</p>
            </div>
          </div>
        </Link>
        
        <Link to="/users" className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Kelola User</h4>
              <p className="text-sm text-gray-500">Lihat semua pengguna</p>
            </div>
          </div>
        </Link>
        
        <Link to="/orders" className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Kelola Pesanan</h4>
              <p className="text-sm text-gray-500">Lihat semua pesanan</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-800">📋 Pesanan Terbaru</h3>
            <Link to="/orders" className="text-sm text-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.map(order => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between">
                <div>
                  <p className="font-medium">Pesanan #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {order.user?.name} • {new Date(order.createdAt).toLocaleDateString('id-ID')}
                  </p>
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
    </div>
  );
};

export default AdminDashboard;