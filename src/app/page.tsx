"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading";
import { isInTelegram } from "@/lib/telegram";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingScreen message="Initializing app..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-center">Welcome to RenFound</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-center text-muted-foreground">
            {isInTelegram()
              ? "Loading your account..."
              : "Please open this app in Telegram"}
          </p>
          <Button onClick={() => router.push("/login")} disabled={isLoading}>
            Get Started
          </Button>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
