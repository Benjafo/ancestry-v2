import {
    Outlet,
    RootRoute,
    Route,
    Router,
    redirect
} from '@tanstack/react-router';
import { hasRole, isAuthenticated } from './utils/auth';

// Import pages
import ClientAssignment from './pages/ClientAssignment';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Register from './pages/Register';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';

// Import layout components
import { Layout } from './components/layout/Layout';

// Root layout
const RootLayout = () => (
    <div className="min-h-screen bg-gray-50">
        <Outlet />
    </div>
);

// Auth layout with protected routes
const AuthLayout = () => {
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};

// Root route
const rootRoute = new RootRoute({
    component: RootLayout,
});

// Public routes
const loginRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: Login,
    beforeLoad: async () => {
        // Redirect to dashboard if already logged in
        if (isAuthenticated()) {
            throw redirect({
                to: '/dashboard',
            });
        }
    },
});

const registerRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: Register,
    beforeLoad: async () => {
        if (isAuthenticated()) {
            throw redirect({
                to: '/dashboard',
            });
        }
    },
});

// Auth layout route
const authLayoutRoute = new Route({
    getParentRoute: () => rootRoute,
    id: 'auth',
    component: AuthLayout,
    beforeLoad: async () => {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            throw redirect({
                to: '/login',
            });
        }
    },
});

// Protected routes
const dashboardRoute = new Route({
    getParentRoute: () => authLayoutRoute,
    path: '/dashboard',
    component: Dashboard,
});

const profileRoute = new Route({
    getParentRoute: () => authLayoutRoute,
    path: '/profile',
    component: Profile,
});

const settingsRoute = new Route({
    getParentRoute: () => authLayoutRoute,
    path: '/settings',
    component: Settings,
});

const projectsRoute = new Route({
    getParentRoute: () => authLayoutRoute,
    path: '/projects',
    component: Projects,
});

const projectDetailRoute = new Route({
    getParentRoute: () => authLayoutRoute,
    path: '/projects/$projectId', 
    component: ProjectDetail
});


const notFoundRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '*',
    component: NotFound,
});

// Manager routes
const managerDashboardRoute = new Route({
    getParentRoute: () => authLayoutRoute,
    path: '/manager/dashboard',
    component: ManagerDashboard,
    beforeLoad: async () => {
        // Check if user has manager role
        if (!hasRole('manager')) {
            throw redirect({
                to: '/dashboard',
            });
        }
    },
});

const userManagementRoute = new Route({
    getParentRoute: () => authLayoutRoute,
    path: '/manager/users',
    component: UserManagement,
    beforeLoad: async () => {
        // Check if user has manager role
        if (!hasRole('manager')) {
            throw redirect({
                to: '/dashboard',
            });
        }
    },
});

const clientAssignmentRoute = new Route({
    getParentRoute: () => authLayoutRoute,
    path: '/manager/client-assignment',
    component: ClientAssignment,
    beforeLoad: async () => {
        // Check if user has manager role
        if (!hasRole('manager')) {
            throw redirect({
                to: '/dashboard',
            });
        }
    },
});

// Create the router
const routeTree = rootRoute.addChildren([
    loginRoute,
    registerRoute,
    authLayoutRoute.addChildren([
        dashboardRoute,
        profileRoute,
        settingsRoute,
        projectsRoute,
        projectDetailRoute,
        // Manager routes
        managerDashboardRoute,
        userManagementRoute,
        clientAssignmentRoute,
    ]),
    notFoundRoute,
]);

export const router = new Router({ routeTree});

// Register router types
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
