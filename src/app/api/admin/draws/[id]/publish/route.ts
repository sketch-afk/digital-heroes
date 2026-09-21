import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { calculateMatches } from "@/lib/domain/draw-engine";
import { calculateTierPayouts } from "@/lib/domain/tier-payouts";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const adminClient = createAdminClient();

  // 1. Fetch draw
  const { data: draw, error: drawError } = await adminClient.from('draws').select('*').eq('id', id).single();
  if (drawError || !draw) return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  if (draw.status !== 'simulated') return NextResponse.json({ error: "Draw must be simulated before publishing" }, { status: 400 });

  // 2. Fetch the latest simulation to get the winning numbers
  const { data: sim, error: simError } = await adminClient
    .from('draw_simulations')
    .select('*')
    .eq('draw_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (simError || !sim) return NextResponse.json({ error: "No simulation found" }, { status: 400 });
  
  const winningNumbers = sim.numbers;
  const drawMonthStr = draw.draw_month;

  // 3. Calculate pool
  const { data: poolLedger, error: poolError } = await adminClient
    .from('prize_pool_ledger')
    .select('amount')
    .eq('draw_month', drawMonthStr);
  
  if (poolError) return NextResponse.json({ error: poolError.message }, { status: 500 });
  const totalPool = poolLedger.reduce((sum, row) => sum + row.amount, 0);

  // 4. Fetch eligible users
  const { data: activeSubs, error: subError } = await adminClient
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active');
  if (subError) return NextResponse.json({ error: subError.message }, { status: 500 });

  const activeUserIds = activeSubs.map(s => s.user_id);
  
  let eligibleUsers: { user_id: string, scores: number[] }[] = [];
  if (activeUserIds.length > 0) {
    const { data: scoresData, error: scoresError } = await adminClient
      .from('scores')
      .select('user_id, stableford_score, score_date')
      .in('user_id', activeUserIds)
      .order('score_date', { ascending: false });

    if (scoresError) return NextResponse.json({ error: scoresError.message }, { status: 500 });

    const userScoresMap = new Map<string, number[]>();
    scoresData.forEach(row => {
      const arr = userScoresMap.get(row.user_id) || [];
      if (arr.length < 5) {
        arr.push(row.stableford_score);
        userScoresMap.set(row.user_id, arr);
      }
    });

    for (const [uid, scores] of userScoresMap.entries()) {
      if (scores.length === 5) {
        eligibleUsers.push({ user_id: uid, scores });
      }
    }
  }

  let match5Users: typeof eligibleUsers = [];
  let match4Users: typeof eligibleUsers = [];
  let match3Users: typeof eligibleUsers = [];
  
  const userMatches = new Map<string, number>();

  eligibleUsers.forEach(u => {
    const matches = calculateMatches(u.scores, winningNumbers);
    userMatches.set(u.user_id, matches);
    if (matches === 5) match5Users.push(u);
    else if (matches === 4) match4Users.push(u);
    else if (matches === 3) match3Users.push(u);
  });

  const payouts = calculateTierPayouts(
    { totalPool, jackpotCarriedIn: draw.jackpot_carried_in },
    { match5: match5Users.length, match4: match4Users.length, match3: match3Users.length }
  );

  // --- BEGIN DB WRITES ---
  // In a robust production system, this would be an RPC call for transactional safety.
  // We will execute them sequentially.
  
  // Update Draw
  await adminClient.from('draws').update({
    status: 'published',
    winning_numbers: winningNumbers,
    active_subscriber_count: eligibleUsers.length,
    pool_total: totalPool,
    published_at: new Date().toISOString(),
    published_by: user.id
  }).eq('id', id);

  // Insert Draw Tiers
  await adminClient.from('draw_tiers').insert([
    {
      draw_id: id,
      match_type: 5,
      share_pct: 40,
      tier_pool: payouts.match5.tierPool,
      rollover_in: draw.jackpot_carried_in,
      winners_count: match5Users.length,
      per_winner_amount: payouts.match5.perWinnerAmount,
      rolled_over_out: payouts.match5.rolledOverOut
    },
    {
      draw_id: id,
      match_type: 4,
      share_pct: 35,
      tier_pool: payouts.match4.tierPool,
      rollover_in: 0,
      winners_count: match4Users.length,
      per_winner_amount: payouts.match4.perWinnerAmount,
      rolled_over_out: 0
    },
    {
      draw_id: id,
      match_type: 3,
      share_pct: 25,
      tier_pool: payouts.match3.tierPool,
      rollover_in: 0,
      winners_count: match3Users.length,
      per_winner_amount: payouts.match3.perWinnerAmount,
      rolled_over_out: 0
    }
  ]);

  // Insert Draw Entries
  // Chunking to avoid large inserts
  const chunkSize = 500;
  for (let i = 0; i < eligibleUsers.length; i += chunkSize) {
    const chunk = eligibleUsers.slice(i, i + chunkSize);
    const entryPayload = chunk.map(u => {
      const matchCount = userMatches.get(u.user_id) || 0;
      let tier = null;
      if (matchCount === 5) tier = 5;
      else if (matchCount === 4) tier = 4;
      else if (matchCount === 3) tier = 3;

      return {
        draw_id: id,
        user_id: u.user_id,
        scores_snapshot: u.scores,
        matched_count: matchCount,
        tier
      };
    });
    await adminClient.from('draw_entries').insert(entryPayload);
  }

  // Fetch the inserted entries to get their IDs for the winners table
  const { data: insertedEntries } = await adminClient
    .from('draw_entries')
    .select('id, user_id, tier')
    .eq('draw_id', id)
    .not('tier', 'is', null);

  if (insertedEntries && insertedEntries.length > 0) {
    const winnersPayload = insertedEntries.map(entry => {
      let amount = 0;
      if (entry.tier === 5) amount = payouts.match5.perWinnerAmount;
      if (entry.tier === 4) amount = payouts.match4.perWinnerAmount;
      if (entry.tier === 3) amount = payouts.match3.perWinnerAmount;

      return {
        draw_id: id,
        user_id: entry.user_id,
        draw_entry_id: entry.id,
        match_type: entry.tier,
        prize_amount: amount,
        verification_status: 'pending_proof',
        payment_status: 'pending'
      };
    });
    
    await adminClient.from('winners').insert(winnersPayload);
  }

  return NextResponse.json({ success: true });
}
