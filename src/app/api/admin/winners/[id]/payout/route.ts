import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const adminClient = createAdminClient();
    
    // Check if approved
    const { data: winner, error: fetchError } = await adminClient
      .from('winners')
      .select('verification_status, payment_status')
      .eq('id', id)
      .single();

    if (fetchError || !winner) return NextResponse.json({ error: "Winner not found" }, { status: 404 });
    if (winner.verification_status !== 'approved') return NextResponse.json({ error: "Proof must be approved before payout" }, { status: 400 });
    if (winner.payment_status === 'paid') return NextResponse.json({ error: "Already paid" }, { status: 400 });

    const { data, error } = await adminClient
      .from('winners')
      .update({
        payment_status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
