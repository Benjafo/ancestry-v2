import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Project, projectsApi } from '../api/client';

const Projects = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'on_hold'>('all');

    useEffect(() => {
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

    const getStatusBadgeClass = (status: Project['status']) => {
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

    const getStatusText = (status: Project['status']) => {
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
                <h1 className="text-2xl font-semibold text-gray-900">Research Projects</h1>
                <button className="btn-primary">New Project</button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex space-x-2">
                    <button 
                        className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button 
                        className={`px-4 py-2 rounded-md ${filter === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        onClick={() => setFilter('active')}
                    >
                        Active
                    </button>
                    <button 
                        className={`px-4 py-2 rounded-md ${filter === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </button>
                    <button 
                        className={`px-4 py-2 rounded-md ${filter === 'on_hold' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}
                        onClick={() => setFilter('on_hold')}
                    >
                        On Hold
                    </button>
                </div>
            </div>

            {/* Projects List */}
            {filteredProjects.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <p className="text-gray-500">No projects found matching the selected filter.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredProjects.map(project => (
                        <div key={project.id} className="bg-white p-6 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-medium text-gray-900">
                                        <Link 
                                            to="/projects/$projectId" 
                                            params={{ projectId: project.id }}
                                            className="hover:text-primary-600"
                                        >
                                            {project.title}
                                        </Link>
                                    </h2>
                                    <p className="text-gray-600 mt-1">{project.description}</p>
                                    <div className="mt-2 flex items-center space-x-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                                            {getStatusText(project.status)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Updated {new Date(project.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="text-gray-400 hover:text-gray-500">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                    <button className="text-gray-400 hover:text-red-500">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Projects;
