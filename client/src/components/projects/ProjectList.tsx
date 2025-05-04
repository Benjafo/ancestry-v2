import { Link } from '@tanstack/react-router';
import { Project } from '../../api/client';

interface ProjectListProps {
    projects: Project[];
    isLoading: boolean;
    error: string | null;
}

const ProjectList = ({ projects, isLoading, error }: ProjectListProps) => {
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

    if (projects.length === 0) {
        return (
            <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Projects</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have any projects yet.</p>
                <Link to="/projects/new" className="btn-primary">
                    Create Your First Project
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
                <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="p-5">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{project.title}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(project.created_at).toLocaleDateString()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                                project.status === 'active' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : project.status === 'completed' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                                {project.status === 'active' 
                                    ? 'Active' 
                                    : project.status === 'completed' 
                                        ? 'Completed' 
                                        : 'On Hold'}
                            </span>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                        <Link 
                            to="/projects/:projectId"
                            params={{ projectId: project.id }}
                            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
                        >
                            View Project →
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProjectList;
