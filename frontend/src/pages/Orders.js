import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Riwayat Pesanan</h1>
      {orders.length === 0 && <p>Belum ada pesanan.</p>}
      {orders.map(order => (
        <div key={order.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: 10 }}>
          <p><strong>Pesanan #{order.id}</strong> - Status: {order.status}</p>
          <p>Total: Rp{order.total}</p>
          <p>Alamat: {order.address}</p>
          <ul>
            {order.items.map(item => (
              <li key={item.id}>{item.product.name} x{item.quantity} = Rp{item.price * item.quantity}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Orders;