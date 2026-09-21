import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect("/dashboard");

  const adminClient = createAdminClient();

  // 1. Total Registered Users
  const { count: totalUsers } = await adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'subscriber');

  // 2. Total Active Subscribers
  const { count: activeSubs } = await adminClient.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');

  // 3. Total Prize Pool
  const { data: poolLedger } = await adminClient.from('prize_pool_ledger').select('amount');
  const totalPrizePool = (poolLedger || []).reduce((sum, row) => sum + row.amount, 0);

  // 4. Total Charity Contributions
  const { data: charityLedger } = await adminClient.from('charity_contributions').select('amount');
  const totalCharity = (charityLedger || []).reduce((sum, row) => sum + row.amount, 0);

  // 5. Draw Statistics
  const { count: publishedDraws } = await adminClient.from('draws').select('*', { count: 'exact', head: true }).eq('status', 'published');
  
  const { data: winners } = await adminClient.from('winners').select('prize_amount, payment_status');
  const totalPaidOut = (winners || []).filter(w => w.payment_status === 'paid').reduce((sum, w) => sum + w.prize_amount, 0);
  const totalPending = (winners || []).filter(w => w.payment_status === 'pending').reduce((sum, w) => sum + w.prize_amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display-m font-bold tracking-tight text-text">Platform Overview</h1>
        <p className="text-text-2 mt-1">High-level metrics and statistics for Digital Heroes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-surface border-line">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-3">Total Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-text">{totalUsers || 0}</div>
            <p className="text-xs text-text-3 mt-1">Platform subscribers</p>
          </CardContent>
        </Card>
        
        <Card className="bg-surface border-line">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-3">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-charity">{activeSubs || 0}</div>
            <p className="text-xs text-text-3 mt-1">Currently paying users</p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-line">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-3">Generated Prize Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-reward">₹{(totalPrizePool / 100).toFixed(0)}</div>
            <p className="text-xs text-text-3 mt-1">Lifetime pool generated</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-surface to-surface-2 border-line">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-charity">Charity Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-text">₹{(totalCharity / 100).toFixed(0)}</div>
            <p className="text-xs text-text-3 mt-1">Lifetime raised for charities</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-surface border-line">
          <CardHeader>
            <CardTitle className="text-xl font-display">Draw Statistics</CardTitle>
            <CardDescription className="text-text-3">Overview of the monthly draws</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-surface-2 rounded-2xl border border-line">
              <span className="font-bold text-sm uppercase text-text-2">Published Draws</span>
              <span className="font-bold text-2xl font-display tabular-nums text-text">{publishedDraws || 0}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-charity/10 text-charity rounded-2xl border border-charity/20">
              <span className="font-bold text-sm uppercase">Total Prizes Paid</span>
              <span className="font-bold text-2xl font-display tabular-nums">₹{(totalPaidOut / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-reward/10 text-reward rounded-2xl border border-reward/20">
              <span className="font-bold text-sm uppercase">Prizes Pending</span>
              <span className="font-bold text-2xl font-display tabular-nums">₹{(totalPending / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
