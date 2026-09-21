import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const adminClient = createAdminClient();
    
    // Fetch profile
    const { data: userData, error: userError } = await adminClient
      .from('profiles')
      .select(`
        *,
        subscriptions ( status, plan, current_period_end ),
        charities ( name )
      `)
      .eq('id', id)
      .single();

    if (userError) throw userError;

    // Fetch scores
    const { data: scores } = await adminClient
      .from('scores')
      .select('*')
      .eq('user_id', id)
      .order('score_date', { ascending: false });
    
    return NextResponse.json({ data: { ...userData, scores } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const adminClient = createAdminClient();

    if (body.action === 'update_profile') {
      const { full_name } = body;
      const { error } = await adminClient.from('profiles').update({ full_name }).eq('id', id);
      if (error) throw error;
    }
    else if (body.action === 'toggle_role') {
      const { role } = body;
      if (role !== 'admin' && role !== 'subscriber') throw new Error("Invalid role");
      const { error } = await adminClient.from('profiles').update({ role }).eq('id', id);
      if (error) throw error;
    }
    else if (body.action === 'cancel_subscription') {
      const { error } = await adminClient.from('subscriptions').update({ status: 'canceled' }).eq('user_id', id);
      if (error) throw error;
    }
    else if (body.action === 'delete_score') {
      const { score_id } = body;
      const { error } = await adminClient.from('scores').delete().eq('id', score_id);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
