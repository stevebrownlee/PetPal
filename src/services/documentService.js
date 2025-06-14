import { get, post, del } from './apiService';

/**
 * Upload a document for a health record
 * @param {string} visitId - The ID of the health record visit
 * @param {string} petId - The ID of the pet
 * @param {FormData} formData - FormData containing the document and metadata
 * @returns {Promise<Object>} - The uploaded document data
 */
export const uploadDocument = async (visitId, petId, formData) => {
  // Use fetch directly since we need to send multipart/form-data
  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/healthrecords/${visitId}/documents`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include', // Include cookies in the request
    body: formData, // FormData automatically sets the correct Content-Type
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`API Error ${response.status}: ${errorData.message || 'Unknown error'}`);
  }

  return response.json();
};

/**
 * Get all documents for a health record
 * @param {string} visitId - The ID of the health record visit
 * @returns {Promise<Array>} - Array of document objects
 */
export const getDocumentsForHealthRecord = async (visitId) => {
  return get(`/healthrecords/${visitId}/documents`);
};

/**
 * Delete a document
 * @param {string} documentId - The ID of the document to delete
 * @returns {Promise<void>}
 */
export const deleteDocument = async (documentId) => {
  return del(`/documents/${documentId}`);
};

/**
 * Download a document
 * @param {string} documentId - The ID of the document to download
 * @returns {string} - The download URL
 */
export const getDocumentDownloadUrl = (documentId) => {
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/documents/${documentId}`;
};

export default {
  uploadDocument,
  getDocumentsForHealthRecord,
  deleteDocument,
  getDocumentDownloadUrl,
};