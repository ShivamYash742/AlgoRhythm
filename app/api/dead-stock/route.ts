import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/dead-stock - Get all dead stock products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');

    const where: any = {
      OR: [
        { status: 'DEAD_STOCK' },
        { deadStockRisk: { gte: 0.7 } },
        { expiryDate: { lt: new Date() } }
      ]
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const deadStock = await prisma.product.findMany({
      where,
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        recommendations: {
          where: { isImplemented: false },
          orderBy: { urgency: 'desc' }
        },
        alerts: {
          where: { isResolved: false },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: [
        { deadStockRisk: 'desc' },
        { expiryDate: 'asc' }
      ]
    });

    // Calculate additional metrics
    const deadStockWithMetrics = deadStock.map(product => {
      const daysUntilExpiry = product.expiryDate 
        ? Math.ceil((product.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

      const totalValue = product.currentStock * product.sellingPrice;
      const totalCost = product.currentStock * product.costPrice;
      const potentialLoss = totalValue - totalCost;

      return {
        ...product,
        daysUntilExpiry,
        totalValue,
        totalCost,
        potentialLoss,
        isExpired: product.expiryDate ? product.expiryDate < new Date() : false
      };
    });

    return NextResponse.json(deadStockWithMetrics);
  } catch (error) {
    console.error('Error fetching dead stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dead stock' },
      { status: 500 }
    );
  }
}

// POST /api/dead-stock/analyze - Analyze products for dead stock risk
export async function POST(request: NextRequest) {
  try {
    const { warehouseId } = await request.json();

    // Get all products in the warehouse
    const products = await prisma.product.findMany({
      where: { warehouseId },
      include: {
        sales: {
          orderBy: { saleDate: 'desc' },
          take: 30 // Last 30 sales
        }
      }
    });

    const analysisResults = [];

    for (const product of products) {
      // Calculate dead stock risk based on various factors
      let deadStockRisk = 0;

      // Factor 1: Days until expiry
      if (product.expiryDate) {
        const daysUntilExpiry = Math.ceil((product.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 0) {
          deadStockRisk += 0.8; // Expired
        } else if (daysUntilExpiry <= 3) {
          deadStockRisk += 0.6; // Expiring very soon
        } else if (daysUntilExpiry <= 7) {
          deadStockRisk += 0.4; // Expiring soon
        } else if (daysUntilExpiry <= 14) {
          deadStockRisk += 0.2; // Expiring in 2 weeks
        }
      }

      // Factor 2: Sales velocity (if no sales in last 7 days, higher risk)
      const recentSales = product.sales.filter(sale => 
        sale.saleDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );
      if (recentSales.length === 0 && product.currentStock > 0) {
        deadStockRisk += 0.3;
      }

      // Factor 3: Stock level vs shelf life ratio
      if (product.shelfLifeDays > 0) {
        const stockToShelfLifeRatio = product.currentStock / product.shelfLifeDays;
        if (stockToShelfLifeRatio > 10) { // High stock relative to shelf life
          deadStockRisk += 0.2;
        }
      }

      // Factor 4: Margin (low margin products are harder to discount)
      const margin = (product.sellingPrice - product.costPrice) / product.sellingPrice;
      if (margin < 0.2) {
        deadStockRisk += 0.1;
      }

      // Cap the risk at 1.0
      deadStockRisk = Math.min(deadStockRisk, 1.0);

      // Determine status based on risk
      let status = 'HEALTHY';
      if (deadStockRisk >= 0.8) {
        status = 'DEAD_STOCK';
      } else if (deadStockRisk >= 0.5) {
        status = 'AT_RISK';
      }

      // Update product with new risk assessment
      await prisma.product.update({
        where: { id: product.id },
        data: {
          deadStockRisk,
          status,
          lastPrediction: new Date()
        }
      });

      // Create alerts for high-risk products
      if (deadStockRisk >= 0.7) {
        await prisma.alert.create({
          data: {
            title: 'High Dead Stock Risk Detected',
            message: `${product.name} has a ${(deadStockRisk * 100).toFixed(1)}% risk of becoming dead stock`,
            type: 'DEAD_STOCK_ALERT',
            priority: deadStockRisk >= 0.9 ? 'CRITICAL' : 'HIGH',
            productId: product.id,
            warehouseId: product.warehouseId
          }
        });
      }

      analysisResults.push({
        productId: product.id,
        productName: product.name,
        deadStockRisk,
        status,
        currentStock: product.currentStock,
        daysUntilExpiry: product.expiryDate 
          ? Math.ceil((product.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null
      });
    }

    return NextResponse.json({
      success: true,
      analyzedProducts: analysisResults.length,
      highRiskProducts: analysisResults.filter(p => p.deadStockRisk >= 0.7).length,
      results: analysisResults
    });

  } catch (error) {
    console.error('Error analyzing dead stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze dead stock' },
      { status: 500 }
    );
  }
}
