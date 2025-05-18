import { useEffect, useState } from 'react';
import { Document, documentsApi } from '../../api/client';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

// Helper function to extract error message safely
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    return String(error) || 'An unknown error occurred';
};

interface DocumentFormProps {
    documentId?: string;
    onSuccess: (document: Document) => void;
    onCancel: () => void;
}

const DocumentForm = ({ documentId, onSuccess, onCancel }: DocumentFormProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Document>>({
        title: '',
        document_type: 'certificate',
        file_path: '',
        description: '',
        source: '',
        date_of_original: ''
    });
    // We need this state to hold the file, even though we don't directly use the variable
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_file, setFile] = useState<File | null>(null);

    const documentTypes = [
        { value: 'certificate', label: 'Certificate' },
        { value: 'photo', label: 'Photo' },
        { value: 'letter', label: 'Letter' },
        { value: 'record', label: 'Record' },
        { value: 'newspaper', label: 'Newspaper' },
        { value: 'census', label: 'Census' },
        { value: 'military', label: 'Military' },
        { value: 'legal', label: 'Legal' },
        { value: 'map', label: 'Map' },
        { value: 'audio', label: 'Audio' },
        { value: 'video', label: 'Video' },
        { value: 'other', label: 'Other' }
    ];

    useEffect(() => {
        // If editing an existing document, fetch its data
        if (documentId) {
            const fetchDocument = async () => {
                setIsLoading(true);
                try {
                    const document = await documentsApi.getDocumentById(documentId);

                    // Format date for input field (YYYY-MM-DD)
                    const formattedDocument = {
                        ...document,
                        date_of_original: document.date_of_original ? new Date(document.date_of_original).toISOString().split('T')[0] : ''
                    };

                    setFormData(formattedDocument);
                } catch (err: unknown) {
                    setError(getErrorMessage(err) || 'Failed to load document data');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchDocument();
        }
    }, [documentId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Update form data with file information
            setFormData(prev => ({
                ...prev,
                file_path: `/uploads/${selectedFile.name}`, // This is a placeholder path
                file_size: selectedFile.size,
                mime_type: selectedFile.type
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // In a real implementation, you would upload the file to a server first
            // and then create/update the document record with the file path

            let result;

            if (documentId) {
                // Update existing document
                result = await documentsApi.updateDocument(documentId, formData);
            } else {
                // Create new document
                result = await documentsApi.createDocument(formData);
            }

            onSuccess(result.document);
        } catch (err: unknown) {
            setError(getErrorMessage(err) || 'An error occurred');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && documentId) {
        return <LoadingSpinner containerClassName="h-64" size="lg" />;
    }

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {documentId ? 'Edit Document' : 'Add New Document'}
            </h2>

            {error && <ErrorAlert message={error} />}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Document title"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="document_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Document Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="document_type"
                        name="document_type"
                        value={formData.document_type}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                        {documentTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                {!documentId && (
                    <div className="mb-4">
                        <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            File <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            id="file"
                            onChange={handleFileChange}
                            required={!documentId}
                            className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-medium
                                file:bg-primary-50 dark:file:bg-primary-900 file:text-primary-700 dark:file:text-primary-200
                                hover:file:bg-primary-100 dark:hover:file:bg-primary-800"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Accepted file types depend on document type. For {formData.document_type}, common formats include:
                            {formData.document_type === 'photo' && ' JPG, PNG, GIF, TIFF'}
                            {formData.document_type === 'certificate' && ' PDF, JPG, PNG'}
                            {formData.document_type === 'letter' && ' PDF, DOC, DOCX, TXT'}
                            {formData.document_type === 'record' && ' PDF, DOC, DOCX, TXT, CSV'}
                            {formData.document_type === 'audio' && ' MP3, WAV, OGG'}
                            {formData.document_type === 'video' && ' MP4, AVI, MOV'}
                        </p>
                    </div>
                )}

                <div className="mb-4">
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Source
                    </label>
                    <input
                        type="text"
                        id="source"
                        name="source"
                        value={formData.source || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., National Archives, Family Collection"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="date_of_original" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date of Original
                    </label>
                    <input
                        type="date"
                        id="date_of_original"
                        name="date_of_original"
                        value={formData.date_of_original || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Additional details about this document..."
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : (documentId ? 'Update Document' : 'Add Document')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DocumentForm;
