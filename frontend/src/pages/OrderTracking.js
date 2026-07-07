// frontend/src/pages/OrderTracking.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { TruckIcon, CheckCircleIcon, ClockIcon, XCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

const OrderTracking = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTracking();
  }, [orderId, user]);

  const fetchTracking = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/tracking/${orderId}`);
      if (response.data.success) {
        setOrder(response.data.data.order);
        setTracking(response.data.data.trackingHistory || []);
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
      setError(error.response?.data?.message || 'Gagal mengambil data tracking');
      
      // Coba dari delivery
      try {
        const deliveryRes = await api.get(`/couriers/deliveries/order/${orderId}`);
        if (deliveryRes.data.success) {
          setOrder(deliveryRes.data.data.order);
          setTracking([
            {
              status: deliveryRes.data.data.status,
              description: getStatusDescription(deliveryRes.data.data.status),
              location: deliveryRes.data.data.pickupAddress,
              createdAt: deliveryRes.data.data.createdAt
            }
          ]);
          setError(null);
        }
      } catch (err) {
        console.error('No delivery found');
      }
    } finally {
      setLoading(false);
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
      'PENDING': <ClockIcon className="w-5 h-5" />,
      'PROCESSING': <ClockIcon className="w-5 h-5" />,
      'SHIPPED': <TruckIcon className="w-5 h-5" />,
      'IN_TRANSIT': <TruckIcon className="w-5 h-5" />,
      'DELIVERED': <CheckCircleIcon className="w-5 h-5" />,
      'CANCELLED': <XCircleIcon className="w-5 h-5" />,
      'COMPLETED': <CheckCircleIcon className="w-5 h-5" />
    };
    return icons[status] || <ClockIcon className="w-5 h-5" />;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat data tracking...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">😕</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-gray-500 mb-4">{error || 'Pesanan tidak ditemukan'}</p>
          <Link to="/orders" className="btn-primary inline-block">
            Kembali ke Daftar Pesanan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-3xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/orders" className="text-primary hover:underline inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Daftar Pesanan
          </Link>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Track Pesanan #{order.orderNumber || orderId}
              </h1>
              <p className="text-gray-500 text-sm">
                Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-medium">{getStatusLabel(order.status)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Total Pesanan</p>
              <p className="font-semibold">Rp{order.totalAmount?.toLocaleString() || order.total?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ongkos Kirim</p>
              <p className="font-semibold">Rp{order.shippingCost?.toLocaleString() || '0'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Grand Total</p>
              <p className="font-semibold text-primary">Rp{order.grandTotal?.toLocaleString() || order.total?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kurir</p>
              <p className="font-semibold">{order.courier || '-'}</p>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Riwayat Tracking</h2>

          {tracking.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada riwayat tracking
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>

              {tracking.map((item, index) => (
                <div key={index} className="relative pl-12 pb-8 last:pb-0">
                  <div className={`absolute left-1 w-6 h-6 rounded-full border-4 flex items-center justify-center
                    ${index === 0 ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                    {index === 0 && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {item.description || getStatusLabel(item.status)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Status: {getStatusLabel(item.status)}
                        </p>
                        {item.location && (
                          <p className="text-sm text-gray-500 mt-1">
                            📍 {item.location}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-400 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Estimated Delivery */}
          {order.status !== 'DELIVERED' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="font-semibold text-gray-800">Estimasi Pengiriman</p>
                    {order.estimatedDelivery ? (
                      <p className="text-sm text-gray-600">
                        {new Date(order.estimatedDelivery).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">Segera diinformasikan</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
            <Link to={`/orders`} className="btn-primary">
              Lihat Semua Pesanan
            </Link>
            {order.status === 'PENDING' && (
              <Link to={`/payment`} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                💳 Bayar Sekarang
              </Link>
            )}
            <Link to="/help" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              Bantuan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;