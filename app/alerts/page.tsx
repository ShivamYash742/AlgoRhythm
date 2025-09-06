'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Package, 
  CheckCircle,
  XCircle,
  Bell,
  Filter,
  Search
} from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'SHELF_LIFE_WARNING' | 'DEAD_STOCK_ALERT' | 'SPACE_CONSTRAINT' | 'REORDER_REMINDER' | 'ML_PREDICTION' | 'INVENTORY_LOW';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch alerts from API
        const response = await fetch('/api/alerts');
        const alertsData = await response.json();
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        // Fallback to mock data
        const mockAlerts: Alert[] = [
          {
            id: '1',
            title: 'Product Expiring Soon',
            message: 'Artisan Bread expires in 2 days. Consider applying discount.',
            type: 'SHELF_LIFE_WARNING',
            priority: 'HIGH',
            isRead: false,
            isResolved: false,
            createdAt: '2024-01-24T10:30:00Z',
            product: {
              id: '1',
              name: 'Artisan Bread',
              sku: 'BAKERY-001'
            }
          },
          {
            id: '2',
            title: 'Dead Stock Detected',
            message: 'Expired Yogurt needs immediate liquidation or disposal.',
            type: 'DEAD_STOCK_ALERT',
            priority: 'CRITICAL',
            isRead: false,
            isResolved: false,
            createdAt: '2024-01-24T09:15:00Z',
            product: {
              id: '2',
              name: 'Expired Yogurt',
              sku: 'DAIRY-002'
            }
          },
          {
            id: '3',
            title: 'Warehouse Space Constraint',
            message: 'Insufficient space for new order. Required: 500 units, Available: 200 units.',
            type: 'SPACE_CONSTRAINT',
            priority: 'HIGH',
            isRead: true,
            isResolved: false,
            createdAt: '2024-01-24T08:45:00Z'
          },
          {
            id: '4',
            title: 'High Dead Stock Risk',
            message: 'Organic Bananas have 80% risk of becoming dead stock.',
            type: 'ML_PREDICTION',
            priority: 'MEDIUM',
            isRead: true,
            isResolved: false,
            createdAt: '2024-01-24T07:20:00Z',
            product: {
              id: '3',
              name: 'Organic Bananas',
              sku: 'PRODUCE-001'
            }
          },
          {
            id: '5',
            title: 'Low Stock Alert',
            message: 'Canned Tomatoes stock is below minimum level.',
            type: 'INVENTORY_LOW',
            priority: 'LOW',
            isRead: true,
            isResolved: true,
            createdAt: '2024-01-23T16:30:00Z',
            product: {
              id: '4',
              name: 'Canned Tomatoes',
              sku: 'CANNED-001'
            }
          }
        ];
        setAlerts(mockAlerts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SHELF_LIFE_WARNING': return <Clock className="w-4 h-4" />;
      case 'DEAD_STOCK_ALERT': return <XCircle className="w-4 h-4" />;
      case 'SPACE_CONSTRAINT': return <Package className="w-4 h-4" />;
      case 'REORDER_REMINDER': return <Bell className="w-4 h-4" />;
      case 'ML_PREDICTION': return <AlertTriangle className="w-4 h-4" />;
      case 'INVENTORY_LOW': return <Package className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'SHELF_LIFE_WARNING': return 'Shelf Life Warning';
      case 'DEAD_STOCK_ALERT': return 'Dead Stock Alert';
      case 'SPACE_CONSTRAINT': return 'Space Constraint';
      case 'REORDER_REMINDER': return 'Reorder Reminder';
      case 'ML_PREDICTION': return 'ML Prediction';
      case 'INVENTORY_LOW': return 'Low Inventory';
      default: return type;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'ALL' || alert.priority === priorityFilter;
    const matchesType = typeFilter === 'ALL' || alert.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || 
                         (statusFilter === 'UNREAD' && !alert.isRead) ||
                         (statusFilter === 'RESOLVED' && alert.isResolved) ||
                         (statusFilter === 'UNRESOLVED' && !alert.isResolved);
    
    return matchesSearch && matchesPriority && matchesType && matchesStatus;
  });

  const markAsRead = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAsResolved = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: true, resolvedBy: 'Current User' })
      });
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, isResolved: true, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as resolved:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Alerts</h1>
          <p className="text-gray-600 mt-2">Monitor and manage warehouse notifications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-3xl font-bold text-orange-600">
                  {alerts.filter(a => !a.isRead).length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-3xl font-bold text-red-600">
                  {alerts.filter(a => a.priority === 'CRITICAL').length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600">
                  {alerts.filter(a => a.isResolved).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Types</option>
                <option value="SHELF_LIFE_WARNING">Shelf Life</option>
                <option value="DEAD_STOCK_ALERT">Dead Stock</option>
                <option value="SPACE_CONSTRAINT">Space</option>
                <option value="ML_PREDICTION">ML Prediction</option>
                <option value="INVENTORY_LOW">Low Inventory</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="UNREAD">Unread</option>
                <option value="UNRESOLVED">Unresolved</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl shadow-sm border p-6 ${
                !alert.isRead ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                      {getTypeIcon(alert.type)}
                      <span className="ml-1">{getTypeLabel(alert.type)}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      alert.priority === 'CRITICAL' ? 'text-red-600 bg-red-100' :
                      alert.priority === 'HIGH' ? 'text-orange-600 bg-orange-100' :
                      alert.priority === 'MEDIUM' ? 'text-yellow-600 bg-yellow-100' :
                      'text-blue-600 bg-blue-100'
                    }`}>
                      {alert.priority}
                    </span>
                    {alert.isResolved && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-100">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{alert.title}</h3>
                  <p className="text-gray-600 mb-4">{alert.message}</p>
                  
                  {alert.product && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium text-gray-900">Related Product:</p>
                      <p className="text-sm text-gray-600">{alert.product.name} ({alert.product.sku})</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                    <div className="flex space-x-2">
                      {!alert.isRead && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark as Read
                        </button>
                      )}
                      {!alert.isResolved && (
                        <button
                          onClick={() => markAsResolved(alert.id)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
