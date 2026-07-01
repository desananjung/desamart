const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const csv = require('csv-parser');
const { Readable } = require('stream');

class UMKMProductService {
  // Upload produk via CSV
  async bulkUploadProducts(umkmId, csvData, sellerId) {
    try {
      const results = [];
      const errors = [];
      const products = [];

      // Cek apakah UMKM ada
      const umkm = await prisma.umkm.findUnique({
        where: { id: umkmId }
      });
      
      if (!umkm) {
        throw new Error('UMKM tidak ditemukan');
      }

      // Parse CSV
      const rows = await this.parseCSV(csvData);

      // Validasi & proses setiap row
      for (const [index, row] of rows.entries()) {
        try {
          const product = await this.validateAndCreateProduct(row, umkmId, sellerId, umkm.storeId);
          products.push(product);
          results.push({
            row: index + 1,
            status: 'success',
            product: product.name
          });
        } catch (error) {
          errors.push({
            row: index + 1,
            error: error.message
          });
        }
      }

      return {
        total: rows.length,
        success: products.length,
        failed: errors.length,
        products,
        errors
      };
    } catch (error) {
      console.error('Error in bulkUploadProducts:', error);
      throw error;
    }
  }

  async parseCSV(csvData) {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = Readable.from(csvData);
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  async validateAndCreateProduct(row, umkmId, sellerId, storeId) {
    // Validasi data
    if (!row.name) throw new Error('Nama produk wajib diisi');
    if (!row.price) throw new Error('Harga produk wajib diisi');
    if (!row.categoryId) throw new Error('Kategori produk wajib diisi');

    // Cek kategori
    const category = await prisma.category.findUnique({
      where: { id: parseInt(row.categoryId) }
    });
    if (!category) throw new Error('Kategori tidak ditemukan');

    // Buat product
    const product = await prisma.product.create({
      data: {
        name: row.name,
        description: row.description || '',
        price: parseFloat(row.price),
        stock: parseInt(row.stock) || 0,
        imageUrl: row.imageUrl || '',
        categoryId: parseInt(row.categoryId),
        sellerId,
        storeId
      }
    });

    // Buat relasi UMKMProduct
    await prisma.uMKMProduct.create({
      data: {
        productId: product.id,
        umkmId,
        productionDate: row.productionDate ? new Date(row.productionDate) : null,
        expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
        batchNumber: row.batchNumber || '',
        halal: row.halal === 'true' || row.halal === '1',
        organic: row.organic === 'true' || row.organic === '1',
        bpom: row.bpom === 'true' || row.bpom === '1',
        bpomNumber: row.bpomNumber || ''
      }
    });

    return product;
  }

  // Alert stok menipis
  async getLowStockProducts(umkmId, threshold = 10) {
    try {
      const products = await prisma.product.findMany({
        where: {
          store: {
            umkm: {
              id: umkmId
            }
          },
          stock: { lte: threshold }
        },
        include: {
          category: true
        },
        orderBy: {
          stock: 'asc'
        }
      });
      return products;
    } catch (error) {
      console.error('Error in getLowStockProducts:', error);
      return [];
    }
  }

  // Update stok massal
  async bulkUpdateStock(umkmId, updates) {
    try {
      const results = [];
      for (const update of updates) {
        try {
          const product = await prisma.product.findFirst({
            where: {
              id: update.productId,
              store: {
                umkm: {
                  id: umkmId
                }
              }
            }
          });

          if (!product) throw new Error('Produk tidak ditemukan');

          const updated = await prisma.product.update({
            where: { id: product.id },
            data: { stock: update.stock }
          });
          results.push({
            productId: product.id,
            status: 'success',
            productName: product.name
          });
        } catch (error) {
          results.push({
            productId: update.productId,
            status: 'failed',
            error: error.message
          });
        }
      }
      return results;
    } catch (error) {
      console.error('Error in bulkUpdateStock:', error);
      throw error;
    }
  }

  // Export produk ke CSV
  async exportProducts(umkmId) {
    try {
      const products = await prisma.product.findMany({
        where: {
          store: {
            umkm: {
              id: umkmId
            }
          }
        },
        include: {
          category: true,
          umkmProducts: true
        }
      });

      // Format untuk CSV
      const formatted = products.map(p => ({
        name: p.name,
        description: p.description || '',
        price: p.price,
        stock: p.stock,
        category: p.category.name,
        imageUrl: p.imageUrl || '',
        productionDate: p.umkmProducts[0]?.productionDate || '',
        expiryDate: p.umkmProducts[0]?.expiryDate || '',
        batchNumber: p.umkmProducts[0]?.batchNumber || '',
        halal: p.umkmProducts[0]?.halal ? 'Yes' : 'No',
        organic: p.umkmProducts[0]?.organic ? 'Yes' : 'No',
        bpom: p.umkmProducts[0]?.bpom ? 'Yes' : 'No'
      }));

      return formatted;
    } catch (error) {
      console.error('Error in exportProducts:', error);
      throw error;
    }
  }
}

module.exports = new UMKMProductService();