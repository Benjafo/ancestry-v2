import React from 'react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {title}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {message}
                </p>

                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
