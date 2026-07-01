import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  UsersIcon, 
  ShoppingBagIcon, 
  TagIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    growth: 12.5
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await api.get('/admin/users');
        setUsers(usersRes.data.data);
        setStats(prev => ({ 
          ...prev, 
          totalUsers: usersRes.data.data.length 
        }));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, bgColor, trend, trendValue }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-xs font-medium ml-1 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trendValue}%
              </span>
              <span className="text-xs text-gray-400 ml-1">dari bulan lalu</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  // Warna role badge
  const getRoleBadge = (role) => {
    const styles = {
      ADMIN: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      SELLER: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
      BUYER: 'bg-gradient-to-r from-green-500 to-green-600 text-white'
    };
    return styles[role] || 'bg-gray-500 text-white';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
            <p className="text-gray-500 mt-1">
              Selamat datang kembali, <span className="font-semibold text-gray-700">{user?.name}</span>
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="btn-secondary text-sm">
              📊 Export Data
            </button>
            <button className="btn-primary text-sm">
              + Tambah Admin
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={UsersIcon} 
          label="Total User" 
          value={stats.totalUsers} 
          bgColor="bg-blue-50" 
          color="text-blue-500"
          trend="up"
          trendValue="12"
        />
        <StatCard 
          icon={ShoppingBagIcon} 
          label="Total Produk" 
          value={stats.totalProducts || 0} 
          bgColor="bg-green-50" 
          color="text-green-500"
        />
        <StatCard 
          icon={ChartBarIcon} 
          label="Total Pesanan" 
          value={stats.totalOrders || 0} 
          bgColor="bg-purple-50" 
          color="text-purple-500"
          trend="up"
          trendValue="8.5"
        />
        <StatCard 
          icon={CurrencyDollarIcon} 
          label="Pendapatan" 
          value={`Rp${(stats.totalRevenue || 0).toLocaleString()}`} 
          bgColor="bg-primary/10" 
          color="text-primary"
          trend="up"
          trendValue="23"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
        
        <Link to="/categories" className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition">
              <span className="text-2xl">🏷️</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Kategori</h4>
              <p className="text-sm text-gray-500">Atur kategori produk</p>
            </div>
          </div>
        </Link>
        
        <Link to="/orders" className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Pesanan</h4>
              <p className="text-sm text-gray-500">Lihat & update status</p>
            </div>
          </div>
        </Link>
        
        <Link to="/users" className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">User</h4>
              <p className="text-sm text-gray-500">Kelola semua user</p>
            </div>
          </div>
        </Link>
      </div>

      {/* User List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-800 flex items-center">
            <UsersIcon className="w-5 h-5 mr-2 text-gray-500" />
            Daftar Semua User
          </h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {users.length} user
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bergabung</th>
                <th className="text-left py-3.5 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u, index) => (
                <tr key={u.id} className={`hover:bg-gray-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="py-3.5 px-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm ${getRoleBadge(u.role)}`}>
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-gray-600">{u.email}</td>
                  <td className="py-3.5 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-3.5 px-6">
                    <button className="text-primary hover:text-red-600 text-sm font-medium transition">
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;