import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { getTelegramInitData, isInTelegram } from "@/lib/telegram";
import { useRouter } from "next/navigation";

// Custom hook to handle authentication
export const useAuth = (requireAuth = true) => {
  const {
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    user,
    loginWithTelegram,
    logout,
    fetchCurrentUser,
    deleteAccount,
  } = useAuthStore();

  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    // If we have a token but no user data, fetch it
    if (accessToken && !user) {
      fetchCurrentUser();
    }
  }, [accessToken, user, fetchCurrentUser]);

  // Auto-login with Telegram if in Telegram and not authenticated
  useEffect(() => {
    const autoLogin = async () => {
      if (!isAuthenticated && !isLoading && isInTelegram()) {
        const initData = getTelegramInitData();
        if (initData) {
          try {
            await loginWithTelegram(initData);
          } catch (error) {
            console.error("Auto-login failed:", error);
          }
        }
      }
    };

    autoLogin();
  }, [isAuthenticated, isLoading, loginWithTelegram]);

  // Redirect based on auth state if requireAuth is set
  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push("/login");
      } else if (!requireAuth && isAuthenticated) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  return {
    isAuthenticated,
    isLoading,
    error,
    user,
    loginWithTelegram,
    logout,
    fetchCurrentUser,
    deleteAccount,
  };
};
