import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Person, ProjectDetail as ProjectDetailType, projectsApi } from '../api/client';
import ConfirmDeleteModal from '../components/common/ConfirmDeleteModal';
import ErrorAlert from '../components/common/ErrorAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SuccessAlert from '../components/common/SuccessAlert';
import CreatePersonModal from '../components/projects/CreatePersonModal';
import EditPersonModal from '../components/projects/EditPersonModal';
import EditPersonNotesModal from '../components/projects/EditPersonNotesModal';
import EditProjectModal from '../components/projects/EditProjectModal';
import ProjectDocumentsTab from '../components/projects/ProjectDocumentsTab';
import ProjectFamilyMembersTab from '../components/projects/ProjectFamilyMembersTab';
import ProjectOverviewTab from '../components/projects/ProjectOverviewTab';
import ProjectRelationshipsTab from '../components/projects/ProjectRelationshipsTab';
import ProjectResearchNotesTab from '../components/projects/ProjectResearchNotesTab';
import ProjectTimelineTab from '../components/projects/ProjectTimelineTab';
import ViewPersonModal from '../components/projects/ViewPersonModal';
import { User } from '../utils/auth';
import { formatDate } from '../utils/dateUtils';
import { getApiErrorMessage } from '../utils/errorUtils';
import { getStatusBadgeClass, getStatusText } from '../utils/statusUtils';

