"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth";
import { showTelegramConfirm } from "@/lib/telegram";

export function UserProfile() {
  const { user, logout, deleteAccount, isLoading } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) {
    return (
      <div className="flex justify-center py-8">
        <LoadingIndicator />
      </div>
    );
  }

  const handleLogout = async () => {
    const confirmed = await showTelegramConfirm(
      "Are you sure you want to log out?"
    );
    if (confirmed) {
      await logout();
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await showTelegramConfirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (confirmed) {
      setIsDeleting(true);
      try {
        await deleteAccount();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Profile</span>
        </CardTitle>
        <CardDescription>Your account information</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          {user.photo_url && (
            <img
              src={user.photo_url}
              alt={user.first_name}
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <h3 className="font-medium">
              {user.first_name} {user.last_name || ""}
            </h3>
            {user.username && (
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            )}
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <ProfileItem label="User ID" value={user.id} />
          <ProfileItem
            label="Telegram ID"
            value={user.telegram_id.toString()}
          />
          <ProfileItem label="Joined" value={formatDate(user.created_at)} />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          Log Out
        </Button>
        <Button
          onClick={handleDeleteAccount}
          variant="destructive"
          className="w-full"
          disabled={isDeleting || isLoading}
        >
          {isDeleting ? <LoadingIndicator /> : "Delete Account"}
        </Button>
      </CardFooter>
    </Card>
  );
}

interface ProfileItemProps {
  label: string;
  value: string;
}

function ProfileItem({ label, value }: ProfileItemProps) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
