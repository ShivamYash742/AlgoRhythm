'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  status: 'HEALTHY' | 'AT_RISK' | 'DEAD_STOCK' | 'EXPIRED';
  daysUntilExpiry: number | null;
  deadStockRisk: number;
  costPrice: number;
  sellingPrice: number;
  category: string;
  brand: string;
  receivedDate: string;
  expiryDate: string;
}

interface WarehouseStats {
  totalProducts: number;
  totalValue: number;
  healthyCount: number;
  atRiskCount: number;
  deadStockCount: number;
  expiredCount: number;
  utilizationPercentage: number;
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<WarehouseStats>({
    totalProducts: 0,
    totalValue: 0,
    healthyCount: 0,
    atRiskCount: 0,
    deadStockCount: 0,
    expiredCount: 0,
    utilizationPercentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard data
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        
        if (data.success) {
          // Convert products to the expected format using dynamic data from API
          const productsData: Product[] = data.products.map((product: any) => ({
            id: product.id,
            name: product.name,
            sku: product.id.substring(0, 8), // Use part of ID as SKU
            currentStock: product.quantity,
            status: product.status === 'ACTIVE' ? 'HEALTHY' : 
                   product.status === 'LOW_SHELF_LIFE' ? 'AT_RISK' : 'DEAD_STOCK',
            daysUntilExpiry: product.daysUntilExpiry,
            deadStockRisk: product.isExpired ? 1.0 : 
                          product.daysUntilExpiry <= 7 ? 0.7 : 0.2,
            costPrice: product.costPrice, // Dynamic from API
            sellingPrice: product.sellingPrice, // Dynamic from API
            category: product.category, // Dynamic from API
            brand: product.brand, // Dynamic from API
            receivedDate: product.createdAt,
            expiryDate: product.selfLife
          }));
          
          setProducts(productsData);
          
          // Calculate stats
          const totalValue = productsData.reduce((sum, p) => sum + (p.currentStock * p.sellingPrice), 0);
          
          setStats({
            totalProducts: data.stats.totalProducts,
            totalValue,
            healthyCount: data.stats.activeCount,
            atRiskCount: data.stats.lowShelfLifeStatusCount,
            deadStockCount: data.stats.deadStockCount,
            expiredCount: productsData.filter(p => p.daysUntilExpiry && p.daysUntilExpiry <= 0).length,
            utilizationPercentage: data.warehouseUtilization?.[0]?.utilizationPercentage || 0 // Dynamic from API
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to empty data
        setProducts([]);
        setStats({
          totalProducts: 0,
          totalValue: 0,
          healthyCount: 0,
          atRiskCount: 0,
          deadStockCount: 0,
          expiredCount: 0,
          utilizationPercentage: 0
        });
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'stock':
        return b.currentStock - a.currentStock;
      case 'expiry':
        return (a.daysUntilExpiry || 999) - (b.daysUntilExpiry || 999);
      case 'risk':
        return b.deadStockRisk - a.deadStockRisk;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive view of your warehouse inventory</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.atRiskCount}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

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
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="HEALTHY">Healthy</option>
                <option value="AT_RISK">At Risk</option>
                <option value="DEAD_STOCK">Dead Stock</option>
                <option value="EXPIRED">Expired</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="stock">Sort by Stock</option>
                <option value="expiry">Sort by Expiry</option>
                <option value="risk">Sort by Risk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Detailed Inventory</h2>
            <p className="text-sm text-gray-600">Showing {sortedProducts.length} of {products.length} products</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shelf Life
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                        <div className="text-xs text-gray-400">{product.category} • {product.brand}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.currentStock}</div>
                      <div className="text-xs text-gray-500">units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.daysUntilExpiry !== null 
                          ? product.daysUntilExpiry > 0 
                            ? `${product.daysUntilExpiry} days`
                            : 'Expired'
                          : 'N/A'
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        Expires: {new Date(product.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                        {getStatusIcon(product.status)}
                        <span className="ml-1 capitalize">{product.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              product.deadStockRisk > 0.7 ? 'bg-red-500' :
                              product.deadStockRisk > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${product.deadStockRisk * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {(product.deadStockRisk * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${(product.currentStock * product.sellingPrice).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${product.sellingPrice}/unit
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Placeholder */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Distribution</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Healthy Products</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(stats.healthyCount / stats.totalProducts) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.healthyCount}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">At Risk Products</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(stats.atRiskCount / stats.totalProducts) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.atRiskCount}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Dead Stock</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(stats.deadStockCount / stats.totalProducts) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stats.deadStockCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Warehouse Utilization</h3>
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${stats.utilizationPercentage * 2.51} 251`}
                    className="text-blue-600"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{stats.utilizationPercentage}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Warehouse Capacity Used</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
