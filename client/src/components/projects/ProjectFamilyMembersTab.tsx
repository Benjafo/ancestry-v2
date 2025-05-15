import React from 'react';
import { Person, ProjectDetail } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';

interface ProjectFamilyMembersTabProps {
    project: ProjectDetail;
    onEditPersonDetails: (person: Person) => void;
    onViewPerson: (personId: string) => void;
    onRemovePerson: (personId: string) => void;
}

const ProjectFamilyMembersTab: React.FC<ProjectFamilyMembersTabProps> = ({
    project,
    onEditPersonDetails,
    onViewPerson,
    onRemovePerson
}) => {
    return (
        <div>
            {!project.persons || project.persons.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No family members have been added to this project yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.persons.map(person => (
                        <div
                            key={person.person_id}
                            className="border dark:border-gray-700 rounded-lg p-4 dark:bg-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
                            onClick={() => onViewPerson(person.person_id)}
                        >
                            <div className="flex justify-between">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                    {person.first_name} {person.last_name}
                                </h3>

                                {project.access_level === 'edit' && project.status !== 'completed' && (
                                    <div className="flex space-x-2">
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
                                {person.death_date && (
                                    <p>Died: {formatDate(person.death_date)}</p>
                                )}
                            </div>

                            {person.project_persons?.notes && (
                                <div className="mt-2 text-sm">
                                    <p className="font-medium">Notes:</p>
                                    <p className="text-gray-600 dark:text-gray-300">{person.project_persons.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectFamilyMembersTab;
