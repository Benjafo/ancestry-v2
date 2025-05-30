import React from 'react';
import { ServicePackage, CustomerInfo } from '../../api/client';
import { formatPrice, processFeatures } from '../../utils/orderUtils';

interface OrderSummaryProps {
    selectedPackage: ServicePackage;
    customerInfo: CustomerInfo;
    onEditCustomerInfo?: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ selectedPackage, customerInfo, onEditCustomerInfo }) => {
    const features = processFeatures(selectedPackage.features);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>

            <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Service Package</h4>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    {selectedPackage.name}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{selectedPackage.description}</p>
                <ul className="text-gray-700 dark:text-gray-300 text-left space-y-1">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                            <svg className="w-4 h-4 text-green-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {feature}
                        </li>
                    ))}
                </ul>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Estimated delivery: {selectedPackage.estimated_delivery_weeks} weeks
                </p>
            </div>

            <div className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex justify-between items-center">
                    Customer Information
                    {onEditCustomerInfo && (
                        <button
                            type="button"
                            onClick={onEditCustomerInfo}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                        >
                            Edit
                        </button>
                    )}
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                    {customerInfo.firstName} {customerInfo.lastName}
                </p>
                <p className="text-gray-700 dark:text-gray-300">{customerInfo.email}</p>
                {customerInfo.phone && <p className="text-gray-700 dark:text-gray-300">{customerInfo.phone}</p>}
                {customerInfo.address && (
                    <p className="text-gray-700 dark:text-gray-300">
                        {customerInfo.address}, {customerInfo.city}, {customerInfo.state} {customerInfo.zip}
                    </p>
                )}
                {customerInfo.specialRequests && (
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                        <span className="font-medium">Special Requests:</span> {customerInfo.specialRequests}
                    </p>
                )}
                {customerInfo.familyInfo && (
                    <p className="text-gray-700 dark:text-gray-300 mt-2">
                        <span className="font-medium">Family Info:</span> {customerInfo.familyInfo}
                    </p>
                )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total:</span>
                    <span>{formatPrice(selectedPackage.price)}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;
