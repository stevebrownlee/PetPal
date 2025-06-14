import { get, post, put, del } from './apiService';
import { uploadDocument as uploadDocumentService } from './documentService';

// Get all health records for a pet
export const getPetHealthRecords = async (petId) => {
  return get(`/pets/${petId}/healthrecords`);
};

// Get a specific health record by ID
export const getHealthRecordById = async (recordId) => {
  return get(`/healthrecords/${recordId}`);
};

// Create a new health record
export const createHealthRecord = async (recordData) => {
  return post('/healthrecords', recordData);
};

// Update a health record
export const updateHealthRecord = async (recordId, recordData) => {
  return put(`/healthrecords/${recordId}`, recordData);
};

// Delete a health record
export const deleteHealthRecord = async (recordId) => {
  return del(`/healthrecords/${recordId}`);
};

/**
 * Create a health record with document uploads
 * @param {Object} recordData - The health record data
 * @param {Array} documents - Array of document files to upload
 * @param {Array} documentMetadata - Array of metadata for each document (type, description)
 * @returns {Promise<Object>} - The created health record with documents
 */
export const createHealthRecordWithDocuments = async (recordData, documents, documentMetadata = []) => {
  // First create the health record
  const newRecord = await createHealthRecord(recordData);

  // If there are documents to upload, upload them
  if (documents && documents.length > 0 && newRecord && newRecord.id) {
    try {
      // Upload each document
      for (let i = 0; i < documents.length; i++) {
        const formData = new FormData();
        formData.append('visitId', newRecord.id);
        formData.append('petId', recordData.petId);
        formData.append('document', documents[i]);

        // Add metadata if available
        if (documentMetadata[i]) {
          if (documentMetadata[i].documentType) {
            formData.append('documentType', documentMetadata[i].documentType);
          }
          if (documentMetadata[i].description) {
            formData.append('description', documentMetadata[i].description);
          }
        }

        await uploadDocumentService(newRecord.id, recordData.petId, formData);
      }

      // Refresh the record to get the updated data with documents
      return await getHealthRecordById(newRecord.id);
    } catch (error) {
      console.error('Error uploading documents:', error);
      // Return the record even if document upload fails
      return newRecord;
    }
  }

  return newRecord;
};

/**
 * Update a health record with document uploads
 * @param {string} recordId - The ID of the health record to update
 * @param {Object} recordData - The updated health record data
 * @param {Array} documents - Array of document files to upload
 * @param {Array} documentMetadata - Array of metadata for each document (type, description)
 * @returns {Promise<Object>} - The updated health record with documents
 */
export const updateHealthRecordWithDocuments = async (recordId, recordData, documents, documentMetadata = []) => {
  // First update the health record
  const updatedRecord = await updateHealthRecord(recordId, recordData);

  // If there are documents to upload, upload them
  if (documents && documents.length > 0) {
    try {
      // Upload each document
      for (let i = 0; i < documents.length; i++) {
        const formData = new FormData();
        formData.append('visitId', recordId);
        formData.append('petId', recordData.petId);
        formData.append('document', documents[i]);

        // Add metadata if available
        if (documentMetadata[i]) {
          if (documentMetadata[i].documentType) {
            formData.append('documentType', documentMetadata[i].documentType);
          }
          if (documentMetadata[i].description) {
            formData.append('description', documentMetadata[i].description);
          }
        }

        await uploadDocumentService(recordId, recordData.petId, formData);
      }

      // Refresh the record to get the updated data with documents
      return await getHealthRecordById(recordId);
    } catch (error) {
      console.error('Error uploading documents:', error);
      // Return the record even if document upload fails
      return updatedRecord;
    }
  }

  return updatedRecord;
};

export default {
  getPetHealthRecords,
  getHealthRecordById,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  createHealthRecordWithDocuments,
  updateHealthRecordWithDocuments,
};