import React from 'react';

interface EmptyStateProps {
    message: string;
    icon?: React.ReactNode;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon, className }) => {
    return (
        <div className={`text-center py-8 ${className || ''}`}>
            {icon && <div className="flex justify-center mb-4">{icon}</div>}
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
        </div>
    );
};

export default EmptyState;
