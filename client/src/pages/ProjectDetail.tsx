import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ProjectDetail as ProjectDetailType, projectsApi } from '../api/client';

const ProjectDetail = () => {
    const { projectId } = useParams({ from: '/auth/projects/$projectId' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<ProjectDetailType | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'timeline' | 'family_members'>('overview');

    useEffect(() => {
        console.log('Fetching project details for ID:', projectId);
        const fetchProjectDetails = async () => {
            try {
                const projectData = await projectsApi.getProjectById(projectId);
                setProject(projectData);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching project details:', err);
                setError('Failed to load project details');
                setIsLoading(false);
            }
        };

        fetchProjectDetails();
    }, [projectId]);

    const getStatusBadgeClass = (status: ProjectDetailType['status']) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'on_hold':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: ProjectDetailType['status']) => {
        switch (status) {
            case 'active':
                return 'Active';
            case 'completed':
                return 'Completed';
            case 'on_hold':
                return 'On Hold';
            default:
                return status;
        }
    };

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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error || 'Project not found'}</p>
                        <div className="mt-2">
                            <Link to="/projects" className="text-sm font-medium text-red-700 hover:text-red-600">
                                Return to Projects
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Link to="/projects" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Projects
                    </Link>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{project.title}</h1>
                </div>
                <div className="flex space-x-2">
                    <button className="btn-secondary">Edit Project</button>
                    <button className="btn-primary">Add Document</button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                {/* Project Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                        <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                                {getStatusText(project.status)}
                            </span>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Created on {new Date(project.created_at).toLocaleDateString()}
                                {' • '}
                                Last updated {new Date(project.updated_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Researcher</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{project.researcher.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{project.researcher.email}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex -mb-px">
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                activeTab === 'overview'
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                activeTab === 'documents'
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setActiveTab('documents')}
                        >
                            Documents ({project.documents?.length || 0})
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                activeTab === 'timeline'
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setActiveTab('timeline')}
                        >
                            Timeline ({project.timeline?.length || 0})
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                activeTab === 'family_members'
                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => setActiveTab('family_members')}
                        >
                            Family Members {project.persons && `(${project.persons.length})`}
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'overview' && (
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
                                            {new Date(project.documents[0].uploaded_at).toLocaleString()}
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
                                        {new Date(project.updated_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'documents' && (
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
                                                                {new Date(document.uploaded_at).toLocaleDateString()}
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
                    )}

                    {activeTab === 'timeline' && (
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
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{event.event}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                                                            </div>
                                                            <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                                <time dateTime={event.date}>{new Date(event.date).toLocaleDateString()}</time>
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
                    )}

                    {activeTab === 'family_members' && (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Family Members</h3>
                            {!project.persons || project.persons.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">No family members have been added to this project yet.</p>
                                    {project.access_level === 'edit' && (
                                        <button className="btn-primary mt-4">Add First Person</button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {project.persons.map(person => (
                                        <div key={person.person_id} className="border dark:border-gray-700 rounded-lg p-4 dark:bg-gray-700">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                {person.first_name} {person.last_name}
                                            </h3>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                {person.birth_date && (
                                                    <p>Born: {new Date(person.birth_date).toLocaleDateString()}</p>
                                                )}
                                                {person.death_date && (
                                                    <p>Died: {new Date(person.death_date).toLocaleDateString()}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
