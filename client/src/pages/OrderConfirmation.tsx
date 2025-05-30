import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from '@tanstack/react-router';
import { ordersApi, Order } from '../api/client';
import { formatPrice } from '../utils/orderUtils';
import { formatDate } from '../utils/dateUtils';
import { getApiErrorMessage } from '../utils/errorUtils';

const OrderConfirmation: React.FC = () => {
    const navigate = useNavigate();
    const { orderId } = useParams({ from: '/order-confirmation/$orderId' });

    // Fetch order details
    const { data: orderData, isLoading, error } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => ordersApi.getOrderById(orderId),
        enabled: !!orderId,
        staleTime: 0, // Always fetch fresh data for confirmation
    });

    useEffect(() => {
        if (!orderId) {
            navigate({ to: '/dashboard' });
        }
    }, [orderId, navigate]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-indigo-600 dark:text-indigo-400 text-xl">Loading order details...</div>
            </div>
        );
    }

    if (error) {
        const errorMessage = getApiErrorMessage(error);
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.734-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Order Not Found</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{errorMessage}</p>
                        <Link to="/dashboard" className="mt-4 inline-block btn-primary">
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!orderData?.order) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order not found</h1>
                        <Link to="/dashboard" className="mt-4 inline-block btn-primary">
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const order = orderData.order;
    const isSuccess = order.status === 'paid' || order.status === 'processing' || order.status === 'completed';
    const isPending = order.status === 'pending';

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                <div className="text-center">
                    {/* Success Icon */}
                    {isSuccess && (
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}

                    {/* Pending Icon */}
                    {isPending && (
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900">
                            <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
                        {isSuccess ? 'Order Confirmed!' : 'Order Received'}
                    </h1>

                    {/* Subtitle */}
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                        {isSuccess ? 'Thank you for your order. We will begin your research project shortly.' : 'Your order is being processed.'}
                    </p>

                    {/* Order ID */}
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Order #{order.id}
                    </p>
                </div>

                {/* Order Details */}
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Details</h2>
                    
                    <div className="space-y-4">
                        {/* Service Package */}
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Service Package:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {order.service_package?.name || 'N/A'}
                            </span>
                        </div>

                        {/* Total Amount */}
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {formatPrice(order.total_amount)}
                            </span>
                        </div>

                        {/* Order Date */}
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Order Date:</span>
                            <span className="text-gray-900 dark:text-white">
                                {formatDate(order.created_at)}
                            </span>
                        </div>

                        {/* Status */}
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <span className={`capitalize font-medium ${
                                isSuccess ? 'text-green-600 dark:text-green-400' : 
                                isPending ? 'text-yellow-600 dark:text-yellow-400' : 
                                'text-gray-600 dark:text-gray-400'
                            }`}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h2>
                    
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-900 dark:text-white">
                            {order.customer_info.firstName} {order.customer_info.lastName}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">{order.customer_info.email}</p>
                        {order.customer_info.phone && (
                            <p className="text-gray-600 dark:text-gray-400">{order.customer_info.phone}</p>
                        )}
                        {order.customer_info.address && (
                            <p className="text-gray-600 dark:text-gray-400">
                                {order.customer_info.address}
                                {order.customer_info.city && `, ${order.customer_info.city}`}
                                {order.customer_info.state && `, ${order.customer_info.state}`}
                                {order.customer_info.zip && ` ${order.customer_info.zip}`}
                            </p>
                        )}
                    </div>
                </div>

                {/* Next Steps */}
                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What Happens Next?</h2>
                    
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">1.</span>
                            <span>Our research team will review your order and family information within 1-2 business days.</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">2.</span>
                            <span>You will receive an email confirmation with your login credentials and project access.</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">3.</span>
                            <span>A dedicated researcher will be assigned to your project and begin the genealogy research.</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-2">4.</span>
                            <span>You can track progress and view results through your online dashboard.</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/dashboard" className="btn-primary text-center">
                        Go to Dashboard
                    </Link>
                    <Link to="/contact" className="btn-secondary text-center">
                        Contact Support
                    </Link>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
                    <p>Questions? Contact us at support@ancestryresearch.com or call (555) 123-4567</p>
                    <p className="mt-1">
                        A copy of this confirmation has been sent to {order.customer_info.email}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
