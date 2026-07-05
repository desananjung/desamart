import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const EnterpriseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/enterprise');
        const enterprise = res.data.data;
        if (enterprise) {
          setOrders(enterprise.orders || []);
        }
      } catch (error) {
        console.error('Error fetching enterprise orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📋 Pesanan Enterprise</h1>
        <p className="text-gray-500">Lihat semua pesanan enterprise</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">📭</span>
          <h3 className="text-xl font-semibold">Belum Ada Pesanan</h3>
          <p className="text-gray-500 mt-2">Pesanan akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">Pesanan #{item.order?.id}</p>
                  <p className="text-sm text-gray-500">
                    {item.order?.user?.name} • {new Date(item.order?.createdAt).toLocaleDateString('id-ID')}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.order?.status)}`}>
                    {item.order?.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">
                    Rp{item.order?.total?.toLocaleString()}
                  </p>
                  <span className="text-xs text-gray-500">{item.order?.items?.length} item</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnterpriseOrders;