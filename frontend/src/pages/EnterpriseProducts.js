import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PlusIcon } from '@heroicons/react/24/outline';

const EnterpriseProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/enterprise');
        const enterprise = res.data.data;
        if (enterprise) {
          setProducts(enterprise.products || []);
        }
      } catch (error) {
        console.error('Error fetching enterprise products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">📦 Produk Enterprise</h1>
          <p className="text-gray-500">Kelola semua produk dalam enterprise</p>
        </div>
        <Link to="/products/new" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Tambah Produk
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
          <span className="text-6xl block mb-4">📦</span>
          <h3 className="text-xl font-semibold">Belum Ada Produk</h3>
          <p className="text-gray-500 mt-2">Tambahkan produk pertama Anda</p>
          <Link to="/products/new" className="btn-primary inline-block mt-4">
            + Tambah Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
              <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                {item.product?.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-4xl">📦</span>
                )}
              </div>
              <h3 className="font-semibold mt-2">{item.product?.name}</h3>
              <p className="text-primary font-bold">Rp{item.product?.price?.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Stok: {item.product?.stock}</p>
              <p className="text-xs text-gray-400">{item.product?.category?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnterpriseProducts;