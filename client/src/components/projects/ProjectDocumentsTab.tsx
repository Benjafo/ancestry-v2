import React from 'react';
import { ProjectDetail } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';

interface ProjectDocumentsTabProps {
    project: ProjectDetail;
}

const ProjectDocumentsTab: React.FC<ProjectDocumentsTabProps> = ({ project }) => {
    const getDocumentTypeIcon = (type: string) => {
        switch (type) {
            case 'certificate':
                return (
                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'record':
                return (
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                );
            case 'photo':
                return (
                    <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                );
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Documents</h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search documents..."
                        className="form-input py-2 pl-10 pr-4 rounded-md"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md">
                {project.documents && project.documents.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {project.documents.map((document) => (
                            <li key={document.id}>
                                <a href="#" className="block hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <div className="flex items-center px-4 py-4 sm:px-6">
                                        <div className="flex-shrink-0">
                                            {getDocumentTypeIcon(document.type)}
                                        </div>
                                        <div className="min-w-0 flex-1 px-4">
                                            <div>
                                                <p className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">{document.title}</p>
                                                <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="truncate">Type: {document.type}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(document.uploaded_at)}
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No documents have been added to this project yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDocumentsTab;
