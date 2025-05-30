import React from 'react';
import { ServicePackage } from '../../api/client';
import { formatPrice, processFeatures } from '../../utils/orderUtils';

interface ServicePackageCardProps {
    servicePackage: ServicePackage;
    onSelect: (pkg: ServicePackage) => void;
    isSelected: boolean;
}

const ServicePackageCard: React.FC<ServicePackageCardProps> = ({ servicePackage, onSelect, isSelected }) => {
    const features = processFeatures(servicePackage.features);

    console.log('Rendering ServicePackageCard:', servicePackage);

    return (
        <div
            className={`
                bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 m-4
                flex flex-col justify-between items-center text-center
                border-2 transition-all duration-300 ease-in-out
                ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-200 dark:ring-indigo-700' : 'border-gray-200 dark:border-gray-700'}
                hover:border-indigo-400 hover:shadow-xl
            `}
        >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {servicePackage.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                {servicePackage.description}
            </p>
            <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-4">
                {formatPrice(servicePackage.price)}
                <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
                    /package
                </span>
            </div>
            <ul className="text-gray-700 dark:text-gray-300 text-left w-full mb-6 space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                    </li>
                ))}
            </ul>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Estimated delivery: {servicePackage.estimated_delivery_weeks} weeks
            </p>
            <button
                onClick={() => onSelect(servicePackage)}
                className={`
                    w-full py-3 px-6 rounded-md text-lg font-semibold
                    transition-colors duration-300 ease-in-out
                    ${isSelected
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800'
                    }
                `}
            >
                {isSelected ? 'Selected' : 'Select Package'}
            </button>
        </div>
    );
};

export default ServicePackageCard;
