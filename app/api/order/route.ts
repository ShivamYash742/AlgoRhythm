import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

// POST /api/order - Process new order
export async function POST(request: NextRequest) {
  try {
    const {
      productName,
      quantity,
      shelfLifeDays,
      unitCost,
      sellingPrice,
      category,
      brand,
      warehouseId
    } = await request.json();

    // Validate required fields
    if (!productName || !quantity || !shelfLifeDays || !warehouseId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get warehouse information
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId }
    });

    if (!warehouse) {
      return NextResponse.json(
        { success: false, error: 'Warehouse not found' },
        { status: 404 }
      );
    }

    // Check warehouse space availability
    const availableSpace = warehouse.capacity - warehouse.usedCapacity;
    
    if (availableSpace < quantity) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient warehouse space',
        availableSpace,
        requiredSpace: quantity,
        message: 'Not enough space in warehouse. Please clear dead stock first.'
      });
    }

    // Check if product already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: {
          equals: productName,
          mode: 'insensitive'
        },
        warehouseId: warehouseId
      }
    });

    // ML Logic: Check existing product's shelf life
    if (existingProduct) {
      const daysUntilExpiry = Math.ceil((existingProduct.selfLife.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      // If existing product expires in 7 days or less, recommend selling old stock first
      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        return NextResponse.json({
          success: false,
          error: 'Existing stock expires soon',
          existingProduct: {
            id: existingProduct.id,
            name: existingProduct.name,
            currentQuantity: existingProduct.quantity,
            daysUntilExpiry: daysUntilExpiry,
            status: existingProduct.status
          },
          message: `Warning: Existing stock of ${productName} expires in ${daysUntilExpiry} days. Consider selling old stock first.`,
          recommendation: 'Apply discount to existing stock before placing new order.'
        });
      }

      // If existing product is already expired, it's dead stock
      if (daysUntilExpiry <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Dead stock detected',
          existingProduct: {
            id: existingProduct.id,
            name: existingProduct.name,
            currentQuantity: existingProduct.quantity,
            daysUntilExpiry: daysUntilExpiry,
            status: existingProduct.status
          },
          message: `Dead stock detected: ${productName} has expired. Please liquidate existing stock first.`,
          recommendation: 'Liquidate or dispose of expired stock before placing new order.'
        });
      }

      // Update existing product quantity
      const updatedProduct = await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          quantity: existingProduct.quantity + quantity,
          // Update shelf life to the new batch if it's longer
          selfLife: new Date(Date.now() + shelfLifeDays * 24 * 60 * 60 * 1000),
          status: 'ACTIVE' // Reset status to active for new stock
        }
      });

      // Create order record
      const order = await prisma.order.create({
        data: {
          productId: existingProduct.id,
          quantityOrdered: quantity
        }
      });

      // Update warehouse capacity
      await prisma.warehouse.update({
        where: { id: warehouseId },
        data: {
          usedCapacity: warehouse.usedCapacity + quantity
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Order processed successfully - existing product updated',
        orderId: order.id,
        product: updatedProduct,
        action: 'updated_existing'
      });

    } else {
      // Create new product
      const newProduct = await prisma.product.create({
        data: {
          name: productName,
          quantity: quantity,
          selfLife: new Date(Date.now() + shelfLifeDays * 24 * 60 * 60 * 1000),
          status: 'ACTIVE',
          warehouseId: warehouseId
        }
      });

      // Create order record
      const order = await prisma.order.create({
        data: {
          productId: newProduct.id,
          quantityOrdered: quantity
        }
      });

      // Update warehouse capacity
      await prisma.warehouse.update({
        where: { id: warehouseId },
        data: {
          usedCapacity: warehouse.usedCapacity + quantity
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Order processed successfully - new product created',
        orderId: order.id,
        product: newProduct,
        action: 'created_new'
      });
    }

  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process order' },
      { status: 500 }
    );
  }
}
