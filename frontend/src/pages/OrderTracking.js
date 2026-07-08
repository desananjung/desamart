// frontend/src/pages/OrderTracking.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  ArrowLeftIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const OrderTracking = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // FETCH TRACKING DATA
  // ============================================
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTracking();
  }, [orderId, user]);

  const fetchTracking = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      console.log(`📦 Fetching tracking for order ${orderId}`);
      const response = await api.get(`/tracking/${orderId}`);
      console.log('📥 Tracking response:', response.data);
      
      const isSuccess = response.data.success || response.data.status === 'success';
      
      if (isSuccess) {
        setOrder(response.data.data.order);
        setTracking(response.data.data.trackingHistory || []);
      } else {
        setError(response.data.message || 'Gagal mengambil data tracking');
      }
    } catch (error) {
      console.error('❌ Error fetching tracking:', error);
      setError(error.response?.data?.message || 'Gagal mengambil data tracking');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getStatusColor = (status) => {
    const colors = {
      'CREATED': 'bg-blue-100 text-blue-800 border-blue-200',
      'PAYMENT_VERIFIED': 'bg-green-100 text-green-800 border-green-200',
      'PROCESSING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'SHIPPED': 'bg-purple-100 text-purple-800 border-purple-200',
      'IN_TRANSIT': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'DELIVERED': 'bg-green-100 text-green-800 border-green-200',
      'COMPLETED': 'bg-gray-100 text-gray-800 border-gray-200',
      'CANCELLED': 'bg-red-100 text-red-800 border-red-200',
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'CREATED': 'Pesanan Dibuat',
      'PAYMENT_VERIFIED': 'Pembayaran Diverifikasi',
      'PROCESSING': 'Diproses',
      'SHIPPED': 'Dikirim',
      'IN_TRANSIT': 'Dalam Perjalanan',
      'DELIVERED': 'Telah Sampai',
      'COMPLETED': 'Selesai',
      'CANCELLED': 'Dibatalkan',
      'PENDING': 'Menunggu'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'CREATED': '📦',
      'PAYMENT_VERIFIED': '✅',
      'PROCESSING': '⚙️',
      'SHIPPED': '🚚',
      'IN_TRANSIT': '🚚',
      'DELIVERED': '✅',
      'COMPLETED': '🎉',
      'CANCELLED': '❌',
      'PENDING': '⏳'
    };
    return icons[status] || '📌';
  };

  const getStatusDescription = (status) => {
    const descriptions = {
      'CREATED': 'Pesanan berhasil dibuat dan menunggu pembayaran',
      'PAYMENT_VERIFIED': 'Pembayaran telah diverifikasi oleh admin',
      'PROCESSING': 'Penjual sedang memproses pesanan Anda',
      'SHIPPED': 'Pesanan telah dikirim oleh penjual',
      'IN_TRANSIT': 'Pesanan sedang dalam perjalanan menuju Anda',
      'DELIVERED': 'Pesanan telah sampai di alamat tujuan',
      'COMPLETED': 'Pesanan telah selesai dan diterima',
      'CANCELLED': 'Pesanan telah dibatalkan',
      'PENDING': 'Menunggu konfirmasi'
    };
    return descriptions[status] || status;
  };

  const getProgressPercentage = () => {
    if (tracking.length === 0) return 0;
    const statuses = ['CREATED', 'PAYMENT_VERIFIED', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];
    const currentIndex = statuses.indexOf(order?.status);
    if (currentIndex === -1) return 0;
    return Math.min(((currentIndex + 1) / statuses.length) * 100, 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `Rp${amount?.toLocaleString() || '0'}`;
  };

  // ============================================
  // RENDER LOADING
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Memuat data tracking...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER ERROR
  // ============================================
  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <span className="text-7xl block mb-6">😕</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Tidak Ditemukan</h2>
          <p className="text-gray-500 mb-6">{error || 'Pesanan tidak ditemukan'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => fetchTracking(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Coba Lagi
            </button>
            <Link to="/orders" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <ArrowLeftIcon className="w-5 h-5" />
              Kembali ke Daftar Pesanan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-10">
      <div className="container-custom max-w-4xl">
        {/* HEADER - KEMBALI & REFRESH */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link 
            to="/orders" 
            className="inline-flex items-center text-gray-600 hover:text-primary transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali ke Daftar Pesanan</span>
          </Link>
          
          <button
            onClick={() => fetchTracking(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Memperbarui...' : 'Perbarui'}
          </button>
        </div>

        {/* ORDER INFO CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <span>Track Pesanan</span>
                <span className="text-base font-normal text-gray-400">
                  #{order.orderNumber || orderId}
                </span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                📅 Dibuat: {formatDate(order.createdAt)}
              </p>
            </div>
            <div className={`px-4 py-2.5 rounded-full border-2 flex items-center gap-2.5 ${getStatusColor(order.status)}`}>
              <span className="text-xl">{getStatusIcon(order.status)}</span>
              <span className="font-semibold">{getStatusLabel(order.status)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Pesanan Dibuat</span>
              <span>Selesai</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-green-500 rounded-full h-2.5 transition-all duration-700 ease-out"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{getStatusLabel(order.status)}</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Pesanan</p>
              <p className="font-semibold text-gray-800">{formatCurrency(order.total)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Ongkos Kirim</p>
              <p className="font-semibold text-gray-800">{formatCurrency(order.shippingCost)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Grand Total</p>
              <p className="font-bold text-primary">{formatCurrency(order.grandTotal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Kurir</p>
              <p className="font-semibold text-gray-800">{order.courier || '-'}</p>
            </div>
          </div>

          {/* Tracking Number */}
          {order.trackingNumber && order.trackingNumber !== '-' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Nomor Resi</p>
              <p className="font-mono font-semibold text-primary text-sm">
                {order.trackingNumber}
              </p>
            </div>
          )}

          {/* Alamat */}
          {order.address && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Alamat Pengiriman</p>
              <p className="text-sm text-gray-700">{order.address}</p>
              {order.phone && (
                <p className="text-sm text-gray-500">📞 {order.phone}</p>
              )}
            </div>
          )}
        </div>

        {/* TRACKING TIMELINE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TruckIcon className="w-6 h-6 text-primary" />
            Riwayat Tracking
          </h2>

          {tracking.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-5xl block mb-4">📭</span>
              <p className="font-medium">Belum ada riwayat tracking</p>
              <p className="text-sm">Status akan diperbarui seiring proses pesanan</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline Vertical Line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>

              {tracking.map((item, index) => (
                <div 
                  key={index} 
                  className="relative pl-12 pb-8 last:pb-0"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 w-8 h-8 rounded-full border-4 flex items-center justify-center z-10
                    ${index === 0 ? 'bg-primary border-primary animate-pulse' : 'bg-white border-gray-300'}`}
                  >
                    {index === 0 ? (
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow ${
                    index === 0 ? 'border-l-4 border-primary' : ''
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-2xl">{getStatusIcon(item.status)}</span>
                          <h3 className="font-semibold text-gray-800">
                            {item.description || getStatusLabel(item.status)}
                          </h3>
                          {index === 0 && (
                            <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                              Terbaru
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Status: {getStatusLabel(item.status)}
                        </p>
                        {item.location && (
                          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                            <span>📍</span>
                            {item.location}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1.5 bg-white p-2 rounded-lg border border-gray-100">
                            {getStatusDescription(item.status)}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ESTIMATED DELIVERY */}
          {order.status !== 'DELIVERED' && 
           order.status !== 'COMPLETED' && 
           order.status !== 'CANCELLED' && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="bg-gradient-to-r from-primary/5 to-green-50 rounded-xl p-5 border border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Estimasi Pengiriman</p>
                    {order.estimatedDelivery ? (
                      <>
                        <p className="text-sm text-gray-600">
                          Dikirim pada: {formatDate(order.estimatedDelivery)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          *Estimasi dapat berubah tergantung kondisi pengiriman
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">Segera diinformasikan</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
            <Link to="/orders" className="btn-primary flex items-center gap-2">
              <ArrowLeftIcon className="w-4 h-4" />
              Lihat Semua Pesanan
            </Link>
            
            {order.status === 'PENDING' && (
              <Link 
                to="/payment" 
                className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                💳 Bayar Sekarang
              </Link>
            )}

            {order.status === 'DELIVERED' && (
              <Link 
                to={`/orders/${order.id}/review`}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
              >
                ✍️ Beri Ulasan
              </Link>
            )}

            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-gray-700"
            >
              🖨️ Cetak
            </button>
          </div>
        </div>

        {/* FOOTER - TIPS */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>
            💡 Butuh bantuan?{' '}
            <Link to="/help" className="text-primary hover:underline">
              Hubungi Tim Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;