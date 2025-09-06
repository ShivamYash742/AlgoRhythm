import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🚀 Setting up Intelligent Warehouse Management Database...\n');

  try {
    // 1. Create sample warehouses
    console.log('📦 Creating sample warehouses...');
    const warehouse1 = await prisma.warehouse.create({
      data: {
        name: 'Main Distribution Center',
        location: 'New York',
        address: '123 Industrial Blvd',
        city: 'New York',
        country: 'USA',
        totalCapacity: 10000,
        usedCapacity: 0,
        managerName: 'John Smith',
        managerEmail: 'john.smith@company.com',
        managerPhone: '+1-555-0123'
      }
    });

    const warehouse2 = await prisma.warehouse.create({
      data: {
        name: 'Secondary Warehouse',
        location: 'Los Angeles',
        address: '456 Commerce St',
        city: 'Los Angeles',
        country: 'USA',
        totalCapacity: 5000,
        usedCapacity: 0,
        managerName: 'Sarah Johnson',
        managerEmail: 'sarah.johnson@company.com',
        managerPhone: '+1-555-0456'
      }
    });

    console.log(`✅ Created warehouses: ${warehouse1.name}, ${warehouse2.name}`);

    // 2. Create sample products
    console.log('\n🛍️ Creating sample products...');
    const products = await prisma.product.createMany({
      data: [
        // Fresh products with short shelf life
        {
          sku: 'DAIRY-001',
          name: 'Fresh Milk',
          description: 'Organic whole milk',
          category: 'Dairy',
          brand: 'Organic Farms',
          costPrice: 2.50,
          sellingPrice: 4.00,
          currentStock: 200,
          minStockLevel: 50,
          maxStockLevel: 500,
          shelfLifeDays: 7,
          receivedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          daysUntilExpiry: 5,
          deadStockRisk: 0.3,
          status: 'AT_RISK',
          warehouseId: warehouse1.id
        },
        {
          sku: 'BAKERY-001',
          name: 'Artisan Bread',
          description: 'Fresh baked sourdough bread',
          category: 'Bakery',
          brand: 'Local Bakery',
          costPrice: 1.50,
          sellingPrice: 3.50,
          currentStock: 100,
          minStockLevel: 25,
          maxStockLevel: 200,
          shelfLifeDays: 3,
          receivedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          daysUntilExpiry: 2,
          deadStockRisk: 0.7,
          status: 'AT_RISK',
          warehouseId: warehouse1.id
        },
        {
          sku: 'PRODUCE-001',
          name: 'Organic Bananas',
          description: 'Fresh organic bananas',
          category: 'Produce',
          brand: 'Tropical Farms',
          costPrice: 0.80,
          sellingPrice: 2.00,
          currentStock: 300,
          minStockLevel: 100,
          maxStockLevel: 500,
          shelfLifeDays: 5,
          receivedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          daysUntilExpiry: 2,
          deadStockRisk: 0.8,
          status: 'AT_RISK',
          warehouseId: warehouse1.id
        },
        // Long shelf life products
        {
          sku: 'CANNED-001',
          name: 'Canned Tomatoes',
          description: 'Premium canned tomatoes',
          category: 'Canned Goods',
          brand: 'Premium Brand',
          costPrice: 1.20,
          sellingPrice: 2.50,
          currentStock: 500,
          minStockLevel: 100,
          maxStockLevel: 1000,
          shelfLifeDays: 365,
          receivedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), // 335 days from now
          daysUntilExpiry: 335,
          deadStockRisk: 0.1,
          status: 'HEALTHY',
          warehouseId: warehouse1.id
        },
        {
          sku: 'FROZEN-001',
          name: 'Frozen Vegetables',
          description: 'Mixed frozen vegetables',
          category: 'Frozen',
          brand: 'Frozen Fresh',
          costPrice: 2.00,
          sellingPrice: 4.50,
          currentStock: 150,
          minStockLevel: 50,
          maxStockLevel: 300,
          shelfLifeDays: 180,
          receivedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          expiryDate: new Date(Date.now() + 170 * 24 * 60 * 60 * 1000), // 170 days from now
          daysUntilExpiry: 170,
          deadStockRisk: 0.2,
          status: 'HEALTHY',
          warehouseId: warehouse2.id
        },
        // Dead stock example
        {
          sku: 'EXPIRED-001',
          name: 'Expired Yogurt',
          description: 'Greek yogurt (expired)',
          category: 'Dairy',
          brand: 'Dairy Delight',
          costPrice: 1.80,
          sellingPrice: 3.50,
          currentStock: 50,
          minStockLevel: 20,
          maxStockLevel: 100,
          shelfLifeDays: 14,
          receivedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
          expiryDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago (expired)
          daysUntilExpiry: -6,
          deadStockRisk: 1.0,
          status: 'DEAD_STOCK',
          warehouseId: warehouse1.id
        }
      ]
    });

    console.log(`✅ Created ${products.count} products`);

    // 3. Create sample orders
    console.log('\n📋 Creating sample orders...');
    const orders = await prisma.order.createMany({
      data: [
        {
          orderNumber: 'ORD-2024-001',
          productId: (await prisma.product.findFirst({ where: { sku: 'DAIRY-001' } }))?.id || '',
          warehouseId: warehouse1.id,
          quantity: 200,
          unitCost: 2.50,
          totalCost: 500.00,
          shelfLifeDays: 7,
          expectedExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'DELIVERED',
          mlRecommendedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          mlConfidence: 0.85
        },
        {
          orderNumber: 'ORD-2024-002',
          productId: (await prisma.product.findFirst({ where: { sku: 'BAKERY-001' } }))?.id || '',
          warehouseId: warehouse1.id,
          quantity: 150,
          unitCost: 1.50,
          totalCost: 225.00,
          shelfLifeDays: 3,
          expectedExpiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          status: 'PENDING',
          mlRecommendedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          mlConfidence: 0.72
        }
      ]
    });

    console.log(`✅ Created ${orders.count} orders`);

    // 4. Create sample alerts
    console.log('\n🚨 Creating sample alerts...');
    const alerts = await prisma.alert.createMany({
      data: [
        {
          title: 'Product Expiring Soon',
          message: 'Artisan Bread expires in 2 days. Consider applying discount.',
          type: 'SHELF_LIFE_WARNING',
          priority: 'HIGH',
          productId: (await prisma.product.findFirst({ where: { sku: 'BAKERY-001' } }))?.id || '',
          warehouseId: warehouse1.id
        },
        {
          title: 'Dead Stock Detected',
          message: 'Expired Yogurt needs immediate liquidation or disposal.',
          type: 'DEAD_STOCK_ALERT',
          priority: 'CRITICAL',
          productId: (await prisma.product.findFirst({ where: { sku: 'EXPIRED-001' } }))?.id || '',
          warehouseId: warehouse1.id
        },
        {
          title: 'High Dead Stock Risk',
          message: 'Organic Bananas have 80% risk of becoming dead stock.',
          type: 'ML_PREDICTION',
          priority: 'HIGH',
          productId: (await prisma.product.findFirst({ where: { sku: 'PRODUCE-001' } }))?.id || '',
          warehouseId: warehouse1.id
        }
      ]
    });

    console.log(`✅ Created ${alerts.count} alerts`);

    // 5. Create sample recommendations
    console.log('\n💡 Creating sample recommendations...');
    const recommendations = await prisma.recommendation.createMany({
      data: [
        {
          productId: (await prisma.product.findFirst({ where: { sku: 'BAKERY-001' } }))?.id || '',
          type: 'DISCOUNT',
          title: 'Apply 30% Discount',
          description: 'Apply 30% discount to move Artisan Bread before expiry',
          suggestedAction: 'Reduce price from $3.50 to $2.45 for quick sale',
          expectedImpact: 75.00,
          confidence: 0.85,
          urgency: 'HIGH'
        },
        {
          productId: (await prisma.product.findFirst({ where: { sku: 'EXPIRED-001' } }))?.id || '',
          type: 'LIQUIDATE',
          title: 'Immediate Liquidation',
          description: 'Liquidate expired yogurt at cost or below',
          suggestedAction: 'Sell at $1.80 (cost price) or dispose of',
          expectedImpact: -90.00,
          confidence: 1.0,
          urgency: 'CRITICAL'
        },
        {
          productId: (await prisma.product.findFirst({ where: { sku: 'PRODUCE-001' } }))?.id || '',
          type: 'BUNDLE',
          title: 'Create Bundle Offer',
          description: 'Bundle bananas with other produce for better sales',
          suggestedAction: 'Create "Fresh Fruit Bundle" with bananas and apples',
          expectedImpact: 120.00,
          confidence: 0.70,
          urgency: 'MEDIUM'
        }
      ]
    });

    console.log(`✅ Created ${recommendations.count} recommendations`);

    // 6. Create sample sales
    console.log('\n💰 Creating sample sales...');
    const sales = await prisma.sale.createMany({
      data: [
        {
          productId: (await prisma.product.findFirst({ where: { sku: 'DAIRY-001' } }))?.id || '',
          quantitySold: 50,
          unitPrice: 4.00,
          totalRevenue: 200.00,
          profit: 75.00,
          customerName: 'Grocery Store A',
          customerEmail: 'orders@grocerystorea.com'
        },
        {
          productId: (await prisma.product.findFirst({ where: { sku: 'CANNED-001' } }))?.id || '',
          quantitySold: 100,
          unitPrice: 2.50,
          totalRevenue: 250.00,
          profit: 130.00,
          customerName: 'Restaurant B',
          customerEmail: 'supplies@restaurantb.com'
        }
      ]
    });

    console.log(`✅ Created ${sales.count} sales records`);

    // 7. Update warehouse capacity
    console.log('\n📊 Updating warehouse capacity...');
    const totalStock = await prisma.product.aggregate({
      where: { warehouseId: warehouse1.id },
      _sum: { currentStock: true }
    });

    await prisma.warehouse.update({
      where: { id: warehouse1.id },
      data: { usedCapacity: totalStock._sum.currentStock || 0 }
    });

    console.log('✅ Updated warehouse capacity');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Warehouses: 2`);
    console.log(`- Products: ${products.count}`);
    console.log(`- Orders: ${orders.count}`);
    console.log(`- Alerts: ${alerts.count}`);
    console.log(`- Recommendations: ${recommendations.count}`);
    console.log(`- Sales: ${sales.count}`);

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDatabase()
  .then(() => {
    console.log('\n✨ Setup complete! You can now start using the API endpoints.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
