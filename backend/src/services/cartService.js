const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mendapatkan atau membuat keranjang untuk user
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, stock: true, imageUrl: true }
          }
        }
      }
    }
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: { include: { product: true } }
      }
    });
  }
  return cart;
};

// Tambah item ke keranjang
const addItem = async (userId, productId, quantity = 1) => {
  const cart = await getOrCreateCart(userId);
  // Cek stok
  const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
  if (!product) throw new Error('Produk tidak ditemukan');
  if (product.stock < quantity) throw new Error(`Stok tidak mencukupi, tersisa ${product.stock}`);

  // Cek apakah item sudah ada di keranjang
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId: parseInt(productId) }
  });
  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (product.stock < newQty) throw new Error(`Stok tidak mencukupi, tersisa ${product.stock}`);
    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty }
    });
  } else {
    return await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: parseInt(productId),
        quantity
      }
    });
  }
};

// Update quantity item
const updateItem = async (userId, itemId, quantity) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: parseInt(itemId) },
    include: { cart: true }
  });
  if (!item) throw new Error('Item tidak ditemukan');
  if (item.cart.userId !== userId) throw new Error('Anda tidak memiliki akses ke item ini');
  if (quantity <= 0) {
    // Hapus item
    return await prisma.cartItem.delete({ where: { id: parseInt(itemId) } });
  }
  // Cek stok
  const product = await prisma.product.findUnique({ where: { id: item.productId } });
  if (product.stock < quantity) throw new Error(`Stok tidak mencukupi, tersisa ${product.stock}`);
  return await prisma.cartItem.update({
    where: { id: parseInt(itemId) },
    data: { quantity }
  });
};

// Hapus item
const removeItem = async (userId, itemId) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: parseInt(itemId) },
    include: { cart: true }
  });
  if (!item) throw new Error('Item tidak ditemukan');
  if (item.cart.userId !== userId) throw new Error('Anda tidak memiliki akses');
  return await prisma.cartItem.delete({ where: { id: parseInt(itemId) } });
};

// Kosongkan keranjang
const clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};

module.exports = { getOrCreateCart, addItem, updateItem, removeItem, clearCart };