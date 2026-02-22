"use server";

import { redirect } from "next/navigation";

export type ResetPasswordState = {
  error?: string;
};

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = formData.get("token") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!token || !newPassword) {
    return { error: "Invalid reset link" };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1/auth/reset-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    }
  ).catch(() => null);

  if (!res?.ok) {
    return { error: "Reset link is invalid or has expired" };
  }

  redirect("/login?reset=success");
}
