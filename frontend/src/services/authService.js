import axiosInstance from './axiosInstance';

const authService = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default authService;