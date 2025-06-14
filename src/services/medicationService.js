import { get, post, put, del } from './apiService';

// Get medications for a specific pet
export const getPetMedications = async (petId) => {
  return get(`/pets/${petId}/medications`);
};

// Get a specific medication by ID
export const getMedicationById = async (medicationId) => {
  return get(`/medications/${medicationId}`);
};

// Create a new medication
export const createMedication = async (medicationData) => {
  return post('/medications', medicationData);
};

// Update a medication
export const updateMedication = async (medicationId, medicationData) => {
  return put(`/medications/${medicationId}`, medicationData);
};

// Delete a medication
export const deleteMedication = async (medicationId) => {
  return del(`/medications/${medicationId}`);
};

// Update medication reminder settings
export const updateMedicationReminder = async (medicationId, reminderData) => {
  return put(`/medications/${medicationId}/reminder`, reminderData);
};

// Get user's medication reminders
export const getUserMedicationReminders = async () => {
  return get('/user/medication-reminders');
};

export default {
  getPetMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  updateMedicationReminder,
  getUserMedicationReminders,
};