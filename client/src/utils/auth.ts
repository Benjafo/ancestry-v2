const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export interface User {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    roles: string[];
}

export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setUser = (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
};

export const clearTokens = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};

export const hasRole = (role: string): boolean => {
    const user = getUser();
    return user?.roles?.includes(role) || false;
};

export const login = (token: string, user: User, refreshToken?: string): void => {
    setToken(token);
    setUser(user);
    if (refreshToken) {
        setRefreshToken(refreshToken);
    }
};

export const logout = (): void => {
    clearTokens();
    window.location.href = '/login';
};

export const hasAnyRole = (roles: string[]): boolean => {
    const user = getUser();
    return user?.roles?.some(role => roles.includes(role)) || false;
};
