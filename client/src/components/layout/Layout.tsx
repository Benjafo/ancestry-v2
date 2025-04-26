import { Link } from '@tanstack/react-router';
import { logout } from '../../utils/auth';

interface LayoutProps {
    children: React.ReactNode;
}

export const Sidebar = () => (
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
            </ul>
        </nav>
    </div>
);

export const Header = () => (
    <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-800">Client Portal</h1>
            <button 
                className="btn-secondary"
                onClick={() => logout()}
            >
                Logout
            </button>
        </div>
    </header>
);

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
