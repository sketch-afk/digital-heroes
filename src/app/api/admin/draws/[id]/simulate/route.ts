import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { generateAlgorithmicDraw, generateRandomDraw, calculateMatches, ScoreFrequency } from "@/lib/domain/draw-engine";
import { calculateTierPayouts } from "@/lib/domain/tier-payouts";

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
  if (draw.status === 'published') return NextResponse.json({ error: "Draw is already published" }, { status: 400 });

  const drawMonthStr = draw.draw_month; // e.g. "2026-09-01"

  // 2. Fetch total pool for this month
  const { data: poolLedger, error: poolError } = await adminClient
    .from('prize_pool_ledger')
    .select('amount')
    .eq('draw_month', drawMonthStr);
  
  if (poolError) return NextResponse.json({ error: poolError.message }, { status: 500 });
  const totalPool = poolLedger.reduce((sum, row) => sum + row.amount, 0);

  // 3. Find eligible users (active sub + exactly 5 scores)
  // Fetch active subscriptions
  const { data: activeSubs, error: subError } = await adminClient
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active');
  if (subError) return NextResponse.json({ error: subError.message }, { status: 500 });

  const activeUserIds = activeSubs.map(s => s.user_id);
  
  // Fetch their scores
  let eligibleUsers: { user_id: string, scores: number[] }[] = [];
  let scoreFrequencies: Record<number, number> = {};

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
        scores.forEach(s => {
          scoreFrequencies[s] = (scoreFrequencies[s] || 0) + 1;
        });
      }
    }
  }

  // 4. Generate winning numbers
  let winningNumbers: number[];
  if (draw.mode === 'algorithmic') {
    const freqArray: ScoreFrequency[] = Object.entries(scoreFrequencies).map(([scoreStr, count]) => ({
      score: parseInt(scoreStr, 10),
      count
    }));
    winningNumbers = generateAlgorithmicDraw(freqArray, draw.config);
  } else {
    winningNumbers = generateRandomDraw(draw.config);
  }

  // 5. Calculate matches
  let match5 = 0;
  let match4 = 0;
  let match3 = 0;

  eligibleUsers.forEach(u => {
    const matches = calculateMatches(u.scores, winningNumbers);
    if (matches === 5) match5++;
    else if (matches === 4) match4++;
    else if (matches === 3) match3++;
  });

  // 6. Calculate payouts
  const payouts = calculateTierPayouts(
    { totalPool, jackpotCarriedIn: draw.jackpot_carried_in },
    { match5, match4, match3 }
  );

  // 7. Store simulation
  const resultPayload = {
    winningNumbers,
    eligibleUsersCount: eligibleUsers.length,
    totalPool,
    jackpotCarriedIn: draw.jackpot_carried_in,
    winners: { match5, match4, match3 },
    payouts
  };

  const { data: simData, error: simError } = await adminClient.from('draw_simulations').insert({
    draw_id: id,
    mode: draw.mode,
    numbers: winningNumbers,
    result: resultPayload,
    created_by: user.id
  }).select().single();

  if (simError) return NextResponse.json({ error: simError.message }, { status: 500 });

  // 8. Update draw status to simulated if it was draft
  if (draw.status === 'draft') {
    await adminClient.from('draws').update({ status: 'simulated' }).eq('id', id);
  }

  return NextResponse.json({ data: simData });
}
