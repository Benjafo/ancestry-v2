import ky from 'ky';
import { clearTokens, getRefreshToken, getToken, setToken, User } from '../utils/auth';

// API response types
export interface AuthResponse {
    token: string;
    refreshToken?: string;
    user: User;
    message: string;
}

const API_URL = 'http://localhost:3000/api';

export const apiClient = ky.create({
    prefixUrl: API_URL,
    hooks: {
        beforeRequest: [
            request => {
                const token = getToken();
                if (token) {
                    request.headers.set('Authorization', `Bearer ${token}`);
                }
            }
        ],
        afterResponse: [
            async (request, _, response) => {
                // Only attempt refresh if status is 401 (Unauthorized)
                if (response.status === 401) {
                    const refreshToken = getRefreshToken();

                    // If we have a refresh token, try to get a new access token
                    if (refreshToken) {
                        try {
                            // Create a new instance of ky without the auth interceptors to avoid loops
                            const refreshClient = ky.create({
                                prefixUrl: API_URL,
                                retry: 0
                            });

                            // Request new access token
                            const refreshResponse = await refreshClient.post('auth/refresh-token', {
                                json: { refreshToken }
                            });

                            if (refreshResponse.ok) {
                                const { accessToken } = await refreshResponse.json<{ accessToken: string }>();

                                // Update the token in storage
                                setToken(accessToken);

                                // Retry the original request with the new token
                                request.headers.set('Authorization', `Bearer ${accessToken}`);
                                return ky(request);
                            }
                        } catch (error) {
                            console.error('Token refresh failed:', error);
                        }
                    }

                    // If refresh failed or no refresh token, clear tokens and redirect to login
                    clearTokens();
                    window.location.href = '/login';
                }

                return response;
            }
        ]
    },
    retry: 0,
    timeout: 30000,
});

// API service functions
export const authApi = {
    login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
        const response = await apiClient.post('auth/login', { json: credentials });
        return response.json<AuthResponse>();
    },

    register: async (userData: {
        email: string;
        password: string;
        first_name: string;
        last_name: string
    }): Promise<AuthResponse> => {
        const response = await apiClient.post('auth/register', { json: userData });
        return response.json<AuthResponse>();
    },

    getProfile: async (): Promise<{ user: User }> => {
        const response = await apiClient.get('auth/profile');
        return response.json<{ user: User }>();
    },

    refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
        const response = await apiClient.post('auth/refresh-token', {
            json: { refreshToken }
        });
        return response.json<{ accessToken: string }>();
    },

    requestPasswordReset: async (email: string): Promise<{ message: string; resetToken?: string; resetUrl?: string }> => {
        const response = await apiClient.post('auth/request-password-reset', {
            json: { email }
        });
        return response.json<{ message: string; resetToken?: string; resetUrl?: string }>();
    },

    resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
        const response = await apiClient.post('auth/reset-password', {
            json: { token, password }
        });
        return response.json<{ message: string }>();
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
        const response = await apiClient.post('auth/change-password', {
            json: { currentPassword, newPassword }
        });
        return response.json<{ message: string }>();
    },
};

export interface ClientProfile {
    user_id: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    email_notifications?: boolean;
    research_updates?: boolean;
}

export interface UserEvent {
    id: string;
    user_id: string;
    actor_id?: string;
    event_type: string;
    message: string;
    entity_id?: string;
    entity_type?: string;
    createdAt: string;
    updatedAt: string;
    actor?: {
        first_name: string;
        last_name: string;
    };
}

export interface DashboardSummary {
    projectCount: number;
    documentCount?: number;
    personCount?: number;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'completed' | 'on_hold';
    created_at: string;
    updated_at: string;
}

