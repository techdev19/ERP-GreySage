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

    getOrderById: async (orderId) => {
      try {
        const response = await axiosInstance.get(`api/orders/${orderId}`);
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

    getStitching: async (search = '', orderId = '', invoiceNumber = '') => {
      try {
        const response = await axiosInstance.get('api/stitching', {
          params: { search, orderId, invoiceNumber },
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

    getWashing: async (search = '', lotId = '', invoiceNumber = '') => {
      try {
        const response = await axiosInstance.get('api/washing', {
          params: { search, lotId, invoiceNumber },
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

  // Stitching Vendors API calls
  stitchingVendors: {
    createStitchingVendor: async (vendorData) => {
      try {
        const response = await axiosInstance.post('api/stitching-vendors', vendorData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    getStitchingVendors: async (search = '', showInactive = false) => {
      try {
        const response = await axiosInstance.get('api/stitching-vendors', {
          params: { search, showInactive },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    toggleStitchingVendorActive: async (id) => {
      try {
        const response = await axiosInstance.put(`api/stitching-vendors/${id}/toggle-active`);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  },

  // Washing Vendors API calls
  washingVendors: {
    createWashingVendor: async (vendorData) => {
      try {
        const response = await axiosInstance.post('api/washing-vendors', vendorData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    getWashingVendors: async (search = '', showInactive = false) => {
      try {
        const response = await axiosInstance.get('api/washing-vendors', {
          params: { search, showInactive },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    toggleWashingVendorActive: async (id) => {
      try {
        const response = await axiosInstance.put(`api/washing-vendors/${id}/toggle-active`);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  },

  // Finishing Vendors API calls
  finishingVendors: {
    createFinishingVendor: async (vendorData) => {
      try {
        const response = await axiosInstance.post('api/finishing-vendors', vendorData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    getFinishingVendors: async (search = '', showInactive = false) => {
      try {
        const response = await axiosInstance.get('api/finishing-vendors', {
          params: { search, showInactive },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    toggleFinishingVendorActive: async (id) => {
      try {
        const response = await axiosInstance.put(`api/finishing-vendors/${id}/toggle-active`);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  },

  // Lot-related API calls
  lots: {
    searchByLotNumber: async (lotNumber, orderId) => {
      try {
        const response = await axiosInstance.get('api/lots/search/lotNumber', {
          params: { lotNumber, orderId },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    searchByInvoiceNumber: async (invoiceNumber, orderId) => {
      try {
        const response = await axiosInstance.get('api/lots/search/invoiceNumber', {
          params: { invoiceNumber, orderId },
        });
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  },

  client: {
    createClient: async (clientData) => {
      try {
        const response = await axiosInstance.post('api/clients', clientData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

    updateClient: async (id) => {
      try {
        const response = await axiosInstance.put(`api/clients/${id}/toggle-active`, null);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

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
    createFitstyles: async (fitStyleData) => {
      try {
        const response = await axiosInstance.post('api/fitstyles', fitStyleData);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },

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

    toggleFitstyleActive: async (id) => {
      try {
        const response = await axiosInstance.put(`api/fitstyles/${id}/toggle-active`);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  }
};

export default apiService;