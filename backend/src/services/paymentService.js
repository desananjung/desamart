const midtransClient = require('midtrans-client');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Konfigurasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
});

/**
 * Create payment transaction
 */
const createPayment = async (orderId, userId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    if (!order) throw new Error('Order tidak ditemukan');
    if (order.userId !== userId) throw new Error('Anda tidak memiliki akses ke order ini');
    if (order.paymentStatus === 'PAID') throw new Error('Order sudah dibayar');

    // Buat parameter untuk Midtrans
    const parameter = {
      transaction_details: {
        order_id: `ORDER-${order.id}-${Date.now()}`,
        gross_amount: order.total
      },
      customer_details: {
        first_name: order.user.name,
        email: order.user.email,
        phone: order.phone || '08123456789',
        billing_address: {
          address: order.address,
          phone: order.phone
        }
      },
      item_details: order.items.map(item => ({
        id: item.productId,
        price: item.price,
        quantity: item.quantity,
        name: item.product.name.substring(0, 50)
      })),
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/payment/success`,
        error: `${process.env.FRONTEND_URL}/payment/error`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`
      }
    };

    // Create transaction
    const transaction = await snap.createTransaction(parameter);
    
    // Update order dengan payment URL
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentUrl: transaction.redirect_url,
        transactionId: transaction.transaction_id,
        paymentStatus: 'PENDING'
      }
    });

    return {
      orderId: order.id,
      paymentUrl: transaction.redirect_url,
      token: transaction.token
    };
  } catch (error) {
    console.error('Payment creation error:', error);
    throw error;
  }
};

/**
 * Handle payment notification (webhook)
 */
const handlePaymentNotification = async (notification) => {
  try {
    const transaction = await snap.transaction.notification(notification);
    const orderId = transaction.order_id;
    const transactionStatus = transaction.transaction_status;
    const fraudStatus = transaction.fraud_status;

    // Cari order berdasarkan transactionId atau order_id
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { transactionId: orderId },
          { id: parseInt(orderId.split('-')[1]) }
        ]
      }
    });

    if (!order) throw new Error('Order tidak ditemukan');

    let paymentStatus = order.paymentStatus;
    let orderStatus = order.status;

    // Update status berdasarkan Midtrans response
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      paymentStatus = 'PAID';
      orderStatus = 'PROCESSING';
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'PENDING';
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
      paymentStatus = 'FAILED';
      orderStatus = 'CANCELLED';
    }

    // Update order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus,
        status: orderStatus
      }
    });

    return { orderId: order.id, paymentStatus, orderStatus };
  } catch (error) {
    console.error('Payment notification error:', error);
    throw error;
  }
};

/**
 * Check payment status
 */
const checkPaymentStatus = async (orderId, userId) => {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(orderId) }
  });

  if (!order) throw new Error('Order tidak ditemukan');
  if (order.userId !== userId) throw new Error('Anda tidak memiliki akses');

  return {
    paymentStatus: order.paymentStatus,
    paymentUrl: order.paymentUrl,
    status: order.status
  };
};

module.exports = {
  createPayment,
  handlePaymentNotification,
  checkPaymentStatus
};