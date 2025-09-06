# Cloud Database Setup Guide

This guide will help you set up a cloud PostgreSQL database for your warehouse management system.

## 🌐 **Recommended Cloud Database Services**

### **Option 1: Supabase (Recommended - Free)**
- **Free tier**: 500MB database, 2GB bandwidth
- **Easy setup**: User-friendly interface
- **Built-in features**: Auth, real-time, storage

**Setup Steps:**
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up
3. Create a new project
4. Wait for the project to be ready (2-3 minutes)
5. Go to **Settings** → **Database**
6. Copy the connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### **Option 2: Railway (Free tier)**
- **Free tier**: $5 credit monthly
- **Simple deployment**: One-click setup
- **Good performance**: Fast and reliable

**Setup Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Database" → "PostgreSQL"
5. Wait for deployment
6. Go to the database service
7. Copy the connection string from the **Variables** tab

### **Option 3: Neon (Free tier)**
- **Free tier**: 3GB storage, 10GB transfer
- **Serverless**: Auto-scaling
- **Fast**: Optimized for performance

**Setup Steps:**
1. Go to [neon.tech](https://neon.tech)
2. Sign up for free
3. Create a new project
4. Copy the connection string from the dashboard

## 🔧 **Setting Up Your Database**

### **Step 1: Get Your Connection String**

Once you have your cloud database, you'll get a connection string that looks like:
```
postgresql://username:password@host:port/database
```

### **Step 2: Update Your .env File**

Replace the DATABASE_URL in your `.env` file:

```env
# Replace with your actual connection string
DATABASE_URL="postgresql://postgres:your-actual-password@your-actual-host:5432/your-database"
```

### **Step 3: Run Database Setup**

```bash
# Generate Prisma client
npm run db:generate

# Push schema to your cloud database
npm run db:push

# Seed with sample data
npm run db:seed
```

## 🚨 **Common Issues and Solutions**

### **Issue 1: Connection Refused**
- **Cause**: Wrong host, port, or credentials
- **Solution**: Double-check your connection string

### **Issue 2: SSL Required**
- **Cause**: Some cloud providers require SSL
- **Solution**: Add `?sslmode=require` to your connection string:
  ```
  postgresql://user:pass@host:port/db?sslmode=require
  ```

### **Issue 3: Database Not Found**
- **Cause**: Database name is incorrect
- **Solution**: Check the database name in your connection string

### **Issue 4: Permission Denied**
- **Cause**: Wrong username/password
- **Solution**: Verify your credentials

## 🔒 **Security Best Practices**

1. **Never commit your .env file** to version control
2. **Use environment variables** in production
3. **Rotate passwords** regularly
4. **Use connection pooling** for production apps
5. **Enable SSL** for secure connections

## 📊 **Testing Your Setup**

After setting up your cloud database:

1. **Test connection**:
   ```bash
   npm run db:push
   ```

2. **Verify data**:
   ```bash
   npm run db:seed
   ```

3. **Start your app**:
   ```bash
   npm run dev
   ```

4. **Check the dashboard**: Visit `http://localhost:3000/dashboard`

## 🆘 **Need Help?**

If you're having trouble:

1. **Check the connection string format**
2. **Verify your credentials**
3. **Ensure the database service is running**
4. **Check firewall settings** (if applicable)

## 🎯 **Quick Start with Supabase**

1. Go to [supabase.com](https://supabase.com)
2. Create account and new project
3. Wait 2-3 minutes for setup
4. Go to Settings → Database
5. Copy the connection string
6. Update your `.env` file
7. Run `npm run db:push`
8. Run `npm run db:seed`
9. Start your app with `npm run dev`

Your warehouse management system will be running on a cloud database! 🚀
