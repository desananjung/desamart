// backend/src/services/orderService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// CREATE ORDER
// ============================================
const createOrder = async (userId, address, phone, note = '') => {
  try {
    console.log('📦 Creating order for user:', userId);

    // 1. Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    console.log('🛒 Cart found:', cart ? 'Yes' : 'No');
    console.log('📦 Cart items:', cart?.items?.length || 0);

    if (!cart || cart.items.length === 0) {
      throw new Error('Keranjang belanja kosong');
    }

    // 2. Calculate total and prepare items
    let total = 0;
    const orderItemsData = [];

    for (const item of cart.items) {
      console.log(`📦 Product: ${item.product.name}, Stock: ${item.product.stock}, Qty: ${item.quantity}`);
      
      if (item.product.stock < item.quantity) {
        throw new Error(`Stok produk ${item.product.name} tidak mencukupi (tersisa ${item.product.stock})`);
      }
      
      const subtotal = item.product.price * item.quantity;
      total += subtotal;
      
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      });
    }

    console.log('💰 Total:', total);
    console.log('📦 Order items:', orderItemsData.length);

    // 3. Create order with items using transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          total: total,
          address: address,
          phone: phone,
          note: note || '',
          status: 'PENDING',
          orderNumber: `ORD-${Date.now()}-${userId}`,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                  sellerId: true
                }
              }
            }
          }
        }
      });

      console.log('✅ Order created:', newOrder.id);

      // Update stock for each product
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        });
        console.log(`📦 Stock updated for product ${item.productId}`);
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
      console.log('🗑️ Cart cleared');

      return newOrder;
    });

    return order;
  } catch (error) {
    console.error('❌ Create order error:', error);
    throw error;
  }
};

// ============================================
// GET ORDERS BY USER
// ============================================
const getOrdersByUser = async (userId) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders;
  } catch (error) {
    console.error('❌ Get orders error:', error);
    throw error;
  }
};

// ============================================
// GET ORDER BY ID
// ============================================
const getOrderById = async (orderId, userId, isAdmin = false) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                sellerId: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      throw new Error('Pesanan tidak ditemukan');
    }

    if (!isAdmin && order.userId !== userId) {
      throw new Error('Anda tidak memiliki akses ke pesanan ini');
    }

    return order;
  } catch (error) {
    console.error('❌ Get order error:', error);
    throw error;
  }
};

// ============================================
// UPDATE ORDER STATUS
// ============================================
const updateOrderStatus = async (orderId, status, userId, isAdmin = false) => {
  try {
    if (!isAdmin) {
      throw new Error('Hanya admin yang dapat mengubah status');
    }

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Status tidak valid');
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });

    if (!order) {
      throw new Error('Pesanan tidak ditemukan');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: status },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return updatedOrder;
  } catch (error) {
    console.error('❌ Update order status error:', error);
    throw error;
  }
};

// ============================================
// PROCESS PAYMENT
// ============================================
const processPayment = async (orderId, userId, paymentMethod, shippingMethod) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      throw new Error('Pesanan tidak ditemukan');
    }

    if (order.userId !== userId) {
      throw new Error('Anda tidak memiliki akses ke pesanan ini');
    }

    if (order.status !== 'PENDING') {
      throw new Error('Pesanan sudah diproses');
    }

    // Shipping costs
    const shippingCosts = {
      jne: 25000,
      pos: 15000,
      grab: 35000,
      village_courier: 20000
    };
    const shippingCost = shippingCosts[shippingMethod] || 20000;

    // Generate shipping number
    const shippingNumber = `DESA-${Date.now()}-${orderId}`;

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: paymentMethod,
        paymentStatus: 'PAID',
        paidAt: new Date(),
        shippingMethod: shippingMethod,
        shippingCost: shippingCost,
        shippingNumber: shippingNumber,
        status: 'PROCESSING'
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return updatedOrder;
  } catch (error) {
    console.error('❌ Process payment error:', error);
    throw error;
  }
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
  processPayment
};