"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  ).catch(() => null);

  if (!res?.ok) {
    return { error: "Invalid email or password" };
  }

  const data = await res.json().catch(() => null);
  if (!data?.data?.accessToken || !data?.data?.refreshToken) {
    return { error: "Invalid credentials" };
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
