"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DonationForm({ charityId, charityName }: { charityId: string, charityName: string }) {
  const [amount, setAmount] = useState<string>("1000"); // 1000 INR default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const amt = parseInt(amount, 10) * 100; // Convert to paise
    if (amt <= 0 || isNaN(amt)) {
      setError("Please enter a valid amount.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charityId, amount: amt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate donation");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleDonate} className="space-y-4 mt-6">
      <div className="space-y-2">
        <Label htmlFor="amount">Donation Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          min="1"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive font-medium">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Processing..." : `Donate to ${charityName}`}
      </Button>
    </form>
  );
}
