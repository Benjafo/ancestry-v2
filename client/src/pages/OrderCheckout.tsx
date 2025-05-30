import { Elements } from '@stripe/react-stripe-js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { CustomerInfo, ordersApi, servicePackagesApi } from '../api/client';
import CustomerInfoForm from '../components/payment/CustomerInfoForm';
import OrderSummary from '../components/payment/OrderSummary';
import PaymentForm from '../components/payment/PaymentForm';
import PaymentStatus from '../components/payment/PaymentStatus';
import { getApiErrorMessage } from '../utils/errorUtils';
import { getStripe } from '../utils/stripe';

// Define the search schema for the route
interface OrderCheckoutSearch {
    packageId: string;
}

const OrderCheckout: React.FC = () => {
    const navigate = useNavigate();
    const search = useSearch({ from: '/checkout' });
    const packageId = search.packageId;

    const [currentStep, setCurrentStep] = useState(1); // 1: Customer Info, 2: Payment, 3: Confirmation
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'processing' | 'unknown'>('processing');
    const [paymentMessage, setPaymentMessage] = useState<string | undefined>(undefined);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    const stripePromise = getStripe();

    // Fetch selected service package details
    const { data: servicePackageData, isLoading: isLoadingPackage, error: packageError } = useQuery({
        queryKey: ['servicePackage', packageId],
        queryFn: () => servicePackagesApi.getActiveServicePackages().then(data => {
            const pkg = data.servicePackages.find(p => p.id === packageId);
            if (!pkg) {
                throw new Error('Service package not found or is inactive.');
            }
            return pkg;
        }),
        enabled: !!packageId,
        staleTime: Infinity, // Packages don't change often
    });

    // Mutation to create an order on the backend
    const createOrderMutation = useMutation({
        mutationFn: ordersApi.createOrder,
        onSuccess: (data) => {
            setClientSecret(data.client_secret);
            setOrderId(data.order.id);
            setCurrentStep(2); // Move to payment step
        },
        onError: (error) => {
            const errorMessage = getApiErrorMessage(error);
            setPaymentStatus('failed');
            setPaymentMessage(`Failed to create order: ${errorMessage}`);
            setCurrentStep(3); // Show error on confirmation page
        },
    });

    useEffect(() => {
        if (!packageId) {
            // Redirect if no packageId is provided
            navigate({ to: '/services' });
        }
    }, [packageId, navigate]);

    const handleCustomerInfoSubmit = (data: CustomerInfo) => {
        setCustomerInfo(data);
        if (servicePackageData) {
            createOrderMutation.mutate({
                stripeProductId: servicePackageData.id, // Changed to stripeProductId
                customer_info: data,
            });
        }
    };

    const handlePaymentSuccess = () => {
        setPaymentStatus('success');
        setPaymentMessage('Your payment was successful! Your order is being processed.');
        setCurrentStep(3); // Move to confirmation step
    };

    const handlePaymentError = (errorMsg: string) => {
        setPaymentStatus('failed');
        setPaymentMessage(errorMsg);
        setCurrentStep(3); // Move to confirmation step
    };

    if (isLoadingPackage || createOrderMutation.isPending) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-indigo-600 dark:text-indigo-400 text-xl">Loading checkout...</div>
            </div>
        );
    }

    if (packageError) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-red-600 dark:text-red-400 text-xl">
                    Error: {packageError.message}. Please go back to <Link to="/services" className="text-indigo-600 hover:underline dark:text-indigo-400">service selection</Link>.
                </div>
            </div>
        );
    }

    if (!servicePackageData) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="text-red-600 dark:text-red-400 text-xl">
                    No service package selected. Please go back to <Link to="/services" className="text-indigo-600 hover:underline dark:text-indigo-400">service selection</Link>.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-8">
                    Complete Your Order
                </h1>

                <div className="flex justify-center mb-8">
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${currentStep >= 1 ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                            1
                        </div>
                        <span className={`ml-2 text-lg ${currentStep >= 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            Customer Info
                        </span>
                    </div>
                    <div className="flex-1 border-t-2 border-gray-300 dark:border-gray-600 mx-4 mt-4"></div>
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${currentStep >= 2 ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                            2
                        </div>
                        <span className={`ml-2 text-lg ${currentStep >= 2 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            Payment
                        </span>
                    </div>
                    <div className="flex-1 border-t-2 border-gray-300 dark:border-gray-600 mx-4 mt-4"></div>
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${currentStep >= 3 ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                            3
                        </div>
                        <span className={`ml-2 text-lg ${currentStep >= 3 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                            Confirmation
                        </span>
                    </div>
                </div>

                {currentStep === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Information</h2>
                            <CustomerInfoForm
                                initialData={customerInfo || undefined}
                                onSubmit={handleCustomerInfoSubmit}
                                isLoading={createOrderMutation.isPending}
                            />
                        </div>
                        <div>
                            <OrderSummary
                                selectedPackage={servicePackageData}
                                customerInfo={customerInfo || { firstName: '', lastName: '', email: '' }}
                            />
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Details</h2>
                            {clientSecret && stripePromise ? (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <PaymentForm
                                        clientSecret={clientSecret}
                                        onPaymentSuccess={handlePaymentSuccess}
                                        onPaymentError={handlePaymentError}
                                        isLoading={isProcessingPayment}
                                        setIsLoading={setIsProcessingPayment}
                                    />
                                </Elements>
                            ) : (
                                <div className="text-red-600 dark:text-red-400">
                                    Unable to load payment form. Please try again.
                                </div>
                            )}
                        </div>
                        <div>
                            <OrderSummary
                                selectedPackage={servicePackageData}
                                customerInfo={customerInfo || { firstName: '', lastName: '', email: '' }}
                                onEditCustomerInfo={() => setCurrentStep(1)}
                            />
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <PaymentStatus
                        status={paymentStatus}
                        message={paymentMessage}
                        orderId={orderId || undefined}
                    />
                )}
            </div>
        </div>
    );
};

export default OrderCheckout;
