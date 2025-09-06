import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/debug-warehouses - Debug warehouses API
export async function GET() {
  try {
    console.log('Testing Prisma connection...');
    
    // Simple test first
    const warehouseCount = await prisma.warehouse.count();
    console.log('Warehouse count:', warehouseCount);
    
    // Try to fetch warehouses without includes
    const warehouses = await prisma.warehouse.findMany();
    console.log('Warehouses fetched:', warehouses.length);
    
    return NextResponse.json({
      success: true,
      warehouseCount,
      warehouses: warehouses.map(w => ({
        id: w.id,
        location: w.location,
        capacity: w.capacity,
        usedCapacity: w.usedCapacity
      }))
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
