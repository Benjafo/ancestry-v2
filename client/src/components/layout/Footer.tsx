export const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div>
                        <p>© {currentYear} Ben Foley. All rights reserved.</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                        <ul className="flex space-x-4">
                            <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Contact</a></li>
                        </ul>
                    </div>
                </div>
                {/* <div className="mt-2 text-xs">
                    <p>Version 1.0.0</p>
                </div> */}
            </div>
        </footer>
    );
};

export default Footer;
