import { apiRequest } from "./client";
import { User } from "@/types/user";

// Auth API interfaces
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface TelegramAuthParams {
  initData: string;
}

// Auth API methods
export const authApi = {
  // Authenticate with Telegram
  telegramAuth: async (initData: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>({
      method: "POST",
      url: "/auth/telegram",
      data: { initData },
    });
    return response.data;
  },

  // Refresh tokens
  refreshTokens: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>({
      method: "POST",
      url: "/auth/refresh",
      data: { refresh_token: refreshToken },
    });
    return response.data;
  },

  // Logout
  logout: async (refreshToken: string): Promise<void> => {
    await apiRequest<{ success: boolean }>({
      method: "POST",
      url: "/auth/logout",
      data: { refresh_token: refreshToken },
    });
  },

  // Logout from all devices
  logoutAll: async (): Promise<void> => {
    await apiRequest<{ success: boolean }>({
      method: "POST",
      url: "/auth/logout-all",
    });
  },

  // Get current user
  getMe: async (): Promise<User> => {
    const response = await apiRequest<User>({
      method: "GET",
      url: "/users/me",
    });
    return response.data;
  },

  // Delete user account
  deleteAccount: async (): Promise<void> => {
    await apiRequest<{ success: boolean }>({
      method: "DELETE",
      url: "/users/me",
    });
  },
};
