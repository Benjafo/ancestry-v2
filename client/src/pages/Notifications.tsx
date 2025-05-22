import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { UserEvent, dashboardApi } from '../api/client';
import ErrorAlert from '../components/common/ErrorAlert';
import { formatSnakeCase } from '../utils/formatUtils';
import { formatDate } from '../utils/dateUtils';

const Notifications = () => {
    const [notifications, setNotifications] = useState<UserEvent[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<UserEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [filterType, setFilterType] = useState<string>('all');

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await dashboardApi.getUserEvents();
                setNotifications(data.userEvents);
                setFilteredNotifications(data.userEvents);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching notifications:', err);
                setError('Failed to load notifications');
                setIsLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Filter and sort notifications
    useEffect(() => {
        let result = [...notifications];

        // Apply type filter
        if (filterType !== 'all') {
            result = result.filter(notification => notification.event_type === filterType);
        }

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(notification =>
                notification.message.toLowerCase().includes(term) ||
                notification.event_type.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setFilteredNotifications(result);
    }, [notifications, searchTerm, sortBy, filterType]);

    // Get unique event types for filter dropdown
    const eventTypes = ['all', ...Array.from(new Set(notifications.map(n => n.event_type)))];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return <ErrorAlert message={error} />
    }

    return (
        <div className="space-y-6">
            <div>
                <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">Notifications</h1>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        {eventTypes.map(type => (
                            <option key={type} value={type}>
                                {type === 'all' ? 'All Types' : formatSnakeCase(type)}
                            </option>
                        ))}
                    </select>
                    <select
                        className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Notifications list */}
            <div className="card bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">No notifications found.</p>
                        </div>
                    ) : (
                        filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2"
                            >
                                <div className="flex justify-between">
                                    <span className="font-medium dark:text-white">
                                        {formatSnakeCase(notification.event_type)}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(notification.createdAt, 'No date')}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                                {notification.actor && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        By {notification.actor.first_name} {notification.actor.last_name}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
