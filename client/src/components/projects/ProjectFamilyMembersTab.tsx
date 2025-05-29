import React, { useEffect, useState } from 'react';
import { Person, ProjectDetail, projectsApi } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import ViewToggle from '../common/ViewToggle';

interface ProjectFamilyMembersTabProps {
    project: ProjectDetail;
    onEditPersonDetails: (person: Person) => void;
    onViewPerson: (personId: string) => void;
    onRemovePerson: (personId: string) => void;
    onCreatePerson: () => void;
}

const ProjectFamilyMembersTab: React.FC<ProjectFamilyMembersTabProps> = ({
    project,
    onEditPersonDetails,
    onViewPerson,
    onRemovePerson,
    onCreatePerson
}) => {
    // State to track which person card is being hovered
    const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
        return (localStorage.getItem('projectFamilyMembersViewMode') as 'grid' | 'list') || 'list';
    });
    const [sortBy, setSortBy] = useState<string>('created_at'); // Default sort by created date
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default sort order descending
    const [persons, setPersons] = useState<Person[]>([]);
    const [filteredPersons, setFilteredPersons] = useState<Person[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const handleToggleView = (newView: 'grid' | 'list') => {
        setViewMode(newView);
        localStorage.setItem('projectFamilyMembersViewMode', newView);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const [newSortBy, newSortOrder] = e.target.value.split(':');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder as 'asc' | 'desc');
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Fetch sorted persons data
    useEffect(() => {
        const fetchProjectPersons = async () => {
            try {
                setIsLoading(true);
                const sortedPersons = await projectsApi.getProjectPersons(project.id, {
                    sortBy,
                    sortOrder
                });
                setPersons(sortedPersons);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching project persons:', error);
                // Fallback to project.persons if API call fails
                setPersons(project.persons || []);
                setIsLoading(false);
            }
        };

        fetchProjectPersons();
    }, [project.id, sortBy, sortOrder, project.persons]);

    // Filter persons based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPersons(persons);
        } else {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const filtered = persons.filter(person =>
                person.first_name.toLowerCase().includes(lowerSearchTerm) ||
                person.last_name.toLowerCase().includes(lowerSearchTerm) ||
                (person.middle_name && person.middle_name.toLowerCase().includes(lowerSearchTerm)) ||
                (person.birth_date && person.birth_date.includes(searchTerm)) ||
                (person.death_date && person.death_date.includes(searchTerm)) ||
                (person.project_persons?.notes && person.project_persons.notes.toLowerCase().includes(lowerSearchTerm))
            );
            setFilteredPersons(filtered);
        }
    }, [searchTerm, persons]);

    return (
        <div>
            {/* Enhanced header with better spacing and visual hierarchy */}
            <div className="mb-6">
                {/* Top row: Title, Search, and Create button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    {/* Left side: Title */}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Family Members</h3>

                    {/* Right side: Search and Create button */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search family members..."
                                className="form-input py-2 pl-10 pr-4 w-64 rounded-md text-sm"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>

                        {project.access_level === 'edit' && project.status !== 'completed' && (
                            <button
                                className="btn-primary"
                                onClick={onCreatePerson}
                            >
                                Add Person
                            </button>
                        )}
                    </div>
                </div>

                {/* Second row: View toggle and Sort dropdown */}
                <div className="flex items-center justify-end gap-3">
                    <ViewToggle currentView={viewMode} onToggle={handleToggleView} />

                    <select
                        id="sort-family-members"
                        name="sort-family-members"
                        className="form-select pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white min-w-48"
                        value={`${sortBy}:${sortOrder}`}
                        onChange={handleSortChange}
                    >
                        <option value="created_at:desc">Created Date (Newest)</option>
                        <option value="created_at:asc">Created Date (Oldest)</option>
                        <option value="updated_at:desc">Last Updated (Newest)</option>
                        <option value="updated_at:asc">Last Updated (Oldest)</option>
                        <option value="birth_date:desc">Birth Date (Newest)</option>
                        <option value="birth_date:asc">Birth Date (Oldest)</option>
                        <option value="first_name:asc">First Name (A-Z)</option>
                        <option value="first_name:desc">First Name (Z-A)</option>
                        <option value="last_name:asc">Last Name (A-Z)</option>
                        <option value="last_name:desc">Last Name (Z-A)</option>
                    </select>
                </div>
            </div>
            {isLoading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : filteredPersons.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'No family members found matching your search.' : 'No family members have been added to this project yet.'}
                    </p>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "" : "overflow-hidden bg-white dark:bg-gray-800 shadow sm:rounded-md"}>
                    <ul className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "divide-y divide-gray-200 dark:divide-gray-700"}>
                        {filteredPersons.map(person => (
                            <li key={person.person_id} className={viewMode === 'grid' ? "border dark:border-gray-700 rounded-lg p-4 dark:bg-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 relative" : ""}>
                                <div
                                    className={viewMode === 'grid'
                                        ? "cursor-pointer relative"
                                        : "block hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer relative"
                                    }
                                    onClick={() => onViewPerson(person.person_id)}
                                    onMouseEnter={() => setHoveredPersonId(person.person_id)}
                                    onMouseLeave={() => setHoveredPersonId(null)}
                                >
                                    {viewMode === 'grid' ? (
                                        <>
                                            <div className="flex justify-between">
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    {person.first_name} {person.last_name}
                                                </h3>

                                                {project.access_level === 'edit' && project.status !== 'completed' && (
                                                    <div
                                                        className={`flex space-x-2 transition-opacity duration-200 ${hoveredPersonId === person.person_id ? 'opacity-100' : 'opacity-0'
                                                            }`}
                                                    >
                                                        <button
                                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Stop event from bubbling up
                                                                onEditPersonDetails(person);
                                                            }}
                                                            title="Edit person"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Stop event from bubbling up
                                                                onRemovePerson(person.person_id);
                                                            }}
                                                            title="Remove from project"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                {person.birth_date && (
                                                    <p>Born: {formatDate(person.birth_date)}</p>
                                                )}
                                                {person.death_date ? (
                                                    <p>Died: {formatDate(person.death_date)}</p>
                                                ) : (
                                                    <p>&nbsp;</p>
                                                )}
                                            </div>

                                            {person.project_persons?.notes && (
                                                <div className="mt-2 text-sm">
                                                    <p className="font-medium">Notes:</p>
                                                    <p className="text-gray-600 dark:text-gray-300">{person.project_persons.notes}</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-medium text-primary-600 dark:text-primary-400 truncate">
                                                    {person.first_name} {person.last_name}
                                                </h3>
                                                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                    {person.birth_date && (
                                                        <span>Born: {formatDate(person.birth_date)}</span>
                                                    )}
                                                    {person.birth_date && person.death_date && (
                                                        <span className="mx-2">•</span>
                                                    )}
                                                    {person.death_date && (
                                                        <span>Died: {formatDate(person.death_date)}</span>
                                                    )}
                                                </div>
                                                {person.project_persons?.notes && (
                                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        <span className="truncate">Notes: {person.project_persons.notes}</span>
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center">
                                                {/* Action buttons - only visible on hover */}
                                                {project.access_level === 'edit' && project.status !== 'completed' && (
                                                    <div className={`flex space-x-2 mr-4 transition-opacity duration-200 ${hoveredPersonId === person.person_id ? 'opacity-100' : 'opacity-0'
                                                        }`}>
                                                        <button
                                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent person view from opening
                                                                onEditPersonDetails(person);
                                                            }}
                                                            title="Edit person"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent person view from opening
                                                                onRemovePerson(person.person_id);
                                                            }}
                                                            title="Remove from project"
                                                        >
                                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ProjectFamilyMembersTab;
