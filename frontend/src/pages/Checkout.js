import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    
    if (!form.address.trim()) {
      alert('Alamat pengiriman wajib diisi');
      return;
    }
    if (!form.phone.trim()) {
      alert('Nomor telepon wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        address: form.address,
        phone: form.phone,
        note: form.note
      });
      
      alert('✅ Pesanan berhasil dibuat! Silakan lakukan pembayaran.');
      navigate('/payment');
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Gagal checkout. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
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
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <h3 className="font-semibold mb-3">Ringkasan Pesanan</h3>
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between py-2 border-b border-gray-100">
            <span>{item.product?.name} x{item.quantity}</span>
            <span className="font-medium">Rp{(item.product?.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 font-bold">
          <span>Total</span>
          <span className="text-primary">Rp{total.toLocaleString()}</span>
        </div>
      </div>

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
              placeholder="Masukkan alamat lengkap (jalan, rt/rw, kelurahan, kecamatan, kabupaten)"
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
              placeholder="Catatan untuk penjual (contoh: pintu belakang)"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 text-lg"
          >
            {submitting ? 'Memproses...' : '💳 Buat Pesanan & Lanjutkan Pembayaran'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;