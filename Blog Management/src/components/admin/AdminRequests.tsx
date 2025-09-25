import React, { useState } from 'react';
import { Check, X, Calendar, User } from 'lucide-react';
import Button from '../Button';
import toast from 'react-hot-toast';

interface Request {
  id: string;
  type: 'subscription_upgrade' | 'account_deletion' | 'support_ticket' | 'refund';
  customerName: string;
  customerEmail: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

function AdminRequests() {
  const [requests, setRequests] = useState<Request[]>([
    {
      id: '1',
      type: 'subscription_upgrade',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      description: 'Request to upgrade from Basic to Premium plan',
      priority: 'medium',
      createdAt: new Date('2024-01-20'),
      status: 'pending'
    },
    {
      id: '2',
      type: 'support_ticket',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      description: 'Unable to publish blog posts - getting permission error',
      priority: 'high',
      createdAt: new Date('2024-01-19'),
      status: 'pending'
    },
    {
      id: '3',
      type: 'refund',
      customerName: 'Mike Johnson',
      customerEmail: 'mike@example.com',
      description: 'Request refund for last month billing due to service issues',
      priority: 'medium',
      createdAt: new Date('2024-01-18'),
      status: 'pending'
    },
    {
      id: '4',
      type: 'account_deletion',
      customerName: 'Sarah Wilson',
      customerEmail: 'sarah@example.com',
      description: 'Request to permanently delete account and all associated data',
      priority: 'low',
      createdAt: new Date('2024-01-17'),
      status: 'approved'
    }
  ]);

  const handleApprove = async (requestId: string) => {
    setRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: 'approved' as const }
          : request
      )
    );
    toast.success('Request approved successfully');
  };

  const handleReject = async (requestId: string) => {
    setRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: 'rejected' as const }
          : request
      )
    );
    toast.success('Request rejected');
  };

  const getTypeLabel = (type: Request['type']) => {
    switch (type) {
      case 'subscription_upgrade':
        return 'Subscription Upgrade';
      case 'account_deletion':
        return 'Account Deletion';
      case 'support_ticket':
        return 'Support Ticket';
      case 'refund':
        return 'Refund Request';
      default:
        return type;
    }
  };

  const getPriorityColor = (priority: Request['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Request['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingRequests = requests.filter(request => request.status === 'pending');
  const processedRequests = requests.filter(request => request.status !== 'pending');

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customer Requests</h1>
        <p className="mt-2 text-gray-600">Review and respond to customer requests.</p>
      </div>

      {/* Pending Requests */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Pending Requests ({pendingRequests.length})
        </h2>
        
        {pendingRequests.length > 0 ? (
          <div className="bg-white shadow rounded-lg">
            <div className="divide-y divide-gray-200">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {getTypeLabel(request.type)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority} priority
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {request.customerName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {request.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-4">{request.description}</p>
                      
                      <div className="text-xs text-gray-500">
                        Customer: {request.customerEmail}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(request.id)}
                        icon={Check}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(request.id)}
                        icon={X}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <div className="text-center py-12">
              <p className="text-gray-500">No pending requests.</p>
            </div>
          </div>
        )}
      </div>

      {/* Processed Requests */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Recent Processed ({processedRequests.length})
        </h2>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processedRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getTypeLabel(request.type)}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {request.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.customerName}</div>
                      <div className="text-sm text-gray-500">{request.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRequests;