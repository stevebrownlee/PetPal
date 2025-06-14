import { get, put } from './apiService';

/**
 * Get the user's notification settings
 * @returns {Promise<Object>} The user's notification settings
 */
export const getNotificationSettings = async () => {
  try {
    return await get('/settings/notifications');
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    throw error;
  }
};

/**
 * Update the user's notification settings
 * @param {Object} settings - The updated notification settings
 * @returns {Promise<Object>} The updated notification settings
 */
export const updateNotificationSettings = async (settings) => {
  try {
    return await put('/settings/notifications', settings);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

/**
 * Get the user's theme preference
 * @returns {Promise<Object>} The user's theme preference
 */
export const getThemePreference = async () => {
  try {
    return await get('/settings/theme');
  } catch (error) {
    console.error('Error fetching theme preference:', error);
    throw error;
  }
};

/**
 * Update the user's theme preference
 * @param {Object} themeSettings - The updated theme settings
 * @returns {Promise<Object>} The updated theme preference
 */
export const updateThemePreference = async (themeSettings) => {
  try {
    return await put('/settings/theme', { themePreference: themeSettings.theme });
  } catch (error) {
    console.error('Error updating theme preference:', error);
    throw error;
  }
};

export default {
  getNotificationSettings,
  updateNotificationSettings,
  getThemePreference,
  updateThemePreference,
};