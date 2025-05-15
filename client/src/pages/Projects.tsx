import { useEffect, useState } from 'react';
import { Project, projectsApi } from '../api/client';
import EmptyState from '../components/common/EmptyState';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SuccessAlert from '../components/common/SuccessAlert';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import EditProjectModal from '../components/projects/EditProjectModal';
import ProjectList from '../components/projects/ProjectList';
import { hasRole } from '../utils/auth';

const Projects = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'on_hold'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Search and sort state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'updated_at' | 'created_at'>('updated_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const isManager = hasRole('manager');

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleProjectCreated = (newProject: Project) => {
        // Refresh projects list to ensure sorting is maintained
        fetchProjects();
        setIsCreateModalOpen(false);

        // Show success message
        setSuccessMessage('Project created successfully');

        // Clear success message after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
    };

    const handleEditProject = (project: Project) => {
        setSelectedProject(project);
        setIsEditModalOpen(true);
    };

    const handleProjectUpdated = (updatedProject: Project) => {
        // Refresh projects list to ensure sorting is maintained
        fetchProjects();
        setIsEditModalOpen(false);
        setSelectedProject(null);

        // Show success message
        setSuccessMessage('Project updated successfully');

        // Clear success message after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
    };

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const data = await projectsApi.getProjects({
                sortBy,
                sortOrder
            });
            setProjects(data.projects);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Check if we should open the create modal based on URL
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('create') === 'true') {
            setIsCreateModalOpen(true);
            // Clear the parameter from the URL
            window.history.replaceState({}, '', '/projects');
        }

        fetchProjects();
    }, [sortBy, sortOrder]);

    // Apply client-side filtering for search and status
    const filteredProjects = projects.filter(project => {
        // First apply status filter
        if (filter !== 'all' && project.status !== filter) {
            return false;
        }
        
        // Then apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return (
                project.title.toLowerCase().includes(term) ||
                project.description.toLowerCase().includes(term)
            );
        }
        
        return true;
    });

    // const getStatusBadgeClass = (status: Project['status']) => {
    //     switch (status) {
    //         case 'active':
    //             return 'bg-green-100 text-green-800';
    //         case 'completed':
    //             return 'bg-blue-100 text-blue-800';
    //         case 'on_hold':
    //             return 'bg-yellow-100 text-yellow-800';
    //         default:
    //             return 'bg-gray-100 text-gray-800';
    //     }
    // };

    // const getStatusText = (status: Project['status']) => {
    //     switch (status) {
    //         case 'active':
    //             return 'Active';
    //         case 'completed':
    //             return 'Completed';
    //         case 'on_hold':
    //             return 'On Hold';
    //         default:
    //             return status;
    //     }
    // };

    if (isLoading) {
        return <LoadingSpinner containerClassName="h-64" size="lg" />;
    }

    if (error) {
        return <ErrorAlert message={error} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Research Projects</h1>
                <button className="btn-primary" onClick={handleOpenCreateModal}>New Project</button>
            </div>

            {successMessage && <SuccessAlert message={successMessage} />}

            {/* Search and Sort Controls */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    {/* Sort Controls */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
                        <select
                            className="form-select rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            value={`${sortBy}-${sortOrder}`}
                            onChange={(e) => {
                                const [newSortBy, newSortOrder] = e.target.value.split('-');
                                setSortBy(newSortBy as 'updated_at' | 'created_at');
                                setSortOrder(newSortOrder as 'asc' | 'desc');
                            }}
                        >
                            <option value="updated_at-desc">Last Updated (Newest)</option>
                            <option value="updated_at-asc">Last Updated (Oldest)</option>
                            <option value="created_at-desc">Date Created (Newest)</option>
                            <option value="created_at-asc">Date Created (Oldest)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div className="flex space-x-2">
                    <button
                        className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${filter === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                        onClick={() => setFilter('active')}
                    >
                        Active
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${filter === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${filter === 'on_hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                        onClick={() => setFilter('on_hold')}
                    >
                        On Hold
                    </button>
                </div>
            </div>

            {/* Projects List */}
            {filteredProjects.length === 0 ? (
                <EmptyState message="No projects found matching the selected filter." />
            ) : (
                <ProjectList
                    projects={filteredProjects}
                    isLoading={isLoading}
                    error={error}
                    isManager={isManager}
                    onEditProject={handleEditProject}
                />
            )}

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleProjectCreated}
            />

            {/* Edit Project Modal */}
            {selectedProject && (
                <EditProjectModal
                    project={selectedProject}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleProjectUpdated}
                />
            )}
        </div>
    );
};

export default Projects;
