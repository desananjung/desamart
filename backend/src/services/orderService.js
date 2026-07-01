const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ========== CREATE ORDER ==========
const createOrder = async (userId, address, phone, note = '') => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });
  
  if (!cart || cart.items.length === 0) {
    throw new Error('Keranjang belanja kosong');
  }

  let total = 0;
  const orderItems = [];

  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new Error(`Stok produk ${item.product.name} tidak mencukupi (tersisa ${item.product.stock})`);
    }
    total += item.product.price * item.quantity;
    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price
    });
  }

  const order = await prisma.order.create({
    data: {
      userId,
      total,
      address,
      phone,
      note,
      status: 'PENDING',
      items: {
        create: orderItems
      }
    },
    include: {
      items: {
        include: {
          product: { select: { name: true, imageUrl: true } }
        }
      }
    }
  });

  for (const item of cart.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity }
      }
    });
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return order;
};

// ========== GET ORDERS BY USER ==========
const getOrdersByUser = async (userId) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: { select: { name: true, imageUrl: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

// ========== GET ORDER BY ID ==========
const getOrderById = async (orderId, userId, isAdmin = false) => {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(orderId) },
    include: {
      items: {
        include: {
          product: { select: { name: true, imageUrl: true } }
        }
      }
    }
  });
  if (!order) throw new Error('Pesanan tidak ditemukan');
  if (!isAdmin && order.userId !== userId) {
    throw new Error('Anda tidak memiliki akses ke pesanan ini');
  }
  return order;
};

// ========== UPDATE ORDER STATUS ==========
const updateOrderStatus = async (orderId, status, userId, isAdmin = false) => {
  if (!isAdmin) throw new Error('Hanya admin yang dapat mengubah status');
  
  const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) throw new Error('Status tidak valid');
  
  const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });
  if (!order) throw new Error('Pesanan tidak ditemukan');
  
  return await prisma.order.update({
    where: { id: parseInt(orderId) },
    data: { status },
    include: {
      items: {
        include: {
          product: { select: { name: true } }
        }
      }
    }
  });
};

// ========== PROCESS PAYMENT ==========
const processPayment = async (orderId, userId, paymentMethod, shippingMethod) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });
  
  if (!order) throw new Error('Pesanan tidak ditemukan');
  if (order.userId !== userId) throw new Error('Anda tidak memiliki akses ke pesanan ini');
  
  if (order.status !== 'PENDING') {
    throw new Error('Pesanan sudah diproses');
  }
  
  // Hitung ongkir
  const shippingCosts = {
    jne: 25000,
    pos: 15000,
    grab: 35000
  };
  const shippingCost = shippingCosts[shippingMethod] || 20000;
  
  // Update order
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentMethod,
      paymentStatus: 'PAID',
      paidAt: new Date(),
      shippingMethod,
      shippingCost,
      status: 'PROCESSING',
      shippingNumber: `DESA-${Date.now()}-${orderId}`
    },
    include: {
      items: {
        include: {
          product: { select: { name: true, imageUrl: true } }
        }
      },
      user: { select: { name: true, email: true } }
    }
  });
  
  return updatedOrder;
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
  processPayment
};