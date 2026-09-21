import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";

export async function Nav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    isAdmin = profile?.role === 'admin';
  }

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8 flex h-14 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <span className="inline-block font-bold">DIGITAL HEROES</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/charities" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              Charities
            </Link>
            <Link href="/how-it-works" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              How it Works
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary">Admin Control</Button>
                </Link>
              )}
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <form action="/api/auth/logout" method="POST">
                <Button variant="outline" size="sm" type="submit">Logout</Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Subscribe</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
