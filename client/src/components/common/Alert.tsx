import React from 'react';

interface AlertProps {
    message: string;
    onDismiss?: () => void;
    className?: string;
    children?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({ message, onDismiss, className, children }) => {
    return (
        <div className={`border-l-4 p-4 mb-4 ${className}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    {children}
                </div>
                <div className="ml-3">
                    <p className={`text-sm ${className?.includes('bg-red-50') ? 'text-red-700' : className?.includes('bg-green-50') ? 'text-green-700' : 'text-gray-700'}`}>
                        {message}
                    </p>
                    {onDismiss && (
                        <button
                            className="text-sm font-medium mt-1 hover:opacity-80"
                            onClick={onDismiss}
                        >
                            Dismiss
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Alert;
