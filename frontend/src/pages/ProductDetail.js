import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { ShoppingCartIcon } from '@heroicons/react/24/outline'; // ← TAMBAHKAN INI

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, reviewsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/buyer/reviews/product/${id}`)
        ]);
        setProduct(productRes.data.data);
        setReviews(reviewsRes.data.data || []);

        if (user) {
          const wishlistRes = await api.get(`/buyer/wishlist/check/${id}`);
          setIsInWishlist(wishlistRes.data.data.isInWishlist);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    try {
      await api.post('/buyer/wishlist/toggle', { productId: id });
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const addToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    setAddingToCart(true);
    try {
      await api.post('/cart/items', { productId: id, quantity });
      alert('✅ Produk ditambahkan ke keranjang!');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan ke keranjang');
    } finally {
      setAddingToCart(false);
    }
  };

  // ← TAMBAHKAN FUNGSI BUY NOW
  const buyNow = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    // Tambahkan ke keranjang dulu, lalu redirect ke checkout
    setAddingToCart(true);
    try {
      await api.post('/cart/items', { productId: id, quantity: 1 });
      navigate('/checkout');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal proses pembelian');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Produk tidak ditemukan</h2>
        <Link to="/products" className="btn-primary inline-block mt-4">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-primary">Produk</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-6xl">📦</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-gray-500 text-sm mt-1">
                Kategori: {product.category?.name}
              </p>
              <p className="text-gray-500 text-sm">
                Seller: {product.seller?.name}
              </p>
            </div>
            <button
              onClick={toggleWishlist}
              className="p-3 hover:bg-gray-100 rounded-full transition"
            >
              {isInWishlist ? (
                <HeartSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartOutline className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <span className="text-3xl font-bold text-primary">
              Rp{product.price?.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 line-through">
              Rp{(product.price * 1.2)?.toLocaleString()}
            </span>
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-semibold">
              -20%
            </span>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-yellow-400">⭐⭐⭐⭐</span>
              <span className="text-sm text-gray-500 ml-2">(120 ulasan)</span>
            </div>
            <span className="text-sm text-gray-500">|</span>
            <span className="text-sm text-gray-500">Terjual 50+</span>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-500">Stok: {product.stock}</p>
          </div>

          <div className="mt-6 flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-2 min-w-[40px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {user ? (
              <>
                <button
                  onClick={addToCart}
                  disabled={addingToCart || product.stock === 0}
                  className="flex-1 btn-secondary py-3 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {addingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                </button>
                <button
                  onClick={buyNow}
                  disabled={product.stock === 0}
                  className="flex-1 btn-primary py-3 text-lg disabled:opacity-50"
                >
                  {product.stock === 0 ? 'Stok Habis' : 'Beli Sekarang'}
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login', { state: { from: `/product/${product.id}` } })}
                className="flex-1 btn-primary py-3 text-lg"
              >
                🔑 Login untuk Beli
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h3 className="text-xl font-bold mb-4">⭐ Ulasan Pembeli</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500">Belum ada ulasan untuk produk ini</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold">{review.user?.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-yellow-400">
                    {'⭐'.repeat(review.rating)}
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;