import { get, post, put, del } from './apiService';

// Get all pets (admin only)
export const getAllPets = async () => {
  return get('/pets');
};

// Get pets for the current user
export const getUserPets = async () => {
  return get('/user/pets');
};

// Get a specific pet by ID
export const getPetById = async (petId) => {
  return get(`/pets/${petId}`);
};

// Create a new pet
export const createPet = async (petData) => {
  return post('/pets', petData);
};

// Update a pet
export const updatePet = async (petId, petData) => {
  return put(`/pets/${petId}`, petData);
};

// Delete a pet
export const deletePet = async (petId) => {
  return del(`/pets/${petId}`);
};

// Add an owner to a pet
export const addPetOwner = async (petId, ownerData) => {
  return post(`/pets/${petId}/owners`, ownerData);
};

// Remove an owner from a pet
export const removePetOwner = async (petId, ownerId) => {
  return del(`/pets/${petId}/owners/${ownerId}`);
};

/**
 * Upload a photo for a pet
 * @param {string} petId - The ID of the pet
 * @param {File} photoFile - The photo file to upload
 * @returns {Promise<Object>} - The response from the API
 */
export const uploadPetPhoto = async (petId, photoFile) => {
  // Create a FormData object to send the file
  const formData = new FormData();
  formData.append('petId', petId);
  formData.append('photo', photoFile);

  // Use fetch directly since our apiService doesn't support FormData
  const url = `http://localhost:5000/pets/${petId}/photo`;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include', // Include cookies in the request
    body: formData,
    // Don't set Content-Type header, let the browser set it with the boundary
  });

  // Handle the response
  if (!response.ok) {
    // Try to parse the error response
    let errorData;
    try {
      errorData = await response.json();
    } catch (error) {
      errorData = { message: response.statusText };
    }

    // Throw an error with the status and message
    throw new Error(
      `API Error ${response.status}: ${errorData.message || 'Unknown error'}`
    );
  }

  // Parse the JSON response
  return response.json();
};

export default {
  getAllPets,
  getUserPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  addPetOwner,
  removePetOwner,
  uploadPetPhoto,
};