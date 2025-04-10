"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { UserProfile } from "@/components/auth/user-profile";
import { useAuth } from "@/lib/hooks/use-auth";
import { LoadingScreen } from "@/components/ui/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect } from "react";
import { MainButton } from "@/lib/telegram";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user, logout } = useAuth(true);
  const router = useRouter();

  // Set up Telegram MainButton
  useEffect(() => {
    MainButton.show("Log Out", async () => {
      await logout();
      router.push("/login");
    });

    return () => {
      MainButton.hide();
    };
  }, [logout, router]);

  if (isLoading || !user) {
    return (
      <AppLayout>
        <LoadingScreen />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome, {user.first_name}!</CardTitle>
            <CardDescription>You are now connected to RenFound</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is your personal dashboard. You can manage your account
              settings and preferences here.
            </p>
          </CardContent>
        </Card>

        <UserProfile />
      </div>
    </AppLayout>
  );
}
