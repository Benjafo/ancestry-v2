import { useEffect, useState } from 'react';
import { Project, projectsApi } from '../api/client';
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
    
    const isManager = hasRole('manager');
    
    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };
    
    const handleProjectCreated = (newProject: Project) => {
        setProjects([...projects, newProject]);
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
        // Update the projects list with the updated project
        setProjects(projects.map(p => 
            p.id === updatedProject.id ? updatedProject : p
        ));
        setIsEditModalOpen(false);
        setSelectedProject(null);
        
        // Show success message
        setSuccessMessage('Project updated successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
    };

    useEffect(() => {
        // Check if we should open the create modal based on URL
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('create') === 'true') {
            setIsCreateModalOpen(true);
            // Clear the parameter from the URL
            window.history.replaceState({}, '', '/projects');
        }
        
        const fetchProjects = async () => {
            try {
                const data = await projectsApi.getProjects();
                setProjects(data.projects);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching projects:', err);
                setError('Failed to load projects');
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const filteredProjects = filter === 'all' 
        ? projects 
        : projects.filter(project => project.status === filter);

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
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Research Projects</h1>
                <button className="btn-primary" onClick={handleOpenCreateModal}>New Project</button>
            </div>
            
            {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">{successMessage}</p>
                        </div>
                    </div>
                </div>
            )}

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
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
                    <p className="text-gray-500 dark:text-gray-400">No projects found matching the selected filter.</p>
                </div>
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
