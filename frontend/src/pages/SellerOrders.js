import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ClockIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const url = filter === 'all' ? '/seller/orders' : `/seller/orders?status=${filter}`;
        const res = await api.get(url);
        setOrders(res.data.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [filter]);

  const handleStatusUpdate = async (orderId, status) => {
    if (!window.confirm(`Ubah status pesanan #${orderId} menjadi ${status}?`)) return;
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status });
      // Refresh orders
      const res = await api.get('/seller/orders');
      setOrders(res.data.data);
      alert('✅ Status pesanan berhasil diperbarui!');
    } catch (error) {
      alert('❌ Gagal memperbarui status');
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

  const statusOptions = [
    { value: 'all', label: 'Semua' },
    { value: 'PENDING', label: 'Menunggu' },
    { value: 'PROCESSING', label: 'Diproses' },
    { value: 'SHIPPED', label: 'Dikirim' },
    { value: 'DELIVERED', label: 'Selesai' },
    { value: 'CANCELLED', label: 'Dibatalkan' }
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
            <h1 className="text-3xl font-bold text-gray-800">📋 Kelola Pesanan</h1>
            <p className="text-gray-500 mt-1">Lihat dan update status pesanan</p>
          </div>
          <Link to="/seller" className="btn-secondary text-sm">
            ← Kembali
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
              filter === opt.value
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <span className="text-6xl mb-4 block">📭</span>
          <h3 className="text-xl font-semibold text-gray-800">Belum Ada Pesanan</h3>
          <p className="text-gray-500 mt-2">Pesanan akan muncul di sini setelah pembeli checkout</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h3 className="font-bold text-lg text-gray-800">
                      Pesanan #{order.id}
                    </h3>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status}</span>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Pembeli</p>
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-sm text-gray-600">{order.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Alamat Pengiriman</p>
                      <p className="font-medium">{order.address}</p>
                      <p className="text-sm text-gray-600">📞 {order.phone}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="bg-gray-50 px-3 py-1 rounded-lg text-sm">
                          {item.product.name} <span className="text-gray-400">x{item.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-primary">
                    Rp{order.total.toLocaleString()}
                  </p>
                  <div className="mt-2 space-y-1">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                          className="w-full btn-primary text-xs py-1.5"
                        >
                          Proses Pesanan
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                          className="w-full bg-red-500 text-white text-xs py-1.5 rounded-lg hover:bg-red-600 transition"
                        >
                          Batalkan
                        </button>
                      </>
                    )}
                    {order.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'SHIPPED')}
                        className="w-full btn-primary text-xs py-1.5"
                      >
                        Kirim Pesanan
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                        className="w-full bg-green-500 text-white text-xs py-1.5 rounded-lg hover:bg-green-600 transition"
                      >
                        Selesai
                      </button>
                    )}
                    <button className="w-full btn-secondary text-xs py-1.5">
                      <EyeIcon className="w-4 h-4 inline mr-1" />
                      Detail
                    </button>
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