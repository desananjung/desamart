// frontend/src/pages/SellerOrders.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SellerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? '/orders/seller/orders' 
        : `/orders/seller/orders?status=${filter.toUpperCase()}`;
      
      const response = await api.get(url);
      
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching seller orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/seller/${orderId}/status`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'WAITING_PAYMENT': 'bg-yellow-100 text-yellow-800',
      'PAYMENT_VERIFIED': 'bg-green-100 text-green-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'READY_PICKUP': 'bg-purple-100 text-purple-800',
      'SHIPPED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'COMPLETED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Menunggu Pembayaran',
      'WAITING_PAYMENT': 'Menunggu Verifikasi',
      'PAYMENT_VERIFIED': 'Pembayaran Diverifikasi',
      'PROCESSING': 'Diproses',
      'READY_PICKUP': 'Siap Diambil',
      'SHIPPED': 'Dikirim',
      'DELIVERED': 'Telah Sampai',
      'CANCELLED': 'Dibatalkan',
      'COMPLETED': 'Selesai'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h1 className="text-2xl font-bold">📋 Pesanan Masuk</h1>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'payment_verified', 'processing', 'ready_pickup', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  filter === status 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {status === 'all' ? 'Semua' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <span className="text-6xl block mb-4">📭</span>
            <h2 className="text-2xl font-bold text-gray-800">Belum Ada Pesanan</h2>
            <p className="text-gray-500">Belum ada pesanan masuk untuk toko Anda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold">#{order.orderNumber || order.id}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Pembeli: {order.user?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-bold text-primary">
                        Rp{order.totalAmount?.toLocaleString() || order.total?.toLocaleString()}
                      </p>
                    </div>
                    <Link
  to={`/tracking/${order.id}`}
  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
>
  👁️ Detail / Tracking
</Link>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3 flex-wrap">
                  {order.items?.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.product?.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm">📦</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity}x Rp{item.price?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-500">+{order.items.length - 3} lainnya</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                  {order.status === 'PAYMENT_VERIFIED' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        ⚙️ Proses Pesanan
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        ❌ Batalkan
                      </button>
                    </>
                  )}
                  {order.status === 'PROCESSING' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'READY_PICKUP')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                    >
                      📦 Siap Diambil
                    </button>
                  )}
                  {order.status === 'READY_PICKUP' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                    >
                      🚚 Kirim
                    </button>
                  )}
                  <Link
                    to={`/tracking/${order.id}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    👁️ Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;