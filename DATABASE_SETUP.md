# Database Setup Guide

This guide will help you set up the database for the Intelligent Warehouse Management System.

## Prerequisites

1. **PostgreSQL** (recommended) or **SQLite** (for development)
2. **Node.js** and **npm** installed
3. **Prisma CLI** (installed via npm)

## Setup Steps

### 1. Environment Configuration

Create a `.env` file in the root directory with your database connection string:

```env
# For PostgreSQL (recommended)
DATABASE_URL="postgresql://username:password@localhost:5432/warehouse_db"

# For SQLite (development only)
DATABASE_URL="file:./dev.db"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Push Database Schema

```bash
npm run db:push
```

### 5. Seed Database with Sample Data

```bash
npm run db:seed
```

### 6. (Optional) Open Prisma Studio

```bash
npm run db:studio
```

## Database Schema

The system uses three main models:

### Warehouse
- **id**: Unique identifier
- **location**: Physical location of the warehouse
- **capacity**: Total storage capacity
- **usedCapacity**: Currently used capacity

### Product
- **id**: Unique identifier
- **name**: Product name
- **quantity**: Current stock quantity
- **selfLife**: Expiration date
- **status**: ACTIVE, LOW_SHELF_LIFE, or DEAD_STOCK
- **warehouseId**: Foreign key to Warehouse

### Order
- **id**: Unique identifier
- **productId**: Foreign key to Product
- **quantityOrdered**: Amount ordered
- **orderDate**: When the order was placed

## API Endpoints

Once the database is set up, you can use these endpoints:

- `GET /api/dashboard` - Get all dashboard data
- `GET /api/products/[name]` - Find product by name
- `POST /api/order` - Process new order
- `GET /api/warehouses` - Get all warehouses

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your DATABASE_URL in `.env`
   - Ensure PostgreSQL is running
   - Verify database credentials

2. **Prisma Client Not Generated**
   - Run `npm run db:generate`
   - Check for TypeScript errors

3. **Schema Push Failed**
   - Check database permissions
   - Ensure database exists
   - Try `npx prisma db push --force-reset` (⚠️ This will delete all data)

### Reset Database

If you need to start fresh:

```bash
npx prisma db push --force-reset
npm run db:seed
```

## Sample Data

The seed script creates:
- 1 warehouse (Main Warehouse - New York)
- 5 sample products with different shelf-life statuses
- 3 sample orders
- Realistic capacity and utilization data

## Next Steps

After setting up the database:

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000` to see the application
3. Test the order functionality on `/items-order`
4. View the dashboard on `/dashboard`
