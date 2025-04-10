import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/lib/store/auth";

// API client configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090/api";

// Create a base axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const { refreshToken, logout, setTokens } = useAuthStore.getState();

    // If error is 401 and we have a refresh token, try to refresh
    if (
      error.response?.status === 401 &&
      refreshToken &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Call refresh token endpoint
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;

        // Update tokens in store
        setTokens(access_token, refresh_token);

        // Retry the original request with new token
        originalRequest.headers["Authorization"] = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  error: string;
  description?: string;
  errors?: Record<string, string[]>;
}

// Generic API request method
export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient(config);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw {
        error: error.response.data.error || "Unknown error",
        description: error.response.data.description || error.message,
        errors: error.response.data.errors,
        status: error.response.status,
      };
    }
    throw {
      error: "Network Error",
      description: "Could not connect to server",
    };
  }
};

// Export a default instance
export default apiClient;
