"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/winners");
      const data = await res.json();
      if (res.ok && data.data) {
        setWinners(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const handleVerify = async (id: string, decision: 'approve' | 'reject') => {
    let notes = "";
    if (decision === 'reject') {
      const input = prompt("Please provide a reason for rejection (this will be shown to the user):");
      if (input === null) return; // User cancelled
      notes = input;
    } else {
      if (!confirm("Are you sure you want to approve this proof?")) return;
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/winners/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.error || "Failed");
      
      fetchWinners();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePayout = async (id: string) => {
    if (!confirm("Mark this payout as completed?")) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/winners/${id}/payout`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.error || "Failed");
      fetchWinners();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div>Loading winners...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Winners & Payouts</h1>
        <p className="text-muted-foreground">Verify score proofs and manage prize payouts.</p>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Draw Month</th>
                <th className="px-6 py-4">Prize</th>
                <th className="px-6 py-4">Proof Status</th>
                <th className="px-6 py-4">Payout Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {winners.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No winners found in the system.
                  </td>
                </tr>
              )}
              {winners.map((win) => (
                <tr key={win.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium">{win.profiles?.full_name}</div>
                    <div className="text-xs text-muted-foreground">{win.profiles?.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {new Date(win.draws?.draw_month).toLocaleString('default', { month: 'short', year: 'numeric' })}
                    <div className="text-xs text-muted-foreground font-normal">Match {win.match_type}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">
                    ₹{(win.prize_amount / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={win.verification_status === 'approved' ? 'default' : win.verification_status === 'rejected' ? 'destructive' : 'secondary'}>
                      {win.verification_status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={win.payment_status === 'paid' ? 'default' : 'outline'} className={win.payment_status === 'paid' ? 'bg-green-600' : ''}>
                      {win.payment_status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {/* View Proof Button */}
                    {win.signedUrl && (
                      <a href={win.signedUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm">View Proof</Button>
                      </a>
                    )}
                    
                    {/* Approve / Reject Actions */}
                    {win.verification_status === 'submitted' && (
                      <>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          disabled={processingId === win.id}
                          onClick={() => handleVerify(win.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          disabled={processingId === win.id}
                          onClick={() => handleVerify(win.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {/* Mark Paid Action */}
                    {win.verification_status === 'approved' && win.payment_status === 'pending' && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        disabled={processingId === win.id}
                        onClick={() => handlePayout(win.id)}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
