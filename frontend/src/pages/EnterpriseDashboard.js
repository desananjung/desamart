import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  BuildingOfficeIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const EnterpriseDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enterprise, setEnterprise] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalStores: 0,
    totalMembers: 0,
    growth: 12.5
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/enterprise/dashboard');
        const data = res.data.data;

        if (data && data.enterprise) {
          setEnterprise(data.enterprise);
          setStats(data.stats);
          
          // Ambil beberapa pesanan terbaru
          if (data.enterprise.orders) {
            setRecentOrders(data.enterprise.orders.slice(0, 5));
          }
          
          // Ambil produk teratas
          if (data.enterprise.products) {
            setTopProducts(data.enterprise.products.slice(0, 5));
          }
        }
      } catch (error) {
        console.error('Error fetching enterprise data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, bgColor, trend, trendValue }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition">
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Jika belum memiliki enterprise
  if (!enterprise) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <span className="text-6xl block mb-4">🏢</span>
        <h1 className="text-3xl font-bold text-gray-800">Enterprise Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Daftarkan bisnis Anda untuk mengakses dashboard enterprise
        </p>
        <Link to="/enterprise/create" className="btn-primary inline-block mt-6">
          <PlusIcon className="w-5 h-5 inline mr-2" />
          Buat Enterprise
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏢 Enterprise Dashboard</h1>
            <p className="text-gray-500 mt-1">
              {enterprise.name} • <span className="text-green-600 font-medium">✅ {enterprise.status}</span>
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/enterprise/stores" className="btn-secondary text-sm">
              🏪 Kelola Toko
            </Link>
            <Link to="/enterprise/products/new" className="btn-primary text-sm">
              + Tambah Produk
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={CurrencyDollarIcon}
          label="Total Pendapatan"
          value={`Rp${(stats.totalRevenue || 0).toLocaleString()}`}
          bgColor="bg-green-50"
          color="text-green-500"
          trend="up"
          trendValue="12.5"
        />
        <StatCard
          icon={ShoppingBagIcon}
          label="Total Pesanan"
          value={stats.totalOrders || 0}
          bgColor="bg-blue-50"
          color="text-blue-500"
          trend="up"
          trendValue="8.3"
        />
        <StatCard
          icon={BuildingOfficeIcon}
          label="Total Toko"
          value={stats.totalStores || 0}
          bgColor="bg-purple-50"
          color="text-purple-500"
        />
        <StatCard
          icon={UsersIcon}
          label="Total Anggota"
          value={stats.totalMembers || 0}
          bgColor="bg-yellow-50"
          color="text-yellow-500"
          trend="up"
          trendValue="15.2"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Produk</p>
          <p className="text-2xl font-bold">{stats.totalProducts || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Konversi</p>
          <p className="text-2xl font-bold">18.5%</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Rata-rata Order</p>
          <p className="text-2xl font-bold">Rp{((stats.totalRevenue || 0) / (stats.totalOrders || 1)).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Pelanggan Baru</p>
          <p className="text-2xl font-bold">+45</p>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-800">📋 Pesanan Terbaru</h3>
            <Link to="/enterprise/orders" className="text-sm text-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada pesanan</div>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pesanan #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">Rp{order.order?.total?.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-800">🏆 Produk Terlaris</h3>
            <Link to="/enterprise/products" className="text-sm text-primary hover:underline">
              Lihat Semua →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada produk</div>
            ) : (
              topProducts.map(product => (
                <div key={product.id} className="px-6 py-4 hover:bg-gray-50 transition flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.product?.imageUrl ? (
                        <img src={product.product.imageUrl} alt={product.product.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.product?.name}</p>
                      <p className="text-sm text-gray-500">Rp{product.price?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Terjual: 0</p>
                    <p className="text-sm font-medium text-primary">Rp0</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;