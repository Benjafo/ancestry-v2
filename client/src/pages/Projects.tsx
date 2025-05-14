import { useEffect, useState } from 'react';
import { Project, projectsApi } from '../api/client';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import EditProjectModal from '../components/projects/EditProjectModal';
import ProjectList from '../components/projects/ProjectList';
import { hasRole } from '../utils/auth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import SuccessAlert from '../components/common/SuccessAlert';
import EmptyState from '../components/common/EmptyState';

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
