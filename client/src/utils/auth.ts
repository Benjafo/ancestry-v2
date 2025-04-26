const TOKEN_KEY = 'auth_token';
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

export const setUser = (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
};

export const clearTokens = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};

export const hasRole = (role: string): boolean => {
    const user = getUser();
    return user?.roles?.includes(role) || false;
};

export const login = (token: string, user: User): void => {
    setToken(token);
    setUser(user);
};

export const logout = (): void => {
    clearTokens();
    window.location.href = '/login';
};