export interface Event {
    event_id: string;
    person_id: string;
    event_type: string;
    event_date: string;
    event_location?: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface Document {
    document_id: string;
    title: string;
    document_type: string;
    file_path: string;
    upload_date: string;
    file_size?: number;
    mime_type?: string;
    description?: string;
    source?: string;
    date_of_original?: string;
    created_at: string;
    updated_at: string;
}

export interface Relationship {
    person_id: string;
    first_name: string;
    last_name: string;
    relationship_qualifier?: string;
    start_date?: string;
    end_date?: string;
}

export interface Person {
    person_id: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    maiden_name?: string;
    gender?: string;
    birth_date?: string;
    birth_location?: string;
    death_date?: string;
    death_location?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    project_persons?: {
        notes?: string;
    };
    events?: Event[];
    documents?: Document[];
    relationships?: {
        parents?: Relationship[];
        children?: Relationship[];
        spouses?: Relationship[];
        siblings?: Relationship[];
    };
}

export interface ProjectDetail extends Project {
    researcher: {
        name: string;
        email: string;
    };
    documents: {
        id: string;
        title: string;
        type: string;
        uploaded_at: string;
        person_name?: string;
        person_id?: string;
    }[];
    timeline: {
        id: string;
        date: string;
        event: string;
        description: string;
        event_id?: string;
        event_type?: string;
        event_date?: string;
        event_location?: string;
        createdAt?: string;
        updatedAt?: string;
        PersonEvent?: {
            role?: string;
            notes?: string;
        };
        person_name?: string;
        person_id?: string;
        associated_with?: 'person' | 'project';
        role?: string;
    }[];
    persons?: Person[];
    access_level?: 'view' | 'edit';
    creator?: {
        first_name: string;
        last_name: string;
    };
}


export interface UserDetails extends User {
    is_active: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
}

export interface ManagerDashboardSummary {
    activeClients: number;
    totalClients: number;
    activeProjects: number;
    totalProjects: number;
    recentActivity: {
        id: string;
        type: string;
        description: string;
        projectId: string;
        date: string;
        actor?: string;
    }[];
    pendingTasks: {
        id: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
        dueDate: string;
    }[];
    projectsByStatus: {
        active: number;
        completed: number;
        on_hold: number;
    };
}

export interface ProjectAssignment {
    client_id: string;
    project_id: string;
    access_level: 'view' | 'edit';
    assigned_at: string;
    assigned_by: string;
}

export const clientApi = {
    getProfile: async (): Promise<{ profile: ClientProfile }> => {
        const response = await apiClient.get('client/profile');
        return response.json();
    },

    updateProfile: async (data: Partial<ClientProfile>): Promise<{ message: string; profile: ClientProfile }> => {
        const response = await apiClient.put('client/profile', { json: data });
        return response.json();
    },
};

export const dashboardApi = {
    getSummary: async (): Promise<DashboardSummary> => {
        const response = await apiClient.get('dashboard/summary');
        return response.json();
    },

    getUserEvents: async (): Promise<{ userEvents: UserEvent[] }> => {
        const response = await apiClient.get('dashboard/events');
        return response.json();
    }
};

export const projectsApi = {
    getProjects: async (params?: { 
        search?: string; 
        sortBy?: string; 
        sortOrder?: 'asc' | 'desc';
    }): Promise<{ projects: Project[] }> => {
        const response = await apiClient.get('projects', { 
            searchParams: params 
        });
        return response.json();
    },

    getProjectById: async (id: string): Promise<ProjectDetail> => {
        const response = await apiClient.get(`projects/${id}`);
        return response.json();
    },

    createProject: async (data: { title: string; description: string }): Promise<{ message: string; project: Project }> => {
        const response = await apiClient.post('projects', { json: data });
        return response.json();
    },

    updateProject: async (id: string, data: Partial<Project>): Promise<{ message: string; project: Project }> => {
        const response = await apiClient.put(`projects/${id}`, { json: data });
        return response.json();
    },

    // Project-Person Management
    getProjectPersons: async (projectId: string): Promise<Person[]> => {
        const response = await apiClient.get(`projects/${projectId}/persons`);
        return response.json();
    },

    addPersonToProject: async (projectId: string, personId: string, notes?: string): Promise<{ message: string; association: ProjectPersonAssociation }> => {
        const response = await apiClient.post(`projects/${projectId}/persons`, {
            json: {
                person_id: personId,
                notes
            }
        });
        return response.json();
    },

    updateProjectPerson: async (projectId: string, personId: string, notes: string): Promise<{ message: string; association: ProjectPersonAssociation }> => {
        const response = await apiClient.put(`projects/${projectId}/persons/${personId}`, {
            json: { notes }
        });
        return response.json();
    },

    removePersonFromProject: async (projectId: string, personId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete(`projects/${projectId}/persons/${personId}`);
        return response.json();
    },

    // Search for persons to add to a project
    searchPersons: async (query: string): Promise<Person[]> => {
        const response = await apiClient.get(`persons/search?q=${encodeURIComponent(query)}`);
        return response.json();
    },

    // Get person by ID with optional related data
    getPersonById: async (personId: string, options: {
        includeEvents?: boolean,
        includeDocuments?: boolean,
        includeRelationships?: boolean
    } = {}): Promise<Person> => {
        const queryParams = new URLSearchParams();
        if (options.includeEvents) queryParams.append('includeEvents', 'true');
        if (options.includeDocuments) queryParams.append('includeDocuments', 'true');
        if (options.includeRelationships) queryParams.append('includeRelationships', 'true');

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await apiClient.get(`persons/${personId}${queryString}`);
        return response.json();
    },

    createPerson: async (personData: Partial<Person>): Promise<{ message: string; person: Person }> => {
        const response = await apiClient.post('persons', { json: personData });
        return response.json();
    },

    updatePerson: async (personId: string, personData: Partial<Person>): Promise<{ message: string; person: Person }> => {
        const response = await apiClient.put(`persons/${personId}`, { json: personData });
        return response.json();
    }
};


// Event types
export interface Event {
    event_id: string;
    person_id: string;
    event_type: string;
    event_date: string;
    event_location?: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

// Document types
export interface Document {
    document_id: string;
    title: string;
    document_type: string;
    file_path: string;
    upload_date: string;
    file_size?: number;
    mime_type?: string;
    description?: string;
    source?: string;
    date_of_original?: string;
    created_at: string;
    updated_at: string;
}

export interface DocumentPersonAssociation {
    document_id: string;
    person_id: string;
    relevance?: string;
    notes?: string;
}

export interface ProjectPersonAssociation {
    project_id: string;
    person_id: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface ApiError extends Error {
    status?: number;
    response?: {
        message?: string;
        error?: string;
    };
}

// API metadata interface
export interface ApiMetadata {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Event API service
export const eventsApi = {
    getEvents: async (params?: Record<string, string | number | boolean>): Promise<{ events: Event[]; metadata: ApiMetadata }> => {
        const response = await apiClient.get('events', { searchParams: params });
        return response.json();
    },

    getEventById: async (eventId: string): Promise<Event> => {
        const response = await apiClient.get(`events/${eventId}`);
        return response.json();
    },

    createEvent: async (eventData: Partial<Event>): Promise<{ message: string; event: Event }> => {
        const response = await apiClient.post('events', { json: eventData });
        return response.json();
    },

    updateEvent: async (eventId: string, eventData: Partial<Event>): Promise<{ message: string; event: Event }> => {
        const response = await apiClient.put(`events/${eventId}`, { json: eventData });
        return response.json();
    },

    deleteEvent: async (eventId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete(`events/${eventId}`);
        return response.json();
    },

    getEventsByPersonId: async (personId: string): Promise<Event[]> => {
        const response = await apiClient.get(`events/person/${personId}`);
        return response.json();
    },

    getEventsByType: async (type: string): Promise<Event[]> => {
        const response = await apiClient.get(`events/type/${type}`);
        return response.json();
    },

    getEventsByDateRange: async (startDate: string, endDate: string): Promise<Event[]> => {
        const response = await apiClient.get(`events/date-range?startDate=${startDate}&endDate=${endDate}`);
        return response.json();
    },

    getEventsByLocation: async (location: string): Promise<Event[]> => {
        const response = await apiClient.get(`events/location/${location}`);
        return response.json();
    },

    getPersonTimeline: async (personId: string): Promise<Event[]> => {
        const response = await apiClient.get(`events/timeline/${personId}`);
        return response.json();
    }
};

// Document API service
export const documentsApi = {
    getDocuments: async (params?: Record<string, string | number | boolean>): Promise<{ documents: Document[]; metadata: ApiMetadata }> => {
        const response = await apiClient.get('documents', { searchParams: params });
        return response.json();
    },

    getDocumentById: async (documentId: string): Promise<Document> => {
        const response = await apiClient.get(`documents/${documentId}`);
        return response.json();
    },

    createDocument: async (documentData: Partial<Document>): Promise<{ message: string; document: Document }> => {
        const response = await apiClient.post('documents', { json: documentData });
        return response.json();
    },

    updateDocument: async (documentId: string, documentData: Partial<Document>): Promise<{ message: string; document: Document }> => {
        const response = await apiClient.put(`documents/${documentId}`, { json: documentData });
        return response.json();
    },

    deleteDocument: async (documentId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete(`documents/${documentId}`);
        return response.json();
    },

    getDocumentsByPersonId: async (personId: string): Promise<Document[]> => {
        const response = await apiClient.get(`documents/person/${personId}`);
        return response.json();
    },

    getDocumentsByType: async (type: string): Promise<Document[]> => {
        const response = await apiClient.get(`documents/type/${type}`);
        return response.json();
    },

    getDocumentsByDateRange: async (startDate: string, endDate: string, dateField?: string): Promise<Document[]> => {
        const params = new URLSearchParams({
            startDate,
            endDate
        });

        if (dateField) {
            params.append('dateField', dateField);
        }

        const response = await apiClient.get(`documents/date-range?${params.toString()}`);
        return response.json();
    },

    associateDocumentWithPerson: async (documentId: string, personId: string, data?: { relevance?: string; notes?: string }): Promise<{ message: string; association: DocumentPersonAssociation }> => {
        const response = await apiClient.post('documents/associate', {
            json: {
                documentId,
                personId,
                ...data
            }
        });
        return response.json();
    },

    updateDocumentPersonAssociation: async (documentId: string, personId: string, data: { relevance?: string; notes?: string }): Promise<{ message: string; association: DocumentPersonAssociation }> => {
        const response = await apiClient.put(`documents/association/${documentId}/${personId}`, {
            json: data
        });
        return response.json();
    },

    removeDocumentPersonAssociation: async (documentId: string, personId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete(`documents/association/${documentId}/${personId}`);
        return response.json();
    },

    getDocumentPersonAssociation: async (documentId: string, personId: string): Promise<DocumentPersonAssociation> => {
        const response = await apiClient.get(`documents/association/${documentId}/${personId}`);
        return response.json();
    }
};

export const managerApi = {
    // Dashboard
    getDashboardSummary: async (): Promise<ManagerDashboardSummary> => {
        const response = await apiClient.get('manager/dashboard');
        return response.json();
    },

    // User Management
    getUsers: async (
        filter: 'all' | 'clients' | 'managers' = 'all',
        page: number = 1,
        limit: number = 10,
        sortField?: string,
        sortDirection?: 'asc' | 'desc',
        statusFilter?: 'all' | 'active' | 'inactive'
    ): Promise<{ users: UserDetails[]; metadata: ApiMetadata }> => {
        const searchParams: Record<string, string | number> = { filter, page, limit };
        
        if (sortField) {
            searchParams.sortField = sortField;
            if (sortDirection) {
                searchParams.sortDirection = sortDirection;
            }
        }
        
        if (statusFilter && statusFilter !== 'all') {
            searchParams.status = statusFilter;
        }
        
        const response = await apiClient.get('manager/users', { searchParams });
        return response.json();
    },

    getUserById: async (userId: string): Promise<{ user: UserDetails }> => {
        const response = await apiClient.get(`manager/users/${userId}`);
        return response.json();
    },

    createUser: async (userData: {
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        role: string;
    }): Promise<{ message: string; user: UserDetails }> => {
        const response = await apiClient.post('manager/users', { json: userData });
        return response.json();
    },

    updateUser: async (userId: string, userData: Partial<UserDetails>): Promise<{ message: string; user: UserDetails }> => {
        const response = await apiClient.put(`manager/users/${userId}`, { json: userData });
        return response.json();
    },

    deactivateUser: async (userId: string): Promise<{ message: string }> => {
        const response = await apiClient.put(`manager/users/${userId}/deactivate`);
        return response.json();
    },

    reactivateUser: async (userId: string): Promise<{ message: string }> => {
        const response = await apiClient.put(`manager/users/${userId}/reactivate`);
        return response.json();
    },

    resetUserPassword: async (userId: string): Promise<{ message: string; temporaryPassword: string }> => {
        const response = await apiClient.post(`manager/users/${userId}/reset-password`);
        return response.json();
    },

    // Client Assignment
    getClientAssignments: async (clientId: string): Promise<{
        projects: Project[]
    }> => {
        const response = await apiClient.get(`manager/clients/${clientId}/assignments`);
        return response.json();
    },

    getAssignmentHistory: async (clientId: string): Promise<{ history: UserEvent[] }> => {
        const response = await apiClient.get(`manager/clients/${clientId}/assignment-history`);
        return response.json();
    },

    assignClientToProject: async (clientId: string, projectId: string, accessLevel: 'view' | 'edit' = 'view'): Promise<{ message: string }> => {
        const response = await apiClient.post(`manager/clients/${clientId}/projects/${projectId}`, {
            json: { accessLevel }
        });
        return response.json();
    },

    removeClientFromProject: async (clientId: string, projectId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete(`manager/clients/${clientId}/projects/${projectId}`);
        return response.json();
    }
}
