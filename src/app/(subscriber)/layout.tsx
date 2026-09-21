import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SubscriberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      <div className="border-b bg-muted/40">
        <div className="container mx-auto px-4 md:px-8 flex h-12 items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Overview</Button>
          </Link>
          <Link href="/dashboard/winnings">
            <Button variant="ghost" size="sm">My Winnings</Button>
          </Link>
        </div>
      </div>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
