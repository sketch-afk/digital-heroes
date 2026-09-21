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
    <div className="flex min-h-[calc(100vh-3.5rem)] bg-bg">
      {/* Sidebar */}
      <aside className="w-64 flex-col border-r border-line bg-surface p-6 hidden md:flex">
        <nav className="space-y-2">
          <h2 className="mb-6 text-xl font-display font-bold tracking-tight text-text">Admin Control</h2>
          <Link
            href="/admin"
            className="flex items-center rounded-[var(--radius-control)] px-4 py-3 text-sm font-medium text-text-2 transition-all hover:bg-surface-2 hover:text-text"
          >
            Overview
          </Link>
          <Link
            href="/admin/draws"
            className="flex items-center rounded-[var(--radius-control)] px-4 py-3 text-sm font-medium text-text-2 transition-all hover:bg-surface-2 hover:text-text"
          >
            Draw Management
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center rounded-[var(--radius-control)] px-4 py-3 text-sm font-medium text-text-2 transition-all hover:bg-surface-2 hover:text-text"
          >
            Users
          </Link>
          <Link
            href="/admin/winners"
            className="flex items-center rounded-[var(--radius-control)] px-4 py-3 text-sm font-medium text-text-2 transition-all hover:bg-surface-2 hover:text-text"
          >
            Winners & Payouts
          </Link>
          <Link
            href="/admin/charities"
            className="flex items-center rounded-[var(--radius-control)] px-4 py-3 text-sm font-medium text-text-2 transition-all hover:bg-surface-2 hover:text-text"
          >
            Charities
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
