import React from 'react';
import { Package, Calendar, DollarSign, CheckCircle } from 'lucide-react';

function CustomerServices() {
  const services = [
    {
      id: 1,
      name: 'Blog Writing Service',
      description: 'Professional blog writing and editing services',
      price: '$99/month',
      status: 'Active',
      nextBilling: '2024-02-15'
    },
    {
      id: 2,
      name: 'SEO Optimization',
      description: 'Search engine optimization for your content',
      price: '$149/month',
      status: 'Active',
      nextBilling: '2024-02-15'
    },
    {
      id: 3,
      name: 'Content Strategy',
      description: 'Strategic planning for your content marketing',
      price: '$199/month',
      status: 'Pending',
      nextBilling: 'Not activated'
    }
  ];

  const recentOrders = [
    {
      id: 'ORD-001',
      service: 'Blog Writing Service',
      date: '2024-01-15',
      amount: '$99',
      status: 'Completed'
    },
    {
      id: 'ORD-002',
      service: 'SEO Optimization',
      date: '2024-01-10',
      amount: '$149',
      status: 'Completed'
    },
    {
      id: 'ORD-003',
      service: 'Content Strategy',
      date: '2024-01-05',
      amount: '$199',
      status: 'Processing'
    }
  ];

  return (
    <div className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Services & Orders</h1>
        <p className="mt-2 text-gray-600">Manage your subscribed services and view order history.</p>
      </div>

      {/* Active Services */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Active Services</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id} className="card">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-brand-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {service.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {service.price}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`badge ${
                      service.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {service.status}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {service.nextBilling}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-emerald-600 mr-1" />
                      {order.amount.replace('$', '')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${
                      order.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {order.status === 'Completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CustomerServices;