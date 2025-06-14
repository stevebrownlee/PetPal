import { get, post, put } from './apiService';

// Register a new user
export const register = async (userData) => {
  return post('/auth/register', userData);
};

// Login a user
export const login = async (credentials) => {
  return post('/auth/login', credentials);
};

// Logout the current user
export const logout = async () => {
  return post('/auth/logout');
};

// Get the current user's profile
export const getCurrentUser = async () => {
  try {
    return await get('/auth/me');
  } catch (error) {
    // If there's an error (like 401 Unauthorized), return null
    console.error('Error getting current user:', error);
    return null;
  }
};

// Update the user's profile
export const updateUserProfile = async (profileData) => {
  return put('/user/profile', profileData);
};

// Request a password reset email
export const requestPasswordReset = async (email) => {
  return post('/auth/forgot-password', { email });
};

// Reset password with token
export const resetPassword = async (token, newPassword, confirmPassword) => {
  return post('/auth/reset-password', {
    token,
    newPassword,
    confirmPassword
  });
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  updateUserProfile,
  requestPasswordReset,
  resetPassword,
};