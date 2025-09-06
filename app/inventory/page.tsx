'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Activity,
  Search,
  Filter
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

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products from API
        const response = await fetch('/api/warehouses');
        const warehouses = await response.json();
        
        if (warehouses.length > 0) {
          const productsData = warehouses[0].products || [];
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to mock data
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Fresh Milk',
            sku: 'DAIRY-001',
            currentStock: 200,
            status: 'AT_RISK',
            daysUntilExpiry: 3,
            deadStockRisk: 0.7,
            costPrice: 2.50,
            sellingPrice: 4.00,
            category: 'Dairy',
            brand: 'Organic Farms',
            receivedDate: '2024-01-20',
            expiryDate: '2024-01-27'
          },
          {
            id: '2',
            name: 'Artisan Bread',
            sku: 'BAKERY-001',
            currentStock: 50,
            status: 'DEAD_STOCK',
            daysUntilExpiry: -1,
            deadStockRisk: 0.9,
            costPrice: 1.50,
            sellingPrice: 3.50,
            category: 'Bakery',
            brand: 'Local Bakery',
            receivedDate: '2024-01-18',
            expiryDate: '2024-01-21'
          },
          {
            id: '3',
            name: 'Canned Tomatoes',
            sku: 'CANNED-001',
            currentStock: 500,
            status: 'HEALTHY',
            daysUntilExpiry: 300,
            deadStockRisk: 0.1,
            costPrice: 1.20,
            sellingPrice: 2.50,
            category: 'Canned Goods',
            brand: 'Premium Brand',
            receivedDate: '2024-01-15',
            expiryDate: '2024-11-15'
          }
        ];
        setProducts(mockProducts);
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
      case 'AT_RISK': return <AlertTriangle className="w-4 h-4" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Manage and monitor your warehouse inventory</p>
        </div>

        {/* Filters */}
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
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.sku}</p>
                  <p className="text-xs text-gray-400">{product.category} • {product.brand}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                  {getStatusIcon(product.status)}
                  <span className="ml-1">{product.status.replace('_', ' ')}</span>
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Stock</span>
                  <span className="font-medium text-gray-900">{product.currentStock} units</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Shelf Life</span>
                  <span className="font-medium text-gray-900">
                    {product.daysUntilExpiry !== null 
                      ? product.daysUntilExpiry > 0 
                        ? `${product.daysUntilExpiry} days`
                        : 'Expired'
                      : 'N/A'
                    }
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dead Stock Risk</span>
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
                    <span className="text-sm font-medium text-gray-900">
                      {(product.deadStockRisk * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Value</span>
                  <span className="font-medium text-gray-900">
                    ${(product.currentStock * product.sellingPrice).toLocaleString()}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Received: {new Date(product.receivedDate).toLocaleDateString()}</span>
                    <span>Expires: {new Date(product.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
