import { cookies } from "next/headers";
import { NavBar } from "@/components/NavBar";
import { Toaster } from "@/components/ui/sonner";

function getUsernameFromToken(token: string): string | undefined {
  try {
    const [, payload] = token.split(".");
    if (!payload) return undefined;
    const decoded = JSON.parse(
      atob(payload.replaceAll("-", "+").replaceAll("_", "/"))
    );
    return decoded.username ?? decoded.sub;
  } catch {
    return undefined;
  }
}

export default async function AppLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const username = token ? getUsernameFromToken(token) : undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar username={username} />
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <Toaster />
    </div>
  );
}
