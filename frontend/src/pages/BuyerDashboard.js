import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShoppingBagIcon, HeartIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    orders: 0,
    totalSpent: 0,
    wishlist: 0,
    cart: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, wishlistRes, cartRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/buyer/wishlist'),
          api.get('/cart')
        ]);
        setStats({
          orders: statsRes.data.data?.orders || 0,
          totalSpent: statsRes.data.data?.totalSpent || 0,
          wishlist: wishlistRes.data.data?.length || 0,
          cart: cartRes.data.data?.items?.length || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { icon: ShoppingBagIcon, label: 'Total Belanja', value: `Rp${stats.totalSpent.toLocaleString()}`, link: '/orders', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: ClockIcon, label: 'Pesanan', value: stats.orders, link: '/orders', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: HeartIcon, label: 'Wishlist', value: stats.wishlist, link: '/wishlist', color: 'text-red-500', bg: 'bg-red-50' },
    { icon: UserIcon, label: 'Profil', value: 'Edit', link: '/profile', color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🛒 Dashboard Pembeli</h1>
        <p className="text-gray-500 mt-1">
          Selamat datang kembali, <span className="font-semibold text-gray-700">{user?.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} to={card.link} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition">
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold mb-4">⚡ Akses Cepat</h3>
          <div className="space-y-2">
            <Link to="/marketplace" className="block p-3 hover:bg-gray-50 rounded-lg transition">🛍️ Belanja Sekarang</Link>
            <Link to="/cart" className="block p-3 hover:bg-gray-50 rounded-lg transition">🛒 Lihat Keranjang</Link>
            <Link to="/orders" className="block p-3 hover:bg-gray-50 rounded-lg transition">📦 Cek Pesanan</Link>
            <Link to="/wishlist" className="block p-3 hover:bg-gray-50 rounded-lg transition">❤️ Wishlist</Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold mb-4">🎉 Promo Spesial</h3>
          <div className="bg-gradient-to-r from-primary to-red-500 text-white p-4 rounded-xl">
            <p className="font-bold">Diskon 20%</p>
            <p className="text-sm opacity-90">Untuk pembelian pertama</p>
            <button className="mt-2 bg-white text-primary px-4 py-2 rounded-lg text-sm font-semibold">
              Klaim Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;