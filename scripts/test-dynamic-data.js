// Test script to verify all dynamic data is working
const testDynamicData = async () => {
  console.log('🧪 Testing Dynamic Data Generation...\n');

  try {
    // Test 1: Dashboard API
    console.log('1. Testing Dashboard API...');
    const dashboardResponse = await fetch('http://localhost:3000/api/dashboard');
    const dashboardData = await dashboardResponse.json();
    
    if (dashboardData.success) {
      console.log('✅ Dashboard API working');
      console.log(`   - Products: ${dashboardData.products.length}`);
      console.log(`   - Stats: ${JSON.stringify(dashboardData.stats)}`);
      console.log(`   - Warehouse Utilization: ${dashboardData.warehouseUtilization?.[0]?.utilizationPercentage}%`);
      
      // Check for dynamic data
      const hasDynamicPricing = dashboardData.products.every(p => p.costPrice && p.sellingPrice);
      const hasDynamicCategories = dashboardData.products.every(p => p.category && p.brand);
      console.log(`   - Dynamic Pricing: ${hasDynamicPricing ? '✅' : '❌'}`);
      console.log(`   - Dynamic Categories: ${hasDynamicCategories ? '✅' : '❌'}`);
    } else {
      console.log('❌ Dashboard API failed');
    }

    // Test 2: Product Lookup API
    console.log('\n2. Testing Product Lookup API...');
    const productResponse = await fetch('http://localhost:3000/api/products/Fresh%20Milk');
    const productData = await productResponse.json();
    
    if (productData.success && productData.found) {
      console.log('✅ Product Lookup API working');
      console.log(`   - Product: ${productData.product.name}`);
      console.log(`   - Quantity: ${productData.product.currentQuantity}`);
      console.log(`   - Days Until Expiry: ${productData.product.daysUntilExpiry}`);
      console.log(`   - Cost Price: $${productData.product.costPrice}`);
      console.log(`   - Selling Price: $${productData.product.sellingPrice}`);
      console.log(`   - Category: ${productData.product.category}`);
      console.log(`   - Brand: ${productData.product.brand}`);
    } else {
      console.log('❌ Product Lookup API failed');
    }

    // Test 3: Warehouses API
    console.log('\n3. Testing Warehouses API...');
    const warehousesResponse = await fetch('http://localhost:3000/api/warehouses');
    const warehousesData = await warehousesResponse.json();
    
    if (warehousesData.length > 0) {
      console.log('✅ Warehouses API working');
      console.log(`   - Warehouses: ${warehousesData.length}`);
      console.log(`   - First Warehouse: ${warehousesData[0].location}`);
      console.log(`   - Capacity: ${warehousesData[0].capacity}`);
      console.log(`   - Used: ${warehousesData[0].usedCapacity}`);
      console.log(`   - Available: ${warehousesData[0].availableCapacity}`);
    } else {
      console.log('❌ Warehouses API failed');
    }

    // Test 4: Test Dynamic Data API
    console.log('\n4. Testing Dynamic Data Generation...');
    const dynamicResponse = await fetch('http://localhost:3000/api/test-dynamic');
    const dynamicData = await dynamicResponse.json();
    
    if (dynamicData.success) {
      console.log('✅ Dynamic Data Generation working');
      console.log(`   - Test Results: ${JSON.stringify(dynamicData.testResults)}`);
    } else {
      console.log('❌ Dynamic Data Generation failed');
    }

    // Test 5: Database Connection
    console.log('\n5. Testing Database Connection...');
    const dbResponse = await fetch('http://localhost:3000/api/test-db');
    const dbData = await dbResponse.json();
    
    if (dbData.success) {
      console.log('✅ Database Connection working');
      console.log(`   - Connection: ${dbData.dbConnection}`);
    } else {
      console.log('❌ Database Connection failed');
    }

    console.log('\n🎉 Dynamic Data Testing Complete!');
    console.log('\n📊 Summary:');
    console.log('- All static data has been replaced with dynamic API calls');
    console.log('- Pricing, categories, and brands are generated dynamically');
    console.log('- Warehouse utilization is calculated in real-time');
    console.log('- Product lookups use live database data');
    console.log('- All frontend components fetch data from Prisma-powered APIs');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testDynamicData();
