import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📦 Riwayat Pesanan</h1>
        <Link to="/marketplace" className="btn-primary text-sm">🛍️ Belanja Lagi</Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">📭</span>
          <h2 className="text-xl font-bold text-gray-700">Belum Ada Pesanan</h2>
          <p className="text-gray-500 mt-2">Mulai belanja sekarang!</p>
          <Link to="/marketplace" className="btn-primary inline-block mt-4">🛍️ Belanja Sekarang</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg">Pesanan #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">Rp{order.total?.toLocaleString()}</p>
                  <Link to={`/orders/${order.id}`} className="text-primary hover:underline text-sm font-medium">
                    Lihat Detail →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;