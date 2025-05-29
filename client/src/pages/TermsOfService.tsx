import React from 'react';
import { Link } from '@tanstack/react-router';
import { Layout } from '../components/layout/Layout';

const TermsOfService: React.FC = () => {
    return (
        <Layout>
            <div className="container mx-auto p-8 max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h1>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Welcome to [Your Website Name]! These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our Site, you agree to be bound by these Terms.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    By accessing and using the services provided by [Your Website Name], you agree to comply with and be bound by these Terms. If you do not agree to these Terms, you may not access or use our services.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">2. Services Provided</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    [Your Website Name] provides professional genealogical research services. Our services include, but are not limited to, in-depth family history research, creation of family trees, document retrieval, and expert consultations.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">3. User Accounts</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    To access certain features of our Site, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">4. Privacy Policy</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Your use of our Site is also governed by our Privacy Policy, which can be found at <Link to="/privacy-policy" className="text-primary-600 hover:underline">/privacy-policy</Link>. By using our Site, you consent to the terms of the Privacy Policy.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">5. Intellectual Property</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    All content on this Site, including text, graphics, logos, images, and software, is the property of [Your Website Name] or its content suppliers and is protected by intellectual property laws. You may not use, reproduce, or distribute any content from this Site without our express written permission.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    [Your Website Name] will not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of profits, goodwill, data, or other intangible losses, resulting from the use or inability to use our services.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">7. Governing Law</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    These Terms shall be governed by and construed in accordance with the laws of [Your State/Country], without regard to its conflict of law principles.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">8. Changes to Terms</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the Site after any such modifications constitutes your acceptance of the new Terms.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">9. Contact Information</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-8">
                    If you have any questions about these Terms, please contact us at <a href="mailto:info@example.com" className="text-primary-600 hover:underline">info@example.com</a>.
                </p>

                <div className="text-center">
                    <Link to="/" className="text-primary-600 hover:underline">Back to Home</Link>
                </div>
            </div>
        </Layout>
    );
};

export default TermsOfService;
