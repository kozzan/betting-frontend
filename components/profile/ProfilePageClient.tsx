"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/format";
import type { Profile } from "@/types/profile";
import type { ApiResponse } from "@/types/markets";

interface ProfilePageClientProps {
  readonly profile: Profile;
}

export function ProfilePageClient({ profile }: ProfilePageClientProps) {
  const router = useRouter();
  const [username, setUsername] = useState(profile.username);
  const [savingUsername, setSavingUsername] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed || trimmed === profile.username) return;
    setSavingUsername(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });
      if (!res.ok) {
        toast.error(await getErrorMessage(res));
        return;
      }
      const json: ApiResponse<Profile> = await res.json();
      setUsername(json.data.username);
      toast.success("Username updated");
      router.refresh();
    } finally {
      setSavingUsername(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setSavingPassword(true);
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        toast.error(await getErrorMessage(res));
        return;
      }
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Account info */}
      <div className="rounded-md border border-border p-4 space-y-3">
        <h2 className="text-sm font-medium">Account Info</h2>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
          <p className="text-sm">{profile.email}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Member since</p>
          <p className="text-sm">{new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Username */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <span className="text-sm font-medium">Username</span>
        </div>
        <form onSubmit={handleUsernameSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs text-muted-foreground uppercase tracking-wide">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
            />
          </div>
          <Button
            type="submit"
            disabled={savingUsername || !username.trim() || username.trim() === profile.username}
          >
            {savingUsername ? "Saving…" : "Save username"}
          </Button>
        </form>
      </div>

      {/* Change password */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <span className="text-sm font-medium">Change Password</span>
        </div>
        <form onSubmit={handlePasswordSubmit} className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-xs text-muted-foreground uppercase tracking-wide">
              Current password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-xs text-muted-foreground uppercase tracking-wide">
              New password
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={savingPassword || !currentPassword || !newPassword}
          >
            {savingPassword ? "Saving…" : "Change password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
