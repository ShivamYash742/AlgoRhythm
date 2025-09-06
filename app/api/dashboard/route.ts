import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/dashboard - Get all dashboard data
export async function GET() {
  try {
    // Fetch all warehouses with their products
    const warehouses = await prisma.warehouse.findMany({
      include: {
        products: {
          include: {
            orders: {
              orderBy: { orderDate: 'desc' },
              take: 5 // Get latest 5 orders per product
            }
          }
        }
      }
    });

    // Calculate dashboard statistics
    const allProducts = warehouses.flatMap((warehouse) => warehouse.products);
    
    const stats = {
      totalProducts: allProducts.length,
      totalQuantity: allProducts.reduce((sum: number, product) => sum + product.quantity, 0),
      lowShelfLifeCount: allProducts.filter((product) => {
        const daysUntilExpiry = Math.ceil((product.selfLife.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      }).length,
      deadStockCount: allProducts.filter((product) => product.status === 'DEAD_STOCK').length,
      activeCount: allProducts.filter((product) => product.status === 'ACTIVE').length,
      lowShelfLifeStatusCount: allProducts.filter((product) => product.status === 'LOW_SHELF_LIFE').length
    };

    // Add calculated fields to products
    const productsWithCalculations = allProducts.map((product) => {
      const daysUntilExpiry = Math.ceil((product.selfLife.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const warehouse = warehouses.find((w) => w.id === product.warehouseId);
      
      return {
        ...product,
        daysUntilExpiry: daysUntilExpiry,
        isExpired: daysUntilExpiry <= 0,
        warehouse: warehouse,
        // Add calculated pricing (you can modify these formulas based on your business logic)
        costPrice: Math.round((Math.random() * 5 + 1) * 100) / 100, // Random between $1-6
        sellingPrice: Math.round((Math.random() * 8 + 3) * 100) / 100, // Random between $3-11
        category: ['Dairy', 'Produce', 'Canned Goods', 'Frozen', 'Bakery', 'Beverages'][Math.floor(Math.random() * 6)],
        brand: ['Premium', 'Organic', 'Local', 'Brand A', 'Brand B', 'Generic'][Math.floor(Math.random() * 6)]
      };
    });

    // Calculate warehouse utilization
    const warehouseUtilization = warehouses.map((warehouse) => ({
      id: warehouse.id,
      location: warehouse.location,
      utilizationPercentage: Math.round((warehouse.usedCapacity / warehouse.capacity) * 100)
    }));

    return NextResponse.json({
      success: true,
      warehouses,
      products: productsWithCalculations,
      stats,
      warehouseUtilization
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
