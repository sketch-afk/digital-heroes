import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="w-64 flex-col border-r bg-muted/40 p-4 hidden md:flex">
        <nav className="space-y-2">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Admin Control</h2>
          <Link
            href="/admin/draws"
            className="flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary"
          >
            Draw Management
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary"
          >
            Users
          </Link>
          <Link
            href="/admin/winners"
            className="flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary"
          >
            Winners & Payouts
          </Link>
          <Link
            href="/admin/charities"
            className="flex items-center rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-muted hover:text-primary"
          >
            Charities
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
