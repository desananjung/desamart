import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  TruckIcon, 
  StarIcon, 
  PlusIcon, 
  UserIcon, 
  MapPinIcon,
  UserPlusIcon 
} from '@heroicons/react/24/outline';

const VillageCouriers = () => {
  const { user } = useAuth();
  const [couriers, setCouriers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showCourierForm, setShowCourierForm] = useState(false);
  const [orderForm, setOrderForm] = useState({
    courierId: '',
    receiverId: '',
    pickupAddress: '',
    deliveryAddress: '',
    description: '',
    weight: ''
  });
  const [courierForm, setCourierForm] = useState({
    name: '',
    phone: '',
    vehicle: 'MOTOR',
    area: '',
    fee: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [couriersRes, ordersRes] = await Promise.all([
          api.get('/village-services/couriers'),
          api.get('/village-services/courier-orders')
        ]);
        setCouriers(couriersRes.data.data || []);
        setOrders(ordersRes.data.data || []);
      } catch (error) {
        console.error('Error fetching courier data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/village-services/couriers/order', orderForm);
      alert('✅ Pesanan kurir berhasil dibuat!');
      setShowOrderForm(false);
      setOrderForm({
        courierId: '',
        receiverId: '',
        pickupAddress: '',
        deliveryAddress: '',
        description: '',
        weight: ''
      });
      const res = await api.get('/village-services/courier-orders');
      setOrders(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membuat pesanan kurir');
    }
  };

  const handleCourierSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/village-services/couriers/register', courierForm);
      alert('✅ Pendaftaran kurir berhasil! Menunggu verifikasi admin.');
      setShowCourierForm(false);
      setCourierForm({
        name: '',
        phone: '',
        vehicle: 'MOTOR',
        area: '',
        fee: ''
      });
      const res = await api.get('/village-services/couriers');
      setCouriers(res.data.data || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mendaftar sebagai kurir');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PICKED: 'bg-blue-100 text-blue-800',
      IN_TRANSIT: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800'
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🚚 Kurir Desa</h1>
          <p className="text-gray-500">Layanan antar-jemput barang</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCourierForm(!showCourierForm)}
            className="btn-secondary flex items-center gap-2"
          >
            <UserPlusIcon className="w-5 h-5" />
            Daftar Kurir
          </button>
          <button
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Pesan Kurir
          </button>
        </div>
      </div>

      {/* Form Daftar Kurir */}
      {showCourierForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold mb-4">📝 Daftar Kurir Desa</h3>
          <form onSubmit={handleCourierSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={courierForm.name}
                  onChange={(e) => setCourierForm({ ...courierForm, name: e.target.value })}
                  className="input-field"
                  placeholder="Masukkan nama"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon *</label>
                <input
                  type="text"
                  value={courierForm.phone}
                  onChange={(e) => setCourierForm({ ...courierForm, phone: e.target.value })}
                  className="input-field"
                  placeholder="08xx-xxxx-xxxx"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kendaraan *</label>
                <select
                  value={courierForm.vehicle}
                  onChange={(e) => setCourierForm({ ...courierForm, vehicle: e.target.value })}
                  className="input-field"
                >
                  <option value="MOTOR">Motor</option>
                  <option value="MOBIL">Mobil</option>
                  <option value="SEPEDA">Sepeda</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarif per kg *</label>
                <input
                  type="number"
                  value={courierForm.fee}
                  onChange={(e) => setCourierForm({ ...courierForm, fee: e.target.value })}
                  className="input-field"
                  placeholder="5000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area Jangkauan *</label>
              <input
                type="text"
                value={courierForm.area}
                onChange={(e) => setCourierForm({ ...courierForm, area: e.target.value })}
                className="input-field"
                placeholder="Contoh: Desa Sukamaju & Sekitarnya"
                required
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Daftar Kurir</button>
              <button type="button" onClick={() => setShowCourierForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Form Pesan Kurir */}
      {showOrderForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold mb-4">📦 Pesan Kurir</h3>
          <form onSubmit={handleOrderSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kurir *</label>
              <select
                value={orderForm.courierId}
                onChange={(e) => setOrderForm({ ...orderForm, courierId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Pilih Kurir</option>
                {couriers.map(courier => (
                  <option key={courier.id} value={courier.id}>
                    {courier.name} - {courier.vehicle} (Rp{courier.fee}/kg) - {courier.area}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pickup *</label>
                <input
                  type="text"
                  value={orderForm.pickupAddress}
                  onChange={(e) => setOrderForm({ ...orderForm, pickupAddress: e.target.value })}
                  className="input-field"
                  placeholder="Alamat pengambilan"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman *</label>
                <input
                  type="text"
                  value={orderForm.deliveryAddress}
                  onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                  className="input-field"
                  placeholder="Alamat tujuan"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Berat (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={orderForm.weight}
                  onChange={(e) => setOrderForm({ ...orderForm, weight: e.target.value })}
                  className="input-field"
                  placeholder="1.0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Penerima</label>
                <input
                  type="text"
                  value={orderForm.receiverId}
                  onChange={(e) => setOrderForm({ ...orderForm, receiverId: e.target.value })}
                  className="input-field"
                  placeholder="ID user penerima"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Barang</label>
              <textarea
                value={orderForm.description}
                onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                className="input-field"
                rows="2"
                placeholder="Deskripsi barang yang dikirim..."
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Pesan Kurir</button>
              <button type="button" onClick={() => setShowOrderForm(false)} className="btn-secondary">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar Kurir */}
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-4">📋 Daftar Kurir</h3>
        {couriers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <TruckIcon className="w-16 h-16 text-gray-300 mx-auto" />
            <h4 className="text-xl font-semibold mt-4">Belum Ada Kurir</h4>
            <p className="text-gray-500 mt-2">Daftar sebagai kurir desa sekarang!</p>
            <button
              onClick={() => setShowCourierForm(true)}
              className="btn-primary mt-4 inline-block"
            >
              Daftar Kurir
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {couriers.map(courier => (
              <div key={courier.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <TruckIcon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{courier.name}</h4>
                    <p className="text-sm text-gray-500">{courier.vehicle}</p>
                  </div>
                </div>
                <div className="mt-2 space-y-1 text-sm text-gray-500">
                  <p>📍 {courier.area}</p>
                  <p>💰 Rp{courier.fee}/kg</p>
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-400" />
                    <span>{courier.rating || 0}/5</span>
                  </div>
                </div>
                <button
                  className="mt-3 w-full btn-secondary text-sm py-1.5"
                  onClick={() => {
                    setOrderForm({ ...orderForm, courierId: courier.id });
                    setShowOrderForm(true);
                  }}
                >
                  Pesan Kurir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Pesanan */}
      <div>
        <h3 className="font-bold text-lg mb-4">📦 Riwayat Pesanan Kurir</h3>
        {orders.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500">Belum ada pesanan kurir</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Pesanan #{order.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      📍 {order.pickupAddress} → {order.deliveryAddress}
                    </p>
                    <p className="text-sm text-gray-500">📦 {order.description || '-'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">Rp{order.fee?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{order.courier?.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VillageCouriers;