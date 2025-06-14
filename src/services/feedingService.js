import { get, post, put, del } from './apiService';

// Get feeding schedules for a specific pet
export const getPetFeedingSchedules = async (petId) => {
  return get(`/pets/${petId}/feeding-schedules`);
};

// Get a specific feeding schedule by ID
export const getFeedingScheduleById = async (scheduleId) => {
  return get(`/feeding-schedules/${scheduleId}`);
};

// Create a new feeding schedule
export const createFeedingSchedule = async (scheduleData) => {
  return post('/feeding-schedules', scheduleData);
};

// Update a feeding schedule
export const updateFeedingSchedule = async (scheduleId, scheduleData) => {
  return put(`/feeding-schedules/${scheduleId}`, scheduleData);
};

// Delete a feeding schedule
export const deleteFeedingSchedule = async (scheduleId) => {
  return del(`/feeding-schedules/${scheduleId}`);
};

export default {
  getPetFeedingSchedules,
  getFeedingScheduleById,
  createFeedingSchedule,
  updateFeedingSchedule,
  deleteFeedingSchedule,
};