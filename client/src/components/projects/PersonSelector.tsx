import React, { useEffect, useState } from 'react';
import { Person, projectsApi } from '../../api/client';

interface PersonSelectorProps {
    onSelect: (person: Person) => void;
}

const PersonSelector: React.FC<PersonSelectorProps> = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [persons, setPersons] = useState<Person[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (query.length < 2) {
            setPersons([]);
            return;
        }

        const searchPersons = async () => {
            setLoading(true);
            setError(null);
            try {
                const results = await projectsApi.searchPersons(query);
                setPersons(results);
            } catch (err) {
                console.error('Error searching persons:', err);
                setError('Failed to search for persons');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(searchPersons, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="w-full">
            <div className="relative">
                <input
                    type="text"
                    className="form-input w-full"
                    placeholder="Search for a person..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {loading && (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin h-4 w-4 border-2 border-primary-500 rounded-full border-t-transparent"></div>
                    </div>
                )}
            </div>

            {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
            )}

            {persons.length > 0 && (
                <ul className="mt-2 border rounded-md shadow-sm max-h-60 overflow-y-auto">
                    {persons.map((person) => (
                        <li
                            key={person.person_id}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => onSelect(person)}
                        >
                            <div className="font-medium">{person.first_name} {person.last_name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {person.birth_date && `Born: ${new Date(person.birth_date).getFullYear()}`}
                                {person.birth_date && person.death_date && ' - '}
                                {person.death_date && `Died: ${new Date(person.death_date).getFullYear()}`}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PersonSelector;
