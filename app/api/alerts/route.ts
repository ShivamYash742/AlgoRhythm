import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/alerts - Get all alerts with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const isResolved = searchParams.get('isResolved');

    const where: Prisma.AlertWhereInput = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (isResolved !== null) where.isResolved = isResolved === 'true';

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            location: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            currentStock: true,
            status: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            quantity: true,
            status: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// POST /api/alerts - Create a new alert
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const alert = await prisma.alert.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || 'MEDIUM',
        warehouseId: data.warehouseId,
        productId: data.productId,
        orderId: data.orderId
      }
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

// PATCH /api/alerts/[id] - Mark alert as read or resolved
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { isRead, isResolved, resolvedBy } = await request.json();
    
    const updateData: Prisma.AlertUpdateInput = {};
    if (isRead !== undefined) updateData.isRead = isRead;
    if (isResolved !== undefined) {
      updateData.isResolved = isResolved;
      if (isResolved) {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = resolvedBy;
      }
    }

    const alert = await prisma.alert.update({
      where: { id: context.params.id },
      data: updateData
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
