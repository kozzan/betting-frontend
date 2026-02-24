import { cookies } from "next/headers";
import { decodeJwtPayload } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";
import { HowItWorksNav } from "@/components/HowItWorksNav";

export default async function HowItWorksLayout({
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
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex gap-8 max-w-5xl mx-auto">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <HowItWorksNav />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
