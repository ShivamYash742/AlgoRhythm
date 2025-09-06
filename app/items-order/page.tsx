'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  ArrowRight
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

interface OrderRequest {
  productName: string;
  quantity: number;
  shelfLifeDays: number;
  unitCost: number;
  sellingPrice: number;
  category: string;
  brand: string;
}

interface OrderResponse {
  success: boolean;
  message: string;
  orderId?: string;
  availableSpace?: number;
  requiredSpace?: number;
  existingProduct?: Product;
  recommendation?: string;
}

export default function ItemsOrderPage() {
  const [orderForm, setOrderForm] = useState<OrderRequest>({
    productName: '',
    quantity: 0,
    shelfLifeDays: 24,
    unitCost: 0,
    sellingPrice: 0,
    category: '',
    brand: ''
  });

  const [existingProduct, setExistingProduct] = useState<Product | null>(null);
  const [isCheckingProduct, setIsCheckingProduct] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(null);
  const [warehouseStats, setWarehouseStats] = useState({
    totalCapacity: 10000,
    usedCapacity: 7500,
    availableCapacity: 2500
  });
  const [warehouseId, setWarehouseId] = useState<string>('');

  // Fetch warehouse data on component mount
  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const response = await fetch('/api/warehouses');
        const warehouses = await response.json();
        
        if (warehouses.length > 0) {
          const warehouse = warehouses[0];
          setWarehouseId(warehouse.id);
          setWarehouseStats({
            totalCapacity: warehouse.capacity,
            usedCapacity: warehouse.usedCapacity,
            availableCapacity: warehouse.availableCapacity
          });
        }
      } catch (error) {
        console.error('Error fetching warehouse data:', error);
      }
    };

    fetchWarehouseData();
  }, []);

  // Check for existing product when product name changes
  useEffect(() => {
    const checkExistingProduct = async () => {
      if (orderForm.productName.length < 3) {
        setExistingProduct(null);
        return;
      }

      setIsCheckingProduct(true);
      try {
        // Call real API to check for existing product
        const response = await fetch(`/api/products/${encodeURIComponent(orderForm.productName)}`);
        const data = await response.json();
        
        if (data.success && data.found) {
          const existingProduct: Product = {
            id: data.product.id,
            name: data.product.name,
            sku: data.product.id.substring(0, 8),
            currentStock: data.product.currentQuantity,
            status: data.product.status === 'ACTIVE' ? 'HEALTHY' : 
                   data.product.status === 'LOW_SHELF_LIFE' ? 'AT_RISK' : 'DEAD_STOCK',
            daysUntilExpiry: data.product.daysUntilExpiry,
            deadStockRisk: data.product.isExpired ? 1.0 : 
                          data.product.daysUntilExpiry <= 7 ? 0.7 : 0.2,
            costPrice: data.product.costPrice, // Dynamic from API
            sellingPrice: data.product.sellingPrice, // Dynamic from API
            category: data.product.category, // Dynamic from API
            brand: data.product.brand, // Dynamic from API
            receivedDate: new Date().toISOString(),
            expiryDate: data.product.oldestShelfLife
          };

          setExistingProduct(existingProduct);
        } else {
          setExistingProduct(null);
        }
      } catch (error) {
        console.error('Error checking existing product:', error);
        setExistingProduct(null);
      } finally {
        setIsCheckingProduct(false);
      }
    };

    checkExistingProduct();
  }, [orderForm.productName]);

  const handleInputChange = (field: keyof OrderRequest, value: string | number) => {
    setOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
    setOrderResponse(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderResponse(null);

    try {
      // Call real API to process order
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: orderForm.productName,
          quantity: orderForm.quantity,
          shelfLifeDays: orderForm.shelfLifeDays,
          unitCost: orderForm.unitCost,
          sellingPrice: orderForm.sellingPrice,
          category: orderForm.category,
          brand: orderForm.brand,
          warehouseId: warehouseId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOrderResponse({
          success: true,
          message: data.message,
          orderId: data.orderId,
          recommendation: 'Order processed successfully!'
        });
      } else {
        setOrderResponse({
          success: false,
          message: data.message || data.error,
          availableSpace: data.availableSpace,
          requiredSpace: data.requiredSpace,
          existingProduct: data.existingProduct,
          recommendation: data.recommendation
        });
      }
    } catch (error) {
      console.error('Error processing order:', error);
      setOrderResponse({
        success: false,
        message: 'Error processing order. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order New Items</h1>
          <p className="text-gray-600 mt-2">Place new inventory orders with AI-powered recommendations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={orderForm.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      placeholder="Enter product name..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {isCheckingProduct && (
                      <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
                    )}
                  </div>
                </div>

                {/* Category and Brand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={orderForm.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      placeholder="e.g., Dairy, Bakery, Produce"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={orderForm.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="e.g., Organic Farms, Local Bakery"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Quantity and Shelf Life */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={orderForm.quantity}
                      onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                      placeholder="Number of units"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shelf Life (Days) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={orderForm.shelfLifeDays}
                      onChange={(e) => handleInputChange('shelfLifeDays', parseInt(e.target.value) || 24)}
                      placeholder="Days until expiry"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Cost ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={orderForm.unitCost}
                      onChange={(e) => handleInputChange('unitCost', parseFloat(e.target.value) || 0)}
                      placeholder="Cost per unit"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={orderForm.sellingPrice}
                      onChange={(e) => handleInputChange('sellingPrice', parseFloat(e.target.value) || 0)}
                      placeholder="Price per unit"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4" />
                      <span>Place Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Warehouse Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Warehouse Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Available Space</span>
                    <span className="text-sm font-medium text-gray-900">
                      {warehouseStats.availableCapacity.toLocaleString()} units
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(warehouseStats.usedCapacity / warehouseStats.totalCapacity) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {warehouseStats.usedCapacity.toLocaleString()} of {warehouseStats.totalCapacity.toLocaleString()} used
                  </p>
                </div>
              </div>
            </div>

            {/* Existing Product Check */}
            {existingProduct && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Product Found</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{existingProduct.name}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(existingProduct.status)}`}>
                        {getStatusIcon(existingProduct.status)}
                        <span className="ml-1">{existingProduct.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Current Stock: {existingProduct.currentStock} units</p>
                      <p>Days Until Expiry: {existingProduct.daysUntilExpiry} days</p>
                      <p>Dead Stock Risk: {(existingProduct.deadStockRisk * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Response */}
            {orderResponse && (
              <div className={`rounded-xl shadow-sm border p-6 ${
                orderResponse.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-3">
                  {orderResponse.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <h3 className={`font-semibold ${
                      orderResponse.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {orderResponse.success ? 'Order Successful' : 'Order Failed'}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      orderResponse.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {orderResponse.message}
                    </p>
                    {orderResponse.recommendation && (
                      <p className="text-sm mt-2 text-gray-600">
                        <strong>Recommendation:</strong> {orderResponse.recommendation}
                      </p>
                    )}
                    {orderResponse.orderId && (
                      <p className="text-sm mt-2 text-gray-600">
                        <strong>Order ID:</strong> {orderResponse.orderId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
