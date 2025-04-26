import ky from 'ky';
import { clearTokens, getToken, User } from '../utils/auth';

// API response types
export interface AuthResponse {
    token: string;
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
            async (request, options, response) => {
                if (response.status === 401) {
                    // Handle token expiration
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
        console.log('Login response:', response);
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
};

export interface ClientProfile {
    user_id: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    preferences?: {
        emailNotifications: boolean;
        researchUpdates: boolean;
    };
}

export interface DashboardSummary {
    projectCount: number;
    recentActivity: {
        id: string;
        type: string;
        description: string;
        date: string;
    }[];
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    date: string;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'completed' | 'on_hold';
    created_at: string;
    updated_at: string;
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
    }[];
    timeline: {
        id: string;
        date: string;
        event: string;
        description: string;
    }[];
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
    
    getNotifications: async (): Promise<{ notifications: Notification[] }> => {
        const response = await apiClient.get('dashboard/notifications');
        return response.json();
    },
    
    markNotificationAsRead: async (id: string): Promise<{ message: string; notification: Notification }> => {
        const response = await apiClient.put(`dashboard/notifications/${id}/read`);
        return response.json();
    },
};

export const projectsApi = {
    getProjects: async (): Promise<{ projects: Project[] }> => {
        const response = await apiClient.get('projects');
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
};
