import { useEffect, useState } from 'react';
import { Project, UserDetails, UserEvent, managerApi, projectsApi } from '../api/client';
import CreateUserModal from '../components/CreateUserModal';
import { formatDateTime } from '../utils/dateUtils';
import { formatSnakeCase, formatStatus } from '../utils/formatUtils';
import ErrorAlert from '../components/common/ErrorAlert';
import SuccessAlert from '../components/common/SuccessAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

// Assignment History Component
const AssignmentHistory = ({ clientId }: { clientId: string }) => {
    const [history, setHistory] = useState<UserEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setIsLoading(true);
                const response = await managerApi.getAssignmentHistory(clientId);
                setHistory(response.history);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching assignment history:', err);
                setError('Failed to load assignment history');
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [clientId]);

    if (isLoading) {
        return <LoadingSpinner containerClassName="h-32" size="md" />;
    }

    if (error) {
        return <ErrorAlert message={error} />;
    }

    if (history.length === 0) {
        return <EmptyState message="No assignment history found." />;
    }

    return (
        <div className="space-y-4">
            {history.map(event => (
                <div key={event.id} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2">
                    <div className="flex justify-between">
                        <span className="font-medium dark:text-white">{formatSnakeCase(event.event_type)}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {event.createdAt ? formatDateTime(event.createdAt) : 'No date'}
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{event.message}</p>
                    {event.actor && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            By {event.actor.first_name} {event.actor.last_name}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};
  
const ClientAssignment = () => {
    const [clients, setClients] = useState<UserDetails[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedClient, setSelectedClient] = useState<string | null>(null);
    const [clientAssignments, setClientAssignments] = useState<{
        projects: Project[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    
    // Pagination for client cards (3 rows x 3 columns = 9 clients per page)
    const [currentPage, setCurrentPage] = useState(1);
    const clientsPerPage = 9;

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedClient) {
            fetchClientAssignments(selectedClient);
        } else {
            setClientAssignments(null);
        }
    }, [selectedClient]);

    const fetchInitialData = async () => {
        try {
            setIsLoading(true);
            const [clientsResponse, projectsResponse] = await Promise.all([
                managerApi.getUsers('clients'),
                projectsApi.getProjects()
            ]);

            setClients(clientsResponse.users);
            setProjects(projectsResponse.projects);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
            setIsLoading(false);
        }
    };

    const fetchClientAssignments = async (clientId: string) => {
        try {
            setIsLoadingAssignments(true);
            const response = await managerApi.getClientAssignments(clientId);
            setClientAssignments(response);
            setIsLoadingAssignments(false);
        } catch (err) {
            console.error('Error fetching client assignments:', err);
            setError('Failed to load client assignments');
            setIsLoadingAssignments(false);
        }
    };

    const handleAssignToProject = async (projectId: string) => {
        if (!selectedClient) return;

        try {
            await managerApi.assignClientToProject(selectedClient, projectId);
            setSuccessMessage('Client assigned to project successfully');
            fetchClientAssignments(selectedClient);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error assigning client to project:', err);
            setError('Failed to assign client to project');
        }
    };

    const handleRemoveFromProject = async (projectId: string) => {
        if (!selectedClient) return;

        try {
            await managerApi.removeClientFromProject(selectedClient, projectId);
            setSuccessMessage('Client removed from project successfully');
            fetchClientAssignments(selectedClient);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error removing client from project:', err);
            setError('Failed to remove client from project');
        }
    };


    const isProjectAssigned = (projectId: string) => {
        if (!clientAssignments) return false;
        return clientAssignments.projects.some(project => project.id === projectId);
    };

    if (isLoading) {
        return <LoadingSpinner containerClassName="h-64" size="lg" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Client Assignment</h1>
                <button
                    className="btn-primary"
                    onClick={() => setIsCreateUserModalOpen(true)}
                >
                    Create User
                </button>
            </div>

            {successMessage && <SuccessAlert message={successMessage} />}

            {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Select Client</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.length === 0 ? (
                        <EmptyState message="No clients found" />
                    ) : (
                        // Display only clients for the current page
                        clients
                            .slice((currentPage - 1) * clientsPerPage, currentPage * clientsPerPage)
                            .map(client => (
                                <div
                                    key={client.user_id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedClient === client.user_id
                                        ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:border-primary-500 dark:hover:bg-gray-700'
                                        }`}
                                    onClick={() => setSelectedClient(client.user_id)}
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                                            <span className="text-primary-800 dark:text-primary-200 font-medium">
                                                {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {client.first_name} {client.last_name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{client.email}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
                
                {/* Pagination Controls */}
                {clients.length > clientsPerPage && (
                    <div className="mt-4 flex justify-center">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                                    currentPage === 1
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                        : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                            >
                                <span className="sr-only">Previous</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            {/* Page Numbers */}
                            {Array.from({ length: Math.ceil(clients.length / clientsPerPage) }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                                        currentPage === i + 1
                                            ? 'z-10 bg-primary-50 dark:bg-primary-900 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-200'
                                            : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            
                            <button
                                onClick={() => setCurrentPage(Math.min(Math.ceil(clients.length / clientsPerPage), currentPage + 1))}
                                disabled={currentPage === Math.ceil(clients.length / clientsPerPage)}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                                    currentPage === Math.ceil(clients.length / clientsPerPage)
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                                        : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                            >
                                <span className="sr-only">Next</span>
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {selectedClient && (
                <div className="grid grid-cols-1 gap-6">
                    {/* Projects Assignment */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Assignments</h2>
                        {isLoadingAssignments ? (
                            <LoadingSpinner containerClassName="h-32" size="md" />
                        ) : (
                            <>
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Projects</h3>
                                    {!clientAssignments || clientAssignments.projects.length === 0 ? (
                                        <EmptyState message="No projects assigned" />
                                    ) : (
                                        <div className="space-y-2">
                                            {clientAssignments.projects.map(project => (
                                                <div key={project.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                                    <div>
                                                        <div className="font-medium text-sm dark:text-white">{project.title}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{formatStatus(project.status)}</div>
                                                    </div>
                                                    <button
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                                        onClick={() => handleRemoveFromProject(project.id)}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Projects</h3>
                                    {projects.filter(project => !isProjectAssigned(project.id)).length === 0 ? (
                                        <EmptyState message="No available projects" />
                                    ) : (
                                        <div className="space-y-2">
                                            {projects
                                                .filter(project => !isProjectAssigned(project.id))
                                                .map(project => (
                                                    <div key={project.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                                        <div>
                                                            <div className="font-medium text-sm dark:text-white">{project.title}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{formatStatus(project.status)}</div>
                                                        </div>
                                                        <button
                                                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
                                                            onClick={() => handleAssignToProject(project.id)}
                                                        >
                                                            Assign
                                                        </button>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                </div>
            )}

            {selectedClient && (
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Assignment History</h2>
                    <AssignmentHistory clientId={selectedClient} />
                </div>
            )}

            {/* Create User Modal */}
            {isCreateUserModalOpen && (
                <CreateUserModal
                    isOpen={isCreateUserModalOpen}
                    onClose={() => setIsCreateUserModalOpen(false)}
                    onSuccess={() => {
                        setSuccessMessage('User created successfully');
                        fetchInitialData(); // Refresh the client list
                        setTimeout(() => {
                            setSuccessMessage(null);
                        }, 3000);
                    }}
                    defaultRole="client" // Always create clients from this page
                />
            )}
        </div>
    );
};

export default ClientAssignment;
