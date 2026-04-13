import { Suspense } from "react";
import { createServerCaller } from "@/server/trpc/client";
import { UserProfileCard } from "@/components/dashboard/user-profile-card";
import { Card, CardContent } from "@/components/ui/card";

async function ProfileContent() {
  const caller = await createServerCaller();
  const profile = await caller.user.profile();
  return <UserProfileCard profile={profile} />;
}

function ProfileSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="h-32 animate-pulse rounded bg-gray-200" />
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">View and manage your account information.</p>
      </div>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
