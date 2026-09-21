import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { SubscriptionManager } from "./subscription-manager";
import { ScoreEntry } from "./score-entry";
import { Heart, Trophy, Calendar, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*, charities(name)').eq('id', user.id).single();
  const { data: subscription } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single();

  const isSubscribed = subscription?.status === 'active';
  const planName = subscription?.plan === 'yearly' ? 'Yearly' : 'Monthly';

  // Fetch Winnings
  const { data: winners } = await supabase.from('winners').select('prize_amount').eq('user_id', user.id);
  const totalWinnings = (winners || []).reduce((sum, w) => sum + w.prize_amount, 0);

  // Fetch Participation
  const { count: drawsEntered } = await supabase.from('draw_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  const { data: upcomingDraw } = await supabase.from('draws').select('draw_month').in('status', ['draft', 'simulated']).order('draw_month', { ascending: true }).limit(1).single();

  return (
    <div className="container py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-display-m font-bold tracking-tight text-text">Dashboard</h1>
          <p className="text-text-2 mt-1">Welcome back. Ready to make an impact?</p>
        </div>
        <Link href="/dashboard/settings">
          <Button variant="outline" size="sm" className="gap-2 rounded-full">
            <Settings className="w-4 h-4" /> Settings
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
        
        {/* Bento Hero: Impact (Spans 2 columns on desktop) */}
        <Card className="md:col-span-2 bg-gradient-to-br from-surface to-surface-2 border-line rounded-[36px] overflow-hidden relative shadow-lg">
          <div className="absolute right-0 top-0 w-64 h-64 bg-charity/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <CardHeader className="p-8 pb-4 relative z-10">
            <div className="flex items-center gap-2 text-charity font-bold uppercase tracking-wider text-sm mb-2">
              <Heart className="w-4 h-4" /> Your Impact
            </div>
            <CardTitle className="text-3xl md:text-4xl font-display text-text">
              {profile?.charities?.name || 'No Charity Selected'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0 relative z-10">
            <p className="text-lg text-text-2 max-w-md">
              You are contributing <strong className="text-text">{profile?.charity_percent}%</strong> of your subscription directly to this cause every {planName.toLowerCase()}.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <div>
                <div className="text-sm text-text-3 uppercase tracking-wider">Draws Supported</div>
                <div className="text-3xl font-bold text-text tabular-nums mt-1">{drawsEntered || 0}</div>
              </div>
              <div className="w-px h-12 bg-line" />
              <div>
                <div className="text-sm text-text-3 uppercase tracking-wider">Total Won</div>
                <div className="text-3xl font-bold text-reward tabular-nums mt-1">₹{(totalWinnings / 100).toFixed(0)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bento Sidebar: Subscription & Upcoming */}
        <div className="space-y-6 flex flex-col">
          <Card className="flex-1 bg-bg border-line shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-text-3 font-bold uppercase tracking-wider text-xs mb-1">
                <Calendar className="w-3.5 h-3.5" /> Next Draw
              </div>
              <CardTitle className="text-xl">
                {upcomingDraw ? new Date(upcomingDraw.draw_month).toLocaleString('default', { month: 'long', year: 'numeric' }) : 'No active draws'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-2xl bg-surface-2 border border-line">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-2">Status</span>
                  {isSubscribed ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-charity/10 text-charity text-xs font-bold">Active</span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-danger/10 text-danger text-xs font-bold">Inactive</span>
                  )}
                </div>
                {isSubscribed && subscription?.current_period_end && (
                  <p className="text-xs text-text-3 mb-4">
                    Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
                <SubscriptionManager isActive={isSubscribed} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bento Bottom: Score Entry (Spans full width) */}
        <Card className="md:col-span-3 bg-surface border-line shadow-lg">
          <CardHeader className="border-b border-line pb-6">
            <div className="flex items-center gap-2 text-reward font-bold uppercase tracking-wider text-sm mb-1">
              <Trophy className="w-4 h-4" /> Lottery Ticket
            </div>
            <CardTitle className="text-2xl font-display">Your Rolling Scores</CardTitle>
            <CardDescription className="text-base mt-2">
              {isSubscribed 
                ? 'Submit your 5 most recent Stableford scores. These scores are your entry for the upcoming draw.' 
                : 'Subscribe to enter your scores and participate in the monthly draw.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            {!isSubscribed ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-bg rounded-2xl border border-line">
                <p className="text-text-2 mb-6 max-w-sm">You must have an active subscription to log scores and enter the draw.</p>
                <SubscriptionManager isActive={false} />
              </div>
            ) : (
              <ScoreEntry />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
