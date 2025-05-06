import { useEffect, useState } from 'react';
import { Event, eventsApi } from '../../api/client';

// Helper function to extract error message safely
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return String(error) || 'An unknown error occurred';
};

interface EventFormProps {
    personId?: string;
    eventId?: string;
    onSuccess: (event: Event) => void;
    onCancel: () => void;
}

const EventForm = ({ personId, eventId, onSuccess, onCancel }: EventFormProps) => {
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
                    setError(getErrorMessage(err) || 'Failed to load event data');
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
            let result;
            
            if (eventId) {
                // Update existing event
                result = await eventsApi.updateEvent(eventId, formData);
            } else {
                // Create new event
                result = await eventsApi.createEvent(formData);
            }
            
            onSuccess(result.event);
        } catch (err: unknown) {
            setError(getErrorMessage(err) || 'An error occurred');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
                {eventId ? 'Edit Event' : 'Add New Event'}
            </h2>
            
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
                        </div>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="event_type" className="block text-sm font-medium text-gray-700">
                        Event Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="event_type"
                        name="event_type"
                        value={formData.event_type}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                        {eventTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="mb-4">
                    <label htmlFor="event_date" className="block text-sm font-medium text-gray-700">
                        Date {(formData.event_type === 'birth' || formData.event_type === 'death') && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="date"
                        id="event_date"
                        name="event_date"
                        value={formData.event_date}
                        onChange={handleChange}
                        required={formData.event_type === 'birth' || formData.event_type === 'death'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                </div>
                
                <div className="mb-4">
                    <label htmlFor="event_location" className="block text-sm font-medium text-gray-700">
                        Location {(formData.event_type === 'marriage' || formData.event_type === 'divorce') && <span className="text-red-500">*</span>}
                    </label>
                    <input
                        type="text"
                        id="event_location"
                        name="event_location"
                        value={formData.event_location || ''}
                        onChange={handleChange}
                        required={formData.event_type === 'marriage' || formData.event_type === 'divorce'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="e.g., New York, NY, USA"
                    />
                </div>
                
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Additional details about this event..."
                    />
                </div>
                
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
