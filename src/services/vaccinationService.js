import { get, post, put, del } from './apiService';

// Get vaccinations for a specific pet
export const getPetVaccinations = async (petId) => {
  return get(`/pets/${petId}/vaccinations`);
};

// Get a specific vaccination by ID
export const getVaccinationById = async (vaccinationId) => {
  return get(`/vaccinations/${vaccinationId}`);
};

// Create a new vaccination
export const createVaccination = async (vaccinationData) => {
  return post('/vaccinations', vaccinationData);
};

// Update a vaccination
export const updateVaccination = async (vaccinationId, vaccinationData) => {
  return put(`/vaccinations/${vaccinationId}`, vaccinationData);
};

// Delete a vaccination
export const deleteVaccination = async (vaccinationId) => {
  return del(`/vaccinations/${vaccinationId}`);
};

// Get upcoming vaccinations for a pet
export const getUpcomingVaccinations = async (petId, daysAhead = 30) => {
  return get(`/pets/${petId}/vaccinations/upcoming?daysAhead=${daysAhead}`);
};

export default {
  getPetVaccinations,
  getVaccinationById,
  createVaccination,
  updateVaccination,
  deleteVaccination,
  getUpcomingVaccinations,
};