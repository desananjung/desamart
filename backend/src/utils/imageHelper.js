// src/utils/imageHelper.js
import api from '../services/api';

/**
 * Konversi URL gambar ke absolute URL
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }

  // Jika sudah absolute URL (http atau https)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Jika relative URL (dimulai dengan /)
  if (imageUrl.startsWith('/')) {
    const baseURL = api.defaults.baseURL || process.env.REACT_APP_API_URL || 'https://73e9-182-10-130-155.ngrok-free.app/api';
    const baseWithoutApi = baseURL.replace('/api', '');
    return baseWithoutApi + imageUrl;
  }

  // Jika menggunakan path seperti "uploads/xxx.jpg"
  if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
    const baseURL = api.defaults.baseURL || process.env.REACT_APP_API_URL || 'https://73e9-182-10-130-155.ngrok-free.app/api';
    const baseWithoutApi = baseURL.replace('/api', '');
    return baseWithoutApi + '/' + imageUrl;
  }

  return imageUrl;
};

/**
 * Dapatkan URL untuk ditampilkan dengan fallback
 */
export const getDisplayImageUrl = (imageUrl, fallback = 'https://via.placeholder.com/300x300?text=No+Image') => {
  const fullUrl = getFullImageUrl(imageUrl);
  return fullUrl || fallback;
};

/**
 * Generate placeholder berdasarkan nama produk
 */
export const getPlaceholderImage = (productName) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const initial = productName ? productName.charAt(0).toUpperCase() : '?';
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='${randomColor.replace('#', '%23')}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='100' fill='white' font-weight='bold'%3E${initial}%3C/text%3E%3C/svg%3E`;
};