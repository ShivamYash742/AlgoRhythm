import { prisma } from '../lib/prisma';

async function seedDatabase() {
  console.log('🌱 Seeding database...\n');

  try {
    // Create a default warehouse
    const warehouse = await prisma.warehouse.create({
      data: {
        location: 'Main Warehouse - New York',
        capacity: 10000,
        usedCapacity: 0
      }
    });

    console.log(`✅ Created warehouse: ${warehouse.location}`);

    // Create sample products
    const products = await prisma.product.createMany({
      data: [
        {
          name: 'Fresh Milk',
          quantity: 200,
          selfLife: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          status: 'LOW_SHELF_LIFE',
          warehouseId: warehouse.id
        },
        {
          name: 'Artisan Bread',
          quantity: 50,
          selfLife: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago (expired)
          status: 'DEAD_STOCK',
          warehouseId: warehouse.id
        },
        {
          name: 'Canned Tomatoes',
          quantity: 500,
          selfLife: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // 300 days from now
          status: 'ACTIVE',
          warehouseId: warehouse.id
        },
        {
          name: 'Organic Bananas',
          quantity: 300,
          selfLife: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          status: 'LOW_SHELF_LIFE',
          warehouseId: warehouse.id
        },
        {
          name: 'Frozen Vegetables',
          quantity: 150,
          selfLife: new Date(Date.now() + 170 * 24 * 60 * 60 * 1000), // 170 days from now
          status: 'ACTIVE',
          warehouseId: warehouse.id
        }
      ]
    });

    console.log(`✅ Created ${products.count} products`);

    // Create some sample orders
    const allProducts = await prisma.product.findMany({
      where: { warehouseId: warehouse.id }
    });

    const orders = await prisma.order.createMany({
      data: [
        {
          productId: allProducts[0].id, // Fresh Milk
          warehouseId: warehouse.id,
          quantityOrdered: 200,
          orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          productId: allProducts[2].id, // Canned Tomatoes
          warehouseId: warehouse.id,
          quantityOrdered: 500,
          orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        },
        {
          productId: allProducts[4].id, // Frozen Vegetables
          warehouseId: warehouse.id,
          quantityOrdered: 150,
          orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
        }
      ]
    });

    console.log(`✅ Created ${orders.count} orders`);

    // Update warehouse capacity
    const totalQuantity = allProducts.reduce((sum, product) => sum + product.quantity, 0);
    await prisma.warehouse.update({
      where: { id: warehouse.id },
      data: { usedCapacity: totalQuantity }
    });

    console.log(`✅ Updated warehouse capacity: ${totalQuantity} units used`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Warehouse: ${warehouse.location}`);
    console.log(`- Products: ${products.count}`);
    console.log(`- Orders: ${orders.count}`);
    console.log(`- Total Capacity Used: ${totalQuantity}/${warehouse.capacity} units`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('\n✨ Seeding complete! You can now test the API endpoints.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
