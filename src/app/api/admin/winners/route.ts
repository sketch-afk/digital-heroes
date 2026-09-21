import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const adminClient = createAdminClient();

  // Fetch all winners with related profile and draw info
  const { data: winners, error: winnersError } = await adminClient
    .from('winners')
    .select(`
      *,
      profiles:user_id ( full_name, email ),
      draws:draw_id ( draw_month )
    `)
    .order('created_at', { ascending: false });

  if (winnersError) return NextResponse.json({ error: winnersError.message }, { status: 500 });

  // Add signed URLs for proofs
  const enrichedWinners = await Promise.all(
    winners.map(async (winner) => {
      let signedUrl = null;
      if (winner.proof_path) {
        const { data, error } = await adminClient
          .storage
          .from('winner-proofs')
          .createSignedUrl(winner.proof_path, 60 * 15); // 15 mins expiry
        
        if (!error && data) {
          signedUrl = data.signedUrl;
        }
      }
      return { ...winner, signedUrl };
    })
  );

  return NextResponse.json({ data: enrichedWinners });
}
