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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground">High-level metrics and statistics for Digital Heroes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform subscribers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSubs || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently paying users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Prize Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalPrizePool / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime pool generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Charity Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{(totalCharity / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime raised for charities</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Draw Statistics</CardTitle>
            <CardDescription>Overview of the monthly draws</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg border">
              <span className="font-medium text-sm uppercase">Published Draws</span>
              <span className="font-bold text-xl">{publishedDraws || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
              <span className="font-medium text-sm uppercase">Total Prizes Paid</span>
              <span className="font-bold text-xl">₹{(totalPaidOut / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <span className="font-medium text-sm uppercase">Prizes Pending</span>
              <span className="font-bold text-xl">₹{(totalPending / 100).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
