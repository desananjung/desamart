import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CreditCardIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const Payment = () => {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [shippingMethod, setShippingMethod] = useState('jne');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');

  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersRes = await api.get('/orders');
      const pendingOrders = ordersRes.data.data?.filter(o => o.status === 'PENDING') || [];
      setOrders(pendingOrders);
      if (pendingOrders.length > 0) {
        setSelectedOrder(pendingOrders[0]);
      }

      // Fetch payment methods
      try {
        const methodsRes = await api.get('/payments/methods');
        setPaymentMethods(methodsRes.data.data || []);
      } catch (err) {
        console.warn('Payment methods not available');
        // Set default methods
        setPaymentMethods([
          { id: 1, code: 'bank_transfer', name: 'BANK_TRANSFER', description: 'Transfer Bank' },
          { id: 2, code: 'qris', name: 'QRIS', description: 'QR Code Payment' },
          { id: 3, code: 'cod', name: 'COD', description: 'Cash on Delivery' }
        ]);
      }

      // Fetch banks
      try {
        const banksRes = await api.get('/payments/banks');
        setBanks(banksRes.data.data || []);
        if (banksRes.data.data?.length > 0) {
          setSelectedBank(String(banksRes.data.data[0].id));
        }
      } catch (err) {
        console.warn('Banks not available');
        setBanks([
          { id: 1, bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'DesaMart Official' },
          { id: 2, bankName: 'Mandiri', accountNumber: '0987654321', accountHolder: 'DesaMart Official' },
          { id: 3, bankName: 'BNI', accountNumber: '5678901234', accountHolder: 'DesaMart Official' }
        ]);
        setSelectedBank('1');
      }

    } catch (error) {
      console.error('Error fetching payment data:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

  const handlePayment = async () => {
  if (!selectedOrder) {
    alert('Pilih pesanan terlebih dahulu');
    return;
  }

  if (paymentMethod === 'bank_transfer' && !selectedBank) {
    alert('Pilih rekening tujuan transfer');
    return;
  }

  setProcessing(true);
  try {
    const payload = {
      method: paymentMethod,
      bankAccountId: selectedBank || null
    };

    const res = await api.post(`/payments/process/${selectedOrder.id}`, payload);
    
    // Tampilkan instruksi pembayaran
    let message = '✅ Pembayaran berhasil diproses!\n\n';
    
    if (paymentMethod === 'bank_transfer') {
      const bank = banks.find(b => b.id === parseInt(selectedBank));
      message += `💳 Transfer ke rekening:\n`;
      message += `🏦 Bank: ${bank?.bankName}\n`;
      message += `📋 No. Rekening: ${bank?.accountNumber}\n`;
      message += `👤 A/n: ${bank?.accountHolder}\n\n`;
      message += `💰 Total: Rp${selectedOrder.total.toLocaleString()}\n`;
      message += `📝 Upload bukti transfer di halaman detail pesanan`;
    } else if (paymentMethod === 'qris') {
      message += `📱 Scan QRIS untuk pembayaran\n`;
      message += `💰 Total: Rp${selectedOrder.total.toLocaleString()}`;
    } else if (paymentMethod === 'cod') {
      message += `💵 Bayar saat pesanan tiba (COD)\n`;
      message += `💰 Total: Rp${selectedOrder.total.toLocaleString()}`;
    }
    
    alert(message);
    navigate('/orders');
  } catch (error) {
    console.error('Payment error:', error);
    alert(error.response?.data?.message || 'Gagal memproses pembayaran');
  } finally {
    setProcessing(false);
  }
};

  const paymentMethodOptions = [
    { id: 'bank_transfer', label: '🏦 Transfer Bank', desc: 'Transfer ke rekening kami', icon: '🏦' },
    { id: 'qris', label: '📱 QRIS', desc: 'Scan QR code pembayaran', icon: '📱' },
    { id: 'cod', label: '💵 COD', desc: 'Bayar saat barang diterima', icon: '💵' }
  ];

  const shippingOptions = [
    { id: 'jne', label: 'JNE', desc: 'Pengiriman cepat 1-3 hari', cost: 'Rp25.000' },
    { id: 'pos', label: 'POS Indonesia', desc: 'Pengiriman ekonomis 3-5 hari', cost: 'Rp15.000' },
    { id: 'grab', label: 'GrabExpress', desc: 'Pengiriman instan 1-2 jam', cost: 'Rp35.000' }
  ];

  const getShippingCost = (method) => {
    const costs = { jne: 25000, pos: 15000, grab: 35000 };
    return costs[method] || 20000;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">💳</span>
        <h2 className="text-2xl font-bold">Belum Ada Pesanan untuk Dibayar</h2>
        <p className="text-gray-500 mt-2">Silakan checkout terlebih dahulu</p>
        <Link to="/cart" className="btn-primary inline-block mt-4">🛒 Lihat Keranjang</Link>
      </div>
    );
  }

  const totalWithShipping = selectedOrder 
    ? selectedOrder.total + getShippingCost(shippingMethod) 
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">💳 Payment & Shipping</h1>
        <p className="text-gray-500">Selesaikan pembayaran dan pilih metode pengiriman</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold mb-4">📋 Pilih Pesanan</h3>
            <div className="space-y-3">
              {orders.map(order => (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                    selectedOrder?.id === order.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Pesanan #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-sm text-gray-500">{order.items?.length} item</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        Rp{order.total?.toLocaleString()}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        <ClockIcon className="w-3 h-3" />
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods dengan Bank */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold mb-4">💳 Metode Pembayaran</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {paymentMethodOptions.map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    paymentMethod === method.id 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-2xl">{method.icon}</p>
                  <p className="font-medium mt-1">{method.label}</p>
                  <p className="text-xs text-gray-500">{method.desc}</p>
                </button>
              ))}
            </div>

            {/* Bank Accounts - hanya untuk Bank Transfer */}
            {paymentMethod === 'bank_transfer' && banks.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium mb-3">🏦 Rekening Tujuan</p>
                <div className="space-y-2">
                  {banks.map(bank => (
                    <label key={bank.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-primary cursor-pointer">
                      <input
                        type="radio"
                        name="bank"
                        value={bank.id}
                        checked={selectedBank === String(bank.id)}
                        onChange={() => setSelectedBank(String(bank.id))}
                        className="w-4 h-4 text-primary"
                      />
                      <div>
                        <p className="font-medium">{bank.bankName}</p>
                        <p className="text-sm text-gray-600">{bank.accountNumber}</p>
                        <p className="text-xs text-gray-500">A/n: {bank.accountHolder}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* QRIS Info */}
            {paymentMethod === 'qris' && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-2xl mb-2">📱</p>
                <p className="font-medium">Scan QRIS untuk pembayaran</p>
                <p className="text-sm text-gray-500">Gunakan aplikasi e-wallet atau mobile banking</p>
                <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 inline-block">
                  <img 
                    src="https://via.placeholder.com/150x150?text=QRIS" 
                    alt="QRIS" 
                    className="w-32 h-32"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Kode QR akan aktif selama 24 jam</p>
              </div>
            )}

            {/* COD Info */}
            {paymentMethod === 'cod' && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl">
                <p className="font-medium">💵 Cash on Delivery (COD)</p>
                <p className="text-sm text-gray-600">Bayar saat pesanan tiba di alamat Anda</p>
                <ul className="text-xs text-gray-500 mt-2 space-y-1">
                  <li>✅ Siapkan uang pas</li>
                  <li>✅ Cek barang sebelum bayar</li>
                  <li>✅ Biaya admin Rp5.000</li>
                </ul>
              </div>
            )}
          </div>

          {/* Shipping Methods */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold mb-4">🚚 Metode Pengiriman</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {shippingOptions.map(method => (
                <button
                  key={method.id}
                  onClick={() => setShippingMethod(method.id)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    shippingMethod === method.id 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-2xl">{method.id === 'jne' ? '🚚' : method.id === 'pos' ? '📮' : '🛵'}</p>
                  <p className="font-medium mt-1">{method.label}</p>
                  <p className="text-xs text-gray-500">{method.desc}</p>
                  <p className="text-xs font-bold text-primary mt-1">{method.cost}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold mb-4">💳 Ringkasan Pembayaran</h3>
            
            {selectedOrder ? (
              <>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>Rp{selectedOrder.total?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ongkos Kirim</span>
                    <span>Rp{getShippingCost(shippingMethod).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Metode Pembayaran</span>
                    <span className="capitalize">{paymentMethod.replace('_', ' ')}</span>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    Rp{totalWithShipping.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className={`btn-primary w-full mt-6 py-3 text-lg flex items-center justify-center gap-2 ${
                    processing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon className="w-5 h-5" />
                      Bayar Sekarang
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  ✅ Pembayaran aman dan terenkripsi
                </p>

                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    Setelah pembayaran, pesanan akan segera diproses
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">Pilih pesanan untuk melanjutkan</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;