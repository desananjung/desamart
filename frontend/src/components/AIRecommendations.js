import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AIRecommendations = ({ productId, type = 'similar' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        let endpoint;
        if (type === 'similar') {
          endpoint = `/ai/similar/${productId}`;
        } else if (type === 'frequently-bought') {
          endpoint = `/ai/frequently-bought/${productId}`;
        } else {
          endpoint = '/ai/recommendations';
        }
        const res = await api.get(endpoint);
        setProducts(res.data.data || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, [productId, type]);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">
        {type === 'similar' && '🔄 Produk Serupa'}
        {type === 'frequently-bought' && '🛒 Sering Dibeli Bersamaan'}
        {type === 'personalized' && '🎯 Rekomendasi untuk Anda'}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition"
          >
            <div className="h-32 bg-gray-100 flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">📦</span>
              )}
            </div>
            <div className="p-3">
              <h4 className="font-semibold text-sm line-clamp-1">{product.name}</h4>
              <p className="text-primary font-bold text-sm">Rp{product.price?.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AIRecommendations;