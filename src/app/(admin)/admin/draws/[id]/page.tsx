"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter, useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDrawDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [draw, setDraw] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  const fetchDrawData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/draws/${id}`);
      const json = await res.json();
      if (res.ok && json.data) {
        setDraw(json.data.draw);
        if (json.data.simulation) {
          setSimulation(json.data.simulation);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrawData();
  }, [id]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`/api/admin/draws/${id}/simulate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Simulation failed");
      await fetchDrawData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSimulating(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Are you sure? Publishing will write entries, calculate actual winners, and finalize payouts. This cannot be undone.")) return;
    
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/draws/${id}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Publish failed");
      alert("Draw successfully published!");
      await fetchDrawData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-1/3" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  if (!draw) return <div>Draw not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Draw: {new Date(draw.draw_month).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h1>
          <p className="text-muted-foreground">Mode: {draw.mode}</p>
        </div>
        <Badge className="text-lg px-4 py-1" variant={draw.status === 'published' ? 'default' : draw.status === 'simulated' ? 'secondary' : 'outline'}>
          {draw.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Draw Status & Controls</CardTitle>
            <CardDescription>
              {draw.status === 'draft' && "This draw is in draft. Run a simulation to generate numbers and preview payouts."}
              {draw.status === 'simulated' && "Simulation complete. Review the results before publishing."}
              {draw.status === 'published' && "This draw has been finalized. Payouts and winners are locked."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {draw.status === 'draft' && (
               <Button onClick={handleSimulate} disabled={simulating} className="w-full">
                 {simulating ? "Simulating..." : "Run Simulation"}
               </Button>
             )}
             
             {draw.status === 'simulated' && (
               <div className="space-y-4">
                 <Button onClick={handleSimulate} disabled={simulating} variant="outline" className="w-full">
                   {simulating ? "Re-Simulating..." : "Re-Run Simulation (Generates new numbers)"}
                 </Button>
                 <Button onClick={handlePublish} disabled={publishing} variant="default" className="w-full bg-green-600 hover:bg-green-700">
                   {publishing ? "Publishing..." : "Finalize & Publish Draw"}
                 </Button>
               </div>
             )}

             {draw.status === 'published' && (
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="font-medium text-green-600 dark:text-green-400">Successfully Published</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Published on {new Date(draw.published_at).toLocaleString()}
                  </p>
                </div>
             )}
          </CardContent>
        </Card>

        {simulation && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Results {draw.status === 'published' ? '(Final)' : '(Simulation)'}</CardTitle>
              <CardDescription>Winning numbers and pool statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Winning Numbers</p>
                <div className="flex gap-2">
                  {simulation.numbers.map((num: number, i: number) => (
                    <div key={i} className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-sm">
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Eligible Entries</p>
                  <p className="text-2xl font-bold">{simulation.result.eligibleUsersCount}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Pool</p>
                  <p className="text-2xl font-bold">₹{(simulation.result.totalPool / 100).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {simulation && (
        <Card>
          <CardHeader>
            <CardTitle>Tier Payout Projections</CardTitle>
            <CardDescription>How the prize pool is distributed among winners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Tier</th>
                    <th className="px-4 py-3">Winners</th>
                    <th className="px-4 py-3">Tier Pool</th>
                    <th className="px-4 py-3">Payout / Winner</th>
                    <th className="px-4 py-3 rounded-tr-lg">Rollover (Out)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">Match 5 (40% + Jackpot)</td>
                    <td className="px-4 py-3 font-bold">{simulation.result.winners.match5}</td>
                    <td className="px-4 py-3">₹{(simulation.result.payouts.match5.tierPool / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">₹{(simulation.result.payouts.match5.perWinnerAmount / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">₹{(simulation.result.payouts.match5.rolledOverOut / 100).toFixed(2)}</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">Match 4 (35%)</td>
                    <td className="px-4 py-3 font-bold">{simulation.result.winners.match4}</td>
                    <td className="px-4 py-3">₹{(simulation.result.payouts.match4.tierPool / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">₹{(simulation.result.payouts.match4.perWinnerAmount / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">-</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">Match 3 (25%)</td>
                    <td className="px-4 py-3 font-bold">{simulation.result.winners.match3}</td>
                    <td className="px-4 py-3">₹{(simulation.result.payouts.match3.tierPool / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">₹{(simulation.result.payouts.match3.perWinnerAmount / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
