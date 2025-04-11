import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Environment-aware base URL detection
const getBaseUrl = (): string => {
  // Check for Vite environment variables
  if (import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check for window._env_ pattern (runtime injection)
  if (typeof window !== 'undefined' && (window as any)._env_ && (window as any)._env_.API_URL) {
    return (window as any)._env_.API_URL;
  }
  
  // Default fallback
  return 'http://localhost:8080/v1';
};

// Create a baseURL based on environment
const baseURL = getBaseUrl();

// Create a custom axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // If 401 error and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token, logout user
          return handleAuthError();
        }
        
        // Try to get a new token
        const response = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        });
        
        if (response.data.accessToken) {
          // Save the new tokens
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          
          // Update the failed request with new token and retry
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          return handleAuthError();
        }
      } catch (refreshError) {
        // Refresh token failed, logout user
        return handleAuthError();
      }
    }
    
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);

// Handle authentication errors (logout)
const handleAuthError = () => {
  // Clear tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Redirect to login page
  window.location.href = '/';
  
  return Promise.reject({ message: 'Authentication failed' });
};

export default apiClient;