import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get('/cart');
        setCart(res.data.data);
      } catch (error) {
        console.error('Error fetching cart:', error);
        if (error.response?.status === 403) {
          // User tidak punya akses ke cart
          setCart({ items: [] });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeItem(itemId);
      return;
    }
    
    setUpdating(true);
    try {
      await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
      // Refresh cart
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal update quantity');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Yakin ingin menghapus item ini?')) return;
    
    setUpdating(true);
    try {
      await api.delete(`/cart/items/${itemId}`);
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch (error) {
      alert('Gagal hapus item');
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Yakin ingin mengosongkan keranjang?')) return;
    
    try {
      await api.delete('/cart/clear');
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch (error) {
      alert('Gagal mengosongkan keranjang');
    }
  };

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl block mb-4">🛒</span>
        <h2 className="text-2xl font-bold">Keranjang Kosong</h2>
        <p className="text-gray-500 mt-2">Yuk, mulai belanja di DesaMart!</p>
        <Link to="/marketplace" className="btn-primary inline-block mt-4">
          🛍️ Lihat Produk
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🛒 Keranjang Belanja</h1>
          <p className="text-gray-500">{items.length} item</p>
        </div>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Kosongkan Keranjang
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
            >
              {/* Product Image */}
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                {item.product?.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-3xl">📦</span>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold">{item.product?.name}</h3>
                <p className="text-primary font-bold">
                  Rp{item.product?.price?.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Stok: {item.product?.stock}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={updating}
                  className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={updating || item.quantity >= item.product?.stock}
                  className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Subtotal & Remove */}
              <div className="text-right min-w-[100px]">
                <p className="font-bold text-primary">
                  Rp{(item.product?.price * item.quantity)?.toLocaleString()}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  <TrashIcon className="w-4 h-4 inline" /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Ringkasan Belanja</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({items.length} item)</span>
                <span>Rp{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ongkos Kirim</span>
                <span>Rp20.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Diskon</span>
                <span className="text-green-500">-Rp0</span>
              </div>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">Rp{(total + 20000)?.toLocaleString()}</span>
            </div>

            <Link
              to="/checkout"
              className="btn-primary w-full mt-6 py-3 text-lg text-center block"
            >
              💳 Checkout
            </Link>

            <Link
              to="/marketplace"
              className="block text-center text-sm text-gray-500 hover:text-primary mt-3"
            >
              ← Lanjutkan Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;