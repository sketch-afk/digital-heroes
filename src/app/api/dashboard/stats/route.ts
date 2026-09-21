import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // 1. Total Winnings
    const { data: winners } = await supabase
      .from('winners')
      .select('prize_amount')
      .eq('user_id', user.id);
    
    const totalWinnings = (winners || []).reduce((sum, w) => sum + w.prize_amount, 0);

    // 2. Draws Entered
    const { count: drawsEntered } = await supabase
      .from('draw_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // 3. Upcoming Draw
    const { data: upcomingDraw } = await supabase
      .from('draws')
      .select('draw_month, status')
      .in('status', ['draft', 'simulated'])
      .order('draw_month', { ascending: true })
      .limit(1)
      .single();

    return NextResponse.json({
      data: {
        totalWinnings,
        drawsEntered: drawsEntered || 0,
        upcomingDraw: upcomingDraw ? upcomingDraw.draw_month : null
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
