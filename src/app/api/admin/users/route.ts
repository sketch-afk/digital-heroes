import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const adminClient = createAdminClient();
    
    // Fetch profiles, join with subscriptions and charities
    const { data: users, error } = await adminClient
      .from('profiles')
      .select(`
        *,
        subscriptions ( status, plan, current_period_end ),
        charities ( name )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({ data: users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
