import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import api from '../services/api';
import { ClockIcon, CheckCircleIcon, TruckIcon, XCircleIcon } from '@heroicons/react/24/outline';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const url = filter === 'all' ? '/seller/orders' : `/seller/orders?status=${filter}`;
        const res = await api.get(url);
        setOrders(res.data.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [filter]);

  const updateStatus = async (orderId, status) => {
  const statusLabels = {
    'PROCESSING': 'diproses',
    'SHIPPED': 'dikirim',
    'DELIVERED': 'selesai',
    'CANCELLED': 'dibatalkan'
  };
  
  // Ganti confirm dengan window.confirm
  if (!window.confirm(`Ubah status pesanan #${orderId} menjadi ${statusLabels[status] || status}?`)) return;
  
  try {
    await api.put(`/seller/orders/${orderId}/status`, { status });
    
    // Refresh orders
    const res = await api.get('/seller/orders');
    setOrders(res.data.data || []);
    
    // Tampilkan pesan sesuai status
    let message = `✅ Status pesanan #${orderId} berhasil diupdate`;
    if (status === 'SHIPPED') {
      message = '🚚 Pesanan dikirim! Pembeli akan mendapat notifikasi.';
    } else if (status === 'DELIVERED') {
      message = '✅ Pesanan selesai! Pembeli sudah menerima pesanan.';
    }
    alert(message);
  } catch (error) {
    alert('❌ Gagal mengupdate status');
  }
};

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

  const getStatusActions = (order) => {
    switch (order.status) {
      case 'PENDING':
        return (
          <>
            <button
              onClick={() => updateStatus(order.id, 'PROCESSING')}
              className="btn-primary text-xs py-1 px-3"
            >
              Proses
            </button>
            <button
              onClick={() => updateStatus(order.id, 'CANCELLED')}
              className="bg-red-500 text-white text-xs py-1 px-3 rounded-lg hover:bg-red-600"
            >
              Tolak
            </button>
          </>
        );
      case 'PROCESSING':
        return (
          <button
            onClick={() => updateStatus(order.id, 'SHIPPED')}
            className="btn-primary text-xs py-1 px-3"
          >
            Kirim
          </button>
        );
      case 'SHIPPED':
        return (
          <button
            onClick={() => updateStatus(order.id, 'DELIVERED')}
            className="bg-green-500 text-white text-xs py-1 px-3 rounded-lg hover:bg-green-600"
          >
            Selesai
          </button>
        );
      default:
        return null;
    }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📋 Manajemen Pesanan</h1>
          <p className="text-gray-500">Kelola semua pesanan masuk</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">Semua</option>
            <option value="PENDING">⏳ Menunggu</option>
            <option value="PROCESSING">📦 Diproses</option>
            <option value="SHIPPED">🚚 Dikirim</option>
            <option value="DELIVERED">✅ Selesai</option>
            <option value="CANCELLED">❌ Dibatalkan</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">📭</span>
          <h3 className="text-xl font-semibold">Belum Ada Pesanan</h3>
          <p className="text-gray-500 mt-2">Pesanan akan muncul di sini setelah ada pembeli</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">Pesanan #{order.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Pembeli</p>
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-sm text-gray-600">{order.user?.email}</p>
                      <p className="text-sm text-gray-600">📞 {order.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Alamat Pengiriman</p>
                      <p className="font-medium">{order.address}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-500 mb-2">Produk:</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items?.map((item, idx) => (
                        <span key={idx} className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                          {item.product?.name} <span className="text-gray-400">x{item.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4 min-w-[120px]">
                  <p className="text-2xl font-bold text-primary">
                    Rp{order.total?.toLocaleString()}
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {getStatusActions(order)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;