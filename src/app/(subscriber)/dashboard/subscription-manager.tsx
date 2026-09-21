"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SubscriptionManager({ isActive }: { isActive: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (plan?: 'monthly' | 'yearly') => {
    setLoading(true);
    try {
      if (isActive) {
        // Go to Customer Portal
        const res = await fetch("/api/subscriptions/portal", { method: "POST" });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } else {
        // Go to Checkout
        const res = await fetch("/api/subscriptions/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: plan || 'monthly' })
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (isActive) {
    return (
      <Button variant="outline" size="sm" onClick={() => handleAction()} disabled={loading}>
        {loading ? "Loading..." : "Manage Subscription"}
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => handleAction('monthly')} disabled={loading}>
        Subscribe Monthly
      </Button>
      <Button variant="secondary" size="sm" onClick={() => handleAction('yearly')} disabled={loading}>
        Subscribe Yearly
      </Button>
    </div>
  );
}
