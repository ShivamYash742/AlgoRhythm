'use client';

import { useState, useEffect } from 'react';
import { 
  Warehouse, 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Clock, 
  DollarSign,
  BarChart3,
  Zap,
  Shield,
  Target,
  ArrowRight,
  Play,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity,
  Users,
  Settings,
  Download
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  quantity: number;
  shelf_life_days: number;
  added_date: string;
  status?: 'healthy' | 'at-risk' | 'dead-stock';
  dead_stock_risk?: number;
}

interface WarehouseStats {
  totalProducts: number;
  totalValue: number;
  utilization: number;
  deadStockCount: number;
  expiringCount: number;
  alertsCount: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<WarehouseStats>({
    totalProducts: 0,
    totalValue: 0,
    utilization: 0,
    deadStockCount: 0,
    expiringCount: 0,
    alertsCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockProducts: Product[] = [
        { id: 1, name: 'Dairy Products', quantity: 500, shelf_life_days: 24, added_date: '2024-01-15', status: 'healthy', dead_stock_risk: 0.2 },
        { id: 2, name: 'Perishable Goods', quantity: 300, shelf_life_days: 7, added_date: '2024-01-20', status: 'at-risk', dead_stock_risk: 0.6 },
        { id: 3, name: 'Frozen Foods', quantity: 200, shelf_life_days: 30, added_date: '2024-01-10', status: 'healthy', dead_stock_risk: 0.1 },
        { id: 4, name: 'Bakery Items', quantity: 150, shelf_life_days: 3, added_date: '2024-01-22', status: 'dead-stock', dead_stock_risk: 0.9 },
        { id: 5, name: 'Fresh Produce', quantity: 400, shelf_life_days: 14, added_date: '2024-01-18', status: 'at-risk', dead_stock_risk: 0.5 }
      ];
      
      setProducts(mockProducts);
      
      // Calculate stats
      const totalValue = mockProducts.reduce((sum, p) => sum + (p.quantity * 15), 0);
      const deadStockCount = mockProducts.filter(p => p.status === 'dead-stock').length;
      const expiringCount = mockProducts.filter(p => p.shelf_life_days <= 7).length;
      
      setStats({
        totalProducts: mockProducts.length,
        totalValue,
        utilization: 75,
        deadStockCount,
        expiringCount,
        alertsCount: deadStockCount + expiringCount
      });
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'at-risk': return 'text-yellow-600 bg-yellow-100';
      case 'dead-stock': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'at-risk': return <AlertCircle className="w-4 h-4" />;
      case 'dead-stock': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading AI Warehouse System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Warehouse</h1>
                <p className="text-sm text-gray-500">Intelligent Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Get Started</span>
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">
            AI-Powered Warehouse Management
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Transform your warehouse operations with machine learning predictions, 
            automated notifications, and intelligent inventory optimization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Products</p>
                  <p className="text-3xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Inventory Value</p>
                  <p className="text-3xl font-bold">${stats.totalValue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Warehouse Utilization</p>
                  <p className="text-3xl font-bold">{stats.utilization}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-yellow-200" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Active Alerts</p>
                  <p className="text-3xl font-bold">{stats.alertsCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-between">
                      <span>Process New Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-between">
                      <span>Check Dead Stock</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button className="w-full bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-between">
                      <span>View Recommendations</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* AI Model Demo */}
                <div className="bg-gray-900 rounded-xl p-6 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">AI Model Demo</h3>
                  <div className="bg-black rounded-lg p-4 font-mono text-sm">
                    <div className="text-green-400">$ ai-warehouse predict --product DEMO-001</div>
                    <div className="text-gray-300 mt-2">Analyzing inventory patterns...</div>
                    <div className="text-gray-300">Dead stock risk: 15%</div>
                    <div className="text-gray-300">Recommended action: Monitor</div>
                    <div className="text-green-400 mt-2">✅ Prediction completed!</div>
                  </div>
                </div>
              </div>

              {/* Warehouse Status */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Warehouse Status</h3>
                  
                  {/* Utilization Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Space Utilization</span>
                      <span className="text-sm text-gray-500">{stats.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${stats.utilization}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Healthy Products</p>
                      <p className="text-2xl font-bold text-green-600">
                        {products.filter(p => p.status === 'healthy').length}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">At Risk</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {products.filter(p => p.status === 'at-risk').length}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Dead Stock</p>
                      <p className="text-2xl font-bold text-red-600">
                        {products.filter(p => p.status === 'dead-stock').length}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Expiring Soon</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {products.filter(p => p.shelf_life_days <= 7).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Inventory Management</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shelf Life</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.shelf_life_days} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status || 'healthy')}`}>
                            {getStatusIcon(product.status || 'healthy')}
                            <span className="ml-1 capitalize">{product.status || 'healthy'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {((product.dead_stock_risk || 0) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              {products.filter(p => p.status === 'dead-stock' || p.shelf_life_days <= 7).map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {product.status === 'dead-stock' ? (
                        <XCircle className="w-6 h-6 text-red-600" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {product.status === 'dead-stock' 
                          ? 'This product has been identified as dead stock and requires immediate action.'
                          : `This product expires in ${product.shelf_life_days} days and needs attention.`
                        }
                      </p>
                      <div className="mt-4 flex space-x-4">
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors">
                          Liquidate Now
                        </button>
                        <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors">
                          Apply Discount
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Inventory Health</span>
                    <span className="text-lg font-semibold text-green-600">85%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Dead Stock Rate</span>
                    <span className="text-lg font-semibold text-red-600">12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Space Efficiency</span>
                    <span className="text-lg font-semibold text-blue-600">78%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-700">Apply 30% discount to Dairy Products</p>
                    <p className="text-xs text-gray-500 mt-1">Expected impact: +$2,400 revenue</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-700">Liquidate Bakery Items immediately</p>
                    <p className="text-xs text-gray-500 mt-1">Prevent $1,200 loss</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">Create bundle offer for Frozen Foods</p>
                    <p className="text-xs text-gray-500 mt-1">Expected impact: +$800 revenue</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful AI Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leverage cutting-edge machine learning to optimize your warehouse operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'ML Predictions',
                description: 'Advanced algorithms predict dead stock risk and optimize inventory levels'
              },
              {
                icon: Shield,
                title: 'Automated Alerts',
                description: 'Real-time notifications for expiring products and space constraints'
              },
              {
                icon: Target,
                title: 'Smart Recommendations',
                description: 'AI-powered suggestions for discounts, bundles, and liquidation strategies'
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Comprehensive insights into warehouse performance and trends'
              },
              {
                icon: Zap,
                title: 'Real-time Processing',
                description: 'Instant order processing with intelligent space management'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Seamless communication between warehouse managers and staff'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Warehouse?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start building your AI model and optimize your inventory management today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Get Started</span>
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">AI Warehouse</span>
              </div>
              <p className="text-gray-400">
                AI-powered warehouse management for the modern supply chain.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AI Warehouse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
