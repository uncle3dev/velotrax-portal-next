import Link from "next/link";
import { createServerCaller } from "@/server/trpc/client";
import { withAuthNotFound } from "@/server/auth/with-auth-redirect";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProfileEditor, type ProfileField } from "@/components/profile/profile-editor";
import { type UserProfile } from "@/types/index";

function formatLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(key: string, value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "string") {
    if (key === "createdAt" || key === "updatedAt") {
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function isEditableValue(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number";
}

function buildEditableFields(profile: UserProfile): ProfileField[] {
  const reservedKeys = new Set([
    "id",
    "role",
    "roles",
    "createdAt",
    "updatedAt",
    "password",
  ]);

  return Object.entries(profile)
    .filter(([key, value]) => !reservedKeys.has(key) && isEditableValue(value))
    .map(([key, value]) => ({
      key,
      label: formatLabel(key),
      value: String(value),
      type: key === "email" ? "email" : typeof value === "number" ? "number" : "text",
    }));
}

function ProfileHeader({ profile }: { profile: UserProfile }) {
  const displayName = profile.name ?? profile.fullName ?? "Profile";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.12),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.08),_transparent_42%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-semibold text-white shadow-lg shadow-blue-200">
            {initials || "?"}
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-700">
              Account profile
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-gray-900">{displayName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              View every account detail returned by the gateway and update the editable
              fields from one place.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                {profile.email}
              </span>
              {profile.role && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                  {profile.role}
                </span>
              )}
              {Array.isArray(profile.roles) &&
                profile.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700"
                  >
                    {role}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Back to dashboard
            </Link>
            <SignOutButton />
          </div>
          <p className="text-xs text-gray-500">
            Updated {profile.updatedAt ? formatValue("updatedAt", profile.updatedAt) : "recently"}.
          </p>
        </div>
      </div>
    </div>
  );
}

async function ProfilePageContent() {
  const profile = await withAuthNotFound(async () => {
    const caller = await createServerCaller();
    return caller.user.getProfile();
  });

  const editableFields = buildEditableFields(profile);
  const detailRows = Object.entries(profile).filter(([key]) => key !== "password");

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">All info</h2>
            <p className="mt-1 text-sm text-gray-500">
              Every top-level field returned by the profile endpoint is listed here.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {detailRows.map(([key, value]) => (
                <div key={key} className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                    {formatLabel(key)}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-900">
                    {formatValue(key, value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ProfileEditor fields={editableFields} />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfilePageContent />;
}
