import { useEffect, useState } from 'react';
import { Event, eventsApi } from '../../api/client';
import ErrorAlert from '../common/ErrorAlert';
import LoadingSpinner from '../common/LoadingSpinner';
import { getApiErrorMessage } from '../../utils/errorUtils';

interface EventFormProps {
    personId?: string;
    eventId?: string;
    projectId?: string; // Add projectId prop
    onSuccess: (event: Event) => void;
    onCancel: () => void;
}

const EventForm = ({ personId, eventId, projectId, onSuccess, onCancel }: EventFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Event>>({
        person_id: personId || '',
        event_type: 'birth',
        event_date: '',
        event_location: '',
        description: ''
    });

    const eventTypes = [
        { value: 'birth', label: 'Birth' },
        { value: 'death', label: 'Death' },
        { value: 'marriage', label: 'Marriage' },
        { value: 'divorce', label: 'Divorce' },
        { value: 'immigration', label: 'Immigration' },
        { value: 'emigration', label: 'Emigration' },
        { value: 'naturalization', label: 'Naturalization' },
        { value: 'graduation', label: 'Graduation' },
        { value: 'military_service', label: 'Military Service' },
        { value: 'retirement', label: 'Retirement' },
        { value: 'religious', label: 'Religious Event' },
        { value: 'medical', label: 'Medical Event' },
        { value: 'residence', label: 'Residence' },
        { value: 'census', label: 'Census' },
        { value: 'other', label: 'Other' }
    ];

    useEffect(() => {
        // If editing an existing event, fetch its data
        if (eventId) {
            const fetchEvent = async () => {
                setIsLoading(true);
                try {
                    const event = await eventsApi.getEventById(eventId);

                    // Format date for input field (YYYY-MM-DD)
                    const formattedEvent = {
                        ...event,
                        event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : ''
                    };

                    setFormData(formattedEvent);
                } catch (err: unknown) {
                    const errorMessage = await getApiErrorMessage(err);
                    setError(errorMessage);
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchEvent();
        }
    }, [eventId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Create a clean copy of the form data and omit empty optional fields
            const cleanedFormData: Partial<Event> & { projectId?: string } = {
                person_id: formData.person_id,
                event_type: formData.event_type,
                // Conditionally include optional fields if they are not empty strings
                ...(formData.event_date ? { event_date: formData.event_date } : {}), // Assuming event_date is optional based on type
                ...(formData.event_location ? { event_location: formData.event_location } : {}),
                ...(formData.description ? { description: formData.description } : {}),
            };

            console.log('Cleaned Form Data:', cleanedFormData);

            // Include projectId if provided
            if (projectId) {
                cleanedFormData.projectId = projectId;
            }

            let result;

            if (eventId) {
                // Update existing event
                result = await eventsApi.updateEvent(eventId, cleanedFormData);
            } else {
                // Create new event
                result = await eventsApi.createEvent(cleanedFormData);
            }

            onSuccess(result.event);
        } catch (err: unknown) {
            const errorMessage = await getApiErrorMessage(err);
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && eventId) {
        return <LoadingSpinner containerClassName="h-64" size="lg" />;
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {eventId ? 'Edit Event' : 'Add New Event'}
            </h2>

            {error && <ErrorAlert message={error} />}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Event Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="event_type"
                        name="event_type"
                        value={formData.event_type}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                        {eventTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date {(formData.event_type === 'birth' || formData.event_type === 'death') && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="date"
                        id="event_date"
                        name="event_date"
                        value={formData.event_date}
                        onChange={handleChange}
                        required={formData.event_type === 'birth' || formData.event_type === 'death'}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="event_location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location {(formData.event_type === 'marriage' || formData.event_type === 'divorce') && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="text"
                        id="event_location"
                        name="event_location"
                        value={formData.event_location || ''}
                        onChange={handleChange}
                        required={formData.event_type === 'marriage' || formData.event_type === 'divorce'}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., New York, NY, USA"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Additional details about this event..."
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : (eventId ? 'Update Event' : 'Add Event')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventForm;
