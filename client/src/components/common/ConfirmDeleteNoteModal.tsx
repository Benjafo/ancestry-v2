import React from 'react';

interface ConfirmDeleteNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

const ConfirmDeleteNoteModal: React.FC<ConfirmDeleteNoteModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete Note',
    message = 'Are you sure you want to delete this research note? This action cannot be undone.'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-300">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteNoteModal;
