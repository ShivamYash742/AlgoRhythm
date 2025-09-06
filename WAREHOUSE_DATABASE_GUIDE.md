# Intelligent Warehouse Management System - Database Guide

## 🎯 Overview

This Prisma schema is designed specifically for your intelligent warehouse management system that uses ML to reduce dead stock. The database structure supports the complete workflow you described.

## 🏗️ Core Models & Relationships

### 1. **Warehouse Model**
Represents physical warehouse locations with capacity management.

```typescript
// Key attributes:
- totalCapacity: Total storage capacity in units
- usedCapacity: Currently used capacity
- availableCapacity: Calculated available space
- managerName, managerEmail: Warehouse manager contact info
```

### 2. **Product Model**
Represents inventory items with shelf-life tracking and AI predictions.

```typescript
// Key attributes:
- shelfLifeDays: Shelf life in days
- receivedDate, expiryDate: Date tracking
- deadStockRisk: ML-calculated risk score (0-1)
- status: HEALTHY, AT_RISK, DEAD_STOCK, EXPIRED
- minStockLevel, maxStockLevel: Reorder thresholds
```

### 3. **Order Model**
Tracks purchase orders with ML integration.

```typescript
// Key attributes:
- mlRecommendedDate: When ML model suggests ordering
- mlConfidence: ML confidence score
- status: PENDING, APPROVED, PLACED, DELIVERED, etc.
- shelfLifeDays: Specific to this order batch
```

### 4. **Alert Model**
System notifications for warehouse managers.

```typescript
// Key attributes:
- type: SHELF_LIFE_WARNING, DEAD_STOCK_ALERT, SPACE_CONSTRAINT
- priority: LOW, MEDIUM, HIGH, CRITICAL
- isRead, isResolved: Status tracking
```

## 🔄 Workflow Implementation

### **Step 1: New Order Request**
```typescript
// 1. Check warehouse space
const warehouse = await prisma.warehouse.findUnique({
  where: { id: warehouseId },
  include: { products: true }
});

const availableSpace = warehouse.totalCapacity - warehouse.usedCapacity;

if (availableSpace < orderQuantity) {
  // 2. No space - create dead stock alert
  await prisma.alert.create({
    data: {
      title: "Warehouse Space Constraint",
      message: "Insufficient space for new order. Dead stock detected.",
      type: "SPACE_CONSTRAINT",
      priority: "HIGH",
      warehouseId: warehouseId
    }
  });
  return { success: false, reason: "No space available" };
}
```

### **Step 2: ML Model Integration**
```typescript
// 3. ML model decides optimal order date
const mlPrediction = await yourMLModel.predict({
  productId,
  currentStock,
  salesHistory,
  seasonalFactors
});

// 4. Create order with ML recommendation
const order = await prisma.order.create({
  data: {
    productId,
    warehouseId,
    quantity: orderQuantity,
    shelfLifeDays: 24,
    mlRecommendedDate: mlPrediction.optimalDate,
    mlConfidence: mlPrediction.confidence,
    status: "PENDING"
  }
});
```

### **Step 3: Shelf Life Monitoring**
```typescript
// 5. Monitor existing stock for expiry
const expiringProducts = await prisma.product.findMany({
  where: {
    expiryDate: {
      lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    status: { not: "EXPIRED" }
  }
});

// 6. Create shelf life warnings
for (const product of expiringProducts) {
  await prisma.alert.create({
    data: {
      title: "Product Expiring Soon",
      message: `${product.name} expires in ${product.daysUntilExpiry} days`,
      type: "SHELF_LIFE_WARNING",
      priority: product.daysUntilExpiry <= 3 ? "CRITICAL" : "HIGH",
      productId: product.id,
      warehouseId: product.warehouseId
    }
  });
}
```

## 📊 Key Queries for Your System

### **Get Warehouse Status**
```typescript
const warehouseStatus = await prisma.warehouse.findUnique({
  where: { id: warehouseId },
  include: {
    products: {
      select: {
        id: true,
        name: true,
        currentStock: true,
        status: true,
        deadStockRisk: true,
        daysUntilExpiry: true
      }
    },
    alerts: {
      where: { isResolved: false },
      orderBy: { priority: "desc" }
    }
  }
});
```

### **Find Dead Stock**
```typescript
const deadStock = await prisma.product.findMany({
  where: {
    warehouseId,
    OR: [
      { status: "DEAD_STOCK" },
      { deadStockRisk: { gte: 0.7 } },
      { expiryDate: { lt: new Date() } }
    ]
  },
  include: {
    recommendations: {
      where: { isImplemented: false },
      orderBy: { urgency: "desc" }
    }
  }
});
```

### **Get ML Recommendations**
```typescript
const recommendations = await prisma.recommendation.findMany({
  where: {
    productId,
    isImplemented: false
  },
  orderBy: [
    { urgency: "desc" },
    { expectedImpact: "desc" }
  ]
});
```

## 🔧 Database Setup

### **1. Install Prisma**
```bash
npm install prisma @prisma/client
```

### **2. Set up Environment Variables**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/warehouse_db"
```

### **3. Generate Prisma Client**
```bash
npx prisma generate
```

### **4. Run Migrations**
```bash
npx prisma db push
```

### **5. Seed Initial Data**
```typescript
// Create initial warehouse
const warehouse = await prisma.warehouse.create({
  data: {
    name: "Main Warehouse",
    location: "New York",
    totalCapacity: 10000,
    usedCapacity: 0,
    managerName: "John Smith",
    managerEmail: "john@company.com"
  }
});

// Create sample products
const products = await prisma.product.createMany({
  data: [
    {
      sku: "DAIRY-001",
      name: "Fresh Milk",
      costPrice: 2.50,
      sellingPrice: 4.00,
      shelfLifeDays: 7,
      currentStock: 100,
      warehouseId: warehouse.id
    },
    {
      sku: "BAKERY-001", 
      name: "Bread Loaf",
      costPrice: 1.00,
      sellingPrice: 2.50,
      shelfLifeDays: 3,
      currentStock: 50,
      warehouseId: warehouse.id
    }
  ]
});
```

## 🚀 API Integration Examples

### **Order Processing API**
```typescript
// app/api/orders/route.ts
export async function POST(request: Request) {
  const { productId, warehouseId, quantity, shelfLifeDays } = await request.json();
  
  // Check space availability
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId }
  });
  
  if (warehouse.availableCapacity < quantity) {
    return Response.json({ 
      success: false, 
      message: "Insufficient warehouse space" 
    });
  }
  
  // Create order
  const order = await prisma.order.create({
    data: {
      productId,
      warehouseId,
      quantity,
      shelfLifeDays,
      status: "PENDING"
    }
  });
  
  return Response.json({ success: true, order });
}
```

### **Dead Stock Detection API**
```typescript
// app/api/dead-stock/route.ts
export async function GET() {
  const deadStock = await prisma.product.findMany({
    where: {
      OR: [
        { status: "DEAD_STOCK" },
        { deadStockRisk: { gte: 0.7 } },
        { expiryDate: { lt: new Date() } }
      ]
    },
    include: {
      warehouse: true,
      recommendations: true
    }
  });
  
  return Response.json(deadStock);
}
```

## 🎯 Next Steps

1. **Set up your database** using the Prisma schema
2. **Create API routes** for your specific workflow
3. **Integrate your ML model** to populate `deadStockRisk` and `mlRecommendedDate`
4. **Build notification system** using the Alert model
5. **Implement recommendation engine** using the Recommendation model

This schema provides everything you need to build your intelligent warehouse management system! 🚀
