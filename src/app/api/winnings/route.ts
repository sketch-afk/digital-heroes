import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: winners, error: winnersError } = await supabase
    .from('winners')
    .select(`
      *,
      draws:draw_id ( draw_month )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (winnersError) return NextResponse.json({ error: winnersError.message }, { status: 500 });

  return NextResponse.json({ data: winners });
}
