import { apiRequest } from "@/lib/api";
import type { ApiResponse } from "@/types/markets";
import type { Profile } from "@/types/profile";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";

export default async function ProfilePage() {
  let profile: Profile | null = null;
  try {
    const res = await apiRequest<ApiResponse<Profile>>("/api/v1/me");
    profile = res.data;
  } catch {
    // handled below
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground text-sm">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <ProfilePageClient profile={profile} />
    </div>
  );
}
