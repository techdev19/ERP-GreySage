import axiosInstance from './axiosInstance';

const apiService = {
  // Order-related API calls
  orders: {
    createOrder: async (orderData) => {
      try {
        const response = await axiosInstance.post('api/orders', orderData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    getOrders: async (search = '') => {
      try {
        const response = await axiosInstance.get('api/orders', {
          params: { search },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    updateOrderStatus: async (id, status) => {
      try {
        const response = await axiosInstance.put(`api/orders/${id}/status`, { status });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  },

  // Stitching-related API calls
  stitching: {
    createStitching: async (stitchingData) => {
      try {
        const response = await axiosInstance.post('api/stitching', stitchingData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    updateStitching: async (id, stitchOutDate) => {
      try {
        const response = await axiosInstance.put(`api/stitching/${id}`, { stitchOutDate });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    getStitching: async (search = '') => {
      try {
        const response = await axiosInstance.get('api/stitching', {
          params: { search },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  },

  // Washing-related API calls
  washing: {
    createWashing: async (washingData) => {
      try {
        const response = await axiosInstance.post('api/washing', washingData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    updateWashing: async (id, washOutDate) => {
      try {
        const response = await axiosInstance.put(`api/washing/${id}`, { washOutDate });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    getWashing: async (search = '') => {
      try {
        const response = await axiosInstance.get('api/washing', {
          params: { search },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  },

  // Finishing-related API calls
  finishing: {
    createFinishing: async (finishingData) => {
      try {
        const response = await axiosInstance.post('api/finishing', finishingData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    updateFinishing: async (id, finishOutDate) => {
      try {
        const response = await axiosInstance.put(`api/finishing/${id}`, { finishOutDate });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    getFinishing: async (search = '') => {
      try {
        const response = await axiosInstance.get('api/finishing', {
          params: { search },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  },

  client: {
    getClients: async (search = '') => {
      try {
        const response = await axiosInstance.get('api/clients', {
          params: { search },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  },

  fitStyles: {
    getFitstyles: async (search = '') => {
      try {
        const response = await axiosInstance.get('api/fitstyles', {
          params: { search },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  }
};

export default apiService;