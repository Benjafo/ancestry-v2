import React, { useEffect, useState } from 'react';
import { ProjectDetail, UserEvent, projectsApi } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import { getActivityIcon } from '../../utils/iconUtils';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';
import ActivityModal from './ActivityModal';

interface ProjectOverviewTabProps {
    project: ProjectDetail;
}

const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({ project }) => {
    const [recentActivity, setRecentActivity] = useState<UserEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecentActivity = async () => {
            try {
                setIsLoading(true);
                const data = await projectsApi.getProjectEvents(project.id, {
                    limit: 5,
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                    // We can't filter by multiple event types at once, so we'll fetch all events
                    // and let the backend return all relevant events
                });
                setRecentActivity(data.events || []);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching recent activity:', err);
                setError('Failed to load recent activity');
                setIsLoading(false);
            }
        };

        fetchRecentActivity();
    }, [project.id]);

    return (
        <div className="prose max-w-none dark:prose-invert">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Description</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{project.description}</p>

            <div className="flex justify-between items-center mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
                {recentActivity.length > 0 && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        View all activity
                    </button>
                )}
            </div>

            <div className="mt-2 space-y-4">
                {isLoading ? (
                    <LoadingSpinner containerClassName="h-32" size="md" />
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                ) : recentActivity.length === 0 ? (
                    <EmptyState message="No recent activity" />
                ) : (
                    recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
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
                    ))
                )}
            </div>

            {/* Activity Modal */}
            <ActivityModal
                isOpen={isModalOpen}
                onClose={() => {
                    console.log('Closing modal');
                    setIsModalOpen(false);
                }}
                projectId={project.id}
            />
        </div>
    );
};

export default ProjectOverviewTab;
