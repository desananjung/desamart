const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().allow(''),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).default(0),
  categoryId: Joi.number().integer().required(),
  imageUrl: Joi.string().uri().allow('')
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().allow(''),
  price: Joi.number().positive(),
  stock: Joi.number().integer().min(0),
  categoryId: Joi.number().integer(),
  imageUrl: Joi.string().uri().allow('')
});

module.exports = { createProductSchema, updateProductSchema };