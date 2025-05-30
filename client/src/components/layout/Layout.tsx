import { Link } from '@tanstack/react-router';
import { hasRole, logout } from '../../utils/auth';
import { DarkModeToggle } from '../DarkModeToggle';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
}

export const Sidebar = () => {
    const isManager = hasRole('manager');
    const isClient = hasRole('client');

    return (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Ancestry Research</h2>
            </div>
            <nav className="p-4">
                <ul className="space-y-2">
                    <li>
                        <Link to="/dashboard" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
                            Settings
                        </Link>
                    </li>
                    <li>
                        <Link to="/projects" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
                            Projects
                        </Link>
                    </li>
                    
                    {/* Service selection for clients */}
                    {isClient && (
                        <li>
                            <Link to="/services" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
                                Order Services
                            </Link>
                        </li>
                    )}

                    {isManager && (
                        <>
                            <li className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                                <span className="block p-2 text-sm font-medium text-gray-500 dark:text-gray-400">Manager Tools</span>
                            </li>
                            <li>
                                <Link to="/manager/dashboard" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
                                    Manager Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/manager/users" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
                                    User Management
                                </Link>
                            </li>
                            <li>
                                <Link to="/manager/client-assignment" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
                                    Client Assignment
                                </Link>
                            </li>
                            
                            {/* Payment management section for managers */}
                            <li className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                                <span className="block p-2 text-sm font-medium text-gray-500 dark:text-gray-400">Payment Management</span>
                            </li>
                            <li>
                                <Link to="/services" className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200">
                                    Manage Services
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </div>
    );
};

export const Header = () => {
    const isManager = hasRole('manager');

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {isManager ? 'Manager Portal' : 'Client Portal'}
                </h1>
                <div className="flex items-center space-x-2">
                    <DarkModeToggle />
                    <button
                        className="btn-secondary dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                        onClick={() => logout()}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 overflow-auto dark:bg-gray-900 flex flex-col">
                <Header />
                <main className="p-6 dark:bg-gray-900 flex-grow">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
};
