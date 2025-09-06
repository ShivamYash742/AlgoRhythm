'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity
} from 'lucide-react';

interface WarehouseStats {
  totalProducts: number;
  totalValue: number;
  lowShelfLifeCount: number;
  deadStockCount: number;
  alertsCount: number;
  utilizationPercentage: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  status: 'HEALTHY' | 'AT_RISK' | 'DEAD_STOCK' | 'EXPIRED';
  daysUntilExpiry: number | null;
  deadStockRisk: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<WarehouseStats>({
    totalProducts: 0,
    totalValue: 0,
    lowShelfLifeCount: 0,
    deadStockCount: 0,
    alertsCount: 0,
    utilizationPercentage: 0
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard data
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        
        if (data.success) {
          // Calculate total value using dynamic pricing from API
          const totalValue = data.products.reduce((sum: number, product: any) => 
            sum + (product.quantity * (product.sellingPrice || 4.00)), 0);
          
          setStats({
            totalProducts: data.stats.totalProducts,
            totalValue: totalValue, // Dynamic calculation
            lowShelfLifeCount: data.stats.lowShelfLifeCount,
            deadStockCount: data.stats.deadStockCount,
            alertsCount: data.stats.lowShelfLifeCount + data.stats.deadStockCount,
            utilizationPercentage: data.warehouseUtilization?.[0]?.utilizationPercentage || 0 // Dynamic from API
          });
          
          // Convert products to the expected format
          const recentProducts = data.products.slice(0, 5).map((product: ApiProduct) => ({
            id: product.id,
            name: product.name,
            sku: product.id.substring(0, 8), // Use part of ID as SKU
            currentStock: product.quantity,
            status: product.status === 'ACTIVE' ? 'HEALTHY' : 
                   product.status === 'LOW_SHELF_LIFE' ? 'AT_RISK' : 'DEAD_STOCK',
            daysUntilExpiry: product.daysUntilExpiry,
            deadStockRisk: product.isExpired ? 1.0 : 
                          product.daysUntilExpiry <= 7 ? 0.7 : 0.2
          }));
          
          setRecentProducts(recentProducts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data
        setStats({
          totalProducts: 0,
          totalValue: 0,
          lowShelfLifeCount: 0,
          deadStockCount: 0,
          alertsCount: 0,
          utilizationPercentage: 0
        });
        
        setRecentProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-600 bg-green-100';
      case 'AT_RISK': return 'text-yellow-600 bg-yellow-100';
      case 'DEAD_STOCK': return 'text-red-600 bg-red-100';
      case 'EXPIRED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="w-4 h-4" />;
      case 'AT_RISK': return <AlertCircle className="w-4 h-4" />;
      case 'DEAD_STOCK': return <XCircle className="w-4 h-4" />;
      case 'EXPIRED': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading warehouse data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Warehouse Management Dashboard
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            AI-powered inventory management with intelligent dead stock prevention
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Low Shelf Life */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Shelf Life</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.lowShelfLifeCount}</p>
                  <p className="text-xs text-gray-500">≤ 7 days</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Dead Stock */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Dead Stock</p>
                  <p className="text-3xl font-bold text-red-600">{stats.deadStockCount}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.alertsCount}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Inventory</h2>
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getStatusColor(product.status)}`}>
                        {getStatusIcon(product.status)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{product.currentStock} units</p>
                      <p className="text-sm text-gray-500">
                        {product.daysUntilExpiry !== null 
                          ? `${product.daysUntilExpiry} days left`
                          : 'No expiry data'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <Link
                  href="/items-order"
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Place New Order</p>
                      <p className="text-sm text-gray-600">Order new inventory items</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">View Dashboard</p>
                      <p className="text-sm text-gray-600">Detailed inventory analysis</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                </Link>

                <Link
                  href="/alerts"
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-600 p-2 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">View Alerts</p>
                      <p className="text-sm text-gray-600">Check system notifications</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600" />
                </Link>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Manage Your Inventory?
              </h2>
              <p className="text-gray-600 mb-6">
                Use our AI-powered system to optimize your warehouse operations and reduce dead stock.
              </p>
              <Link
                href="/items-order"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Package className="w-5 h-5" />
                <span>Start Ordering</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}