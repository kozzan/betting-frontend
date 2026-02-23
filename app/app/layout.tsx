import { cookies } from "next/headers";
import { decodeJwtPayload } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";
import { Toaster } from "@/components/ui/sonner";

export default async function AppLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const decoded = token ? decodeJwtPayload(token) : null;
  const rawUsername = typeof decoded?.username === "string" ? decoded.username : null;
  const username = rawUsername ?? (typeof decoded?.sub === "string" ? decoded.sub : undefined);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar username={username} />
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <Toaster />
    </div>
  );
}
