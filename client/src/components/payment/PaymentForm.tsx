import React from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { StripeError } from '@stripe/stripe-js';

interface PaymentFormProps {
    clientSecret: string;
    onPaymentSuccess: () => void;
    onPaymentError: (error: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
    clientSecret,
    onPaymentSuccess,
    onPaymentError,
    isLoading,
    setIsLoading,
}) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                // Make sure to change this to your payment confirmation page
                return_url: `${window.location.origin}/order-confirmation`,
            },
        });

        // This point will only be reached if there's an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`. For some payment methods like iDEAL, your customer will
        // be redirected to an intermediate site first to authorize the payment, then
        // redirected to the `return_url`.
        if (error.type === "card_error" || error.type === "validation_error") {
            onPaymentError(error.message || "An unexpected error occurred.");
        } else {
            onPaymentError("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" />
            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
                <span id="button-text">
                    {isLoading ? "Processing..." : "Pay now"}
                </span>
            </button>
            {/* Show any error or success messages */}
            {/* This component will handle displaying messages based on onPaymentError/onPaymentSuccess */}
        </form>
    );
};

export default PaymentForm;
