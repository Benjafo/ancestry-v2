import { Link } from '@tanstack/react-router';
import React from 'react';

interface PaymentStatusProps {
    status: 'success' | 'failed' | 'processing' | 'unknown';
    message?: string;
    orderId?: string;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, message, orderId }) => {
    let icon: React.ReactNode;
    let title: string;
    let description: string;
    let textColor: string;

    switch (status) {
        case 'success':
            icon = (
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            );
            title = 'Payment Successful!';
            description = message || 'Your payment was processed successfully. We are now preparing your order.';
            textColor = 'text-green-600 dark:text-green-400';
            break;
        case 'failed':
            icon = (
                <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            );
            title = 'Payment Failed';
            description = message || 'There was an issue processing your payment. Please try again or contact support.';
            textColor = 'text-red-600 dark:text-red-400';
            break;
        case 'processing':
            icon = (
                <svg className="w-16 h-16 text-blue-500 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356-2A9.993 9.993 0 002.1 12a9.983 9.983 0 001.962 4.785c.186.45.305.795.305.795H6m-3 0h3m-3 0l-.003.001M19 10V5h-.582m-15.356 2A9.993 9.993 0 0121.9 12a9.983 9.983 0 01-1.962 4.785c-.186.45-.305.795-.305.795H18m3 0h-3m3 0l.003.001"></path>
                </svg>
            );
            title = 'Payment Processing...';
            description = message || 'Your payment is currently being processed. This may take a few moments.';
            textColor = 'text-blue-600 dark:text-blue-400';
            break;
        case 'unknown':
        default:
            icon = (
                <svg className="w-16 h-16 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            );
            title = 'Payment Status Unknown';
            description = message || 'We are unable to determine the status of your payment. Please check your order history or contact support.';
            textColor = 'text-yellow-600 dark:text-yellow-400';
            break;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                <div className="mb-6">
                    {icon}
                </div>
                <h2 className={`text-3xl font-extrabold ${textColor} mb-3`}>
                    {title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {description}
                </p>

                {orderId && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        Order ID: <span className="font-mono">{orderId}</span>
                    </p>
                )}

                <div className="space-y-3">
                    {status === 'success' && (
                        <Link
                            to="/orders/$orderId"
                            params={{ orderId: orderId || '' }}
                            className="block w-full py-3 px-6 rounded-md text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                            View Order Details
                        </Link>
                    )}
                    {status === 'failed' && (
                        <button
                            onClick={() => window.location.reload()} // Simple reload to retry
                            className="block w-full py-3 px-6 rounded-md text-lg font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                            Try Again
                        </button>
                    )}
                    <Link
                        to="/dashboard"
                        className="block w-full py-3 px-6 rounded-md text-lg font-semibold text-indigo-600 border border-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-gray-700"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatus;
