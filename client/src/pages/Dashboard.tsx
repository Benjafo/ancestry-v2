import { useEffect, useState } from 'react';
import { DashboardSummary, Project, UserEvent, dashboardApi, projectsApi } from '../api/client';
import ProjectList from '../components/projects/ProjectList';
import { getUser } from '../utils/auth';
import { formatDate } from '../utils/dateUtils';

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
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome, {user?.first_name}</h1>
                <button className="btn-primary">New Research Request</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Summary Card */}
                <div className="card bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 md:col-span-3">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Research Summary</h2>
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
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notifications</h2>
                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
                            <p className="text-gray-500 dark:text-gray-400">No notifications.</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2"
                            >
                                <div className="flex justify-between">
                                    <span className="font-medium dark:text-white">{notification.event_type}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(notification.created_at)}
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
            </div>
        </div>
    );
};

export default Dashboard;
