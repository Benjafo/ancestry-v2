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
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import OrderCheckout from './pages/OrderCheckout';
import OrderConfirmation from './pages/OrderConfirmation';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Register from './pages/Register';
import RequestPasswordReset from './pages/RequestPasswordReset';
import ResetPassword from './pages/ResetPassword';
import ServiceSelection from './pages/ServiceSelection';
import Settings from './pages/Settings';
import TermsOfService from './pages/TermsOfService';
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

// Redirect root route to dashboard
const indexRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: async () => {
        throw redirect({
            to: '/dashboard',
        });
    },
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

const requestPasswordResetRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/request-password-reset',
    component: RequestPasswordReset,
    beforeLoad: async () => {
        if (isAuthenticated()) {
            throw redirect({
                to: '/dashboard',
            });
        }
    },
});

const resetPasswordRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/reset-password',
    component: ResetPassword,
    // This route will receive the token as a query parameter, e.g., /reset-password?token=abc
    // No authentication check here as it's for unauthenticated users
});

const privacyPolicyRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/privacy-policy',
    component: PrivacyPolicy,
});

const termsOfServiceRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/terms-of-service',
    component: TermsOfService,
});

const contactRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/contact',
    component: Contact,
});

// Public service selection route (no auth required)
const serviceSelectionRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/services',
    component: ServiceSelection,
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

const notificationsRoute = new Route({
    getParentRoute: () => authLayoutRoute,
    path: '/notifications',
    component: Notifications,
});

// Protected checkout route (requires auth)
const orderCheckoutRoute = new Route({
    getParentRoute: () => authLayoutRoute,
    path: '/checkout',
    component: OrderCheckout,
    validateSearch: (search: Record<string, unknown>): { packageId: string } => {
        if (!search.packageId || typeof search.packageId !== 'string') {
            throw new Error('packageId is required');
        }
        return {
            packageId: search.packageId,
        };
    },
});

// Protected order confirmation route
const orderConfirmationRoute = new Route({
    getParentRoute: () => authLayoutRoute,
    path: '/order-confirmation/$orderId',
    component: OrderConfirmation,
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
    indexRoute,
    loginRoute,
    registerRoute,
    requestPasswordResetRoute,
    resetPasswordRoute,
    privacyPolicyRoute,
    termsOfServiceRoute,
    contactRoute,
    serviceSelectionRoute,
    orderCheckoutRoute,
    authLayoutRoute.addChildren([
        dashboardRoute,
        settingsRoute,
        projectsRoute,
        projectDetailRoute,
        notificationsRoute,
        orderConfirmationRoute,
        // Manager routes
        managerDashboardRoute,
        userManagementRoute,
        clientAssignmentRoute,
    ]),
    notFoundRoute,
]);

export const router = new Router({ routeTree });

// Register router types
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
