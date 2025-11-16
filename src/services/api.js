import axios from 'axios';
import { API_CONFIG } from '../config';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      setAuthToken(null);
      // Trigger a custom event that the app can listen to
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Helper function to get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || API_CONFIG.token;
};

// Helper function to set token in localStorage
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// Helper function to get token
export const getToken = () => {
  return getAuthToken();
};

/**
 * Formats a Date object to YYYY-MM-DD string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
const formatDateForAPI = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Fetches expenses from the backend API
 * @param {Object} options - Filter options
 * @param {Date} options.startDate - Start date for filtering
 * @param {Date} options.endDate - End date for filtering
 * @param {number} options.offset - Pagination offset (default: 0)
 * @param {number} options.limit - Pagination limit (optional, only sent if > 0)
 * @param {string} options.primarycategory - Filter by primary category (default: '')
 * @param {string} options.secondarycategory - Filter by secondary category (default: '')
 * @returns {Promise<Array>} Array of expense objects
 */
export const fetchExpenses = async ({
  startDate,
  endDate,
  offset = 0,
  limit,
  primarycategory = '',
  secondarycategory = '',
} = {}) => {
  try {
    // Format dates for API (YYYY-MM-DD)
    // API defaults: startDate = '1970-01-01', endDate = current date
    const startDateStr = startDate ? formatDateForAPI(startDate) : '1970-01-01';
    const endDateStr = endDate ? formatDateForAPI(endDate) : formatDateForAPI(new Date());

    // Build query parameters - only include limit if it's provided and greater than 0
    const params = {
      startDate: startDateStr,
      endDate: endDateStr,
      offset,
      ...(limit && limit > 0 && { limit }),
      ...(primarycategory && { primarycategory }),
      ...(secondarycategory && { secondarycategory }),
    };

    const response = await apiClient.get('/expense', { params });

    const data = response.data;
    
    // Handle the API response structure: data.payload.expenses
    if (data?.data?.payload?.expenses) {
      return data.data.payload.expenses;
    }
    
    // Fallback for other possible response formats
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data.expenses) {
      return data.expenses;
    }
    
    if (data.data?.expenses) {
      return data.data.expenses;
    }
    
    // If no expenses found, return empty array
    return [];
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        throw new Error('Unauthorized: Please check your Bearer token');
      }
      if (error.response.status === 404) {
        throw new Error('API endpoint not found');
      }
      throw new Error(`Failed to fetch expenses: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Network error: Could not connect to the server. Please check if the API is running.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
};

/**
 * Fetches expense summary by category from the backend API
 * @param {Object} options - Filter options
 * @param {Date} options.startDate - Start date for filtering
 * @param {Date} options.endDate - End date for filtering
 * @returns {Promise<Array>} Array of summary objects with value and id (category)
 */
export const fetchSummary = async ({
  startDate,
  endDate,
} = {}) => {
  try {
    // Format dates for API (YYYY-MM-DD)
    // API defaults: startDate = '1970-01-01', endDate = current date
    const startDateStr = startDate ? formatDateForAPI(startDate) : '1970-01-01';
    const endDateStr = endDate ? formatDateForAPI(endDate) : formatDateForAPI(new Date());

    const params = {
      startDate: startDateStr,
      endDate: endDateStr,
    };

    const response = await apiClient.get('/expense/summary', { params });

    const data = response.data;
    
    // Handle the API response structure: data.data is an array
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Fallback
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Unauthorized: Please check your Bearer token');
      }
      if (error.response.status === 404) {
        throw new Error('Summary API endpoint not found');
      }
      throw new Error(`Failed to fetch summary: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to the server. Please check if the API is running.');
    } else {
      throw error;
    }
  }
};

/**
 * Fetches secondary category summary for a specific primary category
 * @param {string} primaryCategory - Primary category name
 * @param {Object} options - Filter options
 * @param {Date} options.startDate - Start date for filtering
 * @param {Date} options.endDate - End date for filtering
 * @returns {Promise<Array>} Array of summary objects with secondarycategory, total, count
 */
