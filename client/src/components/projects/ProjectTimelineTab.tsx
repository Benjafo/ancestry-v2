import React, { useEffect } from 'react';
import { ProjectDetail } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';

interface ProjectTimelineTabProps {
    project: ProjectDetail;
}

const ProjectTimelineTab: React.FC<ProjectTimelineTabProps> = ({ project }) => {
    // Function to capitalize event type
    const formatEventType = (eventType: string): string => {
        if (!eventType) return '';
        
        // Convert snake_case or kebab-case to spaces
        const formatted = eventType.replace(/[_-]/g, ' ');
        
        // Capitalize each word
        return formatted
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    useEffect(() => console.log('Events:', project.timeline), [project.timeline]);
    return (
        <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Timeline</h3>
            <div className="flow-root">
                {project.timeline && project.timeline.length > 0 ? (
                    <ul className="-mb-8">
                        {project.timeline.map((event, eventIdx) => (
                            <li key={event.id}>
                                <div className="relative pb-8">
                                    {eventIdx !== project.timeline.length - 1 ? (
                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                                    ) : null}
                                    <div className="relative flex space-x-3">
                                        <div>
                                            <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{formatEventType(event.event)}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                                            </div>
                                            <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                <time dateTime={event.date}>{formatDate(event.date)}</time>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No timeline events have been added to this project yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectTimelineTab;
