const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Konfigurasi RajaOngkir
const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const RAJAONGKIR_BASE_URL = process.env.RAJAONGKIR_BASE_URL || 'https://api.rajaongkir.com/starter';

/**
 * Get all provinces
 */
const getProvinces = async () => {
  try {
    const response = await axios.get(`${RAJAONGKIR_BASE_URL}/province`, {
      headers: { key: RAJAONGKIR_API_KEY }
    });
    return response.data.rajaongkir.results;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw error;
  }
};

/**
 * Get cities by province
 */
const getCities = async (provinceId) => {
  try {
    const response = await axios.get(`${RAJAONGKIR_BASE_URL}/city?province=${provinceId}`, {
      headers: { key: RAJAONGKIR_API_KEY }
    });
    return response.data.rajaongkir.results;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

/**
 * Calculate shipping cost
 */
const calculateShippingCost = async (origin, destination, weight, courier) => {
  try {
    const response = await axios.post(
      `${RAJAONGKIR_BASE_URL}/cost`,
      {
        origin,
        destination,
        weight,
        courier
      },
      {
        headers: {
          key: RAJAONGKIR_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.rajaongkir.results;
  } catch (error) {
    console.error('Error calculating shipping:', error);
    throw error;
  }
};

/**
 * Update order with shipping info
 */
const updateShipping = async (orderId, courier, trackingNumber, estimatedDate) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!order) throw new Error('Order tidak ditemukan');

    return await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        courier,
        trackingNumber,
        estimatedDate: estimatedDate ? new Date(estimatedDate) : null,
        shippingStatus: 'SHIPPED',
        status: 'SHIPPED'
      }
    });
  } catch (error) {
    console.error('Error updating shipping:', error);
    throw error;
  }
};

/**
 * Track shipment (simulasi)
 */
const trackShipment = async (trackingNumber, courier) => {
  // Simulasi tracking - real implementation would call courier API
  return {
    trackingNumber,
    courier,
    status: 'IN_TRANSIT',
    history: [
      {
        date: new Date().toISOString(),
        status: 'Paket sedang dalam perjalanan',
        location: 'Jakarta'
      },
      {
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'Paket telah diterima oleh kurir',
        location: 'Tangerang'
      }
    ],
    estimatedDelivery: new Date(Date.now() + 172800000).toISOString()
  };
};

module.exports = {
  getProvinces,
  getCities,
  calculateShippingCost,
  updateShipping,
  trackShipment
};