export const fetchSecondarySummary = async (primaryCategory, {
  startDate,
  endDate,
} = {}) => {
  try {
    // Format dates for API (YYYY-MM-DD)
    const startDateStr = startDate ? formatDateForAPI(startDate) : '1970-01-01';
    const endDateStr = endDate ? formatDateForAPI(endDate) : formatDateForAPI(new Date());

    const params = {
      startDate: startDateStr,
      endDate: endDateStr,
    };

    // URL encode the primary category for the path parameter
    const encodedCategory = encodeURIComponent(primaryCategory);
    const response = await apiClient.get(`/expense/summary/${encodedCategory}`, { params });

    const data = response.data;
    
    // Handle the API response structure: data.data is an array
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Fallback
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Unauthorized: Please check your Bearer token');
      }
      if (error.response.status === 404) {
        throw new Error('Secondary summary not found');
      }
      throw new Error(`Failed to fetch secondary summary: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to the server. Please check if the API is running.');
    } else {
      throw error;
    }
  }
};

/**
 * Signs up a new user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Response data
 */
export const signUp = async ({ username, email, password }) => {
  try {
    const response = await apiClient.post('/auth/signup', {
      username,
      email,
      password,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || 'Sign up failed';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to the server.');
    } else {
      throw error;
    }
  }
};

/**
 * Signs in a user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Response data with access_token
 */
export const signIn = async ({ email, password }) => {
  try {
    const response = await apiClient.post('/auth/signin', {
      email,
      password,
    });

    const data = response.data;
    
    // Extract and store the access token
    if (data?.payload?.access_token) {
      setAuthToken(data.payload.access_token);
    }

    return data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || 'Sign in failed';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to the server.');
    } else {
      throw error;
    }
  }
};

/**
 * Sends OTP to a phone number
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +1234567890)
 * @returns {Promise<Object>} Response data
 */
export const sendOTP = async (phoneNumber) => {
  try {
    const response = await apiClient.post('/auth/sendOTP', {
      phoneNumber,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || 'Failed to send OTP';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to the server.');
    } else {
      throw error;
    }
  }
};

/**
 * Verifies OTP and signs in the user
 * @param {string} phoneNumber - Phone number in E.164 format
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<Object>} Response data with access_token
 */
export const verifyOTP = async (phoneNumber, otp) => {
  try {
    const response = await apiClient.post('/auth/verifyOTP', {
      phoneNumber,
      otp,
    });

    const data = response.data;
    
    // Extract and store the access token
    if (data?.payload?.access_token) {
      setAuthToken(data.payload.access_token);
    }

    return data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || 'Failed to verify OTP';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to the server.');
    } else {
      throw error;
    }
  }
};

/**
 * Signs out the current user
 * @returns {Promise<Object>} Response data
 */
export const signOut = async () => {
  try {
    const response = await apiClient.post('/auth/signout');
    setAuthToken(null); // Clear token from localStorage
    return response.data;
  } catch (error) {
    // Even if API call fails, clear the token locally
    setAuthToken(null);
    if (error.response) {
      const message = error.response.data?.message || 'Sign out failed';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to the server.');
    } else {
      throw error;
    }
  }
};

/**
 * Adds a new expense
 * @param {Object} expense - Expense data
 * @param {string} expense.expense - Expense description/remark (required)
 * @param {number} expense.amount - Expense amount (required)
 * @param {string} expense.date - Date of expense in YYYY-MM-DD format (optional)
 * @param {string} expense.category - Expense category (optional)
 * @returns {Promise<Object>} Created expense data
 */
export const addExpense = async ({ expense, amount, date, category }) => {
  try {
    const requestBody = {
      expense,
      amount: parseFloat(amount),
    };

    if (date) {
      requestBody.date = date;
    }

    if (category) {
      requestBody.category = category;
    }

    const response = await apiClient.post('/expense', requestBody);
    return response.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || 'Failed to add expense';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to the server.');
    } else {
      throw error;
    }
  }
};

/**
 * Updates an existing expense
 * @param {string} id - Expense ID
 * @param {Object} expense - Expense data
 * @param {string} expense.expense - Expense description/remark (required)
 * @param {number} expense.amount - Expense amount (required)
 * @param {string} expense.created - Date of expense in YYYY-MM-DD format (required)
 * @param {string} expense.primarycategory - Primary category (optional)
 * @param {string} expense.secondarycategory - Secondary category (optional)
 * @returns {Promise<Object>} Updated expense data
 */
export const updateExpense = async (id, { expense, amount, created, primarycategory, secondarycategory }) => {
  try {
    const requestBody = {
      expense,
      amount: parseFloat(amount),
      created: formatDateForAPI(new Date(created)),
    };

    if (primarycategory) {
      requestBody.primarycategory = primarycategory;
    }

    if (secondarycategory) {
      requestBody.secondarycategory = secondarycategory;
    }

    const response = await apiClient.put(`/expense/${id}`, requestBody);
    return response.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || 'Failed to update expense';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to the server.');
    } else {
      throw error;
    }
  }
};

/**
 * Categorizes pending expenses using AI
 * This API checks all records with "Categorization pending" and categorizes them using ChatGPT
 * @returns {Promise<Object>} Response data
 */
export const categorizePendingExpenses = async () => {
  try {
    // This API is on a different base URL
    const response = await axios.post(
      'https://expensetrackercronjob.onrender.com/api/v1/updateDB',
      '',
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || 'Failed to categorize expenses';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to the categorization service.');
    } else {
      throw error;
    }
  }
};

/**
 * Deletes an expense
 * @param {string} id - Expense ID
 * @returns {Promise<Object>} Response data
 */
export const deleteExpense = async (id) => {
  try {
    const response = await apiClient.delete(`/expense/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || 'Failed to delete expense';
      throw new Error(message);
    } else if (error.request) {
      throw new Error('Network error: Could not connect to the server.');
    } else {
      throw error;
    }
  }
};

