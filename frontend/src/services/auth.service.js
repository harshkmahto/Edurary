import api from './api';

const authService = {

  register: async (userData) => {
    try {
      const response = await api.post('/user/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  verifyOTP: async (data) => {
    try {
      const response = await api.post('/user/verify-otp', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'OTP verification failed' };
    }
  },

  resendOTP: async (email) => {
    try {
      const response = await api.post('/user/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to resend OTP' };
    }
  },

  login: async (data) => {
    try {
      const response = await api.post('/user/login', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  verifyLoginOTP: async (data) => {
    try {
      const response = await api.post('/user/verify-login-otp', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login verification failed' };
    }
  },

  logoutUser: async () => {
    try {
      const response = await api.post('/user/logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get profile' };
    }
  },

updateProfile: async (data) => {
    try {
        const response = await api.patch('/user/profile', data, {
            headers: {
                'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to update profile' };
    }
},

  getAllUser: async (params) => {
    try {
      const response = await api.get('/user/admin/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/user/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user details' };
    }
  },

  // authService.js - Complete fixed methods

updateUsers: async (id, data) => {
  try {
    const response = await api.patch(`/user/update/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user' };
  }
},

deleteUsers: async (id) => {
  try {
    const response = await api.delete(`/user/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete user' };
  }
},

  //----------------------PUBLIC SUBSCRIPTION SERVICES----------------------//

  activeSubscription: async () => {
    try {
      const response = await api.get('/user/active/subscription');
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to fetch active subscriptions'
      };
    }
  },

  //----------------------ADMIN SUBSCRIPTION SERVICES----------------------//
  createSubscription: async (data) => {
    try {
      const response = await api.post('/user/subscription', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to create subscription'
      };
    }
  },

  getAllSubscriptions: async () => {
    try {
      const response = await api.get('/user/subscription');
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to fetch subscriptions'
      };
    }
  },

  getSubscriptionById: async (id) => {
    try {
      const response = await api.get(`/user/subscription/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to fetch subscription'
      };
    }
  },

  updateSubscription: async (id, data) => {
    try {
      const response = await api.patch(`/user/subscription/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to update subscription'
      };
    }
  },

  deleteSubscription: async (id) => {
    try {
      const response = await api.delete(`/user/subscription/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to delete subscription'
      };
    }
  },

  activateSubscription: async (id) => {
    try {
      const response = await api.patch(`/user/subscription/${id}/activate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to activate subscription'
      };
    }
  },

//---------------------- SUBSCRIBER SERVICES----------------------//

 // Create subscriber (initiate payment)
  createSubscriber: async (data) => {
    try {
      const response = await api.post('/user/create', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to initiate payment'
      };
    }
  },

  // Submit payment proof with receipt
  submitPaymentProof: async (formData) => {
    try {
      const response = await api.post('/user/submit-payment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to submit payment proof'
      };
    }
  },

  // Get user's all subscriptions
  getUserSubscriptions: async () => {
    try {
      const response = await api.get('/user/my-subscriptions');
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to fetch your subscriptions'
      };
    }
  },

  // Get user's active subscription
  getUserActiveSubscription: async () => {
    try {
      const response = await api.get('/user/active');
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to fetch active subscription'
      };
    }
  },


 getAllSubscribers: async (params) => {
    try {
      const response = await api.get('/user/all', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to fetch all subscribers'
      };
    }
  },

 updateSubscriberStatus: async (subscriberId, data) => {
    try {
      const response = await api.put(`/user/status/${subscriberId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to update subscription status'
      };
    }
  },

  updatePaymentStatus: async (subscriberId, data) => {
    try {
      const response = await api.put(`/user/payment-status/${subscriberId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to update payment status'
      };
    }
  },

  // Delete receipt (admin)
  deleteReceipt: async (subscriberId) => {
    try {
      const response = await api.delete(`/user/receipt/${subscriberId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to delete receipt'
      };
    }
  },

  //----------------------UPI SERVICES----------------------//

  // Get UPI details
  getUpiDetails: async () => {
    try {
      const response = await api.get('/user/upi');
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to fetch UPI details'
      };
    }
  },

  // Update UPI details (admin)
  updateUpiDetails: async (data) => {
    try {
      const response = await api.put('/user/upi', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Failed to update UPI details'
      };
    }
  },

  getInvoice: async (subscriberId) => {
    try {
        const response = await api.get(`/user/invoice/${subscriberId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: 'Failed to fetch invoice'
        };
    }
},

// Get all invoices for user
getAllInvoices: async (params = {}) => {
    try {
        const { page = 1, limit = 10, status } = params;
        const queryParams = new URLSearchParams({ page, limit });
        if (status) queryParams.append('status', status);
        
        const response = await api.get(`/user/invoices?${queryParams}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || {
            message: 'Failed to fetch invoices'
        };
    }
},


};

export default authService;

export const {
  register,
  verifyOTP,
  resendOTP,
  login,
  verifyLoginOTP,
  logoutUser,
  getProfile,
  updateProfile,
  getAllUser,
  getUserById,
  updateUsers,
  deleteUsers,
  activeSubscription,  
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  activateSubscription,
  createSubscriber,
  submitPaymentProof,
  getUserSubscriptions,
  getUserActiveSubscription,
  getAllSubscribers,
  updateSubscriberStatus,
  updatePaymentStatus,
  deleteReceipt,
  getUpiDetails,
  updateUpiDetails,
} = authService;