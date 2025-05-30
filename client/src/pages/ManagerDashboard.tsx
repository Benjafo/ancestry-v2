import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ManagerDashboardSummary, managerApi } from '../api/client';
import EmptyState from '../components/common/EmptyState';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SuccessAlert from '../components/common/SuccessAlert';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import { formatDate } from '../utils/dateUtils';
import { getApiErrorMessage } from '../utils/errorUtils';

const ManagerDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<ManagerDashboardSummary | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const data = await managerApi.getDashboardSummary();
            console.log('Dashboard data:', data);
            setDashboardData(data);
            setIsLoading(false);
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error fetching manager dashboard data:', errorMessage);
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleProjectCreated = () => {
        setIsCreateModalOpen(false);

        // Show success message
        setSuccessMessage('Project created successfully');

        // Clear success message after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);

        // Refresh dashboard data to include the new project
        fetchDashboardData();
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <LoadingSpinner containerClassName="h-64" size="lg" />;
    }

    if (error) {
        return <ErrorAlert message={error} />;
    }

    if (!dashboardData) {
        return <EmptyState message="Unable to retrieve dashboard information." />;
    }

    return (
        <div className="space-y-6">
            {successMessage && <SuccessAlert message={successMessage} />}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Clients</h2>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.activeClients}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">of {dashboardData.totalClients} total</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</h2>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.activeProjects}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                of {dashboardData.totalProjects} total ({dashboardData.projectsByStatus.on_hold} on hold)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</h2>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.pendingTasks.length}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {dashboardData.pendingTasks.filter(task => task.priority === 'high').length} high priority
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unassigned Clients</h2>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.unassignedClientsCount}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Clients not assigned to any project
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                    <EmptyState message="No recent activity" />

                    {/* {dashboardData.recentActivity.length === 0 ? (
                        <EmptyState message="No recent activity" />
                    ) : (
                        <div className="space-y-4">
                            {dashboardData.recentActivity.slice(0, 3).map((activity) => (
                                <div key={activity.id} className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                                    <div className="flex-shrink-0 mr-3">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                                        <div className="flex justify-between">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {formatDate(activity.date)}
                                            </p>
                                            {activity.actor && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    By: {activity.actor}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {dashboardData.recentActivity.length > 3 && (
                                <div className="mt-4 text-center">
                                    <Link to="/notifications" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                        View all {dashboardData.recentActivity.length} activities
                                    </Link>
                                </div>
                            )}
                        </div>
                    )} */}
                </div>

                {/* Pending Tasks */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pending Tasks</h2>
                    {dashboardData.pendingTasks.length === 0 ? (
                        <EmptyState message="No pending tasks" />
                    ) : (
                        <div className="space-y-4">
                            {dashboardData.pendingTasks.map((task) => (
                                <div key={task.id} className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                                    <div className="flex-shrink-0 mr-3">
                                        <div className={`h-3 w-3 rounded-full mt-1 ${task.priority === 'high'
                                            ? 'bg-red-500'
                                            : task.priority === 'medium'
                                                ? 'bg-yellow-500'
                                                : 'bg-green-500'
                                            }`}></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900 dark:text-white">{task.description}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Due: {formatDate(task.dueDate)}
                                        </p>
                                    </div>
                                    <button className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300">
                                        Complete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Link to="/manager/users" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                        <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Manage Users</span>
                    </Link>
                    <Link to="/manager/client-assignment" className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                        <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Assign Clients</span>
                    </Link>
                    <div
                        className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">New Project</span>
                    </div>
                    <div
                        className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                        onClick={() => console.log('Create task clicked - functionality not implemented yet')}
                    >
                        <svg className="h-8 w-8 text-primary-600 dark:text-primary-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 7h6m-6 4h6" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Create Task</span>
                    </div>
                </div>
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleProjectCreated}
            />
        </div>
    );
};

export default ManagerDashboard;
