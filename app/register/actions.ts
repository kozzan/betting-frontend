"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export type RegisterState = {
  error?: string;
};

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!email || !username || !password) {
    return { error: "All fields are required" };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1/auth/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    }
  ).catch(() => null);

  if (!res) {
    return { error: "Could not connect to server" };
  }

  if (res.status === 409) {
    return { error: "Email or username is already taken" };
  }

  if (!res.ok) {
    return { error: "Registration failed. Please try again." };
  }

  const data = await res.json().catch(() => null);
  if (!data?.data?.accessToken || !data?.data?.refreshToken) {
    return { error: "Registration failed. Please try again." };
  }

  const cookieStore = await cookies();
  const IS_PRODUCTION = process.env.NODE_ENV === "production";

  cookieStore.set("access_token", data.data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: 15 * 60,
  });
  cookieStore.set("refresh_token", data.data.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  redirect("/app/markets");
}
