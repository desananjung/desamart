import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  ShoppingBagIcon, 
  CubeIcon, 
  CurrencyDollarIcon,
  StarIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    storeName: 'Loading...'
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/seller/stats'),
          api.get('/seller/orders?limit=5')
        ]);
        setStats(statsRes.data.data);
        setRecentOrders(ordersRes.data.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching seller data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-shadow">
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

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <ClockIcon className="w-4 h-4" />,
      PROCESSING: <TruckIcon className="w-4 h-4" />,
      SHIPPED: <TruckIcon className="w-4 h-4" />,
      DELIVERED: <CheckCircleIcon className="w-4 h-4" />,
      CANCELLED: <XCircleIcon className="w-4 h-4" />
    };
    return icons[status] || <ClockIcon className="w-4 h-4" />;
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏪 Seller Center</h1>
            <p className="text-gray-500 mt-1">
              Selamat datang, <span className="font-semibold text-gray-700">{user?.name}</span>
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/seller/store" className="btn-secondary text-sm">
              ⚙️ Kelola Toko
            </Link>
            <Link to="/products/new" className="btn-primary text-sm">
              + Tambah Produk
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={CubeIcon} 
          label="Total Produk" 
          value={stats.totalProducts} 
          bgColor="bg-blue-50" 
          color="text-blue-500"
        />
        <StatCard 
          icon={ShoppingBagIcon} 
          label="Total Pesanan" 
          value={stats.totalOrders} 
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
          icon={StarIcon} 
          label="Rating" 
          value={`⭐ ${stats.averageRating || 0}/5`} 
          bgColor="bg-yellow-50" 
          color="text-yellow-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/seller/products" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-blue-100 transition">
            <span className="text-2xl">📦</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-2">Kelola Produk</h4>
          <p className="text-xs text-gray-500">Tambah, edit, hapus</p>
        </Link>
        
        <Link to="/seller/orders" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group text-center">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-purple-100 transition">
            <span className="text-2xl">📋</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-2">Kelola Pesanan</h4>
          <p className="text-xs text-gray-500">Lihat & update status</p>
        </Link>
        
        <Link to="/seller/stats" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group text-center">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-green-100 transition">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-2">Laporan</h4>
          <p className="text-xs text-gray-500">Analisis penjualan</p>
        </Link>
        
        <Link to="/seller/store" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition group text-center">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto group-hover:bg-red-100 transition">
            <span className="text-2xl">🏪</span>
          </div>
          <h4 className="font-semibold text-gray-800 mt-2">Profil Toko</h4>
          <p className="text-xs text-gray-500">Atur informasi toko</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-800 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-gray-500" />
            Pesanan Terbaru
          </h3>
          <Link to="/seller/orders" className="text-sm text-primary hover:underline">
            Lihat Semua →
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Belum ada pesanan masuk</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Pesanan #{order.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.user?.name} • {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {item.product.name}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs text-gray-400">+{order.items.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      Rp{order.total.toLocaleString()}
                    </p>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;