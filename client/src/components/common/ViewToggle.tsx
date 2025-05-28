import React from 'react';

interface ViewToggleProps {
    currentView: 'grid' | 'list';
    onToggle: (view: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onToggle }) => {
    const commonClasses = "p-2 rounded-md transition-colors duration-200";
    const activeClasses = "bg-primary-500 text-white shadow-md";
    const inactiveClasses = "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600";

    return (
        <div className="flex space-x-2">
            <button
                onClick={() => onToggle('grid')}
                className={`${commonClasses} ${currentView === 'grid' ? activeClasses : inactiveClasses}`}
                title="Grid View"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            </button>
            <button
                onClick={() => onToggle('list')}
                className={`${commonClasses} ${currentView === 'list' ? activeClasses : inactiveClasses}`}
                title="List View"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>
    );
};

export default ViewToggle;
