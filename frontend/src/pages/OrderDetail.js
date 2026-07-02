import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth(); // ← TAMBAHKAN INI
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [proofImage, setProofImage] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        console.log('📡 Fetching order:', id);
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error('❌ Error:', err);
        setError(err.response?.data?.message || 'Gagal memuat pesanan');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  const handleUploadProof = async (e) => {
    e.preventDefault();
    
    console.log('📤 Upload proof clicked');
    console.log('Order ID:', id);
    console.log('Proof URL:', proofImage);

    if (!proofImage) {
      alert('Silakan masukkan URL bukti transfer');
      return;
    }

    setUploading(true);
    try {
      const response = await api.post(`/payments/upload-proof/${id}`, { 
        proofImage: proofImage 
      });
      console.log('✅ Upload success:', response.data);
      
      alert('✅ Bukti transfer berhasil diupload! Menunggu konfirmasi dari penjual.');
      
      // Refresh order
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data);
      setProofImage('');
    } catch (error) {
      console.error('❌ Upload error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Gagal upload bukti transfer');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!window.confirm('Konfirmasi pembayaran pesanan ini?')) return;
    
    try {
      const res = await api.put(`/payments/confirm/${id}`);
      alert('✅ Pembayaran dikonfirmasi! Pesanan akan diproses.');
      
      // Refresh order
      const orderRes = await api.get(`/orders/${id}`);
      setOrder(orderRes.data.data);
    } catch (error) {
      console.error('Confirm error:', error);
      alert(error.response?.data?.message || 'Gagal konfirmasi pembayaran');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      PAID: 'bg-green-100 text-green-800',
      WAITING_CONFIRMATION: 'bg-orange-100 text-orange-800',
      CONFIRMED: 'bg-green-100 text-green-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">⚠️ Error</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <Link to="/orders" className="btn-primary inline-block mt-4">← Kembali</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Pesanan tidak ditemukan</h2>
        <Link to="/orders" className="btn-primary inline-block mt-4">← Kembali</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📦 Detail Pesanan #{order.id}</h1>
          <p className="text-gray-500 mt-1">
            Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
              {order.status}
            </span>
          </p>
        </div>
        <Link to="/orders" className="btn-secondary text-sm">← Kembali</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-lg mb-4">📋 Informasi Pesanan</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Tanggal</span>
                <span>{new Date(order.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-primary">Rp{order.total?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Metode Pembayaran</span>
                <span className="capitalize">{order.paymentMethod || 'Belum dipilih'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Status Pembayaran</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.paymentStatus || 'PENDING')}`}>
                  {order.paymentStatus || 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Alamat</span>
                <span className="text-right max-w-[200px]">{order.address}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
            <h3 className="font-bold text-lg mb-4">🛍️ Produk</h3>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between border-b border-gray-100 py-2 last:border-0">
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="font-medium">Rp{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">💳 Pembayaran</h3>

            {/* Bank Transfer - Info Rekening */}
            {order.paymentMethod === 'bank_transfer' && (
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <p className="font-medium text-blue-800">Transfer ke Rekening:</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-500">Bank:</span> BCA</p>
                  <p><span className="text-gray-500">No. Rekening:</span> 1234567890</p>
                  <p><span className="text-gray-500">A/n:</span> DesaMart Official</p>
                  <p className="font-bold text-primary mt-2">Total: Rp{order.total?.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Upload Bukti Transfer - Untuk PENDING atau PAID */}
            {(order.paymentStatus === 'PENDING' || order.paymentStatus === 'PAID') && order.paymentMethod === 'bank_transfer' && (
              <form onSubmit={handleUploadProof} className="space-y-3 mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  📤 Upload Bukti Transfer
                </label>
                <input
                  type="url"
                  placeholder="URL bukti transfer (Google Drive, imgur)"
                  value={proofImage}
                  onChange={(e) => setProofImage(e.target.value)}
                  className="input-field text-sm"
                  required
                />
                <p className="text-xs text-gray-400">
                  💡 Upload ke Google Drive atau imgur, lalu paste URL-nya
                </p>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary w-full py-2 text-sm"
                >
                  {uploading ? 'Mengupload...' : '📤 Upload Bukti'}
                </button>
              </form>
            )}

            {/* QRIS - Sudah Lunas */}
            {order.paymentMethod === 'qris' && order.paymentStatus === 'PAID' && (
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-green-700 font-medium">✅ Pembayaran QRIS Berhasil</p>
                <p className="text-sm text-green-600 mt-1">
                  Pembayaran Anda sudah terkonfirmasi otomatis.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Metode: QRIS • Status: {order.paymentStatus}
                </p>
              </div>
            )}

            {/* COD */}
            {order.paymentMethod === 'cod' && (
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-blue-700 font-medium">💵 COD - Bayar Saat Terima</p>
                <p className="text-sm text-blue-600 mt-1">
                  Pesanan akan dikirim, bayar saat barang tiba.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Total: Rp{order.total?.toLocaleString()}
                </p>
              </div>
            )}

            {/* Status Menunggu Konfirmasi */}
            {order.paymentStatus === 'WAITING_CONFIRMATION' && (
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-orange-700 font-medium">⏳ Menunggu Konfirmasi</p>
                <p className="text-sm text-orange-600 mt-1">
                  Bukti transfer sedang diperiksa oleh penjual.
                </p>
              </div>
            )}

            {/* Tombol Konfirmasi - hanya untuk seller/admin */}
            {order.paymentStatus === 'WAITING_CONFIRMATION' && (user?.role === 'SELLER' || user?.role === 'ADMIN') && (
              <button
                onClick={handleConfirmPayment}
                className="btn-primary w-full py-2 text-sm mt-3"
              >
                ✅ Konfirmasi Pembayaran
              </button>
            )}

            {/* Status Terkonfirmasi */}
            {order.paymentStatus === 'CONFIRMED' && (
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-green-700 font-medium">✅ Pembayaran Terkonfirmasi</p>
                <p className="text-sm text-green-600 mt-1">
                  Pesanan akan segera diproses.
                </p>
              </div>
            )}

            {/* Link Bukti Transfer */}
            {order.paymentProof && (
              <div className="mt-3 text-sm text-gray-500">
                <p>📎 Bukti terupload:</p>
                <a 
                  href={order.paymentProof} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {order.paymentProof}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;