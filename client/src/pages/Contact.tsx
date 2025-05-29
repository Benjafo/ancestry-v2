import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Layout } from '../components/layout/Layout';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // This is a placeholder for future functionality.
        // In a real application, you would send this data to a backend API.
        console.log('Contact form submitted:', formData);
        alert('Thank you for your message! This form is not yet functional.');
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
        });
    };

    return (
        <Layout>
            <div className="container mx-auto p-8 max-w-2xl">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Contact Us</h1>

                <p className="text-gray-700 dark:text-gray-300 mb-8 text-center">
                    Have questions or need assistance? Fill out the form below or reach out to us directly.
                </p>

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="message" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                            Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={5}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        ></textarea>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                        >
                            Send Message
                        </button>
                    </div>
                </form>

                <div className="text-center mt-8">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        You can also reach us directly at:
                    </p>
                    <p className="text-primary-600 dark:text-primary-400 font-semibold">
                        <a href="mailto:info@example.com" className="hover:underline">info@example.com</a>
                    </p>
                    <Link to="/" className="text-primary-600 hover:underline mt-4 block">Back to Home</Link>
                </div>
            </div>
        </Layout>
    );
};

export default Contact;
