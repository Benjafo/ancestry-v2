import React from 'react';
import { ProjectDetail } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';

interface ProjectOverviewTabProps {
    project: ProjectDetail;
}

const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({ project }) => {
    return (
        <div className="prose max-w-none dark:prose-invert">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Description</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{project.description}</p>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6">Recent Activity</h3>
            <div className="mt-2 space-y-4">
                {project.documents && project.documents.length > 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Document Added:</span> {project.documents[0].title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(project.documents[0].uploaded_at)}
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">No Documents:</span> No documents have been added to this project yet.
                        </p>
                    </div>
                )}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Research Note:</span> Found connection to Williams family through marriage records
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(project.updated_at)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProjectOverviewTab;
