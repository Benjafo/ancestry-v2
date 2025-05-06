import { useEffect, useState } from 'react';
import { Event, eventsApi } from '../../api/client';

// Helper function to extract error message safely
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return String(error) || 'An unknown error occurred';
};

interface EventListProps {
    personId?: string;
    onEditEvent?: (eventId: string) => void;
    onDeleteEvent?: (eventId: string) => void;
    onSelectEvent?: (event: Event) => void;
    readOnly?: boolean;
}

const EventList = ({ personId, onEditEvent, onDeleteEvent, onSelectEvent, readOnly = false }: EventListProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    const eventTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'birth', label: 'Birth' },
        { value: 'death', label: 'Death' },
        { value: 'marriage', label: 'Marriage' },
        { value: 'divorce', label: 'Divorce' },
        { value: 'immigration', label: 'Immigration' },
        { value: 'emigration', label: 'Emigration' },
        { value: 'naturalization', label: 'Naturalization' },
        { value: 'military_service', label: 'Military Service' },
        { value: 'census', label: 'Census' },
        { value: 'other', label: 'Other' }
    ];

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                let eventsData;
                
                if (personId) {
                    eventsData = await eventsApi.getEventsByPersonId(personId);
                } else {
                    const response = await eventsApi.getEvents();
                    eventsData = response.events;
                }
                
                setEvents(eventsData);
                setFilteredEvents(eventsData);
            } catch (err: unknown) {
                setError(getErrorMessage(err) || 'Failed to load events');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchEvents();
    }, [personId]);

    useEffect(() => {
        // Apply filters whenever events, searchTerm, or filterType changes
        let result = [...events];
        
        // Filter by type
        if (filterType !== 'all') {
            result = result.filter(event => event.event_type === filterType);
        }
        
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(event => 
                (event.event_location && event.event_location.toLowerCase().includes(term)) ||
                (event.description && event.description.toLowerCase().includes(term))
            );
        }
        
        setFilteredEvents(result);
    }, [events, searchTerm, filterType]);

    const formatEventType = (eventType: string) => {
        return eventType
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleEdit = (eventId: string) => {
        if (onEditEvent) {
            onEditEvent(eventId);
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!onDeleteEvent) return;
        
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await eventsApi.deleteEvent(eventId);
                setEvents(events.filter(event => event.event_id !== eventId));
                onDeleteEvent(eventId);
            } catch (err: unknown) {
                setError(getErrorMessage(err) || 'Failed to delete event');
                console.error(err);
            }
        }
    };

    const handleSelect = (event: Event) => {
        if (onSelectEvent) {
            onSelectEvent(event);
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
        <div>
            <div className="mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                    <label htmlFor="search" className="sr-only">Search</label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                            placeholder="Search by location or description"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div>
                    <label htmlFor="event-type-filter" className="sr-only">Filter by type</label>
                    <select
                        id="event-type-filter"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        {eventTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            {filteredEvents.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No events found.</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {filteredEvents.map(event => (
                            <li key={event.event_id}>
                                <div 
                                    className={`px-4 py-4 sm:px-6 ${onSelectEvent ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                    onClick={() => onSelectEvent && handleSelect(event)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <p className="text-sm font-medium text-primary-600 truncate">
                                                {formatEventType(event.event_type)}
                                            </p>
                                            <p className="ml-2 flex-shrink-0 text-sm text-gray-500">
                                                {event.event_date ? new Date(event.event_date).toLocaleDateString() : 'Unknown date'}
                                            </p>
                                        </div>
                                        
                                        {!readOnly && (
                                            <div className="flex space-x-2">
                                                {onEditEvent && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(event.event_id);
                                                        }}
                                                        className="text-primary-600 hover:text-primary-900"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                
                                                {onDeleteEvent && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(event.event_id);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-2 sm:flex sm:justify-between">
                                        <div className="sm:flex">
                                            {event.event_location && (
                                                <p className="flex items-center text-sm text-gray-500">
                                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {event.event_location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {event.description && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 line-clamp-2">
                                                {event.description}
                                            </p>
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

export default EventList;
