import { useEffect, useState } from 'react';
import { Event, eventsApi } from '../../api/client';
import { formatDate } from '../../utils/dateUtils';
import { getEventTypeIcon } from '../../utils/iconUtils';

// Helper function to extract error message safely
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return String(error) || 'An unknown error occurred';
};

interface TimelineProps {
    personId: string;
    onEditEvent?: (eventId: string) => void;
    onDeleteEvent?: (eventId: string) => void;
    readOnly?: boolean;
}

const Timeline = ({ personId, onEditEvent, onDeleteEvent, readOnly = false }: TimelineProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        const fetchTimeline = async () => {
            setIsLoading(true);
            try {
                const timelineEvents = await eventsApi.getPersonTimeline(personId);
                setEvents(timelineEvents);
            } catch (err: unknown) {
                setError(getErrorMessage(err) || 'Failed to load timeline');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchTimeline();
    }, [personId]);

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

    if (events.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No events found for this person.</p>
            </div>
        );
    }

    return (
        <div className="flow-root">
            <ul className="-mb-8">
                {events.map((event, eventIdx) => (
                    <li key={event.event_id}>
                        <div className="relative pb-8">
                            {eventIdx !== events.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center ring-8 ring-white">
                                        {getEventTypeIcon(event.event_type)}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatEventType(event.event_type)}
                                        </p>
                                        {event.event_location && (
                                            <p className="text-sm text-gray-500">
                                                {event.event_location}
                                            </p>
                                        )}
                                        {event.description && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right flex flex-col">
                                        <span className="text-sm text-gray-500 whitespace-nowrap">
                                            {formatDate(event.event_date, 'Unknown date')}
                                        </span>
                                        
                                        {!readOnly && (
                                            <div className="mt-2 flex space-x-2 justify-end">
                                                {onEditEvent && (
                                                    <button
                                                        onClick={() => handleEdit(event.event_id)}
                                                        className="text-primary-600 hover:text-primary-900"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                
                                                {onDeleteEvent && (
                                                    <button
                                                        onClick={() => handleDelete(event.event_id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Timeline;
