const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class FinancialService {
  async addRecord(umkmId, data) {
    const record = await prisma.financialRecord.create({
      data: {
        type: data.type,
        category: data.category,
        amount: parseFloat(data.amount),
        description: data.description,
        date: new Date(data.date),
        reference: data.reference,
        umkmId
      }
    });
    return record;
  }

  async getFinancialSummary(umkmId, startDate, endDate) {
    const records = await prisma.financialRecord.findMany({
      where: {
        umkmId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    });

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      netProfit: 0,
      byCategory: {},
      byDate: {}
    };

    records.forEach(record => {
      if (record.type === 'INCOME') {
        summary.totalIncome += record.amount;
      } else {
        summary.totalExpense += record.amount;
      }

      // By category
      if (!summary.byCategory[record.category]) {
        summary.byCategory[record.category] = 0;
      }
      summary.byCategory[record.category] += record.amount;

      // By date
      const dateKey = record.date.toISOString().split('T')[0];
      if (!summary.byDate[dateKey]) {
        summary.byDate[dateKey] = { income: 0, expense: 0 };
      }
      if (record.type === 'INCOME') {
        summary.byDate[dateKey].income += record.amount;
      } else {
        summary.byDate[dateKey].expense += record.amount;
      }
    });

    summary.netProfit = summary.totalIncome - summary.totalExpense;

    return summary;
  }

  async getReport(umkmId, period = 'monthly') {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const summary = await this.getFinancialSummary(umkmId, startDate, now);
    return {
      period,
      startDate,
      endDate: now,
      summary
    };
  }
}

module.exports = new FinancialService();