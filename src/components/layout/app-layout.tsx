"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/lib/store/auth";
import { initTelegramWebApp } from "@/lib/telegtam";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { fetchCurrentUser, accessToken } = useAuthStore();

  // Initialize Telegram WebApp
  useEffect(() => {
    initTelegramWebApp();
  }, []);

  // Fetch user data if we have a token
  useEffect(() => {
    if (accessToken) {
      fetchCurrentUser();
    }
  }, [accessToken, fetchCurrentUser]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-background">
      <div className="container max-w-md mx-auto">{children}</div>
    </main>
  );
}
