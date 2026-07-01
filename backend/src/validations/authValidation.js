const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required()
    .messages({
      'string.empty': 'Nama wajib diisi',
      'string.min': 'Nama minimal 3 karakter',
      'any.required': 'Nama wajib diisi'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email tidak valid',
      'string.empty': 'Email wajib diisi',
      'any.required': 'Email wajib diisi'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'Password minimal 6 karakter',
      'string.empty': 'Password wajib diisi',
      'any.required': 'Password wajib diisi'
    }),
  role: Joi.string().valid('BUYER', 'SELLER', 'ADMIN').optional().default('BUYER')
    .messages({
      'any.only': 'Role harus salah satu dari: BUYER, SELLER, ADMIN'
    })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email tidak valid',
      'string.empty': 'Email wajib diisi',
      'any.required': 'Email wajib diisi'
    }),
  password: Joi.string().required()
    .messages({
      'string.empty': 'Password wajib diisi',
      'any.required': 'Password wajib diisi'
    })
});

module.exports = { registerSchema, loginSchema };