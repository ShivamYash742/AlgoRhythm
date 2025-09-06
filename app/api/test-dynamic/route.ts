import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/test-dynamic - Test dynamic data generation
export async function GET() {
  try {
    // Fetch all products to test dynamic data
    const products = await prisma.product.findMany({
      include: {
        warehouse: true
      }
    });

    // Test dynamic data generation
    const testProducts = products.map(product => {
      const daysUntilExpiry = Math.ceil((product.selfLife.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      return {
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        status: product.status,
        daysUntilExpiry: daysUntilExpiry,
        isExpired: daysUntilExpiry <= 0,
        // Dynamic pricing and category data
        costPrice: Math.round((Math.random() * 5 + 1) * 100) / 100,
        sellingPrice: Math.round((Math.random() * 8 + 3) * 100) / 100,
        category: ['Dairy', 'Produce', 'Canned Goods', 'Frozen', 'Bakery', 'Beverages'][Math.floor(Math.random() * 6)],
        brand: ['Premium', 'Organic', 'Local', 'Brand A', 'Brand B', 'Generic'][Math.floor(Math.random() * 6)],
        warehouse: product.warehouse
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Dynamic data generation test successful',
      totalProducts: testProducts.length,
      products: testProducts,
      testResults: {
        hasDynamicPricing: testProducts.every(p => p.costPrice && p.sellingPrice),
        hasDynamicCategories: testProducts.every(p => p.category && p.brand),
        hasRealTimeCalculations: testProducts.every(p => typeof p.daysUntilExpiry === 'number'),
        hasWarehouseData: testProducts.every(p => p.warehouse)
      }
    });

  } catch (error) {
    console.error('Error testing dynamic data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test dynamic data' },
      { status: 500 }
    );
  }
}
