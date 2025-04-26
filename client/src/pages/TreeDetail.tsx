import { useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { TreeDetail as TreeDetailType, treesApi } from '../api/client';
import { hasRole } from '../utils/auth';

const TreeDetail = () => {
    const { treeId } = useParams({ from: '/trees/$treeId' });
    const [tree, setTree] = useState<TreeDetailType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isManager = hasRole('manager');

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const response = await treesApi.getTreeById(treeId);
                setTree(response.tree);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching tree:', err);
                setError('Failed to load family tree');
                setIsLoading(false);
            }
        };

        fetchTree();
    }, [treeId]);

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

    if (!tree) {
        return (
            <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tree Not Found</h3>
                <p className="text-gray-500">The requested family tree could not be found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold text-gray-900">{tree.name}</h1>
                <div className="flex space-x-2">
                    {isManager && (
                        <button className="btn-secondary">Manage Access</button>
                    )}
                    {tree.access_level === 'edit' && (
                        <button className="btn-primary">Add Person</button>
                    )}
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">About This Tree</h2>
                    <p className="text-gray-600">{tree.description}</p>
                    <div className="mt-4 text-sm text-gray-500">
                        <p>Created: {new Date(tree.created_at).toLocaleDateString()}</p>
                        {tree.creator && (
                            <p>Created by: {tree.creator.first_name} {tree.creator.last_name}</p>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Family Members</h2>
                    {tree.persons && tree.persons.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tree.persons.map(person => (
                                <div key={person.person_id} className="border rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900">
                                        {person.first_name} {person.last_name}
                                    </h3>
                                    <div className="text-sm text-gray-500 mt-2">
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
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No family members have been added to this tree yet.</p>
                            {tree.access_level === 'edit' && (
                                <button className="btn-primary mt-4">Add First Person</button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TreeDetail;
