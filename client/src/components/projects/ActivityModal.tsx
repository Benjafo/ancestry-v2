import React, { useEffect, useState } from 'react';
import { ApiMetadata, projectsApi, UserEvent } from '../../api/client';
import { getActivityIcon } from '../../utils/activityUtils';
import { formatDate } from '../../utils/dateUtils';
import { formatSnakeCase } from '../../utils/formatUtils';
import EmptyState from '../common/EmptyState';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';

interface ActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose, projectId }) => {
    const [activities, setActivities] = useState<UserEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'createdAt' | 'event_type'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterType, setFilterType] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [metadata, setMetadata] = useState<ApiMetadata>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
    });

    // Fetch activities
    useEffect(() => {
        if (!isOpen) return;

        const fetchActivities = async () => {
            try {
                setIsLoading(true);
                console.log(`Fetching activities for project ${projectId} (Modal)`);
                console.log(`API params: page=${currentPage}, limit=10, sortBy=${sortBy}, sortOrder=${sortOrder}, filterType=${filterType}`);

                const data = await projectsApi.getProjectEvents(projectId, {
                    page: currentPage,
                    limit: 5,
                    sortBy,
                    sortOrder,
                    // eventType: filterType !== 'all' ? filterType : undefined
                });

                console.log('Modal API response:', data);
                console.log('Events array:', data.events);

                if (data.events && Array.isArray(data.events)) {
                    setActivities(data.events);
                } else {
                    console.error('Events is not an array or is undefined:', data.events);
                    setActivities([]);
                }

                setMetadata(data.metadata || {
                    total: 0,
                    page: currentPage,
                    limit: 10,
                    totalPages: 1
                });

                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching project activities:', err);
                setError('Failed to load activities');
                setIsLoading(false);
            }
        };

        fetchActivities();
    }, [isOpen, projectId, currentPage, sortBy, sortOrder, filterType]);

    // Get unique event types for filter dropdown
    const eventTypes = ['all', ...Array.from(new Set(activities.map(a => a.event_type)))];

    // Handle search
    const filteredActivities = activities.filter(activity => {
        if (!searchTerm) return true;

        const term = searchTerm.toLowerCase();
        return (
            activity.message.toLowerCase().includes(term) ||
            activity.event_type.toLowerCase().includes(term) ||
            (activity.actor &&
                `${activity.actor.first_name} ${activity.actor.last_name}`.toLowerCase().includes(term))
        );
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project Activity</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    {/* Search and filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search activities..."
                                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <select
                                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    setCurrentPage(1); // Reset to first page on filter change
                                }}
                            >
                                {eventTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type === 'all' ? 'All Types' : formatSnakeCase(type)}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                                    setSortBy(newSortBy as 'createdAt' | 'event_type');
                                    setSortOrder(newSortOrder as 'asc' | 'desc');
                                    setCurrentPage(1); // Reset to first page on sort change
                                }}
                            >
                                <option value="createdAt-desc">Newest First</option>
                                <option value="createdAt-asc">Oldest First</option>
                                <option value="event_type-asc">Event Type (A-Z)</option>
                                <option value="event_type-desc">Event Type (Z-A)</option>
                            </select>
                        </div>
                    </div>

                    {/* Activities list */}
                    <div className="overflow-y-auto min-h-[300px] max-h-[50vh]">
                        {isLoading ? (
                            <LoadingSpinner containerClassName="h-[200px] flex items-center justify-center" size="md" />
                        ) : error ? (
                            <ErrorAlert
                                message={error}
                                className="h-[200px] flex items-center justify-center"
                            />
                        ) : filteredActivities.length === 0 ? (
                            <EmptyState
                                message="No activities found"
                                className="h-[200px] flex items-center justify-center"
                            />
                        ) : (
                            <div className="space-y-4">
                                {filteredActivities.map(activity => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="flex-shrink-0 mr-3">
                                            {getActivityIcon(activity.event_type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                                            <div className="flex justify-between">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {formatDate(activity.createdAt)}
                                                </p>
                                                {activity.actor && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        By: {activity.actor.first_name} {activity.actor.last_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {metadata.totalPages > 1 && (
                        <div className="mt-6 flex justify-between items-center">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {metadata.page} of {metadata.totalPages} pages ({metadata.total} total)
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded ${currentPage === 1
                                        ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(metadata.totalPages, prev + 1))}
                                    disabled={currentPage === metadata.totalPages}
                                    className={`px-3 py-1 rounded ${currentPage === metadata.totalPages
                                        ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityModal;
