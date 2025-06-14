import { get, post, put, del } from './apiService';

// Get all weight records for a pet
export const getPetWeights = async (petId) => {
  return get(`/pets/${petId}/weights`);
};

// Get a specific weight record by ID
export const getWeightById = async (weightId) => {
  return get(`/weights/${weightId}`);
};

// Create a new weight record
export const createWeight = async (weightData) => {
  return post('/weights', weightData);
};

// Update a weight record
export const updateWeight = async (weightId, weightData) => {
  return put(`/weights/${weightId}`, weightData);
};

// Delete a weight record
export const deleteWeight = async (weightId) => {
  return del(`/weights/${weightId}`);
};

// Get pet's weight history for graphing
export const getPetWeightHistory = async (petId, startDate, endDate) => {
  let endpoint = `/pets/${petId}/weight-history`;

  // Add query parameters if provided
  if (startDate || endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    endpoint += `?${params.toString()}`;
  }

  return get(endpoint);
};

// Calculate weight statistics
export const calculateWeightStats = (weights) => {
  if (!weights || weights.length === 0) {
    return {
      current: null,
      min: null,
      max: null,
      average: null,
      trend: 'stable'
    };
  }

  // Sort weights by date (newest first)
  const sortedWeights = [...weights].sort((a, b) =>
    new Date(b.date) - new Date(a.date)
  );

  // Get current weight (most recent)
  const current = sortedWeights[0].weightValue;

  // Calculate min, max, and average
  const values = sortedWeights.map(w => w.weightValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;

  // Calculate trend (if we have at least 2 weights)
  let trend = 'stable';
  if (sortedWeights.length >= 2) {
    // Compare most recent with previous
    const latest = sortedWeights[0].weightValue;
    const previous = sortedWeights[1].weightValue;

    // Calculate percent change
    const percentChange = ((latest - previous) / previous) * 100;

    // Determine trend based on percent change
    if (percentChange > 1) {
      trend = 'increasing';
    } else if (percentChange < -1) {
      trend = 'decreasing';
    }
  }

  return {
    current,
    min,
    max,
    average,
    trend
  };
};

export default {
  getPetWeights,
  getWeightById,
  createWeight,
  updateWeight,
  deleteWeight,
  getPetWeightHistory,
  calculateWeightStats
};