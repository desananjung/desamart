import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    address: '',
    phone: '',
    note: ''
  });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        setCart(res.data.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
        if (error.response?.status === 403) {
          navigate('/cart');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address || !form.phone) {
      alert('Alamat dan nomor telepon wajib diisi');
      return;
    }

    try {
      const res = await api.post('/orders', {
        address: form.address,
        phone: form.phone,
        note: form.note
      });
      alert('✅ Pesanan berhasil dibuat! Silakan lakukan pembayaran.');
      navigate('/payment');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal checkout');
    }
  };

  const total = cart?.items?.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">🛒</span>
        <h2 className="text-2xl font-bold">Keranjang Kosong</h2>
        <p className="text-gray-500 mt-2">Tambahkan produk ke keranjang terlebih dahulu</p>
        <Link to="/marketplace" className="btn-primary inline-block mt-4">
          🛍️ Belanja Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📦 Checkout</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Alamat Pengiriman *
            </label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Masukkan alamat lengkap"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nomor Telepon *
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
              placeholder="08xx-xxxx-xxxx"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="input-field"
              placeholder="Catatan untuk penjual"
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Pesanan</span>
              <span className="text-primary">Rp{(total + 20000)?.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">*Termasuk ongkos kirim Rp20.000</p>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3 text-lg"
          >
            💳 Buat Pesanan
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;