const ProjectDetail = () => {
    const { projectId } = useParams({ from: '/auth/projects/$projectId' });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [project, setProject] = useState<ProjectDetailType | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'timeline' | 'family_members' | 'relationships' | 'research_notes' | 'tree'>('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false);
    const [isCreatePersonModalOpen, setIsCreatePersonModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [editingPersonDetails, setEditingPersonDetails] = useState<Person | null>(null);
    const [viewingPersonId, setViewingPersonId] = useState<string | null>(null);
    const [deletingPersonId, setDeletingPersonId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [documentCount, setDocumentCount] = useState(0);

    // Get current user from localStorage to check if they are a manager
    const currentUser: User = JSON.parse(localStorage.getItem('user_data') || '{}');
    const isManager = currentUser?.roles?.includes('manager');

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

    // const handleAddPerson = () => {
    //     setIsAddPersonModalOpen(true);
    // };

    const handleCreatePerson = () => {
        setIsCreatePersonModalOpen(true);
    };

    const handleEditPersonDetails = (person: Person) => {
        setEditingPersonDetails(person);
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
            const updatedProject = await projectsApi.getProjectById(projectId, { includeEvents: true, includeDocuments: true, includeRelationships: true }); // Ensure all related data is included
            console.log('Refreshed project data after person update:', updatedProject); // Log the data
            setProject(updatedProject);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            console.error('Error removing person from project:', errorMessage);
            setError(errorMessage);

            // Clear error message after 3 seconds
            setTimeout(() => {
                setError(null);
            }, 3000);
        } finally {
            // Close the confirmation modal
            setDeletingPersonId(null);
        }
    };

    // const handlePersonAdded = async () => {
    //     // Show success message
    //     setSuccessMessage('Person added to project successfully');

    //     // Refresh project data
    //     const updatedProject = await projectsApi.getProjectById(projectId);
    //     setProject(updatedProject);

    //     // Clear success message after 3 seconds
    //     setTimeout(() => {
    //         setSuccessMessage(null);
    //     }, 3000);
    // };

    const handlePersonCreated = async () => {
        // Show success message
        setSuccessMessage('Person created successfully');

        // Refresh project data
        const updatedProject = await projectsApi.getProjectById(projectId);
        setProject(updatedProject);

        // Clear success message after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
    };

    const handlePersonUpdated = async () => {
        // Show success message
        setSuccessMessage('Person updated successfully');

        // Refresh project data
        const updatedProject = await projectsApi.getProjectById(projectId, { includeEvents: true, includeDocuments: true, includeRelationships: true }); // Ensure all related data is included
        console.log('Refreshed project data after person update:', updatedProject); // Log the data
        setProject(updatedProject);

        // Clear success message after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
        }, 3000);
    };

    const handleDocumentAdded = async () => {
        // Show success message
        setSuccessMessage('Document added successfully');

        // Refresh project data with documents included
        const updatedProject = await projectsApi.getProjectById(projectId, {
            includeDocuments: true
        });
        console.log('Refreshed project data after document added:', updatedProject);
        setProject(updatedProject);
        setDocumentCount(updatedProject.documents?.length || 0); // Update document count

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
        const fetchProjectDetails = async () => {
            try {
                // Include relationships and documents when fetching project data
                const projectData = await projectsApi.getProjectById(projectId, {
                    includeRelationships: true,
                    includeDocuments: true
                });
                console.log('Fetched project data:', projectData); // Log the fetched data
                setProject(projectData);
                setDocumentCount(projectData.documents?.length || 0); // Initialize document count
                setIsLoading(false);
            } catch (err: unknown) {
                const errorMessage = await getApiErrorMessage(err);
                console.error('Error fetching project details:', errorMessage);
                setError(errorMessage);
                setIsLoading(false);
            }
        };

        fetchProjectDetails();
    }, [projectId]);

    if (isLoading) {
        return <LoadingSpinner containerClassName="h-64" size="lg" />;
    }

    if (error || !project) {
        return (
            <div className="space-y-4">
                <ErrorAlert message={error || 'Project not found'} />
                <div className="text-center">
                    <Link to="/projects" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                        Return to Projects
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {successMessage && <SuccessAlert message={successMessage} />}

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
                <div>
                    <button
                        className="btn-secondary"
                        onClick={handleOpenEditModal}
                        title={project.status === 'completed' ? 'You can only change the status of completed projects' : 'Edit project'}
                    >
                        Edit Project
                    </button>
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
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'overview'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'documents'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => setActiveTab('documents')}
                        >
                            Documents ({documentCount})
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'timeline'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => setActiveTab('timeline')}
                        >
                            Timeline ({project.timeline?.length || 0})
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'family_members'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => setActiveTab('family_members')}
                        >
                            Family Members {project.persons && `(${project.persons.length})`}
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'relationships'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => setActiveTab('relationships')}
                        >
                            Relationships
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'research_notes'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => setActiveTab('research_notes')}
                        >
                            Research Notes
                        </button>
                        <button
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'tree'
                                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                                }`}
                            onClick={() => setActiveTab('tree')}
                        >
                            Tree
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <ProjectOverviewTab project={project} />
                    )}

                    {activeTab === 'documents' && (
                        <ProjectDocumentsTab
                            project={project}
                            onDocumentAdded={handleDocumentAdded}
                            onViewPerson={handleViewPerson}
                        />
                    )}

                    {activeTab === 'timeline' && (
                        <ProjectTimelineTab
                            project={project}
                            onViewPerson={handleViewPerson}
                        />
                    )}

                    {activeTab === 'family_members' && (
                        <ProjectFamilyMembersTab
                            project={project}
                            onEditPersonDetails={handleEditPersonDetails}
                            onViewPerson={handleViewPerson}
                            onRemovePerson={handleRemovePerson}
                            onCreatePerson={handleCreatePerson}
                        />
                    )}

                    {activeTab === 'relationships' && (
                        <ProjectRelationshipsTab
                            project={project}
                            onViewPerson={handleViewPerson}
                        />
                    )}

                    {activeTab === 'research_notes' && (
                        <ProjectResearchNotesTab project={project} />
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

            {/* Add Person Modal
            {isAddPersonModalOpen && (
                <AddPersonModal
                    projectId={projectId}
                    isOpen={isAddPersonModalOpen}
                    onClose={() => setIsAddPersonModalOpen(false)}
                    onPersonAdded={handlePersonAdded}
                />
            )} */}

            {/* Create Person Modal */}
            {isCreatePersonModalOpen && (
                <CreatePersonModal
                    projectId={projectId}
                    isOpen={isCreatePersonModalOpen}
                    onClose={() => setIsCreatePersonModalOpen(false)}
                    onPersonCreated={handlePersonCreated}
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

            {/* Edit Person Details Modal */}
            {editingPersonDetails && (
                <EditPersonModal
                    person={editingPersonDetails}
                    isOpen={!!editingPersonDetails}
                    onClose={() => setEditingPersonDetails(null)}
                    onPersonUpdated={handlePersonUpdated}
                />
            )}

            {/* View Person Modal */}
            {viewingPersonId && (
                <ViewPersonModal
                    personId={viewingPersonId}
                    isOpen={!!viewingPersonId}
                    onClose={() => setViewingPersonId(null)}
                    onEdit={handleEditPersonDetails}
                    onViewRelatedPerson={handleViewPerson}
                    projectStatus={project.status}
                    isManager={isManager}
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
