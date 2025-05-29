import React from 'react';
import { Link } from '@tanstack/react-router';
import { Layout } from '../components/layout/Layout';

const PrivacyPolicy: React.FC = () => {
    return (
        <Layout>
            <div className="container mx-auto p-8 max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from [Your Website Name] (the “Site”).
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Personal Information We Collect</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site. We refer to this automatically-collected information as “Device Information.”
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We collect Device Information using the following technologies:
                </p>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 ml-4">
                    <li>“Cookies” are data files that are placed on your device or computer and often include an anonymous unique identifier. For more information about cookies, and how to disable cookies, visit http://www.allaboutcookies.org.</li>
                    <li>“Log files” track actions occurring on the Site, and collect data including your IP address, browser type, Internet service provider, referring/exit pages, and date/time stamps.</li>
                    <li>“Web beacons,” “tags,” and “pixels” are electronic files used to record information about how you browse the Site.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How We Use Your Personal Information</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We use the Device Information that we collect to help us screen for potential risk and fraud (in particular, your IP address), and more generally to improve and optimize our Site (for example, by generating analytics about how our customers browse and interact with the Site, and to assess the success of our marketing and advertising campaigns).
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Sharing Your Personal Information</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Google Analytics to help us understand how our customers use the Site—you can read more about how Google uses your Personal Information here: https://www.google.com/intl/en/policies/privacy/. You can also opt-out of Google Analytics here: https://tools.google.com/dlpage/gaoptout.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Finally, we may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Your Rights</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Data Retention</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to erase this information.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Changes</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at <a href="mailto:info@example.com" className="text-primary-600 hover:underline">info@example.com</a> or by mail using the details provided below:
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-8">
                    [Your Business Address]
                </p>

                <div className="text-center">
                    <Link to="/" className="text-primary-600 hover:underline">Back to Home</Link>
                </div>
            </div>
        </Layout>
    );
};

export default PrivacyPolicy;
