const shippingService = require('../services/shippingService');
const { success, badRequest, notFound } = require('../utils/responseHelper');

exports.getProvinces = async (req, res, next) => {
  try {
    const provinces = await shippingService.getProvinces();
    success(res, 'Daftar provinsi', provinces);
  } catch (error) {
    next(error);
  }
};

exports.getCities = async (req, res, next) => {
  try {
    const { provinceId } = req.params;
    const cities = await shippingService.getCities(provinceId);
    success(res, 'Daftar kota', cities);
  } catch (error) {
    next(error);
  }
};

exports.calculateShipping = async (req, res, next) => {
  try {
    const { origin, destination, weight, courier } = req.body;
    if (!origin || !destination || !weight || !courier) {
      return badRequest(res, 'Origin, destination, weight, dan courier wajib diisi');
    }
    const result = await shippingService.calculateShippingCost(
      origin, destination, weight, courier
    );
    success(res, 'Hasil perhitungan ongkir', result);
  } catch (error) {
    next(error);
  }
};

exports.updateShipping = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { courier, trackingNumber, estimatedDate } = req.body;
    if (!courier || !trackingNumber) {
      return badRequest(res, 'Courier dan tracking number wajib diisi');
    }
    const result = await shippingService.updateShipping(orderId, courier, trackingNumber, estimatedDate);
    success(res, 'Shipping info updated', result);
  } catch (error) {
    if (error.message.includes('tidak ditemukan')) return notFound(res, error.message);
    next(error);
  }
};

exports.trackShipment = async (req, res, next) => {
  try {
    const { trackingNumber, courier } = req.params;
    const result = await shippingService.trackShipment(trackingNumber, courier);
    success(res, 'Tracking info', result);
  } catch (error) {
    next(error);
  }
};