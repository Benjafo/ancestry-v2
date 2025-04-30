import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Project, Tree, UserDetails, managerApi, projectsApi, treesApi } from '../api/client';

const ClientAssignment = () => {
    const [clients, setClients] = useState<UserDetails[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [trees, setTrees] = useState<Tree[]>([]);
    const [selectedClient, setSelectedClient] = useState<string | null>(null);
    const [clientAssignments, setClientAssignments] = useState<{
        projects: Project[];
        trees: (Tree & { access_level?: string })[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
            const [clientsResponse, projectsResponse, treesResponse] = await Promise.all([
                managerApi.getUsers('clients'),
                projectsApi.getProjects(),
                treesApi.getTrees()
            ]);
            
            setClients(clientsResponse.users);
            setProjects(projectsResponse.projects);
            setTrees(treesResponse.trees);
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

    const handleAssignToTree = async (treeId: string, accessLevel: 'view' | 'edit') => {
        if (!selectedClient) return;
        
        try {
            await managerApi.assignClientToTree(selectedClient, treeId, accessLevel);
            setSuccessMessage('Client assigned to tree successfully');
            fetchClientAssignments(selectedClient);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error assigning client to tree:', err);
            setError('Failed to assign client to tree');
        }
    };

    const handleRemoveFromTree = async (treeId: string) => {
        if (!selectedClient) return;
        
        try {
            await managerApi.removeClientFromTree(selectedClient, treeId);
            setSuccessMessage('Client removed from tree successfully');
            fetchClientAssignments(selectedClient);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        } catch (err) {
            console.error('Error removing client from tree:', err);
            setError('Failed to remove client from tree');
        }
    };

    const isProjectAssigned = (projectId: string) => {
        if (!clientAssignments) return false;
        return clientAssignments.projects.some(project => project.id === projectId);
    };

    const isTreeAssigned = (treeId: string) => {
        if (!clientAssignments) return false;
        return clientAssignments.trees.some(tree => tree.tree_id === treeId);
    };

    const getTreeAccessLevel = (treeId: string) => {
        if (!clientAssignments) return null;
        const tree = clientAssignments.trees.find(tree => tree.tree_id === treeId);
        return tree?.access_level || null;
    };

    const getSelectedClient = () => {
        if (!selectedClient) return null;
        return clients.find(client => client.user_id === selectedClient);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Client Assignment</h1>
                <Link to="/manager/dashboard" className="btn-secondary">
                    Back to Dashboard
                </Link>
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

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                            <button 
                                className="text-sm font-medium text-red-700 hover:text-red-600 mt-1"
                                onClick={() => setError(null)}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-sm rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Select Client</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.length === 0 ? (
                        <p className="text-gray-500 col-span-full">No clients found</p>
                    ) : (
                        clients.map(client => (
                            <div 
                                key={client.user_id} 
                                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                    selectedClient === client.user_id 
                                        ? 'border-primary-500 bg-primary-50' 
                                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedClient(client.user_id)}
                            >
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                        <span className="text-primary-800 font-medium">
                                            {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {client.first_name} {client.last_name}
                                        </div>
                                        <div className="text-sm text-gray-500">{client.email}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedClient && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Projects Assignment */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Project Assignments</h2>
                        {isLoadingAssignments ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned Projects</h3>
                                    {!clientAssignments || clientAssignments.projects.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No projects assigned</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {clientAssignments.projects.map(project => (
                                                <div key={project.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                                    <div>
                                                        <div className="font-medium text-sm">{project.title}</div>
                                                        <div className="text-xs text-gray-500">{project.status}</div>
                                                    </div>
                                                    <button 
                                                        className="text-red-600 hover:text-red-800 text-sm"
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
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Available Projects</h3>
                                    {projects.filter(project => !isProjectAssigned(project.id)).length === 0 ? (
                                        <p className="text-gray-500 text-sm">No available projects</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {projects
                                                .filter(project => !isProjectAssigned(project.id))
                                                .map(project => (
                                                    <div key={project.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                                        <div>
                                                            <div className="font-medium text-sm">{project.title}</div>
                                                            <div className="text-xs text-gray-500">{project.status}</div>
                                                        </div>
                                                        <button 
                                                            className="text-primary-600 hover:text-primary-800 text-sm"
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

                    {/* Trees Assignment */}
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Tree Assignments</h2>
                        {isLoadingAssignments ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Assigned Trees</h3>
                                    {!clientAssignments || clientAssignments.trees.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No trees assigned</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {clientAssignments.trees.map(tree => (
                                                <div key={tree.tree_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                                    <div>
                                                        <div className="font-medium text-sm">{tree.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            Access: <span className="font-medium">{tree.access_level}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex space-x-1">
                                                            <button 
                                                                className={`text-xs px-2 py-1 rounded ${
                                                                    tree.access_level === 'view' 
                                                                        ? 'bg-blue-100 text-blue-800' 
                                                                        : 'bg-gray-100 text-gray-800 hover:bg-blue-50 hover:text-blue-600'
                                                                }`}
                                                                onClick={() => handleAssignToTree(tree.tree_id, 'view')}
                                                                disabled={tree.access_level === 'view'}
                                                            >
                                                                View
                                                            </button>
                                                            <button 
                                                                className={`text-xs px-2 py-1 rounded ${
                                                                    tree.access_level === 'edit' 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : 'bg-gray-100 text-gray-800 hover:bg-green-50 hover:text-green-600'
                                                                }`}
                                                                onClick={() => handleAssignToTree(tree.tree_id, 'edit')}
                                                                disabled={tree.access_level === 'edit'}
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                        <button 
                                                            className="text-red-600 hover:text-red-800 text-sm"
                                                            onClick={() => handleRemoveFromTree(tree.tree_id)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Available Trees</h3>
                                    {trees.filter(tree => !isTreeAssigned(tree.tree_id)).length === 0 ? (
                                        <p className="text-gray-500 text-sm">No available trees</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {trees
                                                .filter(tree => !isTreeAssigned(tree.tree_id))
                                                .map(tree => (
                                                    <div key={tree.tree_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                                        <div>
                                                            <div className="font-medium text-sm">{tree.name}</div>
                                                            <div className="text-xs text-gray-500">{tree.description?.substring(0, 50)}{tree.description && tree.description.length > 50 ? '...' : ''}</div>
                                                        </div>
                                                        <div className="flex space-x-1">
                                                            <button 
                                                                className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                                onClick={() => handleAssignToTree(tree.tree_id, 'view')}
                                                            >
                                                                View
                                                            </button>
                                                            <button 
                                                                className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200"
                                                                onClick={() => handleAssignToTree(tree.tree_id, 'edit')}
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
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
                <div className="bg-white shadow-sm rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Assignment History</h2>
                    <p className="text-gray-500 text-center py-4">Assignment history will be available in a future update.</p>
                </div>
            )}
        </div>
    );
};

export default ClientAssignment;
