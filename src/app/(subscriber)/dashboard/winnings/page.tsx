"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function WinningsPage() {
  const [winnings, setWinnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const fetchWinnings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/winnings");
      const data = await res.json();
      if (res.ok && data.data) {
        setWinnings(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWinnings();
  }, []);

  const handleUpload = async (e: React.FormEvent, winnerId: string) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fileInput = form.elements.namedItem('proof') as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      alert("Please select an image file first.");
      return;
    }

    setUploadingId(winnerId);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/winners/${winnerId}/proof`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      alert("Proof submitted successfully!");
      fetchWinnings(); // reload the data to show updated status
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-10 space-y-6 max-w-4xl">
        <Skeleton className="h-24 w-[300px]" />
        <div className="grid gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-display-m font-bold tracking-tight text-text">My Winnings</h1>
        <p className="text-text-2 mt-1">Upload proof of your golf scores to claim your draw prizes.</p>
      </div>

      <div className="grid gap-6">
        {winnings.length === 0 && (
          <div className="text-center p-12 border rounded-lg bg-muted/20">
            <h3 className="text-lg font-medium text-muted-foreground">No winnings yet!</h3>
            <p className="text-sm text-muted-foreground mt-1">Keep logging your scores for a chance to win the monthly draw.</p>
          </div>
        )}

        {winnings.map((win) => (
          <Card key={win.id} className={win.verification_status === 'approved' && win.payment_status === 'paid' ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/10' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">Draw: {new Date(win.draws.draw_month).toLocaleString('default', { month: 'long', year: 'numeric' })}</CardTitle>
                <CardDescription>Match {win.match_type} Winner</CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-2xl font-bold text-green-600">₹{(win.prize_amount / 100).toFixed(2)}</div>
                <div className="flex gap-2">
                  <Badge variant={win.verification_status === 'approved' ? 'default' : win.verification_status === 'rejected' ? 'destructive' : 'secondary'}>
                    {win.verification_status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {win.verification_status === 'approved' && (
                     <Badge variant={win.payment_status === 'paid' ? 'default' : 'outline'} className={win.payment_status === 'paid' ? 'bg-green-600' : ''}>
                       {win.payment_status.toUpperCase()}
                     </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {win.verification_status === 'pending_proof' && (
                <div className="mt-4 p-4 bg-muted rounded-lg border">
                  <h4 className="font-medium mb-2">Claim your prize</h4>
                  <p className="text-sm text-muted-foreground mb-4">Please upload a screenshot of your official golf scores confirming your entry for this month.</p>
                  <form onSubmit={(e) => handleUpload(e, win.id)} className="flex items-center gap-4">
                    <Input type="file" name="proof" accept="image/*" className="max-w-sm cursor-pointer" required />
                    <Button type="submit" disabled={uploadingId === win.id}>
                      {uploadingId === win.id ? "Uploading..." : "Submit Proof"}
                    </Button>
                  </form>
                </div>
              )}

              {win.verification_status === 'submitted' && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="font-medium">Proof submitted!</p>
                  <p className="text-sm mt-1">An administrator is reviewing your scores. Check back soon.</p>
                </div>
              )}

              {win.verification_status === 'rejected' && (
                <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                  <p className="font-medium">Proof rejected</p>
                  <p className="text-sm mt-1">Your proof was rejected. {win.admin_notes && `Reason: ${win.admin_notes}`}</p>
                  <p className="text-sm font-medium mt-4 mb-2">Upload a new screenshot:</p>
                  <form onSubmit={(e) => handleUpload(e, win.id)} className="flex items-center gap-4">
                    <Input type="file" name="proof" accept="image/*" className="max-w-sm cursor-pointer" required />
                    <Button type="submit" disabled={uploadingId === win.id} variant="destructive">
                      {uploadingId === win.id ? "Uploading..." : "Re-Submit Proof"}
                    </Button>
                  </form>
                </div>
              )}

              {win.verification_status === 'approved' && win.payment_status === 'pending' && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-300 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="font-medium">Proof approved!</p>
                  <p className="text-sm mt-1">Your prize is queued for payout. You will receive it shortly.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
