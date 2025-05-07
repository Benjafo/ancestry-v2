import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Person, ProjectDetail as ProjectDetailType, projectsApi } from '../api/client';
import AddPersonModal from '../components/projects/AddPersonModal';
import ConfirmDeleteModal from '../components/projects/ConfirmDeleteModal';
import EditPersonNotesModal from '../components/projects/EditPersonNotesModal';
import EditProjectModal from '../components/projects/EditProjectModal';
import ProjectDocumentsTab from '../components/projects/ProjectDocumentsTab';
import ProjectFamilyMembersTab from '../components/projects/ProjectFamilyMembersTab';
import ProjectOverviewTab from '../components/projects/ProjectOverviewTab';
import ProjectTimelineTab from '../components/projects/ProjectTimelineTab';
import ViewPersonModal from '../components/projects/ViewPersonModal';
import { formatDate } from '../utils/dateUtils';

const ProjectDetail = () => {
    const { projectId } = useParams({ from: '/auth/projects/$projectId' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<ProjectDetailType | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'timeline' | 'family_members'>('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [viewingPersonId, setViewingPersonId] = useState<string | null>(null);
    const [deletingPersonId, setDeletingPersonId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleOpenEditModal = () => {
        if (project) {
            setIsEditModalOpen(true);
        }
    };
    
    const handleProjectUpdated = (updatedProject: ProjectDetailType) => {
        setProject(updatedProject);
        setIsEditModalOpen(false);
        
        // Show success message
        setSuccessMessage('Project updated successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
    };

    const handleAddPerson = () => {
        setIsAddPersonModalOpen(true);
    };

    const handleEditPerson = (person: Person) => {
        setEditingPerson(person);
    };

    const handleViewPerson = (personId: string) => {
        setViewingPersonId(personId);
    };

    const handleRemovePerson = (personId: string) => {
        // Instead of showing browser confirm, set the deletingPersonId state
        setDeletingPersonId(personId);
    };

    const confirmRemovePerson = async () => {
        if (!deletingPersonId) return;
        
        try {
            await projectsApi.removePersonFromProject(projectId, deletingPersonId);
            
            // Show success message
            setSuccessMessage('Person removed from project successfully');
            
            // Refresh project data
            const updatedProject = await projectsApi.getProjectById(projectId);
            setProject(updatedProject);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error removing person from project:', err);
            setError('Failed to remove person from project');
            
            // Clear error message after 3 seconds
            setTimeout(() => {
                setError(null);
            }, 3000);
        } finally {
            // Close the confirmation modal
            setDeletingPersonId(null);
        }
    };

    const handlePersonAdded = async () => {
        // Show success message
        setSuccessMessage('Person added to project successfully');
        
        // Refresh project data
        const updatedProject = await projectsApi.getProjectById(projectId);
        setProject(updatedProject);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
    };

    const handleNotesUpdated = async () => {
        // Show success message
        setSuccessMessage('Person notes updated successfully');
        
        // Refresh project data
        const updatedProject = await projectsApi.getProjectById(projectId);
        setProject(updatedProject);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
    };

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
                    <button 
                        className="btn-secondary"
                        onClick={handleOpenEditModal}
                    >
                        Edit Project
                    </button>
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
                                Created on {formatDate(project.created_at)}
                                {' • '}
                                Last updated {formatDate(project.updated_at)}
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
                        <ProjectOverviewTab project={project} />
                    )}

                    {activeTab === 'documents' && (
                        <ProjectDocumentsTab project={project} />
                    )}

                    {activeTab === 'timeline' && (
                        <ProjectTimelineTab project={project} />
                    )}

                    {activeTab === 'family_members' && (
                        <ProjectFamilyMembersTab 
                            project={project}
                            onAddPerson={handleAddPerson}
                            onEditPerson={handleEditPerson}
                            onViewPerson={handleViewPerson}
                            onRemovePerson={handleRemovePerson}
                        />
                    )}
                </div>
            </div>
            
            {/* Edit Project Modal */}
            {project && isEditModalOpen && (
                <EditProjectModal
                    project={project}
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={handleProjectUpdated}
                />
            )}

            {/* Add Person Modal */}
            {isAddPersonModalOpen && (
                <AddPersonModal
                    projectId={projectId}
                    isOpen={isAddPersonModalOpen}
                    onClose={() => setIsAddPersonModalOpen(false)}
                    onPersonAdded={handlePersonAdded}
                />
            )}

            {/* Edit Person Notes Modal */}
            {editingPerson && (
                <EditPersonNotesModal
                    projectId={projectId}
                    person={editingPerson}
                    isOpen={!!editingPerson}
                    onClose={() => setEditingPerson(null)}
                    onNotesUpdated={handleNotesUpdated}
                />
            )}
            
            {/* View Person Modal */}
            {viewingPersonId && (
                <ViewPersonModal
                    personId={viewingPersonId}
                    isOpen={!!viewingPersonId}
                    onClose={() => setViewingPersonId(null)}
                />
            )}

            {/* Confirm Delete Modal */}
            {deletingPersonId && (
                <ConfirmDeleteModal
                    isOpen={!!deletingPersonId}
                    onClose={() => setDeletingPersonId(null)}
                    onConfirm={confirmRemovePerson}
                    title="Remove Person"
                    message="Are you sure you want to remove this person from the project? This action cannot be undone."
                />
            )}
        </div>
    );
};

export default ProjectDetail;
