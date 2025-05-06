import { useEffect, useState } from 'react';
import { Document, documentsApi } from '../../api/client';

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
                } catch (err: Error | unknown) {
                    setError(err.message || 'Failed to load document data');
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
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
                {documentId ? 'Edit Document' : 'Add New Document'}
            </h2>
            
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Document title"
                    />
                </div>
                
                <div className="mb-4">
                    <label htmlFor="document_type" className="block text-sm font-medium text-gray-700">
                        Document Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="document_type"
                        name="document_type"
                        value={formData.document_type}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                            File <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            id="file"
                            onChange={handleFileChange}
                            required={!documentId}
                            className="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-medium
                                file:bg-primary-50 file:text-primary-700
                                hover:file:bg-primary-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">
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
                    <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                        Source
                    </label>
                    <input
                        type="text"
                        id="source"
                        name="source"
                        value={formData.source || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="e.g., National Archives, Family Collection"
                    />
                </div>
                
                <div className="mb-4">
                    <label htmlFor="date_of_original" className="block text-sm font-medium text-gray-700">
                        Date of Original
                    </label>
                    <input
                        type="date"
                        id="date_of_original"
                        name="date_of_original"
                        value={formData.date_of_original || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                </div>
                
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        placeholder="Additional details about this document..."
                    />
                </div>
                
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
