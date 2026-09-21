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

  const adminClient = createAdminClient();
  
  const { data: draw, error: drawError } = await adminClient.from('draws').select('*').eq('id', id).single();
  if (drawError || !draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  
  let simulation = null;
  if (draw.status === 'simulated' || draw.status === 'published') {
    const { data: simData } = await adminClient
      .from('draw_simulations')
      .select('*')
      .eq('draw_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (simData) simulation = simData;
  }
  
  return NextResponse.json({ data: { draw, simulation } });
}
