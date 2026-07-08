// frontend/src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? '/orders' 
        : `/orders?status=${filter.toUpperCase()}`;
      const response = await api.get(url);
      
      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async (orderId) => {
    setTrackingLoading(true);
    try {
      const response = await api.get(`/tracking/${orderId}`);
      if (response.data.success) {
        setTrackingData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
      try {
        const deliveryRes = await api.get(`/couriers/deliveries/order/${orderId}`);
        if (deliveryRes.data.success) {
          setTrackingData({
            order: deliveryRes.data.data.order,
            trackingHistory: [
              {
                status: deliveryRes.data.data.status,
                description: getStatusDescription(deliveryRes.data.data.status),
                location: deliveryRes.data.data.pickupAddress,
                createdAt: deliveryRes.data.data.createdAt
              }
            ],
            currentStatus: deliveryRes.data.data.status
          });
        }
      } catch (err) {
        console.error('No tracking/delivery found');
        setTrackingData(null);
      }
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      'PENDING': 'Menunggu konfirmasi pesanan',
      'PROCESSING': 'Pesanan sedang diproses',
      'SHIPPED': 'Pesanan telah dikirim',
      'IN_TRANSIT': 'Pesanan dalam perjalanan',
      'DELIVERED': 'Pesanan telah sampai',
      'CANCELLED': 'Pesanan dibatalkan',
      'COMPLETED': 'Pesanan selesai'
    };
    return descriptions[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'PROCESSING': 'bg-blue-100 text-blue-800 border-blue-200',
      'SHIPPED': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'IN_TRANSIT': 'bg-purple-100 text-purple-800 border-purple-200',
      'DELIVERED': 'bg-green-100 text-green-800 border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200',
      'COMPLETED': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'PENDING': <ClockIcon className="w-4 h-4" />,
      'PROCESSING': <ShoppingBagIcon className="w-4 h-4" />,
      'SHIPPED': <TruckIcon className="w-4 h-4" />,
      'IN_TRANSIT': <TruckIcon className="w-4 h-4" />,
      'DELIVERED': <CheckCircleIcon className="w-4 h-4" />,
      'CANCELLED': <XCircleIcon className="w-4 h-4" />,
      'COMPLETED': <CheckCircleIcon className="w-4 h-4" />
    };
    return icons[status] || <ShoppingBagIcon className="w-4 h-4" />;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Menunggu Konfirmasi',
      'PROCESSING': 'Diproses',
      'SHIPPED': 'Dikirim',
      'IN_TRANSIT': 'Dalam Perjalanan',
      'DELIVERED': 'Telah Sampai',
      'CANCELLED': 'Dibatalkan',
      'COMPLETED': 'Selesai'
    };
    return labels[status] || status;
  };

  const handleViewDetail = async (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
    await fetchTracking(order.id);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedOrder(null);
    setTrackingData(null);
  };

  const getStatusCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter(o => o.status === status.toUpperCase()).length;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Silakan Login</h2>
          <p className="text-gray-500 mb-4">Login untuk melihat pesanan Anda</p>
          <Link to="/login" className="btn-primary inline-block">
            Login Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBagIcon className="w-6 h-6" />
              Pesanan Saya
            </h1>
            <p className="text-sm text-gray-500">
              {orders.length} pesanan {filter !== 'all' && `(${getStatusCount(filter)} ${filter})`}
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  filter === status 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {status === 'all' ? 'Semua' : getStatusLabel(status.toUpperCase())}
                <span className={`ml-1 text-xs ${
                  filter === status ? 'text-white/80' : 'text-gray-400'
                }`}>
                  ({getStatusCount(status)})
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <span className="text-6xl block mb-4">🛒</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Belum Ada Pesanan</h2>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Anda belum memiliki pesanan. Mulai belanja sekarang!'
                : `Tidak ada pesanan dengan status ${getStatusLabel(filter.toUpperCase())}`}
            </p>
            <Link to="/marketplace" className="btn-primary inline-block">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden"
              >
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-medium text-gray-800">
                        #{order.orderNumber || order.id}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </span>
                      {order.paymentStatus === 'PAID' && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">
                          ✅ Lunas
                        </span>
                      )}
                      {order.paymentStatus === 'UNPAID' && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
                          ⏳ Belum Bayar
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="font-bold text-primary">
                        Rp{order.total?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap gap-3">
                    {order.items?.slice(0, 4).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.product?.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40x40?text=📦';
                              }}
                            />
                          ) : (
                            <span className="text-lg">📦</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-[150px] sm:max-w-[200px]">
                            {item.product?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity}x Rp{item.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 4 && (
                      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-500">+{order.items.length - 4} lainnya</span>
                      </div>
                    )}
                  </div>

                  {/* ============================================ */}
                  {/* ✅ ACTION BUTTONS - PAKAI LINK UNTUK TRACKING */}
                  {/* ============================================ */}
                  <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
                    {/* ✅ Track Order - Pakai Link */}
                    <Link
                      to={`/tracking/${order.id}`}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium"
                    >
                      <TruckIcon className="w-4 h-4" />
                      Lacak Pesanan
                    </Link>
                    
                    <button
                      onClick={() => handleViewDetail(order)}
                      className="inline-flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
                    >
                      <EyeIcon className="w-4 h-4" />
                      Detail
                    </button>

                    {order.status === 'PENDING' && order.paymentStatus === 'UNPAID' && (
                      <Link
                        to={`/payment`}
                        state={{ orderData: order }}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        💳 Bayar Sekarang
                      </Link>
                    )}
                    
                    {order.status === 'DELIVERED' && (
                      <Link
                        to={`/orders/${order.id}/review`}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                      >
                        ✍️ Beri Ulasan
                      </Link>
                    )}

                    {order.status === 'PROCESSING' && (
                      <button className="inline-flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium cursor-default">
                        ⏳ Pesanan diproses
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================ */}
        {/* ORDER DETAIL MODAL */}
        {/* ============================================ */}
        {showDetail && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBagIcon className="w-5 h-5" />
                  Detail Pesanan #{selectedOrder.orderNumber || selectedOrder.id}
                </h2>
                <button
                  onClick={handleCloseDetail}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <XCircleIcon className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1 ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                  {selectedOrder.paymentStatus === 'PAID' && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">
                      ✅ Lunas
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Tanggal</p>
                    <p className="font-medium">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="font-bold text-primary">
                      Rp{selectedOrder.total?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Metode Pembayaran</p>
                    <p className="font-medium">{selectedOrder.paymentMethod || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kurir</p>
                    <p className="font-medium">{selectedOrder.courier || '-'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">📦 Item Pesanan</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.product?.imageUrl ? (
                            <img 
                              src={item.product.imageUrl} 
                              alt={item.product.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">📦</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity}x Rp{item.price?.toLocaleString()}
                          </p>
                        </div>
                        <p className="font-medium">
                          Rp{(item.price * item.quantity)?.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {trackingLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : trackingData ? (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <TruckIcon className="w-5 h-5" />
                      Tracking Status
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(trackingData.currentStatus)}`}>
                          {getStatusLabel(trackingData.currentStatus)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {trackingData.trackingHistory?.[0]?.description || getStatusDescription(trackingData.currentStatus)}
                        </span>
                      </div>
                      {trackingData.trackingHistory && trackingData.trackingHistory.length > 0 && (
                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                          {trackingData.trackingHistory.slice(0, 5).map((track, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className="text-gray-400">•</span>
                              <div>
                                <p className="text-gray-600">{track.description || getStatusLabel(track.status)}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(track.createdAt).toLocaleString('id-ID')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-700">
                    <p>ℹ️ Belum ada informasi tracking untuk pesanan ini</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <Link
                    to={`/tracking/${selectedOrder.id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium"
                  >
                    <TruckIcon className="w-4 h-4" />
                    Lihat Tracking Lengkap
                  </Link>
                  
                  {selectedOrder.status === 'PENDING' && selectedOrder.paymentStatus === 'UNPAID' && (
                    <Link
                      to={`/payment`}
                      state={{ orderData: selectedOrder }}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                    >
                      💳 Bayar Sekarang
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;