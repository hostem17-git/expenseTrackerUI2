// API Configuration
// You can set these via environment variables or update them directly
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://expensetracker-u51b.onrender.com/api/v1',
  token: import.meta.env.VITE_API_TOKEN || '', // Set your Bearer token here or via .env file
};

