import React from 'react';
import Alert from './Alert';

interface SuccessAlertProps {
    message: string;
    onDismiss?: () => void;
}

const SuccessAlert: React.FC<SuccessAlertProps> = ({ message, onDismiss }) => {
    return (
        <Alert
            message={message}
            onDismiss={onDismiss}
            className="bg-green-50 border-green-400"
        >
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        </Alert>
    );
};

export default SuccessAlert;
