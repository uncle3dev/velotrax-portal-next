import { type UserProfile } from "@/types/index";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type UserProfileCardProps = {
  profile: UserProfile;
};

export function UserProfileCard({ profile }: UserProfileCardProps) {
  const name = profile.name ?? profile.fullName ?? profile.email;
  const initials = (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-medium text-gray-900">{name ?? "—"}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base text-gray-900">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member since</p>
              <p className="text-base text-gray-900">
                {profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
