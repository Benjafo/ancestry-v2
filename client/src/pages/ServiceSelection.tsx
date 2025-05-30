import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { servicePackagesApi, ServicePackage } from '../api/client';
import ServicePackageCard from '../components/payment/ServicePackageCard';
import { useNavigate, Link } from '@tanstack/react-router';

const ServiceSelection: React.FC = () => {
    const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
    const navigate = useNavigate();

    const { data, isLoading, error } = useQuery({
        queryKey: ['servicePackages'],
        queryFn: servicePackagesApi.getActiveServicePackages,
    });

    const handleSelectPackage = (pkg: ServicePackage) => {
        setSelectedPackage(pkg);
    };

    const handleProceedToCheckout = () => {
        if (selectedPackage) {
            navigate({
                to: '/checkout',
                search: { packageId: selectedPackage.id },
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-indigo-600 dark:text-indigo-400 text-xl">Loading service packages...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-red-600 dark:text-red-400 text-xl">
                    Error loading service packages: {error.message}
                </div>
            </div>
        );
    }

    const servicePackages = data?.servicePackages || [];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white text-center mb-6">
                    Our Genealogical Research Services
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 text-center mb-12">
                    Choose the perfect package to uncover your family history.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {servicePackages.map((pkg) => (
                        <ServicePackageCard
                            key={pkg.id}
                            servicePackage={pkg}
                            onSelect={handleSelectPackage}
                            isSelected={selectedPackage?.id === pkg.id}
                        />
                    ))}
                </div>

                {selectedPackage && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={handleProceedToCheckout}
                            className="py-4 px-10 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-300 ease-in-out text-xl"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}

                <div className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
                    <p className="mb-2">
                        <span className="font-semibold">Professional Service - No Refunds:</span> Due to the nature of genealogical research, all sales are final. We commit to delivering high-quality, expert-led research based on the selected package.
                    </p>
                    <p className="mb-2">
                        For questions or custom requests, please <Link to="/contact" className="text-indigo-600 hover:underline dark:text-indigo-400">contact us</Link>.
                    </p>
                    <p>
                        Your privacy and data security are paramount. Learn more in our <Link to="/privacy-policy" className="text-indigo-600 hover:underline dark:text-indigo-400">Privacy Policy</Link>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ServiceSelection;
