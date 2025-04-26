import { Link } from '@tanstack/react-router';
import { Tree } from '../../api/client';

interface TreeListProps {
    trees: Tree[];
    isLoading: boolean;
    error: string | null;
}

const TreeList = ({ trees, isLoading, error }: TreeListProps) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
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

    if (trees.length === 0) {
        return (
            <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Family Trees</h3>
                <p className="text-gray-500 mb-4">You don't have any family trees yet.</p>
                <Link to="/trees/new" className="btn-primary">
                    Create Your First Tree
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trees.map((tree) => (
                <div key={tree.tree_id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-5">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{tree.name}</h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{tree.description}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                                {new Date(tree.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                {tree.access_level === 'edit' ? 'Editor' : 'Viewer'}
                            </span>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3">
                        <Link 
                            to={`/trees/${tree.tree_id}`} 
                            className="text-primary-600 hover:text-primary-800 font-medium text-sm"
                        >
                            View Tree →
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TreeList;
