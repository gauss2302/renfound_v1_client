import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthState, User } from "@/types/user";
import { authApi } from "@/lib/api/auth";
import { showToast } from "../utils/toaster";

// Define the auth store interface
interface AuthStore extends AuthState {
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  loginWithTelegram: (initData: string) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  deleteAccount: () => Promise<void>;
}

// Create the auth store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Set tokens
      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      // Set user
      setUser: (user) => {
        set({ user });
      },

      // Set loading state
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // Set error
      setError: (error) => {
        set({ error });
      },

      // Logout
      logout: async () => {
        try {
          const refreshToken = get().refreshToken;
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
          showToast.success(
            "Logged out",
            "You have been logged out successfully"
          );
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      // Login with Telegram
      loginWithTelegram: async (initData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.telegramAuth(initData);
          set({
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
          showToast.success("Login successful", "Welcome to RenFound!");
          // Fetch user data after successful login
          await get().fetchCurrentUser();
        } catch (error) {
          console.error("Login error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Authentication failed";
          showToast.error("Login failed", errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },

      // Fetch current user data
      fetchCurrentUser: async () => {
        if (!get().accessToken) return;

        set({ isLoading: true });
        try {
          const user = await authApi.getMe();
          set({ user, isLoading: false });
        } catch (error) {
          console.error("Fetch user error:", error);
          set({ isLoading: false });

          // If unauthorized, try to refresh token
          if (
            error &&
            typeof error === "object" &&
            "status" in error &&
            error.status === 401
          ) {
            const success = await get().refreshTokens();
            if (success) {
              // Retry fetching user
              await get().fetchCurrentUser();
            }
          }
        }
      },

      // Refresh tokens
      refreshTokens: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return false;

        try {
          const response = await authApi.refreshTokens(refreshToken);
          set({
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
          });
          return true;
        } catch (error) {
          console.error("Refresh token error:", error);
          // If refresh fails, logout
          get().logout();
          return false;
        }
      },

      // Delete account
      deleteAccount: async () => {
        set({ isLoading: true });
        try {
          await authApi.deleteAccount();
          showToast.success(
            "Account deleted",
            "Your account has been successfully deleted"
          );
          // Logout after deleting account
          get().logout();
        } catch (error) {
          console.error("Delete account error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete account";
          showToast.error("Error", errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
