import { Link } from '@tanstack/react-router';
import { hasRole, logout } from '../../utils/auth';

interface LayoutProps {
    children: React.ReactNode;
}

export const Sidebar = () => {
    const isManager = hasRole('manager');
    
    return (
        <div className="w-64 bg-white border-r border-gray-200 h-full">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Ancestry Research</h2>
            </div>
            <nav className="p-4">
                <ul className="space-y-2">
                    <li>
                        <Link to="/dashboard" className="block p-2 rounded hover:bg-gray-100">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/profile" className="block p-2 rounded hover:bg-gray-100">
                            Profile
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings" className="block p-2 rounded hover:bg-gray-100">
                            Settings
                        </Link>
                    </li>
                    <li>
                        <Link to="/projects" className="block p-2 rounded hover:bg-gray-100">
                            Projects
                        </Link>
                    </li>
                    
                    {isManager && (
                        <>
                            <li className="pt-4 border-t border-gray-200 mt-4">
                                <span className="block p-2 text-sm font-medium text-gray-500">Manager Tools</span>
                            </li>
                            <li>
                                <Link to="/manager/dashboard" className="block p-2 rounded hover:bg-gray-100">
                                    Manager Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/manager/users" className="block p-2 rounded hover:bg-gray-100">
                                    User Management
                                </Link>
                            </li>
                            <li>
                                <Link to="/manager/client-assignment" className="block p-2 rounded hover:bg-gray-100">
                                    Client Assignment
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
        <header className="bg-white border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold text-gray-800">
                    {isManager ? 'Manager Portal' : 'Client Portal'}
                </h1>
                <button 
                    className="btn-secondary"
                    onClick={() => logout()}
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <Header />
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};
