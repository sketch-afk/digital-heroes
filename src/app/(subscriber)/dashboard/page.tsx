import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { SubscriptionManager } from "./subscription-manager";
import { ScoreEntry } from "./score-entry";

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
    <div className="container py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Subscription Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isSubscribed ? <span className="text-green-500">Active</span> : <span className="text-muted-foreground">Inactive</span>}
            </div>
            {isSubscribed && subscription?.current_period_end && (
              <p className="text-xs text-muted-foreground">
                {planName} plan renews on {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            )}
            <div className="mt-4">
              <SubscriptionManager isActive={isSubscribed} />
            </div>
          </CardContent>
        </Card>

        {/* Charity Impact Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Charitable Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.charities?.name || 'None Selected'}</div>
            <p className="text-xs text-muted-foreground">
              You are contributing {profile?.charity_percent}% of your subscription.
            </p>
          </CardContent>
        </Card>

        {/* Winnings Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Winnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{(totalWinnings / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {drawsEntered} draws entered
            </p>
            {upcomingDraw && (
              <div className="mt-4 text-xs font-medium bg-muted p-2 rounded-md">
                Upcoming Draw: {new Date(upcomingDraw.draw_month).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scores Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scores</CardTitle>
          <CardDescription>
            {isSubscribed ? 'Manage your rolling 5 Stableford scores to enter the draw.' : 'Subscribe to enter your scores and participate in the monthly draw.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSubscribed && (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/50 rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground mb-4">You must have an active subscription to enter scores.</p>
              <SubscriptionManager isActive={false} />
            </div>
          )}
          {isSubscribed && (
            <ScoreEntry />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
