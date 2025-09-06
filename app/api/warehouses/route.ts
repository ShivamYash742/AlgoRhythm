import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

// GET /api/warehouses - Get all warehouses
export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        products: true
      }
    });

    // Calculate warehouse statistics
    const warehousesWithStats = warehouses.map(warehouse => {
      const totalProducts = warehouse.products.length;
      const totalQuantity = warehouse.products.reduce((sum, product) => sum + product.quantity, 0);
      const lowShelfLifeCount = warehouse.products.filter(product => {
        const daysUntilExpiry = Math.ceil((product.selfLife.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      }).length;
      const deadStockCount = warehouse.products.filter(product => product.status === 'DEAD_STOCK').length;

      return {
        ...warehouse,
        availableCapacity: warehouse.capacity - warehouse.usedCapacity,
        utilizationPercentage: (warehouse.usedCapacity / warehouse.capacity) * 100,
        stats: {
          totalProducts,
          totalQuantity,
          lowShelfLifeCount,
          deadStockCount
        }
      };
    });

    return NextResponse.json(warehousesWithStats);

  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
}