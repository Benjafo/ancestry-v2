import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { DashboardSummary, Project, UserEvent, dashboardApi, projectsApi } from '../api/client';
import ProjectList from '../components/projects/ProjectList';
import { getUser } from '../utils/auth';
import { formatSnakeCase } from '../utils/formatUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import EmptyState from '../components/common/EmptyState';

const Dashboard = () => {
    const user = getUser();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [notifications, setNotifications] = useState<UserEvent[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const [projectsError, setProjectsError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch dashboard summary
                const summaryData = await dashboardApi.getSummary();
                setSummary(summaryData);
                console.log('Dashboard Summary:', summaryData);

                // Fetch user events
                const userEventsData = await dashboardApi.getUserEvents();
                setNotifications(userEventsData.userEvents);
                console.log('User Events:', userEventsData);
                console.log('Created Projects:', userEventsData.userEvents.filter(event => event.event_type === 'project_created'));

                // Debug notification structure
                if (userEventsData.userEvents.length > 0) {
                    console.log('First notification:', userEventsData.userEvents[0]);
                    console.log('createdAt type:', typeof userEventsData.userEvents[0].createdAt);
                    console.log('createdAt value:', userEventsData.userEvents[0].createdAt);
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data');
                setIsLoading(false);
            }
        };

        const fetchProjects = async () => {
            try {
                const response = await projectsApi.getProjects();
                setProjects(response.projects);
                setProjectsLoading(false);
            } catch (err) {
                console.error('Error fetching projects:', err);
                setProjectsError('Failed to load projects');
                setProjectsLoading(false);
            }
        };

        fetchDashboardData();
        fetchProjects();
    }, []);


    if (isLoading) {
        return <LoadingSpinner containerClassName="h-64" size="lg" />;
    }

    if (error) {
        return <ErrorAlert message={error} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome, {user?.first_name}</h1>
                {/* <button className="btn-primary">New Research Request</button> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Summary Card */}
                <div className="card bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 md:col-span-3">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Research Summary</h2>
                        {user?.roles?.includes('manager') && (
                            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                                Showing system-wide statistics
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="stat-card p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                            <div className="text-gray-500 dark:text-gray-400 mb-1">Active Projects</div>
                            <div className="text-3xl font-semibold dark:text-white">{summary?.projectCount || 0}</div>
                        </div>
                        <div className="stat-card p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                            <div className="text-gray-500 dark:text-gray-400 mb-1">Notifications</div>
                            <div className="text-3xl font-semibold dark:text-white">{notifications.length}</div>
                        </div>
                        <div className="stat-card p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                            <div className="text-gray-500 dark:text-gray-400 mb-1">Documents</div>
                            <div className="text-3xl font-semibold dark:text-white">{summary?.documentCount || 0}</div>
                        </div>
                        <div className="stat-card p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                            <div className="text-gray-500 dark:text-gray-400 mb-1">Family Members</div>
                            <div className="text-3xl font-semibold dark:text-white">{summary?.personCount || 0}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects */}
            <div className="card bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Projects</h2>
                </div>
                <ProjectList
                    projects={projects}
                    isLoading={projectsLoading}
                    error={projectsError}
                />
            </div>


            {/* Notifications */}
            <div className="card bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h2>
                    <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        View all
                    </Link>
                </div>
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <EmptyState message="No notifications." />
                    ) : (
                        notifications.slice(0, 5).map(notification => (
                            <div
                                key={notification.id}
                                className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2"
                            >
                                <div className="flex justify-between">
                                    <span className="font-medium dark:text-white">{formatSnakeCase(notification.event_type)}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'No date'}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                                {notification.actor && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        By {notification.actor.first_name} {notification.actor.last_name}
                                    </p>
                                )}
                            </div>
                        )))}
                </div>
                {notifications.length > 5 && (
                    <div className="mt-4 text-center">
                        <Link to="/notifications" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                            View all {notifications.length} notifications
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
