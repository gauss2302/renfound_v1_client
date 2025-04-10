import WebApp from "@telegram-apps/sdk";

// Initialize Telegram WebApp
export const initTelegramWebApp = () => {
  // Ensure we're running in a browser
  if (typeof window === "undefined") {
    return null;
  }

  // Check if we're running inside Telegram
  const isInTelegram = window.Telegram && window.Telegram.WebApp;

  // Initialize the WebApp if we're inside Telegram
  if (isInTelegram) {
    // Request viewport settings for a better experience
    WebApp.enableClosingConfirmation();
    WebApp.setHeaderColor("secondary_bg_color");
    WebApp.setBackgroundColor("secondary_bg_color");

    // Expand the WebApp to full height
    WebApp.expand();

    return WebApp;
  }

  return null;
};

// Get Telegram init data
export const getTelegramInitData = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  return WebApp.initData || "";
};

// Close the WebApp
export const closeTelegramWebApp = () => {
  WebApp.close();
};

// Show alert in Telegram
export const showTelegramAlert = (message: string): Promise<void> => {
  return WebApp.showAlert(message);
};

// Show confirmation dialog in Telegram
export const showTelegramConfirm = (message: string): Promise<boolean> => {
  return WebApp.showConfirm(message);
};

// Get the current Telegram theme
export const getTelegramTheme = () => {
  return WebApp.themeParams;
};

// Check if we're in Telegram
export const isInTelegram = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return !!window.Telegram && !!window.Telegram.WebApp;
};

// Helper to safely get user info
export const getTelegramUser = () => {
  if (!isInTelegram()) {
    return null;
  }

  return WebApp.initDataUnsafe.user;
};

// MainButton helpers
export const MainButton = {
  show: (text: string, callback?: () => void) => {
    WebApp.MainButton.text = text;

    if (callback) {
      WebApp.MainButton.onClick(callback);
    }

    WebApp.MainButton.show();
  },

  hide: () => {
    WebApp.MainButton.hide();
  },

  setLoading: (loading: boolean) => {
    if (loading) {
      WebApp.MainButton.showProgress();
    } else {
      WebApp.MainButton.hideProgress();
    }
  },
};
