import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/orders - Get all orders with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const status = searchParams.get('status');
    const productId = searchParams.get('productId');

    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (status) where.status = status;
    if (productId) where.productId = productId;

    const orders = await prisma.order.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            currentStock: true,
            status: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        alerts: {
          where: { isResolved: false },
          orderBy: { priority: 'desc' }
        }
      },
      orderBy: { requestedDate: 'desc' }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order (implements your workflow)
export async function POST(request: NextRequest) {
  try {
    const { productId, warehouseId, quantity, shelfLifeDays, unitCost } = await request.json();

    // Step 1: Check warehouse space availability
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId }
    });

    if (!warehouse) {
      return NextResponse.json(
        { success: false, error: 'Warehouse not found' },
        { status: 404 }
      );
    }

    const availableSpace = warehouse.totalCapacity - warehouse.usedCapacity;

    // Step 2: Decision making - Check if there's space
    if (availableSpace < quantity) {
      // No space - Create dead stock alert
      await prisma.alert.create({
        data: {
          title: 'Warehouse Space Constraint',
          message: `Insufficient space for new order. Required: ${quantity} units, Available: ${availableSpace} units. Please clear dead stock first.`,
          type: 'SPACE_CONSTRAINT',
          priority: 'HIGH',
          warehouseId: warehouseId
        }
      });

      return NextResponse.json({
        success: false,
        error: 'Insufficient warehouse space',
        availableSpace,
        requiredSpace: quantity,
        message: 'Dead stock alert created. Please clear old inventory before placing new order.'
      });
    }

    // Step 3: Create the order
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        productId,
        warehouseId,
        quantity,
        unitCost,
        totalCost: quantity * unitCost,
        shelfLifeDays,
        expectedExpiry: new Date(Date.now() + shelfLifeDays * 24 * 60 * 60 * 1000),
        status: 'PENDING'
      }
    });

    // Step 4: Update warehouse capacity
    await prisma.warehouse.update({
      where: { id: warehouseId },
      data: {
        usedCapacity: warehouse.usedCapacity + quantity
      }
    });

    // Step 5: Update product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        currentStock: {
          increment: quantity
        },
        receivedDate: new Date(),
        expiryDate: new Date(Date.now() + shelfLifeDays * 24 * 60 * 60 * 1000)
      }
    });

    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
