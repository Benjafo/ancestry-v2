import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ordersApi, Order, ApiMetadata } from '../../api/client';
import { formatPrice } from '../../utils/orderUtils';
import { formatDate } from '../../utils/dateUtils';
import { getApiErrorMessage } from '../../utils/errorUtils';

const OrderHistory: React.FC = () => {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');

    // Fetch user's order history
    const { data, isLoading, error } = useQuery({
        queryKey: ['orders', page, statusFilter],
        queryFn: () => ordersApi.getOrders({
            page,
            limit: 10,
            status: statusFilter === 'all' ? undefined : statusFilter,
            sortBy: 'created_at',
            sortOrder: 'desc'
        }),
        staleTime: 30000, // 30 seconds
    });

    const orders = data?.orders || [];
    const metadata = data?.metadata;

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
            case 'processing':
                return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
            case 'paid':
                return 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900';
            case 'pending':
                return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
            case 'cancelled':
                return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
        }
    };

    const getStatusText = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'Payment Pending';
            case 'paid':
                return 'Paid - Setting Up';
            case 'processing':
                return 'Research In Progress';
            case 'completed':
                return 'Research Complete';
            case 'cancelled':
                return 'Cancelled';
            default:
                return (status as string).charAt(0).toUpperCase() + (status as string).slice(1);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="text-indigo-600 dark:text-indigo-400">Loading order history...</div>
            </div>
        );
    }

    if (error) {
        const errorMessage = getApiErrorMessage(error);
        return (
            <div className="text-center py-8">
                <div className="text-red-600 dark:text-red-400 mb-4">
                    Error loading orders: {errorMessage}
                </div>
                <button 
                    onClick={() => window.location.reload()} 
                    className="btn-secondary"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h2>
                
                {/* Filter */}
                <div className="mt-4 sm:mt-0">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value as Order['status'] | 'all');
                            setPage(1); // Reset to first page when filtering
                        }}
                        className="form-select pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Payment Pending</option>
                        <option value="paid">Paid - Setting Up</option>
                        <option value="processing">Research In Progress</option>
                        <option value="completed">Research Complete</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                        {statusFilter === 'all' ? 'No orders found.' : `No ${statusFilter} orders found.`}
                    </div>
                    <Link to="/services" className="btn-primary">
                        Browse Services
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                {/* Order Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Order #{order.id.slice(-8)}
                                        </h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                        <p>
                                            <span className="font-medium">Service:</span> {order.service_package?.name || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-medium">Order Date:</span> {formatDate(order.created_at)}
                                        </p>
                                        <p>
                                            <span className="font-medium">Total:</span> {formatPrice(order.total_amount)}
                                        </p>
                                        
                                        {/* Show project link if available */}
                                        {order.project && (
                                            <p>
                                                <span className="font-medium">Project:</span>{' '}
                                                <Link 
                                                    to="/projects/$projectId" 
                                                    params={{ projectId: order.project.id }}
                                                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    {order.project.title}
                                                </Link>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row gap-2">
                                    <Link 
                                        to="/order-confirmation/$orderId" 
                                        params={{ orderId: order.id }}
                                        className="btn-secondary text-center text-sm"
                                    >
                                        View Details
                                    </Link>
                                    
                                    {order.project && (
                                        <Link 
                                            to="/projects/$projectId" 
                                            params={{ projectId: order.project.id }}
                                            className="btn-primary text-center text-sm"
                                        >
                                            View Project
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Additional order details for completed orders */}
                            {order.status === 'completed' && order.service_package && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p className="font-medium text-green-600 dark:text-green-400 mb-1">
                                            ✓ Research Complete
                                        </p>
                                        <p>
                                            Estimated delivery was {order.service_package.estimated_delivery_weeks} weeks. 
                                            {order.project && (
                                                <span className="ml-1">
                                                    View your completed research in the{' '}
                                                    <Link 
                                                        to="/projects/$projectId" 
                                                        params={{ projectId: order.project.id }}
                                                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        project dashboard
                                                    </Link>.
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Show progress for processing orders */}
                            {order.status === 'processing' && order.service_package && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">
                                            🔍 Research In Progress
                                        </p>
                                        <p>
                                            Estimated completion: {order.service_package.estimated_delivery_weeks} weeks from order date.
                                            {order.project && (
                                                <span className="ml-1">
                                                    Track progress in your{' '}
                                                    <Link 
                                                        to="/projects/$projectId" 
                                                        params={{ projectId: order.project.id }}
                                                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        project dashboard
                                                    </Link>.
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {metadata && metadata.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page <= 1}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page >= metadata.totalPages}
                            className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing <span className="font-medium">{((page - 1) * (metadata.limit || 10)) + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(page * (metadata.limit || 10), metadata.total)}
                                </span>{' '}
                                of <span className="font-medium">{metadata.total}</span> orders
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page <= 1}
                                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                
                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, metadata.totalPages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                                                page === pageNum
                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900 dark:border-indigo-400 dark:text-indigo-300'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= metadata.totalPages}
                                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    <span className="sr-only">Next</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
